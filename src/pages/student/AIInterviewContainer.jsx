import React, { useState } from 'react';
import InterviewSetup from './InterviewSetup'; 
import InterviewRoom from './InterviewRoom'; 
import InterviewFeedback from './InterviewFeedback'; // We will build this next!
import { supabase } from '../../supabaseClient';
import { Loader2 } from 'lucide-react';

const AIInterviewContainer = ({ user }) => {
  const [stage, setStage] = useState('setup'); // 'setup' | 'interview' | 'analyzing' | 'feedback'
  const [interviewData, setInterviewData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);

  const handleInterviewStart = (data) => {
    setInterviewData(data); 
    setStage('interview');
  };

  const handleCancel = () => window.location.href = '/dashboard';

  // Triggered by InterviewRoom when the 5th question is done
  const handleInterviewEnd = async () => {
    setStage('analyzing');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const backend_url = import.meta.env.VITE_MOTIA_URL || "http://localhost:3000";
      
      const response = await fetch(`${backend_url}/api/student/interview/analyze`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ sessionId: interviewData.sessionId })
      });

      const data = await response.json();
      
      // Safely grab the analysis object
      const finalAnalysis = data.body?.analysis || data.analysis;
      setFeedbackData(finalAnalysis);
      setStage('feedback');

    } catch (error) {
      console.error("Analysis Failed:", error);
      alert("Failed to generate report. Please check your dashboard later.");
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="w-full h-full min-h-[80vh] p-4 md:p-8 flex items-center justify-center">
      {stage === 'setup' && <InterviewSetup onInterviewStart={handleInterviewStart} onCancel={handleCancel} />}
      
      {stage === 'interview' && (
        <InterviewRoom 
          user={user} 
          sessionId={interviewData.sessionId} 
          firstQuestion={interviewData.firstQuestion}
          onEnd={handleInterviewEnd}
        />
      )}

      {/* Loading Screen while Groq thinks */}
      {stage === 'analyzing' && (
        <div className="text-center animate-in fade-in zoom-in text-white p-20 border border-gray-800 rounded-3xl bg-[#111]">
            <Loader2 className="animate-spin text-[#FF4A1F] w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Analyzing Your Performance...</h2>
            <p className="text-gray-400">Our AI is reviewing your transcript and generating custom feedback.</p>
        </div>
      )}

      {/* The Final Result Screen */}
      {stage === 'feedback' && feedbackData && (
         <InterviewFeedback feedback={feedbackData} onFinish={handleCancel} />
      )}
    </div>
  );
};

export default AIInterviewContainer;