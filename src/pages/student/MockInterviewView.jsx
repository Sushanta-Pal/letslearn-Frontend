import React, { useState, useEffect, useRef } from "react";
import { Mic, BookOpen, Code, Trophy, Star, Loader2, Shuffle, Key, Clock, Lock, CheckCircle, ArrowRight, AlertTriangle, Camera } from "lucide-react";
import { supabase } from "../../supabaseClient";

// Import Modules
import CommunicationModule from "./CommunicationModule"; 
import TechnicalModule from "./TechnicalModule"; 
import CodingModule from "./CodingModule"; 

export default function MockInterviewView({ user, initialSessionId }) {
  
  // --- STATE ---
  const [activeSessionId, setActiveSessionId] = useState(initialSessionId || null);
  const [sessionData, setSessionData] = useState(null); 
  const [stage, setStage] = useState("lobby"); 
  
  const [scores, setScores] = useState({ comm: 0, tech: 0, coding: 0 });
  const [unlocked, setUnlocked] = useState({ tech: false, coding: false });
  const [loading, setLoading] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [history, setHistory] = useState([]);

  // --- PROCTORING STATE ---
  const [isProctored, setIsProctored] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    if (initialSessionId) loadExistingSession(initialSessionId);
    else fetchHistory();
  }, [initialSessionId, user]);

  const fetchHistory = async () => {
    if (!user) return;
    const { data } = await supabase.from('mock_interview_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if(data) setHistory(data);
  };

  const loadExistingSession = async (sessionId) => {
    setLoading(true);
    try {
      const { data: session, error } = await supabase.from('mock_interview_sessions').select('*').eq('id', sessionId).single();
      if (error || !session) throw new Error("Session not found");

      if (session.status === 'disqualified') {
        alert("This session was terminated due to malpractice.");
        setStage("lobby");
        return;
      }

      const { data: practiceSet } = await supabase.from('practice_sets').select('data').eq('id', session.metadata.set_id).single();

      setActiveSessionId(sessionId);
      setSessionData(practiceSet.data);
      setScores({ comm: session.communication_score || 0, tech: session.technical_score || 0, coding: session.coding_score || 0 });
      setUnlocked({ tech: (session.communication_score || 0) > 0, coding: (session.technical_score || 0) > 0 });
      
      if (session.status === 'completed') setStage("summary");
      else setStage("dashboard");

    } catch (err) { console.error(err); setStage("lobby"); } finally { setLoading(false); }
  };

  // --- 2. PROCTORING LOGIC (FIXED) ---
  
  const enableProctoring = async () => {
    try {
      // 1. Request Fullscreen FIRST (Must happen directly on click)
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        await elem.webkitRequestFullscreen();
      }

      // 2. Request Camera SECOND (After fullscreen is active)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      setIsProctored(true);
      return true; // Success

    } catch (err) {
      console.error(err);
      alert("Proctoring Failed: Camera permission and Fullscreen are REQUIRED.");
      
      // Cleanup if failed
      if (document.fullscreenElement) document.exitFullscreen();
      setIsProctored(false);
      return false; // Failed
    }
  };

  // Attach Security Listeners
  useEffect(() => {
    if (!isProctored || stage === 'lobby' || stage === 'summary') return;

    const handleVisibilityChange = () => {
      if (document.hidden) terminateSession("Tab Switching / Minimized Window");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) terminateSession("Exited Fullscreen Mode");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isProctored, stage]);

  // Video Stream Connection
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, stage]);

  // Terminate Session
  const terminateSession = async (reason) => {
    setIsProctored(false);
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    if (document.fullscreenElement) document.exitFullscreen();

    await supabase.from('mock_interview_sessions').update({ 
      status: 'disqualified', 
      communication_score: 0, 
      technical_score: 0, 
      coding_score: 0,
      metadata: { ...sessionData, disqualification_reason: reason }
    }).eq('id', activeSessionId);

    alert(`⚠️ MALPRACTICE DETECTED ⚠️\n\nReason: ${reason}\n\nYour session has been terminated.`);
    setStage("lobby");
    fetchHistory();
  };

  // --- ACTIONS ---
  const handleStartSession = async (practiceSet) => {
    // 1. Attempt to enable proctoring
    const success = await enableProctoring();
    if (!success) return; // Stop if user denied camera or fullscreen

    // 2. Initialize Session in DB
    try {
      const { data, error } = await supabase.from('mock_interview_sessions').insert([{
          user_id: user.id, user_email: user.email, status: 'in_progress',
          metadata: { set_id: practiceSet.id, title: practiceSet.title } 
        }]).select().single();

      if(error) throw error;

      setActiveSessionId(data.id);
      setSessionData(practiceSet.data);
      setStage("dashboard");
      setScores({ comm: 0, tech: 0, coding: 0 });
      setUnlocked({ tech: false, coding: false });
    } catch(err) { 
        alert("Error starting session"); 
        if (document.fullscreenElement) document.exitFullscreen(); // Exit if DB error
    }
  };

  const startRandomSet = async () => {
    const { data } = await supabase.from('practice_sets').select('*').limit(20);
    if(data?.length) handleStartSession(data[Math.floor(Math.random() * data.length)]);
  };

  const startProtectedSet = async () => {
    if(!accessKey) return;
    const { data } = await supabase.from('practice_sets').select('*').eq('access_key', accessKey.trim()).single();
    if(data) handleStartSession(data);
    else alert("Invalid Code");
  };

  const handleExit = () => {
    if (isProctored) {
        if(!confirm("Exiting now will terminate the session. Are you sure?")) return;
        if(cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        if (document.fullscreenElement) document.exitFullscreen();
    }
    setStage("lobby");
    setActiveSessionId(null);
  };

  // --- RENDER ---
  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-[#FF4A1F]"><Loader2 className="animate-spin" size={40}/></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FF4A1F] selection:text-black">
      
      {/* PROCTORING OVERLAY */}
      {isProctored && stage !== 'lobby' && stage !== 'summary' && (
        <div className="fixed bottom-4 right-4 z-50 w-48 h-36 bg-black border-2 border-red-500 rounded-xl overflow-hidden shadow-2xl shadow-red-900/50">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div> REC
            </div>
        </div>
      )}

      {/* LOBBY VIEW */}
      {stage === "lobby" && (
        <div className="max-w-6xl mx-auto p-10 space-y-12">
           <div className="text-center space-y-4">
              <h1 className="text-5xl font-extrabold text-white">Mock Interview Portal</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm font-bold">
                 <AlertTriangle size={16}/> Proctored Environment: Camera & Fullscreen Required
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button onClick={startRandomSet} className="bg-[#111] border border-gray-800 p-8 rounded-3xl hover:border-[#FF4A1F] hover:bg-[#161616] transition-all group text-left relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Shuffle size={100}/></div>
                 <h3 className="text-2xl font-bold text-white mb-2">Start Random Mock</h3>
                 <p className="text-gray-500 text-sm">AI will select a random problem set. Fullscreen mode will activate immediately.</p>
              </button>
              
              <div className="bg-[#111] border border-gray-800 p-8 rounded-3xl text-left">
                 <h3 className="text-xl font-bold text-white mb-4">Have a Code?</h3>
                 <div className="flex gap-2">
                    <input value={accessKey} onChange={e => setAccessKey(e.target.value)} className="bg-black border border-gray-700 rounded-xl px-4 py-3 w-full text-white focus:border-[#FF4A1F] outline-none" placeholder="ENTER-CODE" />
                    <button onClick={startProtectedSet} className="bg-[#FF4A1F] text-black font-bold px-6 rounded-xl hover:bg-orange-600">GO</button>
                 </div>
              </div>
           </div>

           {/* History */}
           <div className="bg-[#111] border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6">Recent Attempts</h3>
              <table className="w-full text-left text-sm text-gray-400">
                <thead><tr className="border-b border-gray-800 text-gray-600 uppercase text-xs"><th className="py-3">Date</th><th className="py-3">Status</th><th className="py-3">Score</th></tr></thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b border-gray-800/50 hover:bg-white/5">
                      <td className="py-3">{new Date(h.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            h.status === 'disqualified' ? 'bg-red-500/20 text-red-500' : 
                            h.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                            {h.status === 'disqualified' ? 'TERMINATED' : h.status}
                        </span>
                      </td>
                      <td className="py-3">{h.technical_score + h.communication_score + h.coding_score}/300</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {/* ACTIVE SESSION VIEWS */}
      {stage !== "lobby" && stage !== "summary" && (
         <>
            {/* Dashboard / Hub */}
            {stage === "dashboard" && (
                <div className="max-w-5xl mx-auto p-10 animate-in fade-in">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Session Dashboard</h2>
                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1"><Camera size={12}/> Proctoring Active: Do not switch tabs.</p>
                        </div>
                        <button onClick={handleExit} className="px-4 py-2 rounded-lg border border-red-900 text-red-500 hover:bg-red-900/20 text-sm">Terminate Session</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DashboardCard title="Communication" icon={Mic} status={scores.comm > 0 ? "done" : "active"} score={scores.comm} onClick={() => setStage("communication")} locked={false} />
                        <DashboardCard title="Technical" icon={BookOpen} status={scores.tech > 0 ? "done" : unlocked.tech ? "active" : "locked"} score={scores.tech} onClick={() => setStage("technical")} locked={!unlocked.tech} />
                        <DashboardCard title="Coding" icon={Code} status={scores.coding > 0 ? "done" : unlocked.coding ? "active" : "locked"} score={scores.coding} onClick={() => setStage("coding")} locked={!unlocked.coding} />
                    </div>
                </div>
            )}

            {/* Modules */}
            {stage === "communication" && <CommunicationModule user={user} sessionId={activeSessionId} onComplete={(s) => {setScores(p => ({...p, comm:s})); if(s>=60) setUnlocked(p=>({...p, tech:true})); setStage("dashboard");}} onCancel={() => setStage("dashboard")} customData={sessionData?.communication} />}
            {stage === "technical" && <TechnicalModule user={user} sessionId={activeSessionId} onComplete={(p, s) => {setScores(p => ({...p, tech:s})); if(p) setUnlocked(p=>({...p, coding:true})); setStage("dashboard");}} onCancel={() => setStage("dashboard")} questions={sessionData?.technical} />}
            {stage === "coding" && <CodingModule user={user} sessionId={activeSessionId} onComplete={(s) => {setScores(p => ({...p, coding:s})); setStage("summary");}} onCancel={() => setStage("dashboard")} problems={sessionData?.coding} />}
         </>
      )}

      {/* SUMMARY VIEW */}
      {stage === "summary" && (
         <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-[#111] border border-gray-800 rounded-3xl p-10 text-center max-w-xl w-full">
                <h1 className="text-4xl font-bold text-white mb-2">Session Complete</h1>
                <p className="text-gray-400 mb-8">Results have been saved to your profile.</p>
                <button onClick={handleExit} className="bg-white text-black font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform">Return to Lobby</button>
            </div>
         </div>
      )}
    </div>
  );
}

// Helper Card
const DashboardCard = ({ title, icon: Icon, status, score, onClick, locked }) => (
  <div onClick={!locked ? onClick : null} className={`p-6 rounded-2xl border transition-all ${locked ? 'bg-[#111] border-gray-800 opacity-50 cursor-not-allowed' : 'bg-black border-gray-700 hover:border-[#FF4A1F] cursor-pointer'}`}>
    <div className="flex justify-between mb-4">
      <Icon className={locked ? "text-gray-600" : "text-[#FF4A1F]"} size={24}/>
      {status === 'done' && <span className="text-green-500 font-mono font-bold">{score}%</span>}
    </div>
    <h3 className="text-lg font-bold text-white">{title}</h3>
    <p className="text-xs text-gray-500 mt-2 uppercase flex items-center gap-2">
      {locked ? <><Lock size={12}/> Locked</> : status === 'done' ? <><CheckCircle size={12}/> Completed</> : "Start Now"}
    </p>
  </div>
);