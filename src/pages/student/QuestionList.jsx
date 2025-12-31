import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Code, CheckCircle, Play, Trophy, Zap, Award, TrendingUp, 
  Github, Loader2, GitFork, ExternalLink, AlertCircle, Lock 
} from 'lucide-react';

export default function QuestionList() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ rank: '-', successRate: 0 });
  
  // GitHub State
  const [ghState, setGhState] = useState({
    isConnected: false,
    username: null,
    repoExists: false,
    loading: true,
    token: null
  });

  useEffect(() => {
    fetchData();
    checkGitHubConnection();
  }, []);

  // --- 1. DATA FETCHING ---
  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: allQuestions } = await supabase
        .from('coding_questions')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: userSolves } = await supabase
        .from('student_solutions')
        .select('question_id, status')
        .eq('user_id', user.id);

      const merged = allQuestions.map(q => {
        const solvedEntry = userSolves?.find(s => s.question_id === q.id);
        return { ...q, status: solvedEntry?.status || 'Unsolved' };
      });
      setQuestions(merged);

      // Metrics
      const totalAttempted = userSolves?.length || 0;
      const totalSolved = userSolves?.filter(s => s.status === 'Solved').length || 0;
      const calculatedRate = totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0;

      const { data: myStats } = await supabase
        .from('user_internship_stats')
        .select('total_xp')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const myXP = myStats?.total_xp || 0;
      const { count: rankCount } = await supabase
        .from('user_internship_stats')
        .select('*', { count: 'exact', head: true })
        .gt('total_xp', myXP);

      setMetrics({ rank: rankCount + 1, successRate: calculatedRate });

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. GITHUB LOGIC ---
  const checkGitHubConnection = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.provider_token) {
        const username = session.user.user_metadata.user_name;
        // Check if repo exists
        try {
            const res = await fetch(`https://api.github.com/repos/${username}/foxbird-practice-arena`, {
                headers: { Authorization: `Bearer ${session.provider_token}` }
            });
            setGhState({
                isConnected: true,
                username,
                repoExists: res.status === 200,
                loading: false,
                token: session.provider_token
            });
        } catch (e) {
            setGhState(prev => ({ ...prev, isConnected: true, loading: false }));
        }
    } else {
        setGhState(prev => ({ ...prev, loading: false }));
    }
  };

  const connectGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { scopes: 'repo', redirectTo: window.location.href }
    });
  };

  const createPracticeRepo = async () => {
    if (!ghState.token) return alert("Session expired. Please reconnect GitHub.");
    
    try {
        setGhState(prev => ({ ...prev, loading: true }));
        const res = await fetch(`https://api.github.com/user/repos`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${ghState.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'foxbird-practice-arena',
                description: 'My Data Structures & Algorithms Solutions powered by Fox Bird',
                private: false,
                auto_init: true
            })
        });
        
        if (res.ok) {
            setGhState(prev => ({ ...prev, repoExists: true, loading: false }));
            alert("Repository 'foxbird-practice-arena' created successfully!");
        } else {
            throw new Error("Failed to create repo");
        }
    } catch (err) {
        alert("Error creating repo. Please try again.");
        setGhState(prev => ({ ...prev, loading: false }));
    }
  };

  const solvedCount = questions.filter(q => q.status === 'Solved').length;
  const totalCoins = questions.filter(q => q.status === 'Solved').reduce((sum, q) => sum + (q.coin_reward || 0), 0);

  if(loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#FF4A1F]"><Loader2 className="animate-spin" size={40}/></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      
      {/* HEADER BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-[#050505] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#FF4A1F]/10 rounded-lg text-[#FF4A1F]">
                        <Code size={24} />
                    </div>
                    <span className="text-[#FF4A1F] font-bold tracking-widest text-xs uppercase">Coding Arena</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">Master Your Skills</h1>
                <p className="text-gray-400 text-lg">Solve problems, earn XP, and build your GitHub portfolio automatically.</p>
            </div>

            {/* GITHUB WIDGET */}
            <div className="bg-[#111] border border-white/10 p-4 rounded-2xl flex items-center gap-4 min-w-[300px]">
                <div className="p-3 bg-[#24292e] rounded-xl text-white">
                    <Github size={24}/>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-sm text-white">GitHub Sync</h3>
                    <p className="text-xs text-gray-500">
                        {ghState.loading ? "Checking..." : 
                         !ghState.isConnected ? "Not Connected" : 
                         !ghState.repoExists ? "Repo Missing" : "Active"}
                    </p>
                </div>
                {ghState.loading ? (
                    <Loader2 className="animate-spin text-gray-500" size={18}/>
                ) : !ghState.isConnected ? (
                    <button onClick={connectGitHub} className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                        Connect
                    </button>
                ) : !ghState.repoExists ? (
                    <button onClick={createPracticeRepo} className="px-3 py-1.5 bg-[#FF4A1F] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-colors">
                        Initialize
                    </button>
                ) : (
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                )}
            </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard label="Global Rank" value={`#${metrics.rank}`} icon={Trophy} color="text-yellow-500" />
            <StatCard label="Problems Solved" value={`${solvedCount}/${questions.length}`} icon={CheckCircle} color="text-emerald-500" />
            <StatCard label="Success Rate" value={`${metrics.successRate}%`} icon={TrendingUp} color="text-blue-500" />
            <StatCard label="Total Earnings" value={totalCoins} icon={Zap} color="text-[#FF4A1F]" suffix="🪙" />
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-6">Challenge Library</h2>
            
            {questions.map((q, i) => (
                <div 
                    key={q.id}
                    onClick={() => navigate(`/student/solve/${q.id}`)}
                    className="group flex items-center justify-between bg-[#111] border border-white/5 hover:border-[#FF4A1F]/30 p-5 rounded-2xl transition-all hover:shadow-lg hover:shadow-orange-900/5 cursor-pointer relative overflow-hidden"
                    style={{ animation: `fadeIn 0.5s ease-out ${i * 0.05}s backwards` }}
                >
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF4A1F]/0 via-[#FF4A1F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>

                    <div className="flex items-center gap-5 relative z-10">
                        {/* Status Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                            q.status === 'Solved' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                : 'bg-white/5 border-white/10 text-gray-500 group-hover:text-white'
                        }`}>
                            {q.status === 'Solved' ? <CheckCircle size={20}/> : <Code size={20}/>}
                        </div>

                        <div>
                            <h3 className="font-bold text-white text-lg group-hover:text-[#FF4A1F] transition-colors">{q.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${getDifficultyStyle(q.difficulty)}`}>
                                    {q.difficulty}
                                </span>
                                {q.tags?.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="text-right">
                            <div className="text-white font-bold flex items-center justify-end gap-1">
                                +{q.coin_reward} <Zap size={14} className="text-yellow-500 fill-yellow-500"/>
                            </div>
                            <span className="text-xs text-gray-500">Reward</span>
                        </div>
                        
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                            <Play size={16} fill="currentColor" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatCard({ label, value, icon: Icon, color, suffix }) {
    return (
        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-white">{value} <span className="text-lg text-gray-500">{suffix}</span></p>
            </div>
        </div>
    )
}

function getDifficultyStyle(diff) {
    switch(diff) {
        case 'Easy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'Hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
}