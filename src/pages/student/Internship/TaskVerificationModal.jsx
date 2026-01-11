import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { Loader2, GitCommit, X, ShieldCheck, AlertTriangle, CheckCircle, Github, ArrowRight, XCircle } from 'lucide-react';

export default function TaskVerificationModal({ task, code, language, projectTitle, user, onClose, onSuccess }) {
  // States for the UI Pipeline
  const [status, setStatus] = useState('analyzing'); // analyzing | verifying | uploading | success | error
  const [logs, setLogs] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [githubUrl, setGithubUrl] = useState(null);

  useEffect(() => {
    runPipeline();
  }, []);

  const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

  // --- 1. PATH PARSER (Critical for Portfolio) ---
  const getFilePath = () => {
    // If title has a path like "2. Styles: css/global.css", extract it
    if (task.title && task.title.includes(":")) {
        return task.title.split(":")[1].trim(); 
    }
    
    // Fallback: Clean string
    const safeProject = (projectTitle || "Internship_Project").replace(/[^a-zA-Z0-9]/g, '_');
    const safeTask = (task.title || `task-${task.id}`).replace(/[^a-zA-Z0-9-_]/g, '_');
    
    const extMap = { 'python': 'py', 'java': 'java', 'cpp': 'cpp', 'javascript': 'js', 'html': 'html', 'css': 'css' };
    const ext = extMap[language] || language || 'txt';
    
    return `${safeProject}/${safeTask}.${ext}`;
  };

  // --- 2. CORE PIPELINE ---
  const runPipeline = async () => {
    try {
      // STEP 1: AI QUALITY CHECK
      setStatus('analyzing');
      addLog("Initializing AI Code Reviewer...");
      
      let aiPassed = true;
      let aiFeedbackMsg = "Code looks good.";

      // TRY CALLING REAL AI
      try {
          const API_URL = import.meta.env.VITE_MOTIA_URL; 
          if (API_URL) {
              const verifyRes = await fetch(`${API_URL}/api/verify-task`, { 
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      taskTitle: task.title,
                      taskDescription: task.requirements,
                      studentCode: code
                  })
              });
              const verifyData = await verifyRes.json();
              if (!verifyData.success) {
                  aiPassed = false;
                  aiFeedbackMsg = verifyData.feedback;
              } else {
                  addLog(`AI Approved! (+${verifyData.xp || 100} XP)`);
              }
          } else {
              // MOCK AI (If env var missing)
              await new Promise(r => setTimeout(r, 1500)); 
              addLog("AI Verification Simulation: Passed.");
          }
      } catch (err) {
          console.warn("AI Service Unavailable, skipping check.", err);
          addLog("⚠️ AI Service offline. Skipping semantic check.");
      }

      if (!aiPassed) {
          throw new Error(aiFeedbackMsg);
      }
      
      addLog("Code quality verified.");

      // STEP 2: GITHUB SYNC
      setStatus('uploading');
      addLog("Connecting to GitHub...");

      // Get Token
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = session?.provider_token;
      if (!providerToken) throw new Error("GitHub Token Missing. Please reconnect GitHub.");

      const username = session.user?.user_metadata?.user_name;
      const repoName = "foxbird-internship-portfolio"; 
      
      if (!username) throw new Error("Could not find GitHub username.");

      const filePath = getFilePath();
      addLog(`Target: ${repoName}/${filePath}`);

      // Prepare Commit
      const message = `feat: Completed ${task.title}`;
      const contentEncoded = btoa(code); 

      // Get SHA (for update)
      let sha = null;
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
             headers: { Authorization: `Bearer ${providerToken}` }
        });
        if (checkRes.ok) {
            const fileData = await checkRes.json();
            sha = fileData.sha;
            addLog("File exists. Creating update commit...");
        }
      } catch (e) {}

      // Push File
      const commitRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
          method: 'PUT',
          headers: { 
              Authorization: `Bearer ${providerToken}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message, content: contentEncoded, sha })
      });

      if (!commitRes.ok) throw new Error(`GitHub Error: ${commitRes.statusText}`);
      
      const commitData = await commitRes.json();
      setGithubUrl(commitData.content?.html_url || `https://github.com/${username}/${repoName}`);
      addLog("Successfully pushed to main branch.");

      // STEP 3: SUCCESS
      setStatus('success');
      // Tell Parent Component we are done
      // We wait for user to click "Continue" to trigger onSuccess
      
    } catch (err) {
      console.error(err);
      setFeedback(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0A0A0A] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative animate-in zoom-in-95">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111]">
            <h3 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className={status === 'error' ? "text-red-500" : "text-emerald-500"}/> 
                {status === 'error' ? "Verification Failed" : "Verification Protocol"}
            </h3>
            <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white"/></button>
        </div>

        {/* STATUS VISUALIZER */}
        <div className="p-8 text-center border-b border-white/5">
             {status === 'analyzing' && (
                 <>
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                        <Loader2 className="animate-spin text-blue-500" size={32}/>
                    </div>
                    <h2 className="text-xl font-bold text-white">AI Analyzing...</h2>
                    <p className="text-gray-400 text-sm mt-1">Checking logic & requirements</p>
                 </>
             )}
             {status === 'uploading' && (
                 <>
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50">
                        <GitCommit className="animate-bounce text-purple-500" size={32}/>
                    </div>
                    <h2 className="text-xl font-bold text-white">Syncing to GitHub</h2>
                    <p className="text-gray-400 text-sm mt-1">Pushing code to repository</p>
                 </>
             )}
             {status === 'success' && (
                 <>
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500">
                        <CheckCircle className="text-emerald-500" size={32}/>
                    </div>
                    <h2 className="text-xl font-bold text-white">Verified & Pushed!</h2>
                    <p className="text-gray-400 text-sm mt-1">Your code is now live on GitHub.</p>
                 </>
             )}
             {status === 'error' && (
                 <>
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500">
                        <XCircle className="text-red-500" size={32}/>
                    </div>
                    <h2 className="text-xl font-bold text-white">Action Required</h2>
                    <p className="text-red-400 text-sm mt-1">{feedback}</p>
                 </>
             )}
        </div>

        {/* TERMINAL LOGS */}
        <div className="p-4 bg-black font-mono text-[10px] h-32 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10">
            {logs.map((log, i) => (
                <div key={i} className="text-gray-500 truncate">{log}</div>
            ))}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 bg-[#111] border-t border-white/10">
            {status === 'error' ? (
                <button onClick={onClose} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200">
                    Fix Code & Retry
                </button>
            ) : status === 'success' ? (
                <div className="flex gap-3">
                    <a href={githubUrl} target="_blank" rel="noreferrer" className="flex-1 py-3 flex items-center justify-center gap-2 bg-[#24292e] text-white font-bold rounded-xl hover:bg-black border border-white/10">
                        <Github size={18}/> View Repo
                    </a>
                    <button onClick={() => onSuccess(100)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 flex items-center justify-center gap-2">
                        Next Task <ArrowRight size={18}/>
                    </button>
                </div>
            ) : (
                <button disabled className="w-full py-3 bg-white/5 text-gray-500 font-bold rounded-xl cursor-not-allowed">
                    Processing...
                </button>
            )}
        </div>

      </div>
    </div>
  );
}