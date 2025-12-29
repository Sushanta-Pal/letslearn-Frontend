import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { BookOpen, Play, Code2, CheckCircle, Lock, ArrowLeft, Menu, ChevronRight, XCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function CourseViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState([]); 
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('read'); 
  const [completedModuleIds, setCompletedModuleIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");
  
  // Logic Flow
  const [readTimer, setReadTimer] = useState(0);
  const [isReadComplete, setIsReadComplete] = useState(false);
  const [quizState, setQuizState] = useState({ answers: {}, submitted: false, score: 0, passed: false });
  const readInterval = useRef(null);

  useEffect(() => {
    const initCourse = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: courseMeta } = await supabase.from('courses').select('title').eq('id', courseId).single();
      setCourseTitle(courseMeta?.title || "Course");

      const { data: fullCourseData } = await supabase.from('course_modules').select(`
          id, title, order_index,
          module_content ( type, content ),
          module_questions ( id, question_text, question_type, options, correct_answer )
        `).eq('course_id', courseId).order('order_index');
      setCourseData(fullCourseData || []);

      const { data: progress } = await supabase.from('student_progress').select('module_id').eq('user_id', user.id).eq('course_id', courseId).eq('is_completed', true);
      setCompletedModuleIds(new Set(progress?.map(p => p.module_id) || []));
      setLoading(false);
    };
    initCourse();
  }, [courseId]);

  const activeModule = courseData[activeModuleIndex];
  const currentContent = useMemo(() => activeModule?.module_content?.find(c => c.type === activeTab), [activeModule, activeTab]);
  const currentQuestions = useMemo(() => activeModule?.module_questions || [], [activeModule]);
  
  useEffect(() => {
    if ((activeTab === 'read' || activeTab === 'video') && !isReadComplete) {
      readInterval.current = setInterval(() => {
        setReadTimer(prev => {
          if (prev >= 5) { setIsReadComplete(true); clearInterval(readInterval.current); return prev; }
          return prev + 1;
        });
      }, 1000);
    } else { clearInterval(readInterval.current); }
    return () => clearInterval(readInterval.current);
  }, [activeTab, isReadComplete]);

  useEffect(() => {
    setReadTimer(0);
    const isDone = completedModuleIds.has(activeModule?.id);
    setIsReadComplete(isDone); 
    setQuizState({ answers: {}, submitted: false, score: 0, passed: isDone });
    setActiveTab('read');
  }, [activeModuleIndex, completedModuleIds]);

  const handleQuizSubmit = async () => {
    let correct = 0;
    currentQuestions.forEach(q => {
      const uAns = quizState.answers[q.id]?.toString().trim().toLowerCase();
      const cAns = q.correct_answer?.toString().trim().toLowerCase();
      if (uAns === cAns) correct++;
    });
    const passed = currentQuestions.length === 0 || (correct / currentQuestions.length) >= 0.7;
    setQuizState(prev => ({ ...prev, submitted: true, score: correct, passed }));
    if (passed) confetti();

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('student_quiz_attempts').insert({
      user_id: user.id, module_id: activeModule.id, score: correct, total_questions: currentQuestions.length, passed: passed, answers: quizState.answers
    });
  };

  const handleMarkComplete = async () => {
    if (currentQuestions.length > 0 && !quizState.passed) return;
    const { data: { user } } = await supabase.auth.getUser();
    const newSet = new Set(completedModuleIds);
    newSet.add(activeModule.id);
    setCompletedModuleIds(newSet);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    await supabase.from('student_progress').upsert({ user_id: user.id, course_id: courseId, module_id: activeModule.id, is_completed: true }, { onConflict: 'user_id, module_id' });
    if (activeModuleIndex < courseData.length - 1) setActiveModuleIndex(prev => prev + 1);
  };

  if (loading) return <div className="h-screen bg-[#060606] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="h-screen w-full bg-[#060606] text-white flex overflow-hidden font-sans">
      <motion.aside initial={{ x: -300 }} animate={{ x: sidebarOpen ? 0 : -320 }} className={`fixed md:relative z-30 w-80 h-full bg-[#0F0F0F] border-r border-gray-800 flex flex-col`}>
        <div className="p-6 border-b border-gray-800 bg-[#0F0F0F]"><button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm"><ArrowLeft size={16}/> Back</button><h2 className="font-bold text-lg mb-2 truncate">{courseTitle}</h2></div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {courseData.map((mod, idx) => (
            <button key={mod.id} onClick={() => { setActiveModuleIndex(idx); setSidebarOpen(window.innerWidth > 768); }} className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${idx === activeModuleIndex ? 'bg-[#1A1A1A] border border-[#FF4A1F]/30' : 'hover:bg-[#1A1A1A]'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${completedModuleIds.has(mod.id) ? 'bg-green-500 text-black border-green-500' : 'border-gray-600'}`}>{completedModuleIds.has(mod.id) ? <CheckCircle size={14} /> : idx + 1}</div>
              <span className={`text-sm truncate ${idx === activeModuleIndex ? 'text-white' : 'text-gray-400'}`}>{mod.title}</span>
            </button>
          ))}
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col h-full w-full relative">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#060606]/80 backdrop-blur-md sticky top-0 z-20">
           <div className="flex items-center gap-4"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden"><Menu/></button><h1 className="font-bold text-white truncate max-w-[200px]">{activeModule?.title}</h1></div>
           <div className="flex bg-[#111] p-1 rounded-lg border border-gray-800">
              <button onClick={() => setActiveTab('read')} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 ${activeTab === 'read' ? 'bg-[#FF4A1F] text-black' : 'text-gray-400'}`}><BookOpen size={14}/> Read</button>
              <button onClick={() => setActiveTab('video')} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 ${activeTab === 'video' ? 'bg-[#FF4A1F] text-black' : 'text-gray-400'}`}><Play size={14}/> Watch</button>
              <button onClick={() => isReadComplete && setActiveTab('solve')} disabled={!isReadComplete && currentQuestions.length > 0} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'solve' ? 'bg-[#FF4A1F] text-black' : 'text-gray-400'} ${!isReadComplete && currentQuestions.length > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}>{!isReadComplete && currentQuestions.length > 0 ? <Lock size={12}/> : <Code2 size={14}/>} Quiz</button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'read' && (
                <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert max-w-none">
                  {currentContent ? <ReactMarkdown>{currentContent.content}</ReactMarkdown> : <div className="text-gray-500 text-center mt-10">No reading material.</div>}
                  {!isReadComplete && currentQuestions.length > 0 && <div className="mt-8 p-4 bg-[#111] border border-yellow-500/20 rounded-xl text-center text-sm text-yellow-500 animate-pulse">📖 Read/Watch for {5 - readTimer} more seconds to unlock the quiz.</div>}
                </motion.div>
              )}

              {activeTab === 'video' && (
                <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   {currentContent ? (
                     <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                       <iframe src={currentContent.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} className="w-full h-full" allowFullScreen title="Lecture"/>
                     </div>
                   ) : <div className="text-center text-gray-500 mt-20">No video lecture available.</div>}
                </motion.div>
              )}

              {activeTab === 'solve' && (
                <motion.div key="solve" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {currentQuestions.length > 0 ? (
                    <div className="space-y-8">
                       {currentQuestions.map((q, idx) => {
                         const userAnswer = quizState.answers[q.id];
                         const isCorrect = userAnswer?.toString().toLowerCase() === q.correct_answer.toString().toLowerCase();
                         return (
                           <div key={q.id} className={`bg-[#111] border p-6 rounded-2xl ${quizState.submitted ? (isCorrect ? 'border-green-500/30' : 'border-red-500/30') : 'border-gray-800'}`}>
                             <p className="text-lg font-medium text-white mb-4"><span className="text-[#FF4A1F]">Q{idx+1}.</span> {q.question_text}</p>
                             {q.question_type === 'MCQ' ? (
                               <div className="space-y-2">
                                 {q.options?.map((opt, i) => (
                                   <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${quizState.submitted && q.correct_answer === opt ? 'bg-green-500/20 border-green-500' : (!quizState.submitted && userAnswer === opt ? 'bg-[#FF4A1F]/10 border-[#FF4A1F]' : 'border-gray-800 hover:bg-white/5')}`}>
                                      <input type="radio" name={`q-${q.id}`} className="accent-[#FF4A1F]" checked={userAnswer === opt} onChange={() => !quizState.submitted && setQuizState(prev => ({...prev, answers: {...prev.answers, [q.id]: opt}}))} disabled={quizState.submitted}/>{opt}
                                   </label>
                                 ))}
                               </div>
                             ) : (
                               /* --- NAT INPUT (The Missing Part Restored) --- */
                               <input type="text" placeholder="Type your numerical answer" className="bg-black border border-gray-800 p-3 rounded w-full text-white focus:border-[#FF4A1F] outline-none" value={userAnswer || ''} onChange={(e) => !quizState.submitted && setQuizState(prev => ({...prev, answers: {...prev.answers, [q.id]: e.target.value}}))} disabled={quizState.submitted}/>
                             )}
                             {quizState.submitted && (
                               <div className={`mt-4 p-3 rounded text-sm font-bold flex gap-2 ${isCorrect ? 'text-green-500 bg-green-900/10' : 'text-red-500 bg-red-900/10'}`}>
                                 {isCorrect ? <CheckCircle size={16}/> : <AlertCircle size={16}/>} {isCorrect ? 'Correct!' : `Incorrect. Answer: ${q.correct_answer}`}
                               </div>
                             )}
                           </div>
                         );
                       })}
                       <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                          {quizState.submitted ? (
                            <div className="text-center w-full"><p className={`text-2xl font-bold ${quizState.passed ? 'text-green-500' : 'text-red-500'}`}>{quizState.passed ? "Passed! 🎉" : "Failed. Try Again."}</p></div>
                          ) : <button onClick={handleQuizSubmit} className="w-full bg-[#FF4A1F] text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">Submit Quiz</button>}
                       </div>
                    </div>
                  ) : <div className="text-center text-gray-500 mt-20">No questions for this module.</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="absolute bottom-0 w-full p-6 flex justify-center pointer-events-none bg-gradient-to-t from-black to-transparent">
           <div className="pointer-events-auto bg-[#111]/90 backdrop-blur border border-gray-800 p-2 rounded-2xl flex gap-4 shadow-xl">
              <button onClick={handleMarkComplete} disabled={completedModuleIds.has(activeModule?.id) || (currentQuestions.length > 0 && !quizState.passed)} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${completedModuleIds.has(activeModule?.id) ? 'text-green-500 bg-green-500/10 cursor-default' : (currentQuestions.length > 0 && !quizState.passed) ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#FF4A1F] text-black hover:scale-105'}`}>
                {completedModuleIds.has(activeModule?.id) ? <><CheckCircle size={18}/> Completed</> : (currentQuestions.length > 0 && !quizState.passed) ? "Pass Quiz to Complete" : "Mark Complete"}
              </button>
              {activeModuleIndex < courseData.length - 1 && <button onClick={() => {setActiveModuleIndex(prev => prev+1); setActiveTab('read');}} className="px-6 py-3 rounded-xl bg-[#1A1A1A] border border-gray-700 hover:bg-[#222]">Next <ChevronRight size={18} className="inline"/></button>}
           </div>
        </div>
      </main>
    </div>
  );
}