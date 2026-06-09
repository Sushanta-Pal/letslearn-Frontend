import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
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

  // Initialize the interview with the first question
  useEffect(() => {
    if (firstQuestion) {
      setTranscript([{ role: "interviewer", content: firstQuestion }]);
      playAIVoice(firstQuestion);
    }
    
    // Cleanup function when component unmounts
    return () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }, [firstQuestion]);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Text-to-Speech Function
  const playAIVoice = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: You can change the voice here if you want it to sound more natural
    // const voices = window.speechSynthesis.getVoices();
    // utterance.voice = voices.find(v => v.name.includes("Google UK English Female")) || voices[0];
    
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
      
      mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendAudioToBackend(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { 
        console.error("Mic Error:", err);
        alert("Microphone access denied or not available. Please check your browser permissions."); 
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop the microphone tracks to turn off the red recording light in the browser tab
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
      }
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Upload audio to Supabase Storage safely
      const fileName = `${user.id}/interview_answer_${Date.now()}.webm`;
      
      // Ensure you are using the correct public bucket name here!
      // Ensure you are using the correct public bucket name here!
      const { error: uploadError } = await supabase.storage.from('audio-uploads').upload(fileName, audioBlob);
      if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

      // Get the public URL
      const { data: urlData } = supabase.storage.from('audio-uploads').getPublicUrl(fileName);
      // 2. Send URL to Backend API
      const backend_url = import.meta.env.VITE_MOTIA_URL || "http://localhost:3000";
      const response = await fetch(`${backend_url}/api/student/interview/reply`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ 
            sessionId: sessionId, 
            audioUrl: urlData.publicUrl 
        })
      });

      if (!response.ok) throw new Error("Failed to process reply");
      
      const data = await response.json();

      // Safely extract variables (handles standard responses or nested `body` responses)
      const finalCandidateText = data.body?.candidateTranscript || data.candidateTranscript;
      const finalNextQuestion = data.body?.nextQuestion || data.nextQuestion;
      const isFinished = data.body?.isFinished || data.isFinished; 

      // Update the chat UI
      setTranscript(prev => [
        ...prev, 
        { role: "candidate", content: finalCandidateText },
        { role: "interviewer", content: finalNextQuestion }
      ]);
      
      // Speak the AI's response
      playAIVoice(finalNextQuestion);

      // 🟢 AUTO-EXIT LOGIC
      if (isFinished) {
          // Wait 6 seconds for the AI to speak its goodbye, then trigger the analysis screen
          setTimeout(() => {
              if (onEnd) onEnd();
          }, 6000);
      }

    } catch (error) {
      console.error("Audio Processing Error:", error);
      alert("Error processing audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[80vh] bg-[#111] rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1A1A1A]">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-[#FF4A1F]'}`}></div> 
            Live Interview
        </h2>
        <button onClick={onEnd} className="text-red-500 font-semibold hover:text-red-400 transition-colors text-sm md:text-base">
            End Interview Early
        </button>
      </div>

      {/* Chat Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {transcript.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${msg.role === 'candidate' ? 'bg-[#FF4A1F] text-white rounded-br-sm' : 'bg-gray-800 text-white rounded-bl-sm border border-gray-700'}`}>
              <p className="leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isProcessing && (
            <div className="flex justify-start w-full">
                <div className="bg-gray-800/50 text-gray-400 border border-gray-700 rounded-2xl rounded-bl-sm p-4 flex items-center gap-3">
                    <Loader2 className="animate-spin w-5 h-5"/> 
                    <span className="text-sm font-medium">AI is thinking...</span>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Control Footer */}
      <div className="p-6 bg-[#1A1A1A] border-t border-gray-800 flex justify-center">
        {isProcessing ? (
           <span className="text-gray-400 font-medium px-8 py-3">Processing your answer...</span> 
        ) : isRecording ? (
           <button onClick={stopRecording} className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-bold animate-pulse hover:bg-red-700 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]">
               <Square size={20} fill="currentColor"/> Click to Stop Recording
           </button>
        ) : (
           <button 
              onClick={startRecording} 
              disabled={isPlaying} 
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${
                  isPlaying 
                  ? 'bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed' 
                  : 'bg-[#FF4A1F] text-white hover:scale-105 shadow-[0_0_20px_rgba(255,74,31,0.3)]'
              }`}
            >
               <Mic size={20}/> {isPlaying ? "AI is speaking..." : "Click to Answer"}
           </button>
        )}
      </div>
    </div>
  );
};

export default InterviewRoom;