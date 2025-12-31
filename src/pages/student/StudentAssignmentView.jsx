import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { Trophy, Clock, Lock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import TechnicalModule from './TechnicalModule';

export default function StudentAssignmentView({ user }) {
  const [accessCode, setAccessCode] = useState("");
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [stage, setStage] = useState('lobby'); // lobby, technical, finish
  const [submissionId, setSubmissionId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- 1. ENTER EXAM ---
  const startExam = async () => {
    // 1. Safety Check: User
    if (!user || !user.id) {
        console.error("User is missing:", user);
        return alert("Error: User session not found. Please refresh.");
    }

    if (!accessCode.trim()) return alert("Please enter an access code");
    setLoading(true);

    try {
        // 2. Fetch Assignment
        const { data: assignment, error: assignError } = await supabase
          .from('assignments')
          .select('*')
          .eq('access_key', accessCode.trim())
          .single();

        if (assignError || !assignment) {
            setLoading(false);
            return alert("Invalid Access Code");
        }

        // 3. Check for Existing Submission
        const { data: existing } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('assignment_id', assignment.id)
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to prevent errors if empty

        if (existing && existing.status === 'submitted') {
          setLoading(false);
          return alert("You have already submitted this assignment.");
        }

        // 4. Create/Resume Submission
        // NOTE: If RLS is missing, 'sub' will be null, crashing the app.
        const { data: sub, error: subError } = await supabase
            .from('assignment_submissions')
            .upsert({
              assignment_id: assignment.id,
              user_id: user.id,
              status: existing ? existing.status : 'in_progress' // Keep status if resuming
            }, { onConflict: 'assignment_id, user_id' })
            .select()
            .single();

        if (subError || !sub) {
            console.error("Submission Error:", subError);
            setLoading(false);
            return alert("Failed to start exam. Database permission error (RLS).");
        }

        // Success: Start the exam
        setActiveAssignment(assignment);
        setSubmissionId(sub.id);
        setStage('technical');
        
        // Timer Logic (Resume or Start New)
        if (existing && existing.created_at) {
             // Calculate remaining time based on start time if you want strict timing
             // For now, we just reset to full time or keep it simple
             setTimeLeft(assignment.time_limit * 60); 
        } else {
             setTimeLeft(assignment.time_limit * 60);
        }

    } catch (err) {
        console.error("Critical Error:", err);
        alert("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  // --- 2. GLOBAL TIMER ---
  useEffect(() => {
    if (!activeAssignment || stage === 'finish') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAll(0, {}); // Auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAssignment, stage]);

  // --- 3. PREPARE QUESTIONS ---
  const assignmentQuestions = useMemo(() => {
    if (!activeAssignment?.data?.technical) return [];
    return activeAssignment.data.technical.map(q => ({
      ...q,
      question_text: q.question || q.question_text,
      question: q.question || q.question_text
    }));
  }, [activeAssignment]);

  // --- 4. SUBMIT HANDLER ---
  const handleTechSubmit = async (passed, score, answers) => {
    await handleSubmitAll(score, answers);
  };

  const handleSubmitAll = async (score, answers) => {
    if (!submissionId) return;

    await supabase.from('assignment_submissions').update({
      technical_score: score,
      technical_answers: answers,
      total_score: score,
      status: 'submitted',
      submitted_at: new Date()
    }).eq('id', submissionId);
    
    setStage('finish');
  };

  // --- RENDER ---
  if (stage === 'lobby') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060606] text-white p-4">
        <div className="bg-[#111] p-8 rounded-2xl border border-gray-800 text-center max-w-md w-full shadow-2xl relative">
          
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-yellow-500" size={32}/>
          </div>
          <h1 className="text-2xl font-bold mb-2">Assignment Portal</h1>
          <p className="text-gray-400 mb-8 text-sm">Please enter the access code provided by your instructor.</p>
          
          <div className="space-y-4">
            <input 
              className="w-full bg-black border border-gray-800 rounded-xl p-4 text-center text-lg tracking-[0.2em] font-mono text-white focus:border-[#FF4A1F] focus:ring-1 focus:ring-[#FF4A1F] outline-none transition-all placeholder:text-gray-700 placeholder:tracking-normal"
              placeholder="ENTER CODE"
              value={accessCode} 
              onChange={e => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startExam()}
            />
            <button 
              onClick={startExam} 
              disabled={loading}
              className="w-full bg-[#FF4A1F] hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin"/> : "Start Assignment"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'finish') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060606] text-white animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
            <CheckCircle className="text-green-500" size={48}/>
        </div>
        <h1 className="text-4xl font-bold mb-2">Submitted!</h1>
        <p className="text-gray-400 mt-2 text-lg">Your answers have been recorded.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-10 px-8 py-3 rounded-full border border-gray-700 hover:bg-white hover:text-black transition-all font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // EXAM VIEW
  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col">
      {/* Header */}
      <div className="h-16 bg-[#0A0A0A] border-b border-gray-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-[#FF4A1F] rounded-full"></div>
            <h2 className="font-bold text-lg truncate max-w-[200px] md:max-w-none">{activeAssignment?.title}</h2>
        </div>
        
        <div className={`font-mono text-xl font-bold flex items-center gap-3 px-4 py-1.5 rounded-lg border ${timeLeft < 300 ? 'bg-red-900/20 border-red-500/50 text-red-500 animate-pulse' : 'bg-[#111] border-gray-800 text-gray-200'}`}>
          <Clock size={20} className={timeLeft < 300 ? "animate-spin" : ""}/> 
          <span>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {assignmentQuestions.length > 0 ? (
           <TechnicalModule 
             user={user} 
             questions={assignmentQuestions}
             onComplete={(passed, score, answers) => handleTechSubmit(passed, score, answers)}
           />
        ) : (
           <div className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-gray-800">
              <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={40}/>
              <h3 className="text-xl font-bold text-white mb-2">No Questions Found</h3>
              <p>This assignment appears empty. Please contact your instructor.</p>
           </div>
        )}
      </div>
    </div>
  );
}