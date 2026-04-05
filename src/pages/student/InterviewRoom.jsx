import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, Volume2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

const InterviewRoom = ({ user, sessionId, firstQuestion, onEnd }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (firstQuestion) {
      setTranscript([{ role: "interviewer", content: firstQuestion }]);
      playAIVoice(firstQuestion);
    }
    return () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }, [firstQuestion]);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [transcript]);

  const playAIVoice = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendAudioToBackend(audioBlob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { alert("Mic access denied."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Upload audio to Supabase Storage safely
      const filePath = `${user.id}/interview_answer_${Date.now()}.webm`;
      await supabase.storage.from('audio-uploads').upload(filePath, audioBlob);
      const { data: urlData } = supabase.storage.from('audio-uploads').getPublicUrl(filePath);

      // 2. Send URL to Motia Backend
      const backend_url = import.meta.env.VITE_MOTIA_URL || "http://localhost:3000";
      const response = await fetch(`${backend_url}/api/student/interview/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ sessionId, audioUrl: urlData.publicUrl })
      });

      if (!response.ok) throw new Error("Failed to process reply");
      const data = await response.json();

      // Safely extract variables
      const finalCandidateText = data.body?.candidateTranscript || data.candidateTranscript;
      const finalNextQuestion = data.body?.nextQuestion || data.nextQuestion;
      const isFinished = data.body?.isFinished || data.isFinished; // 🟢 Get the flag

      setTranscript(prev => [
        ...prev, 
        { role: "candidate", content: finalCandidateText },
        { role: "interviewer", content: finalNextQuestion }
      ]);
      
      playAIVoice(finalNextQuestion);

      // 🟢 AUTO-EXIT LOGIC
      if (isFinished) {
          // Wait 6 seconds for the AI to speak its goodbye, then trigger the analysis screen
          setTimeout(() => {
              if (onEnd) onEnd();
          }, 6000);
      }

    } catch (error) {
      alert("Error processing audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[80vh] bg-[#111] rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex justify-between bg-[#1A1A1A]">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-[#FF4A1F]'}`}></div> Live Interview
        </h2>
        <button onClick={onEnd} className="text-red-500 font-semibold hover:text-red-400 transition-colors">End Interview Early</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {transcript.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'candidate' ? 'bg-[#FF4A1F] text-white rounded-br-sm' : 'bg-gray-800 text-white rounded-bl-sm border border-gray-700'}`}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isProcessing && <div className="text-gray-400 flex items-center gap-2"><Loader2 className="animate-spin"/> AI is thinking...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 bg-[#1A1A1A] border-t border-gray-800 flex justify-center">
        {isProcessing ? <span className="text-gray-400">Processing...</span> : isRecording ? (
           <button onClick={stopRecording} className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-bold animate-pulse"><Square size={20}/> Stop Answering</button>
        ) : (
           <button onClick={startRecording} disabled={isPlaying} className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${isPlaying ? 'bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed' : 'bg-[#FF4A1F] text-white hover:scale-105'}`}><Mic size={20}/> {isPlaying ? "AI is speaking..." : "Hold & Speak"}</button>
        )}
      </div>
    </div>
  );
};

export default InterviewRoom;