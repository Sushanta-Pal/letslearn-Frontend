import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Code, CheckCircle, Circle, Play, Trophy } from 'lucide-react';

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Fetch All Questions
      const { data: allQuestions } = await supabase
        .from('coding_questions')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch User's Solved Status
      const { data: userSolves } = await supabase
        .from('student_solutions')
        .select('question_id, status')
        .eq('user_id', user.id);

      // 3. Merge Data
      const merged = allQuestions.map(q => {
        const solvedEntry = userSolves?.find(s => s.question_id === q.id);
        return { ...q, status: solvedEntry?.status || 'Unsolved' };
      });

      setQuestions(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if(loading) return <div className="p-10 text-white text-center">Loading Arena...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen text-white">
      <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold">Practice Arena</h1>
          <p className="text-gray-400 mt-2">Solve problems, earn coins, climb the leaderboard.</p>
        </div>
        <div className="bg-[#111] px-4 py-2 rounded-lg border border-gray-800 text-sm text-yellow-500 font-bold flex items-center gap-2">
           <Trophy size={16}/> Global Rank: #42
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div 
            key={q.id}
            onClick={() => navigate(`/student/solve/${q.id}`)} // Navigate to Solver
            className="group bg-[#111] border border-gray-800 p-5 rounded-2xl flex items-center justify-between hover:border-[#FF4A1F] cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
          >
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-xl ${q.status === 'Solved' ? 'bg-green-900/20 text-green-500' : 'bg-gray-800 text-gray-400 group-hover:bg-[#FF4A1F] group-hover:text-black transition-colors'}`}>
                 {q.status === 'Solved' ? <CheckCircle size={24}/> : <Code size={24}/>}
               </div>
               <div>
                 <h3 className="font-bold text-lg group-hover:text-[#FF4A1F] transition-colors">{q.title}</h3>
                 <div className="flex gap-2 mt-1">
                   <span className={`text-[10px] px-2 py-0.5 rounded border ${
                     q.difficulty === 'Easy' ? 'border-green-800 text-green-500 bg-green-900/10' : 
                     q.difficulty === 'Medium' ? 'border-yellow-800 text-yellow-500 bg-yellow-900/10' : 
                     'border-red-800 text-red-500 bg-red-900/10'
                   }`}>{q.difficulty}</span>
                   {q.tags?.map(t => <span key={t} className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-400">{t}</span>)}
                 </div>
               </div>
            </div>

            <div className="text-right">
               <div className="flex items-center gap-1 justify-end text-yellow-500 font-bold mb-1">
                 <span>+{q.coin_reward}</span> 🪙
               </div>
               <span className="text-xs text-gray-500 group-hover:text-white flex items-center gap-1 justify-end">
                 {q.status === 'Solved' ? 'Solved' : 'Solve Challenge'} <Play size={12}/>
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}