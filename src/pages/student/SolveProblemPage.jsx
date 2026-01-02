import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import CodingModule from './CodingModule';
import { ArrowLeft, Loader2, Github, Check } from 'lucide-react'; // Added Icons
import confetti from 'canvas-confetti';

export default function SolveProblemPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pushingToGithub, setPushingToGithub] = useState(false); // New State

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

  // --- GITHUB PUSH FUNCTION ---
  const pushToGitHub = async (user, problemTitle, code, language) => {
    try {
      setPushingToGithub(true);
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = session?.provider_token;
      const username = session?.user?.user_metadata?.user_name;

      if (!providerToken || !username) {
        console.warn("GitHub not connected. Skipping push.");
        return false;
      }

      const repoName = "foxbird-practice-arena"; // Same repo as QuestionList
      const safeTitle = problemTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const extMap = { 'python': 'py', 'java': 'java', 'cpp': 'cpp', 'javascript': 'js' };
      const ext = extMap[language] || 'txt';
      const filePath = `Solutions/${safeTitle}.${ext}`;
      
      const message = `Solved: ${problemTitle}`;
      const contentEncoded = btoa(code);

      // 1. Check if file exists (to get SHA for update)
      let sha = null;
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
             headers: { Authorization: `Bearer ${providerToken}` }
        });
        if (checkRes.ok) {
            const fileData = await checkRes.json();
            sha = fileData.sha;
        }
      } catch (e) { /* Ignore if file doesn't exist */ }

      // 2. Upload File
      const uploadRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
          method: 'PUT',
          headers: { 
              Authorization: `Bearer ${providerToken}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message, content: contentEncoded, sha })
      });

      if (!uploadRes.ok) {
         if (uploadRes.status === 404) {
             alert("Could not push to GitHub: Repository 'foxbird-practice-arena' not found. Please create it from the Practice Dashboard.");
         }
         return false;
      }
      
      return true;

    } catch (err) {
      console.error("GitHub Push Error:", err);
      return false;
    } finally {
      setPushingToGithub(false);
    }
  };

  // --- SUBMISSION HANDLER ---
  const handleComplete = async (score, submittedCode, language) => { 
    if(score === 100) {
      // 1. Visual Celebration
      confetti();
      
      const { data: { user } } = await supabase.auth.getUser();
      const reward = problem.coin_reward || 10;

      // 2. CHECK: Has user already solved this?
      const { data: existingSolution } = await supabase
        .from('student_solutions')
        .select('status')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      const isAlreadySolved = existingSolution?.status === 'Solved';

      // 3. SAVE to Database
      const { error: saveError } = await supabase.from('student_solutions').upsert({
        user_id: user.id,
        question_id: questionId,
        status: 'Solved',
        earned_coins: isAlreadySolved ? 0 : reward, 
        code_submitted: submittedCode,
        language: language            
      }, { onConflict: 'user_id, question_id' });

      if (saveError) {
        console.error("Error saving solution:", saveError);
        return; 
      }

      // 4. PUSH TO GITHUB (New Step)
      const githubSuccess = await pushToGitHub(user, problem.title, submittedCode, language);

      // 5. REWARD & FEEDBACK
      let msg = "";
      if (!isAlreadySolved) {
        const { error: rpcError } = await supabase.rpc('increment_profile_coins', { p_amount: reward });
        if (rpcError) console.error("Wallet error:", rpcError);
        msg = `Problem Solved! +${reward} Coins Added.`;
      } else {
        msg = "Problem Solved! (Already earned coins).";
      }

      if (githubSuccess) msg += " Code pushed to GitHub! 🚀";
      
      alert(msg);
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
      {/* PUSHING OVERLAY */}
      {pushingToGithub && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
              <Github size={48} className="text-white mb-4 animate-bounce"/>
              <h2 className="text-xl font-bold text-white">Syncing to GitHub...</h2>
              <p className="text-gray-400 text-sm">Building your portfolio</p>
          </div>
      )}

      <div className="p-4 border-b border-gray-800 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft/>
        </button>
        <span className="text-white font-bold">{problem.title}</span>
        <div className="flex gap-2">
            <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/50">
                Reward: {problem.coin_reward} 🪙
            </span>
        </div>
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