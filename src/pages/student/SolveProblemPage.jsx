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

  // --- FETCH PROBLEM ---
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('coding_questions')
          .select('*')
          .eq('id', questionId)
          .single();

        if (error) throw error;
        setProblem(data);
      } catch (err) {
        console.error("Error loading problem:", err);
        alert("Problem not found.");
        navigate('/student/questions');
      } finally {
        setLoading(false);
      }
    };

    if (questionId) fetchProblem();
  }, [questionId, navigate]);

  // --- SUBMISSION HANDLER ---
  const handleComplete = async (score, submittedCode, language) => { 
    if(score === 100) {
      confetti();
      const { data: { user } } = await supabase.auth.getUser();
      const reward = problem.coin_reward || 10;

      // 1. CHECK: Has user already solved this?
      const { data: existingSolution } = await supabase
        .from('student_solutions')
        .select('status')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      const isAlreadySolved = existingSolution?.status === 'Solved';

      // 2. SAVE: Always save the latest code (Upsert)
      const { error: saveError } = await supabase.from('student_solutions').upsert({
        user_id: user.id,
        question_id: questionId,
        status: 'Solved',
        earned_coins: isAlreadySolved ? 0 : reward, // Record 0 coins if re-solving
        code_submitted: submittedCode,
        language: language            
      }, { onConflict: 'user_id, question_id' });

      if (saveError) {
        console.error("Error saving solution:", saveError);
        return; 
      }

      // 3. REWARD: Only add coins if it's the first time
      if (!isAlreadySolved) {
        const { error: rpcError } = await supabase.rpc('increment_profile_coins', { 
          p_amount: reward 
        });

        if (rpcError) console.error("Wallet error:", rpcError);
        alert(`Problem Solved! +${reward} Coins Added.`);
      } else {
        alert("Problem Solved! (You have already earned coins for this problem)");
      }

      navigate('/student/questions');
    } else {
        alert("Keep trying! You need to pass all test cases.");
    }
  };

  if(loading) return (
    <div className="h-screen bg-[#060606] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#FF4A1F]" size={40}/>
    </div>
  );
  
  if(!problem) return <div className="text-white p-10">Problem not found.</div>;

  return (
    <div className="bg-[#060606] min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft/>
        </button>
        <span className="text-white font-bold">{problem.title}</span>
        <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/50">
            Reward: {problem.coin_reward} 🪙
        </span>
      </div>
      
      <div className="flex-1 p-4">
        <CodingModule 
          problems={[problem]} 
          onComplete={handleComplete} 
        />
      </div>
    </div>
  );
}