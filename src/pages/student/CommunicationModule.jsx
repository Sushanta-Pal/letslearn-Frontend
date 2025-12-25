import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { 
  Mic, Volume2, MicOff, Loader2, X, Headphones, 
  ArrowRight, BookOpen, Trophy, Star, CheckCircle 
} from "lucide-react";

const CommunicationModule = ({ user, sessionId, onComplete, onCancel, customData }) => {
  const [stage, setStage] = useState("loading"); // "loading" | "reading" | "repetition" | "comprehension" | "finished"
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState({ reading: [], repetition: [], comprehension: [] });
  const [practiceSet, setPracticeSet] = useState(null);
  
  const [viewingStory, setViewingStory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState("idle"); 

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- 1. Data Loading ---
  useEffect(() => {
    if (customData) {
      // Normalize repetition
      let repetitionData = customData.repetition || [{ text: "Repeat this sample." }];
      if (Array.isArray(repetitionData)) {
        repetitionData = repetitionData.map(item => 
          typeof item === 'string' ? { text: item } : item
        );
      }

      // Safe Comprehension normalization
      const compData = customData.comprehension || {};
      const safeComprehension = {
        story: compData.story || "No story provided.",
        questions: Array.isArray(compData.questions) ? compData.questions : []
      };

      const safeSet = {
        reading: customData.reading || ["Read this sample text."],
        repetition: repetitionData,
        comprehension: safeComprehension
      };

      setPracticeSet(safeSet);
      setStage("reading");
    } else {
      alert("No communication data found.");
      onCancel();
    }

    return () => {
      stopAudioPlayback();
      cleanupMic();
    };
  }, [customData, onCancel]);

  // --- AUDIO HELPERS ---
  const stopAudioPlayback = () => { 
    if ('speechSynthesis' in window) window.speechSynthesis.cancel(); 
    setPlaybackStatus("idle"); 
  };

  const cleanupMic = () => { 
    if (streamRef.current) { 
      streamRef.current.getTracks().forEach(track => track.stop()); 
      streamRef.current = null; 
    } 
  };

  const playAIVoice = (text) => {
    if (!('speechSynthesis' in window)) return;
    stopAudioPlayback(); 
    if (isRecording) stopRecording();

    setPlaybackStatus("playing");
    const utterance = new SpeechSynthesisUtterance(text || "No text available");
    utterance.rate = 0.9; 
    utterance.onend = () => setPlaybackStatus("idle"); 
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    if (playbackStatus === "playing") stopAudioPlayback();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { 
        if (e.data.size > 0) audioChunksRef.current.push(e.data); 
      };
      mediaRecorderRef.current.onstop = () => { 
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" }); 
        cleanupMic(); 
        handleAudioUpload(audioBlob); 
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { 
      alert("Microphone access denied."); 
    }
  };

  const stopRecording = () => { 
    if (mediaRecorderRef.current?.state === "recording") { 
      mediaRecorderRef.current.stop(); 
      setIsRecording(false); 
    } 
  };

  const handleAudioUpload = async (audioBlob) => {
    setIsUploading(true);
    const filePath = `${user.id}/${stage}_${Date.now()}.webm`;
    try {
      const { error } = await supabase.storage.from("audio-uploads").upload(filePath, audioBlob);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("audio-uploads").getPublicUrl(filePath);
      saveResultAndAdvance(urlData.publicUrl);
    } catch (err) { 
      console.error("Upload failed", err);
      setIsUploading(false); 
    }
  };

  const saveResultAndAdvance = (url) => {
    const currentItems = practiceSet[stage];
    const currentItem = currentItems[currentIndex];
    const originalText = stage === "reading" ? currentItem : (currentItem?.text || "Unknown"); 

    setResults(prev => ({
      ...prev,
      [stage]: [...prev[stage], { text: originalText, audioUrl: url }]
    }));

    setIsUploading(false);
    setPlaybackStatus("idle"); 
    
    if (currentIndex < currentItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      advanceStage();
    }
  };

  const advanceStage = () => {
    setCurrentIndex(0);
    setPlaybackStatus("idle");
    const flow = ["reading", "repetition", "comprehension", "finished"];
    
    let nextIdx = flow.indexOf(stage) + 1;
    
    while (nextIdx < flow.length) {
      const nextStageName = flow[nextIdx];
      const nextData = practiceSet[nextStageName];
      let isEmpty = false;

      if (!nextData) isEmpty = true;
      else if (Array.isArray(nextData) && nextData.length === 0) isEmpty = true;
      else if (nextStageName === "comprehension" && (!nextData.questions || nextData.questions.length === 0)) isEmpty = true;

      if (isEmpty) nextIdx++;
      else break;
    }
    
    const nextStage = flow[nextIdx] || "finished";
    if (nextStage === "comprehension") {
      setViewingStory(true);
    }
    setStage(nextStage);
  };

  const startComprehensionQuiz = () => {
    stopAudioPlayback();
    setViewingStory(false);
  };

  const handleMCQAnswer = (option) => {
    if (playbackStatus === "playing") stopAudioPlayback();
    const questions = practiceSet.comprehension.questions;
    const qData = questions[currentIndex];
    const isCorrect = option === qData.correctAnswer || option === qData.ans;

    setResults(prev => ({
      ...prev,
      comprehension: [...prev.comprehension, { question: qData.q || qData.question, isCorrect }]
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStage("finished");
    }
  };

  // --- SUBMISSION HANDLER ---
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No auth token found");

      const backend_url = import.meta.env.VITE_MOTIA_URL || "http://localhost:3000";
      const response = await fetch(`${backend_url}/api/student/analyze`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId: sessionId, results: results })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis request failed");
      }

      // Polling Logic
      const pollInterval = setInterval(async () => {
        const { data: sessionData, error } = await supabase
          .from('mock_interview_sessions')
          .select('status, communication_score')
          .eq('id', sessionId)
          .single();

        if (error || sessionData.status === 'completed') {
          clearInterval(pollInterval);
          setIsSubmitting(false);
          if(sessionData?.status === 'completed') onComplete(sessionData.communication_score || 0); 
        }
      }, 2000);

      setTimeout(() => { clearInterval(pollInterval); if (isSubmitting) { setIsSubmitting(false); onComplete(0); } }, 60000);

    } catch (error) {
      alert(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  if (stage === "loading") return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#FF4A1F]" /></div>;

  const currentCompQuestion = stage === "comprehension" ? practiceSet.comprehension?.questions?.[currentIndex] : null;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#111] rounded-[2.5rem] border border-gray-800 shadow-2xl relative min-h-[500px] flex flex-col justify-center">
      <button onClick={onCancel} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24} /></button>
      
      {/* 1. Reading Stage */}
      {stage === "reading" && (
        <div className="text-center space-y-8 animate-in fade-in">
          <p className="text-xl text-gray-400 uppercase tracking-widest">Read Aloud</p>
          <p className="text-3xl font-medium italic text-white leading-relaxed">"{practiceSet.reading[currentIndex]}"</p>
          <RecordUI isRecording={isRecording} isUploading={isUploading} onStart={startRecording} onStop={stopRecording} disabled={false} />
        </div>
      )}

      {/* 2. Repetition Stage */}
      {stage === "repetition" && (
        <div className="text-center space-y-8 animate-in fade-in" key={`rep-${currentIndex}`}>
             <p className="text-xl text-gray-400 uppercase tracking-widest">Listen & Repeat</p>
             <button onClick={() => playAIVoice(practiceSet.repetition[currentIndex]?.text)} className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${playbackStatus === "playing" ? "bg-[#FF4A1F] scale-110" : "bg-[#FF4A1F]/20 text-[#FF4A1F]"}`}>
               <Volume2 size={40} className={playbackStatus === "playing" ? "animate-pulse" : ""} />
             </button>
             <RecordUI isRecording={isRecording} isUploading={isUploading} onStart={startRecording} onStop={stopRecording} disabled={playbackStatus === "playing"} />
        </div>
      )}

      {/* 3. Comprehension Stage */}
      {stage === "comprehension" && (
        <div className="animate-in fade-in w-full">
            {viewingStory ? (
                <div className="text-center space-y-8">
                    <div className="flex items-center gap-3 justify-center mb-4">
                        <Headphones className="text-[#FF4A1F]" size={32}/>
                        <h3 className="text-2xl font-bold uppercase tracking-widest">Listening Comprehension</h3>
                    </div>
                    <p className="text-gray-400 max-w-lg mx-auto">Listen carefully to the story. Once you are ready, answer the questions.</p>
                    <button onClick={() => playAIVoice(practiceSet.comprehension.story)} className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-500 ${playbackStatus === "playing" ? "bg-[#FF4A1F] scale-110" : "bg-[#1A1A1A] border-2 border-[#FF4A1F] text-[#FF4A1F]"}`}>
                        {playbackStatus === "playing" ? <Volume2 size={64} className="animate-pulse"/> : <Volume2 size={64}/>}
                    </button>
                    <button onClick={startComprehensionQuiz} className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 flex items-center justify-center gap-2 mt-8">
                        I'm Ready <ArrowRight size={20}/>
                    </button>
                </div>
            ) : (
                currentCompQuestion && (
                    <div className="space-y-6" key={`comp-${currentIndex}`}>
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-gray-500 uppercase tracking-widest text-sm">Question {currentIndex + 1} of {practiceSet.comprehension.questions.length}</span>
                            <button onClick={() => setViewingStory(true)} className="text-xs text-[#FF4A1F] hover:underline flex items-center gap-1"><Headphones size={12}/> Listen Again</button>
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-8">{currentCompQuestion.q || currentCompQuestion.question}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(currentCompQuestion.options || currentCompQuestion.opt || []).map((opt, i) => (
                            <button key={i} onClick={() => handleMCQAnswer(opt)} className="p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:border-[#FF4A1F] transition-all text-lg font-medium text-left">{opt}</button>
                        ))}
                        </div>
                    </div>
                )
            )}
        </div>
      )}

      {/* 4. FINISH STAGE WITH BADGE */}
      {stage === "finished" && (
        <div className="text-center space-y-8 animate-in zoom-in duration-500">
          
         

          <div>
             <p className="text-gray-400">Excellent effort. Submitting your performance for AI Analysis...</p>
          </div>

          <div className="flex justify-center gap-2 mb-4">
             {[1,2,3].map(i => <Star key={i} className="text-yellow-500 fill-yellow-500 animate-bounce" style={{animationDelay: `${i*100}ms`}} size={24}/>)}
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="w-full bg-gradient-to-r from-[#FF4A1F] to-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
               <>
                 <Loader2 className="animate-spin" /> Analyzing Results...
               </>
            ) : (
               "Generate Report"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const RecordUI = ({ isRecording, isUploading, onStart, onStop, disabled }) => (
  <button onClick={isRecording ? onStop : onStart} disabled={isUploading || disabled} className={`px-12 py-5 rounded-full font-black text-lg flex items-center gap-3 mx-auto transition-all ${disabled ? 'bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed' : isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-[#FF4A1F] text-black hover:scale-105'}`}>
    {isUploading ? <Loader2 className="animate-spin" /> : isRecording ? <MicOff /> : <Mic />} 
    <span>{isUploading ? "Uploading..." : isRecording ? "Stop" : "Record"}</span>
  </button>
);

export default CommunicationModule;