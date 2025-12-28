import React, { useState } from 'react';
import { Loader2, Code, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
      const backendurl = import.meta.env.VITE_MOTIA_URL;
      const response = await fetch(`${backendurl}/api/verify-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.requirements || "Implement functionality correctly.", 
          studentCode: code
        })
      });

      const data = await response.json();
      setAnalyzing(false);
      setFeedback(data.feedback);
      
      if (data.success) {
        setResult('success');
        setTimeout(() => onSuccess(data.xp || 50), 2000);
      } else {
        setResult('fail');
      }
    } catch (err) {
      setAnalyzing(false);
      alert("Verification Server Error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code className="text-indigo-500"/> AI Task Verification
          </h2>
          <div className="mt-2 bg-orange-900/20 border border-orange-500/30 p-3 rounded-lg flex gap-2">
             <AlertTriangle className="text-orange-500 shrink-0" size={16}/>
             <p className="text-xs text-orange-200">
               <strong>Strict Criteria:</strong> {task.requirements || "Standard logic check."}
             </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-40 bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 text-sm font-mono text-gray-300 focus:border-indigo-500 outline-none resize-none"
            placeholder="// Paste your specific solution for this task here..."
          />
          
          {result === 'fail' && (
             <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-sm text-red-200">
                <strong>Rejected:</strong> {feedback}
             </div>
          )}
          {result === 'success' && (
             <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl text-sm text-green-200">
                <strong>Accepted:</strong> {feedback}
             </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
          <button onClick={handleVerify} disabled={analyzing || result === 'success'} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2">
            {analyzing ? <Loader2 className="animate-spin" size={18}/> : "Verify Code"}
          </button>
        </div>
      </div>
    </div>
  );
}