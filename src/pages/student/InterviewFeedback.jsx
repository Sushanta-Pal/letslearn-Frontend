import React from 'react';
import { CheckCircle, TrendingUp, AlertCircle, ArrowRight, Trophy } from 'lucide-react';

const InterviewFeedback = ({ feedback, onFinish }) => {
  
  // Determine color based on score
  const getScoreColor = (score) => {
      if (score >= 80) return 'text-green-500';
      if (score >= 60) return 'text-yellow-500';
      return 'text-red-500';
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#111] rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8">
      
      {/* Header Profile Section */}
      <div className="p-8 border-b border-gray-800 bg-[#1A1A1A] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <Trophy className="text-[#FF4A1F]" size={32} /> Interview Report
              </h2>
              <p className="text-gray-400 mt-2 text-lg">{feedback.summary}</p>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-gray-900 p-6 rounded-2xl border border-gray-800 min-w-[150px]">
              <span className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Overall Score</span>
              <span className={`text-5xl font-black ${getScoreColor(feedback.overallScore)}`}>
                  {feedback.overallScore}<span className="text-2xl text-gray-500">/100</span>
              </span>
          </div>
      </div>

      {/* Feedback Grid */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Strengths */}
          <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="text-green-500" /> Key Strengths
              </h3>
              <ul className="space-y-3">
                  {feedback.strengths.map((str, idx) => (
                      <li key={idx} className="bg-green-500/5 border border-green-500/10 p-4 rounded-xl text-green-100 text-sm leading-relaxed">
                          {str}
                      </li>
                  ))}
              </ul>
          </div>

          {/* Weaknesses */}
          <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle className="text-yellow-500" /> Areas to Improve
              </h3>
              <ul className="space-y-3">
                  {feedback.weaknesses.map((weak, idx) => (
                      <li key={idx} className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl text-yellow-100 text-sm leading-relaxed">
                          {weak}
                      </li>
                  ))}
              </ul>
          </div>
      </div>

      {/* Actionable Tips */}
      <div className="px-8 pb-8">
          <div className="bg-[#FF4A1F]/10 border border-[#FF4A1F]/20 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-[#FF4A1F] flex items-center gap-2 mb-4">
                  <TrendingUp /> Actionable Tips for Next Time
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {feedback.improvementTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                  ))}
              </ul>
          </div>
      </div>

      {/* Footer / Finish Button */}
      <div className="p-6 bg-[#1A1A1A] border-t border-gray-800 flex justify-end">
          <button 
              onClick={onFinish}
              className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
              Return to Dashboard <ArrowRight size={20} />
          </button>
      </div>

    </div>
  );
};

export default InterviewFeedback;