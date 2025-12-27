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

  // ... (useEffect fetchProblem logic remains the same) ...

  // UPDATE THIS FUNCTION
  const handleComplete = async (score, submittedCode, language) => { 
    if(score === 100) {
      confetti();
      const { data: { user } } = await supabase.auth.getUser();
      
      const reward = problem.coin_reward || 10;

      // 1. Record Solution WITH CODE and LANGUAGE
      const { error: saveError } = await supabase.from('student_solutions').upsert({
        user_id: user.id,
        question_id: questionId,
        status: 'Solved',
        earned_coins: reward,
        code_submitted: submittedCode, // <--- Saving the actual code
        language: language             // <--- Saving the language (e.g., 'javascript')
      }, { onConflict: 'user_id, question_id' });

      if (saveError) {
        console.error("Error saving solution:", saveError);
        return; 
      }

      // 2. Add Coins (Only if successful)
      const { error: rpcError } = await supabase.rpc('increment_profile_coins', { 
        p_amount: reward 
      });

      if (rpcError) console.error("Wallet error:", rpcError);

      alert(`Problem Solved! +${reward} Coins Added.`);
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
        <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/50">Reward: {problem.coin_reward} 🪙</span>
      </div>
      
      <div className="flex-1 p-4">
        <CodingModule 
          problems={[problem]} 
          onComplete={handleComplete} // Passing the updated handler
        />
      </div>
    </div>
  );
}