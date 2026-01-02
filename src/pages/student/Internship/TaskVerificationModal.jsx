import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Loader2, GitCommit, X } from 'lucide-react';
import CodingModule from '../CodingModule'; // Ensure this path is correct!

export default function TaskVerificationModal({ task, projectTitle, onClose, onSuccess }) {
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitStatus, setCommitStatus] = useState(null); // 'success' | 'error'

  // --- SAFETY CHECK ---
  // If task data is missing for any reason, don't crash, just return null or a loader
  if (!task) return null;

  // --- 1. DATA ADAPTER ---
  // Convert Internship Task -> CodingModule "Problem" Format
  const problemData = {
    id: task.id || 'unknown-task',
    title: task.title || 'Untitled Task',
    description: task.requirements || 'No requirements provided.', 
    difficulty: "Medium", 
    test_cases: task.test_cases || [], 
    starter_code: {
      // Map the specific language or default to javascript
      [task.language || 'javascript']: task.starter_code || '// Write your solution here'
    }
  };

  // --- 2. GITHUB AUTO-COMMIT LOGIC ---
  const handleCodingComplete = async (score, code, language) => {
    // Only commit if they actually passed (Score 100)
    if (score < 100) {
      alert("Tests failed. You must pass all test cases (Score: 100/100) to verify this task.");
      return;
    }

    setIsCommitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = session?.provider_token;

      if (!providerToken) throw new Error("GitHub Token Missing. Please click 'Connect GitHub' in the workspace.");

      const username = session.user?.user_metadata?.user_name;
      const repoName = "foxbird-internship";
      
      if (!username) throw new Error("Could not find GitHub username.");

      // Sanitize names for file path
      const safeProject = (projectTitle || "Internship_Project").replace(/[^a-zA-Z0-9]/g, '_');
      const safeTask = (task.title || "Task").replace(/[^a-zA-Z0-9]/g, '_');
      
      // Determine extension
      const extMap = { 'python': 'py', 'java': 'java', 'cpp': 'cpp', 'javascript': 'js' };
      const ext = extMap[language] || 'txt';
      
      const filePath = `${safeProject}/${safeTask}.${ext}`;
      const message = `feat: Completed ${task.title}`;
      const contentEncoded = btoa(code); // Base64 Encode

      // A. Check if file exists (to get SHA for update)
      let sha = null;
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
             headers: { Authorization: `Bearer ${providerToken}` }
        });
        if (checkRes.ok) {
            const fileData = await checkRes.json();
            sha = fileData.sha;
        }
      } catch (e) {
        console.warn("File check failed, assuming new file.");
      }

      // B. Create/Update File in GitHub
      const commitRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
          method: 'PUT',
          headers: { 
              Authorization: `Bearer ${providerToken}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message, content: contentEncoded, sha })
      });

      if (!commitRes.ok) {
        if (commitRes.status === 404) throw new Error("Repo 'foxbird-internship' not found. Please re-connect GitHub.");
        throw new Error("GitHub API Error: " + commitRes.statusText);
      }

      // Success!
      setCommitStatus('success');
      // Wait a moment for the user to see "Success" then close
      setTimeout(() => onSuccess(100), 1500); 

    } catch (err) {
      console.error(err);
      alert("Commit Failed: " + err.message);
      setIsCommitting(false);
    }
  };

  // --- 3. RENDER ---
  if (isCommitting) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60]">
         <div className="text-center animate-in zoom-in-95">
             {commitStatus === 'success' ? (
                <>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                    <GitCommit className="text-white" size={32}/>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Code Pushed to GitHub!</h2>
                  <p className="text-gray-400 mt-2">Updating your portfolio...</p>
                </>
             ) : (
                <>
                   <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={48}/>
                   <h2 className="text-2xl font-bold text-white">Syncing with GitHub...</h2>
                   <p className="text-gray-400 mt-2">Committing your solution...</p>
                </>
             )}
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
       {/* Simple Header Overlay */}
       <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-full transition-colors">
             <X size={20}/>
          </button>
       </div>

       {/* Reuse Your Coding Module */}
       <CodingModule 
          problems={[problemData]} 
          onComplete={handleCodingComplete}
          onCancel={onClose}
          user={null} // Not needed for this context
          sessionId={null} // Not needed
          isEmbedded={true}
       />
    </div>
  );
}