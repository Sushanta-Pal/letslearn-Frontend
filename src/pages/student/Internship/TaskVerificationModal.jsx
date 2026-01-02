import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Loader2, GitCommit, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import CodingModule from '../CodingModule'; 

export default function TaskVerificationModal({ task, projectTitle, onClose, onSuccess }) {
  // States for the UI Pipeline
  const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'committing' | 'success'
  const [feedback, setFeedback] = useState(null); // To store AI feedback if rejected

  // --- SAFETY CHECK ---
  if (!task) return null;

  // --- 1. DATA ADAPTER ---
  const problemData = {
    id: task.id || 'unknown-task',
    title: task.title || 'Untitled Task',
    description: task.requirements || 'No requirements provided.', 
    difficulty: "Medium", 
    test_cases: task.test_cases || [], 
    starter_code: {
      [task.language || 'javascript']: task.starter_code || '// Write your solution here'
    }
  };

  // --- 2. CORE LOGIC PIPELINE ---
  const handleCodingComplete = async (score, code, language) => {
    
    // STEP 1: CHECK TEST CASES
    if (score < 100) {
      alert("Tests failed. You must pass all test cases (Score: 100/100) to verify this task.");
      return;
    }

    try {
      // STEP 2: AI VERIFICATION (Quality Gate)
      setStatus('verifying');
      
      const verifyRes = await fetch('import.meta.env.VITE_MOTIA_URL/api/verify-task', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            taskTitle: task.title,
            taskDescription: task.requirements,
            studentCode: code
        })
      });

      const verifyData = await verifyRes.json();

      // If AI Rejects the code
      if (!verifyData.success) {
          setStatus('idle'); // Go back to editor
          setFeedback(verifyData.feedback); // Show the harsh feedback
          alert(`Verification Failed:\n\n${verifyData.feedback}`);
          return; // STOP HERE
      }

      // If AI Approves -> Proceed to GitHub
      console.log(`AI Approved! XP Earned: ${verifyData.xp}`);
      
      // STEP 3: GITHUB AUTO-COMMIT
      setStatus('committing');
      await pushToGitHub(code, language);

      // STEP 4: SUCCESS
      setStatus('success');
      setTimeout(() => onSuccess(100), 1500); 

    } catch (err) {
      console.error(err);
      alert("Process Failed: " + err.message);
      setStatus('idle');
    }
  };

  // --- GITHUB HELPER FUNCTION ---
  const pushToGitHub = async (code, language) => {
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = session?.provider_token;

      if (!providerToken) throw new Error("GitHub Token Missing. Please click 'Connect GitHub' in the workspace.");

      const username = session.user?.user_metadata?.user_name;
      const repoName = "foxbird-internship-portfolio"; // Ensure this matches your repo name
      
      if (!username) throw new Error("Could not find GitHub username.");

      // Sanitize names
      const safeProject = (projectTitle || "Internship_Project").replace(/[^a-zA-Z0-9]/g, '_');
      const safeTask = (task.title || "Task").replace(/[^a-zA-Z0-9]/g, '_');
      
      const extMap = { 'python': 'py', 'java': 'java', 'cpp': 'cpp', 'javascript': 'js' };
      const ext = extMap[language] || 'txt';
      
      const filePath = `${safeProject}/${safeTask}.${ext}`;
      const message = `feat: Completed ${task.title} (Verified)`;
      const contentEncoded = btoa(code); 

      // Get SHA if exists
      let sha = null;
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
             headers: { Authorization: `Bearer ${providerToken}` }
        });
        if (checkRes.ok) {
            const fileData = await checkRes.json();
            sha = fileData.sha;
        }
      } catch (e) { console.warn("New file creation."); }

      // Push File
      const commitRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
          method: 'PUT',
          headers: { 
              Authorization: `Bearer ${providerToken}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message, content: contentEncoded, sha })
      });

      if (!commitRes.ok) {
        if (commitRes.status === 404) throw new Error("Repo not found. Please re-connect GitHub.");
        throw new Error("GitHub API Error: " + commitRes.statusText);
      }
  };

  // --- 3. RENDER LOADING STATES ---
  if (status !== 'idle') {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60]">
         <div className="text-center animate-in zoom-in-95 max-w-md p-6">
             
             {/* VERIFYING STATE */}
             {status === 'verifying' && (
                <>
                   <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500">
                      <ShieldCheck className="text-blue-500" size={32}/>
                   </div>
                   <h2 className="text-2xl font-bold text-white">AI Quality Audit</h2>
                   <p className="text-gray-400 mt-2 text-sm">Analyzing your code structure, logic, and plagiarism check...</p>
                   <Loader2 className="animate-spin text-blue-500 mx-auto mt-6" size={24}/>
                </>
             )}

             {/* COMMITTING STATE */}
             {status === 'committing' && (
                <>
                   <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500">
                      <GitCommit className="text-purple-500" size={32}/>
                   </div>
                   <h2 className="text-2xl font-bold text-white">Syncing to GitHub</h2>
                   <p className="text-gray-400 mt-2 text-sm">Verification Passed! Adding to your portfolio...</p>
                   <Loader2 className="animate-spin text-purple-500 mx-auto mt-6" size={24}/>
                </>
             )}

             {/* SUCCESS STATE */}
             {status === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                    <ShieldCheck className="text-white" size={32}/>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Verified & Pushed!</h2>
                  <p className="text-gray-400 mt-2">Task completed successfully.</p>
                </>
             )}
         </div>
      </div>
    );
  }

  // --- 4. RENDER EDITOR (IDLE) ---
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
       {/* Header with Feedback Alert */}
       <div className="absolute top-4 right-4 z-50 flex gap-4">
          {feedback && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl max-w-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5"/>
                  <div>
                      <span className="font-bold block mb-1">Previous Rejection:</span>
                      {feedback}
                  </div>
              </div>
          )}
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 h-fit rounded-full transition-colors">
             <X size={20}/>
          </button>
       </div>

       <CodingModule 
          problems={[problemData]} 
          onComplete={handleCodingComplete}
          onCancel={onClose}
          user={null} 
          sessionId={null} 
          isEmbedded={true}
       />
    </div>
  );
}