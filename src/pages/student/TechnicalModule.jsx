import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertCircle, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "../../supabaseClient";

export default function TechnicalModule({ 
  user, 
  sessionId,      // If present = Mock Interview (Internal Logic). If missing = Assignment (Parent Logic).
  onComplete, 
  onCancel, 
  questions = [], 
  timeLimit       // Optional: Only used if sessionId is present
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, passed: false });

  // 1. Internal Timer (ONLY runs for Mock Interviews)
  const [timeLeft, setTimeLeft] = useState((timeLimit || 20) * 60);
  
  useEffect(() => {
    // If we are in an Assignment (no sessionId), disable internal timer. 
    // The Parent (StudentAssignmentView) controls the time.
    if (!sessionId || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId, showResult]);

  // Safety Fallback for empty questions
  const activeQuestions = questions.length > 0 ? questions : [{
    id: "dummy", question_text: "No questions loaded.", options: [], correct_answer: ""
  }];

  const handleSelect = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let correctCount = 0;

    activeQuestions.forEach((q) => {
      // Handle Supabase (question_text) vs MongoDB/Manual (q) fields
      const correct = q.correct_answer || q.ans;
      // Case-insensitive comparison
      if (answers[q.id]?.toString().trim().toLowerCase() === correct?.toString().trim().toLowerCase()) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / activeQuestions.length) * 100);
    const passed = scorePercent >= 60; 

    // A. MOCK INTERVIEW MODE (Save to DB Internal)
    if (sessionId) {
        try {
            await supabase.from("mock_interview_sessions")
                .update({
                    technical_score: scorePercent,
                    technical_passed: passed,
                    technical_data: { answers, score: scorePercent }
                })
                .eq('id', sessionId);
        } catch (err) {
            console.error("Save failed", err);
        }
        setScoreData({ score: scorePercent, passed });
        setShowResult(true);
    } 
    
    // B. ASSIGNMENT MODE (Pass Data to Parent)
    else {
        // Just return the data. Parent handles DB and UI.
        onComplete(passed, scorePercent, answers);
    }
    
    setIsSubmitting(false);
  };

  // --- RESULT VIEW (Only for Mock Interview Mode) ---
  if (showResult && sessionId) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-[#111] rounded-2xl border border-gray-800 text-center animate-in fade-in">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${scoreData.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {scoreData.passed ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{scoreData.passed ? "Assessment Passed" : "Assessment Failed"}</h2>
        <p className="text-4xl font-black text-white mb-8">{scoreData.score}%</p>
        <button 
            onClick={() => onComplete(scoreData.passed, scoreData.score)}
            className="px-8 py-3 rounded-full bg-[#FF4A1F] text-black font-bold hover:scale-105 transition-transform"
        >
            {scoreData.passed ? "Continue Next" : "Finish"}
        </button>
      </div>
    );
  }

  // --- QUESTION UI ---
  const currentQ = activeQuestions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#0A0A0A] rounded-2xl border border-gray-800 min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
        <div>
            <h2 className="text-xl font-bold text-white">Technical Questions</h2>
            <p className="text-gray-500 text-sm">Question {currentIdx + 1} of {activeQuestions.length}</p>
        </div>
        
        {/* Only show Internal Timer if in Mock Interview Mode (sessionId exists) */}
        {sessionId && (
          <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-900/20 text-red-500' : 'bg-gray-800 text-white'}`}>
              <Clock size={20} />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Question Body */}
      <div className="flex-1">
        <h3 className="text-2xl font-medium text-white mb-6 leading-relaxed">
            {currentQ.question_text || currentQ.q}
        </h3>

        <div className="grid grid-cols-1 gap-3">
            {(currentQ.options || []).map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => handleSelect(currentQ.id, opt)}
                    className={`p-4 rounded-xl text-left border transition-all flex items-center gap-3 group ${
                        answers[currentQ.id] === opt
                        ? "bg-[#FF4A1F]/10 border-[#FF4A1F] text-white"
                        : "bg-[#111] border-gray-800 hover:border-gray-600 text-gray-400"
                    }`}
                >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${answers[currentQ.id] === opt ? "border-[#FF4A1F] text-[#FF4A1F]" : "border-gray-600 group-hover:border-gray-400"}`}>
                        {String.fromCharCode(65 + idx)}
                    </div>
                    {opt}
                </button>
            ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between">
        <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30"
        >
            <ArrowLeft size={18}/> Previous
        </button>

        {currentIdx < activeQuestions.length - 1 ? (
            <button 
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200"
            >
                Next Question <ArrowRight size={18}/>
            </button>
        ) : (
            <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#FF4A1F] text-black font-bold hover:brightness-110"
            >
                {isSubmitting ? "Submitting..." : "Submit Assignment"} <Save size={18}/>
            </button>
        )}
      </div>
    </div>
  );
}