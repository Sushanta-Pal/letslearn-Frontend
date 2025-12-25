import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import CodingModule from './CodingModule';
import { ArrowLeft, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SolveProblemPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      // Fetch Problem Details
      const { data } = await supabase
        .from('coding_questions')
        .select('*')
        .eq('id', questionId)
        .single();
      
      // Adapt DB columns to CodingModule expectations
      if (data) {
        setProblem({
          id: data.id,
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          testCases: data.test_cases, // DB: test_cases, Component: testCases
          starterCode: data.starter_code // DB: starter_code, Component: starterCode
        });
      }
      setLoading(false);
    };
    fetchProblem();
  }, [questionId]);

  // Handle Practice Mode Completion
  const handleComplete = async (score) => {
    if(score === 100) {
      confetti();
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Record Solution
      await supabase.from('student_solutions').upsert({
        user_id: user.id,
        question_id: questionId,
        status: 'Solved',
        earned_coins: problem.coin_reward // Assuming you passed rewards up or fetched them
      }, { onConflict: 'user_id, question_id' });

      // 2. (Optional) Add coins to user profile
      // await supabase.rpc('increment_coins', { amount: 10, uid: user.id });

      alert("Problem Solved! Coins Added.");
      navigate('/student/questions');
    }
  };

  if(loading) return <div className="h-screen bg-[#060606] flex items-center justify-center text-white"><Loader2 className="animate-spin"/></div>;
  if(!problem) return <div className="text-white p-10">Problem not found.</div>;

  return (
    <div className="bg-[#060606] min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white"><ArrowLeft/></button>
        <span className="text-white font-bold">{problem.title}</span>
      </div>
      
      <div className="flex-1 p-4">
        <CodingModule 
          // No sessionId passed -> Triggers 'Practice Mode' logic in module
          problems={[problem]} 
          onComplete={handleComplete} 
        />
      </div>
    </div>
  );
}