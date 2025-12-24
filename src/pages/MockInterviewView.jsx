import React, { useState, useEffect } from "react";
import { Mic, BookOpen, Code, Award, Play, Lock, Shuffle, Key, Loader2, CheckCircle, Trophy, Clock, Star, Zap } from "lucide-react";
import { supabase } from "../supabaseClient";

// Import Modules
import CommunicationModule from "./CommunicationModule"; 
import TechnicalModule from "./TechnicalModule"; 
import CodingModule from "./CodingModule"; 

export default function MockInterviewView({ user }) {
  // --- STATE ---
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null); 
  const [stage, setStage] = useState("lobby"); // lobby, dashboard, communication, technical, coding, summary
  
  // Scores
  const [scores, setScores] = useState({ comm: 0, tech: 0, coding: 0 });
  const [unlocked, setUnlocked] = useState({ tech: false, coding: false });
  const [loading, setLoading] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [history, setHistory] = useState([]);

  // Fetch History on Load
  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('mock_interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if(data) setHistory(data);
    };
    if(user) fetchHistory();
  }, [user, activeSessionId, stage]); // Refresh history when stage changes

  // --- LOBBY ACTIONS ---
  const startRandomSet = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('practice_sets').select('*').is('access_key', null).limit(20);
      if(error || !data.length) throw new Error("No public practice sets found.");
      const randomSet = data[Math.floor(Math.random() * data.length)];
      initializeSession(randomSet);
    } catch(err) { alert(err.message); setLoading(false); }
  };

  const startProtectedSet = async () => {
    if(!accessKey) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('practice_sets').select('*').eq('access_key', accessKey.trim()).single();
      if(error || !data) throw new Error("Invalid Key or Set not found.");
      initializeSession(data);
    } catch(err) { alert(err.message); setLoading(false); }
  };

  const initializeSession = async (practiceSet) => {
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
    } catch(err) { console.error(err); alert("Failed to start session."); } finally { setLoading(false); }
  };

  // --- MODULE COMPLETION HANDLERS ---
  const onCommFinish = async (score) => {
    await supabase.from('mock_interview_sessions').update({ communication_score: score }).eq('id', activeSessionId);
    setScores(prev => ({...prev, comm: score}));
    if(score >= 60) setUnlocked(prev => ({...prev, tech: true}));
    setStage("dashboard");
  };

  const onTechFinish = async (passed, score) => {
    await supabase.from('mock_interview_sessions').update({ technical_score: score, technical_passed: passed }).eq('id', activeSessionId);
    setScores(prev => ({...prev, tech: score}));
    if(passed) setUnlocked(prev => ({...prev, coding: true}));
    setStage("dashboard");
  };

  const onCodingFinish = async (score) => {
    // 1. Update DB
    await supabase.from('mock_interview_sessions')
      .update({ coding_score: score, status: 'completed' })
      .eq('id', activeSessionId);

    // 2. Update Local State
    setScores(prev => ({...prev, coding: score}));
    
    // 3. SHOW FINAL BADGE SCREEN (Instead of dashboard)
    setStage("summary"); 
  };

  const handleExit = () => {
    setStage("lobby");
    setActiveSessionId(null);
    setSessionData(null);
  };

  // --- RENDERING ---

  if (stage === "lobby") {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-12 animate-in fade-in">
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-10 text-center relative overflow-hidden">
           <div className="relative z-10">
             <h1 className="text-4xl font-bold text-white mb-4">Mock Interview Portal</h1>
             <p className="text-gray-400 mb-8 max-w-xl mx-auto">Master your interview skills with our 3-stage assessment engine.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button onClick={startRandomSet} disabled={loading} className="bg-black border border-gray-800 p-6 rounded-2xl hover:border-[#FF4A1F] transition-all group text-left">
                   <div className="flex items-center gap-4 mb-2">
                     <div className="p-3 bg-blue-900/20 text-blue-500 rounded-lg group-hover:scale-110 transition-transform">{loading ? <Loader2 className="animate-spin"/> : <Shuffle size={24}/>}</div>
                     <span className="font-bold text-white text-lg">Random Mock</span>
                   </div>
                   <p className="text-sm text-gray-500">Practice with a randomly generated set.</p>
                </button>
                <div className="bg-black border border-gray-800 p-6 rounded-2xl text-left">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-yellow-900/20 text-yellow-500 rounded-lg"><Key size={24}/></div>
                     <span className="font-bold text-white text-lg">Classroom Code</span>
                   </div>
                   <div className="flex gap-2">
                     <input value={accessKey} onChange={e => setAccessKey(e.target.value)} className="bg-[#111] border border-gray-700 rounded px-3 py-2 text-white text-sm w-full focus:border-yellow-500 outline-none" placeholder="ENTER-CODE"/>
                     <button onClick={startProtectedSet} disabled={loading || !accessKey} className="bg-yellow-600 text-black font-bold px-3 rounded hover:bg-yellow-500 disabled:opacity-50">GO</button>
                   </div>
                </div>
             </div>
           </div>
        </div>
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
           <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Clock size={20}/> Previous Attempts</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-400">
               <thead><tr className="border-b border-gray-800 text-gray-500 uppercase text-xs"><th className="py-3">Date</th><th className="py-3">Status</th><th className="py-3">Comm.</th><th className="py-3">Tech</th><th className="py-3">Coding</th></tr></thead>
               <tbody>
                 {history.map(h => (
                   <tr key={h.id} className="border-b border-gray-800/50">
                     <td className="py-3">{new Date(h.created_at).toLocaleDateString()}</td>
                     <td className="py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${h.status === 'completed' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>{h.status}</span></td>
                     <td className="py-3">{h.communication_score}%</td><td className="py-3">{h.technical_passed ? 'Pass' : 'Fail'}</td><td className="py-3">{h.coding_score || '-'}%</td>
                   </tr>
                 ))}
                 {history.length === 0 && <tr><td colSpan="5" className="py-8 text-center italic">No history found.</td></tr>}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  if (stage === "dashboard") {
    return (
      <div className="max-w-5xl mx-auto p-6 animate-in fade-in">
        <div className="flex justify-between items-center mb-8">
           <div><h2 className="text-2xl font-bold text-white">Live Session</h2><span className="text-xs text-gray-500">ID: {activeSessionId}</span></div>
           <button onClick={handleExit} className="text-red-500 text-sm hover:underline">Exit Session</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <DashboardCard title="Communication" icon={Mic} status={scores.comm > 0 ? "done" : "active"} score={scores.comm} onClick={() => setStage("communication")} locked={false} />
           <DashboardCard title="Technical" icon={BookOpen} status={scores.tech > 0 ? "done" : unlocked.tech ? "active" : "locked"} score={scores.tech} onClick={() => setStage("technical")} locked={!unlocked.tech} />
           <DashboardCard title="Coding" icon={Code} status={scores.coding > 0 ? "done" : unlocked.coding ? "active" : "locked"} score={scores.coding} onClick={() => setStage("coding")} locked={!unlocked.coding} />
        </div>
      </div>
    );
  }

  // --- FINAL SUMMARY BADGE VIEW ---
  if (stage === "summary") {
    const totalScore = Math.round((scores.comm + scores.tech + scores.coding) / 3);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 animate-in zoom-in duration-500">
         <div className="bg-[#111] border border-gray-800 rounded-3xl p-10 max-w-2xl w-full text-center relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mb-6 shadow-xl shadow-orange-900/40">
                    <Trophy size={64} className="text-black" />
                </div>
                
                <h1 className="text-4xl font-extrabold text-white mb-2">Interview Completed!</h1>
                <p className="text-gray-400 mb-8">You have successfully cleared all 3 rounds.</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <ScoreBox label="Comm." score={scores.comm} />
                    <ScoreBox label="Technical" score={scores.tech} />
                    <ScoreBox label="Coding" score={scores.coding} />
                </div>

                <div className="bg-black/50 border border-gray-800 rounded-xl p-4 mb-8">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Average Performance</p>
                    <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                        {totalScore}% 
                        {totalScore > 80 ? <Star className="text-yellow-500 fill-yellow-500" size={24}/> : null}
                    </div>
                </div>

                <button 
                    onClick={handleExit} 
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                    Return to Lobby <ArrowRight size={20}/>
                </button>
            </div>
         </div>
      </div>
    );
  }

  // --- MODULE VIEWS ---
  if (stage === "communication") return <CommunicationModule user={user} sessionId={activeSessionId} onComplete={onCommFinish} onCancel={() => setStage("dashboard")} customData={sessionData.communication} />;
  if (stage === "technical") return <TechnicalModule user={user} sessionId={activeSessionId} onComplete={onTechFinish} onCancel={() => setStage("dashboard")} questions={sessionData.technical} />;
  if (stage === "coding") return <CodingModule user={user} sessionId={activeSessionId} onComplete={onCodingFinish} onCancel={() => setStage("dashboard")} problems={sessionData.coding} />;

  return <div>Error: Unknown Stage</div>;
}

// Helpers
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

const ScoreBox = ({ label, score }) => (
    <div className="bg-[#1A1A1A] rounded-lg p-3 border border-white/5">
        <p className="text-[10px] text-gray-500 uppercase mb-1">{label}</p>
        <span className={`text-xl font-bold ${score >= 60 ? 'text-green-400' : 'text-orange-400'}`}>{score}</span>
    </div>
);

// Icon helper
const ArrowRight = ({size}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);