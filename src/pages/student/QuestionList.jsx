import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Code, CheckCircle, Play, Trophy, Zap, Award, TrendingUp } from 'lucide-react';

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ rank: '-', successRate: 0 }); // Store real metrics
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // --- 1. FETCH QUESTIONS & SOLUTIONS ---
      const { data: allQuestions } = await supabase
        .from('coding_questions')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: userSolves } = await supabase
        .from('student_solutions')
        .select('question_id, status')
        .eq('user_id', user.id);

      // Merge Logic (Keep existing logic)
      const merged = allQuestions.map(q => {
        const solvedEntry = userSolves?.find(s => s.question_id === q.id);
        return { ...q, status: solvedEntry?.status || 'Unsolved' };
      });
      setQuestions(merged);

      // --- 2. CALCULATE SUCCESS RATE ---
      // Success Rate = (Solved / Total Unique Attempts) * 100
      const totalAttempted = userSolves?.length || 0;
      const totalSolved = userSolves?.filter(s => s.status === 'Solved').length || 0;
      const calculatedRate = totalAttempted > 0 
        ? Math.round((totalSolved / totalAttempted) * 100) 
        : 0;

      // --- 3. CALCULATE GLOBAL RANK ---
      // Get My XP
      const { data: myStats } = await supabase
        .from('user_internship_stats')
        .select('total_xp')
        .eq('user_id', user.id)
        .single();
      
      const myXP = myStats?.total_xp || 0;

      // Count how many people have MORE XP than me
      const { count: rankCount } = await supabase
        .from('user_internship_stats')
        .select('*', { count: 'exact', head: true })
        .gt('total_xp', myXP);

      // Rank is (People ahead) + 1
      const realRank = rankCount + 1;

      setMetrics({ rank: realRank, successRate: calculatedRate });

    } catch (err) {
      console.error("Error fetching arena data:", err);
    } finally {
      setLoading(false);
    }
  };

  if(loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-medium">Loading Arena...</p>
      </div>
    </div>
  );

  const solvedCount = questions.filter(q => q.status === 'Solved').length;
  const totalCoins = questions.filter(q => q.status === 'Solved').reduce((sum, q) => sum + (q.coin_reward || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-500/20">
                    <Trophy className="text-white" size={28}/>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-100 to-orange-300 bg-clip-text text-transparent">
                    Practice Arena
                  </h1>
                </div>
                <p className="text-slate-400 text-lg ml-1">Master problems, collect rewards, dominate the leaderboard</p>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-3 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="text-yellow-400" size={18}/>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Global Rank</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    #{metrics.rank} {/* <-- REAL RANK HERE */}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle className="text-emerald-400" size={20}/>
                  <span className="text-slate-400 text-sm">Solved</span>
                </div>
                <div className="text-2xl font-bold text-white">{solvedCount}/{questions.length}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="text-yellow-400" size={20}/>
                  <span className="text-slate-400 text-sm">Total Coins</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">{totalCoins} 🪙</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="text-blue-400" size={20}/>
                  <span className="text-slate-400 text-sm">Success Rate</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {metrics.successRate}% {/* <-- REAL SUCCESS RATE HERE */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div 
              key={q.id}
              onClick={() => navigate(`/student/solve/${q.id}`)}
              className="group relative bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-orange-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10"
              style={{
                animationDelay: `${idx * 50}ms`,
                animation: 'slideIn 0.5s ease-out forwards',
                opacity: 0
              }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-6 flex items-center justify-between">
                <div className="flex items-center gap-5 flex-1">
                  {/* Status Icon */}
                  <div className={`relative p-4 rounded-2xl transition-all duration-300 ${
                    q.status === 'Solved' 
                      ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 shadow-lg shadow-emerald-500/20' 
                      : 'bg-slate-800/50 group-hover:bg-gradient-to-br group-hover:from-orange-500/20 group-hover:to-red-500/20 group-hover:shadow-lg group-hover:shadow-orange-500/20'
                  }`}>
                    {q.status === 'Solved' ? (
                      <CheckCircle className="text-emerald-400" size={28}/>
                    ) : (
                      <Code className="text-slate-400 group-hover:text-orange-400 transition-colors" size={28}/>
                    )}
                    {q.status === 'Solved' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Question Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-white group-hover:text-orange-400 transition-colors duration-300 mb-2">
                      {q.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all duration-300 ${
                        q.difficulty === 'Easy' 
                          ? 'border-emerald-700/50 text-emerald-400 bg-emerald-900/20 group-hover:border-emerald-500/50 group-hover:shadow-lg group-hover:shadow-emerald-500/20' 
                          : q.difficulty === 'Medium' 
                          ? 'border-yellow-700/50 text-yellow-400 bg-yellow-900/20 group-hover:border-yellow-500/50 group-hover:shadow-lg group-hover:shadow-yellow-500/20' 
                          : 'border-red-700/50 text-red-400 bg-red-900/20 group-hover:border-red-500/50 group-hover:shadow-lg group-hover:shadow-red-500/20'
                      }`}>
                        {q.difficulty}
                      </span>
                      {q.tags?.map(t => (
                        <span 
                          key={t} 
                          className="text-xs bg-slate-800/70 px-3 py-1.5 rounded-full text-slate-400 border border-slate-700/50 group-hover:bg-slate-700/70 group-hover:text-slate-300 transition-all duration-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reward Section */}
                <div className="text-right ml-6">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    <Zap className="text-yellow-400" size={18}/>
                    <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      +{q.coin_reward}
                    </span>
                    <span className="text-2xl">🪙</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end text-slate-400 group-hover:text-orange-400 transition-colors duration-300">
                    <span className="text-sm font-medium">
                      {q.status === 'Solved' ? 'Solved' : 'Start Challenge'}
                    </span>
                    <Play size={16} className="group-hover:translate-x-1 transition-transform duration-300"/>
                  </div>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="h-1 bg-gradient-to-r from-transparent via-orange-500/0 to-transparent group-hover:via-orange-500/50 transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {questions.length === 0 && !loading && (
          <div className="text-center py-20">
            <Target className="mx-auto text-slate-600 mb-4" size={64}/>
            <h3 className="text-2xl font-bold text-slate-400 mb-2">No challenges available yet</h3>
            <p className="text-slate-500">Check back soon for new problems to solve!</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}