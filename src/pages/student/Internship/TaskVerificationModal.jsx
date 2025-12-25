// src/pages/student/Internship/TaskVerificationModal.jsx
import React, { useState } from 'react';
import { Loader2, Code, CheckCircle, XCircle } from 'lucide-react';

export default function TaskVerificationModal({ task, onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null); 
  const [feedback, setFeedback] = useState('');

  const handleVerify = async () => {
    if (!code.trim()) return alert("Please paste your code.");
    
    setAnalyzing(true);
    setResult(null);

    try {
        const backendurl = import.meta.env.VITE_MOTIA_URL || 'http://localhost:5000';
      // --- CALL YOUR MOTIA BACKEND HERE ---
      const response = await fetch(`${backendurl}/api/verify-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: "Ensure code uses proper syntax and logic.", // You can pass real description if you have it
          studentCode: code
        })
      });

      const data = await response.json();
      
      setAnalyzing(false);
      setFeedback(data.feedback);
      
      if (data.success) {
        setResult('success');
        // Success! Wait 2s then trigger the move to "Done"
        setTimeout(() => {
          onSuccess(data.xp || 50, 10); // Pass XP from AI
        }, 2000);
      } else {
        setResult('fail');
        // Failure! The modal stays open, task stays in "In Progress"
      }

    } catch (err) {
      console.error(err);
      setAnalyzing(false);
      alert("Server connection failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code className="text-indigo-500"/> AI Code Review
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Grok will analyze your code for <strong>{task.title}</strong>.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-40 bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 text-sm font-mono text-gray-300 focus:border-indigo-500 outline-none resize-none"
            placeholder="// Paste your solution here..."
          />

          {/* --- ERROR STATE (REMAINS IN PROGRESS) --- */}
          {result === 'fail' && (
             <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex gap-3 animate-in slide-in-from-top-2">
                <XCircle className="text-red-500 shrink-0" size={20} />
                <div>
                  <p className="text-sm text-red-200 font-bold">Verification Failed</p>
                  <p className="text-xs text-red-300/80 mt-1">{feedback}</p>
                </div>
             </div>
          )}

          {/* --- SUCCESS STATE (AUTO MOVES TO DONE) --- */}
          {result === 'success' && (
             <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex gap-3 animate-in slide-in-from-top-2">
                <CheckCircle className="text-green-500 shrink-0" size={20} />
                <div>
                  <p className="text-sm text-green-200 font-bold">Code Accepted!</p>
                  <p className="text-xs text-green-300/80 mt-1">{feedback}</p>
                  <p className="text-[10px] text-green-400 mt-2 uppercase font-bold">Moving to Done...</p>
                </div>
             </div>
          )}
        </div>

        <div className="p-4 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
          <button 
            onClick={handleVerify}
            disabled={analyzing || result === 'success'}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-2"
          >
            {analyzing ? <Loader2 className="animate-spin" size={18}/> : "Submit for Review"}
          </button>
        </div>
      </div>
    </div>
  );
}