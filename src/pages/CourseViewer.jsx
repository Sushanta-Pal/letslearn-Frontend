import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  BookOpen, Play, Code2, CheckCircle, Lock, ArrowLeft, 
  Menu, ChevronRight, Check, AlertCircle 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function CourseViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // --- OPTIMIZED STATE ---
  // We store ALL course data here once. No more fetching on tab clicks.
  const [courseData, setCourseData] = useState([]); 
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('read'); 
  
  // Progress & User State
  const [completedModuleIds, setCompletedModuleIds] = useState(new Set());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");

  // Quiz Local State
  const [quizState, setQuizState] = useState({ 
    answers: {}, // { questionId: "User Answer" }
    submitted: false, 
    score: 0 
  });

  // --- 1. THE MEGA-FETCH (Runs Once) ---
  useEffect(() => {
    const initCourse = async () => {
      try {
        setLoading(true);

        // A. Get User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');
        setUser(user);

        // B. Fetch Course Details (Title)
        const { data: courseMeta } = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .single();
        setCourseTitle(courseMeta?.title || "Course");

        // C. THE OPTIMIZATION: Fetch Modules + Content + Questions in ONE Request
        // Supabase joins the tables automatically based on Foreign Keys
        const { data: fullCourseData, error } = await supabase
          .from('course_modules')
          .select(`
            id, title, order_index,
            module_content ( type, content ),
            module_questions ( id, question_text, question_type, options, correct_answer )
          `)
          .eq('course_id', courseId)
          .order('order_index');

        if (error) throw error;
        setCourseData(fullCourseData || []);

        // D. Fetch User Progress
        const { data: progress } = await supabase
          .from('student_progress')
          .select('module_id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .eq('is_completed', true);

        const progressSet = new Set(progress?.map(p => p.module_id) || []);
        setCompletedModuleIds(progressSet);

      } catch (err) {
        console.error("Critical Error loading course:", err);
      } finally {
        setLoading(false);
      }
    };

    initCourse();
  }, [courseId, navigate]);

  // --- HELPERS (Instant Lookups, No DB Calls) ---
  const activeModule = courseData[activeModuleIndex];
  
  // Extract content for the current tab from local state
  const currentContent = useMemo(() => {
    if (!activeModule) return null;
    return activeModule.module_content?.find(c => c.type === activeTab);
  }, [activeModule, activeTab]);

  const currentQuestions = useMemo(() => {
    if (!activeModule) return [];
    return activeModule.module_questions || [];
  }, [activeModule]);

  const progressPercentage = useMemo(() => {
    if (courseData.length === 0) return 0;
    return Math.round((completedModuleIds.size / courseData.length) * 100);
  }, [completedModuleIds, courseData.length]);

  // --- ACTIONS ---
  const handleNextModule = () => {
    if (activeModuleIndex < courseData.length - 1) {
      setActiveModuleIndex(prev => prev + 1);
      setActiveTab('read'); // Reset tab
      setQuizState({ answers: {}, submitted: false, score: 0 }); // Reset quiz
    }
  };

  const handleMarkComplete = async () => {
    // Optimistic UI Update (Instant)
    const newSet = new Set(completedModuleIds);
    newSet.add(activeModule.id);
    setCompletedModuleIds(newSet);
    
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });

    // Background DB Update (User doesn't wait for this)
    await supabase.from('student_progress').upsert({
      user_id: user.id,
      course_id: courseId,
      module_id: activeModule.id,
      is_completed: true
    }, { onConflict: 'user_id, module_id' });
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    currentQuestions.forEach(q => {
      const uAns = quizState.answers[q.id]?.toString().trim().toLowerCase();
      const cAns = q.correct_answer?.toString().trim().toLowerCase();
      if (uAns === cAns) correct++;
    });
    setQuizState(prev => ({ ...prev, submitted: true, score: correct }));
    
    if (correct === currentQuestions.length) {
      confetti();
    }
  };

  if (loading) return <div className="h-screen bg-[#060606] flex items-center justify-center text-white font-bold animate-pulse">Loading Course Data...</div>;

  return (
    <div className="h-screen w-full bg-[#060606] text-white flex overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <motion.aside 
        initial={{ x: -300 }} animate={{ x: sidebarOpen ? 0 : -320 }}
        className={`fixed md:relative z-30 w-80 h-full bg-[#0F0F0F] border-r border-gray-800 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-800 bg-[#0F0F0F]">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm"><ArrowLeft size={16}/> Back</button>
           <h2 className="font-bold text-lg mb-2 truncate">{courseTitle}</h2>
           <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#FF4A1F]" animate={{ width: `${progressPercentage}%` }} />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {courseData.map((mod, idx) => (
            <button key={mod.id} onClick={() => { setActiveModuleIndex(idx); setSidebarOpen(window.innerWidth > 768); }}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${idx === activeModuleIndex ? 'bg-[#1A1A1A] border border-[#FF4A1F]/30' : 'hover:bg-[#1A1A1A] border border-transparent'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${completedModuleIds.has(mod.id) ? 'bg-green-500 text-black border-green-500' : 'border-gray-600'}`}>
                {completedModuleIds.has(mod.id) ? <Check size={14} /> : idx + 1}
              </div>
              <span className={`text-sm truncate ${idx === activeModuleIndex ? 'text-white' : 'text-gray-400'}`}>{mod.title}</span>
            </button>
          ))}
        </div>
      </motion.aside>

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col h-full w-full relative">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#060606]/80 backdrop-blur-md sticky top-0 z-20">
           <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden"><Menu/></button>
             <h1 className="font-bold text-white truncate max-w-[200px]">{activeModule?.title}</h1>
           </div>
           <div className="flex bg-[#111] p-1 rounded-lg border border-gray-800">
              {[{id:'read', icon:BookOpen, label:'Read'}, {id:'solve', icon:Code2, label:'Quiz'}, {id:'video', icon:Play, label:'Watch'}].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                  className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-[#FF4A1F] text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  <tab.icon size={14}/> {tab.label}
                </button>
              ))}
           </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto pb-24">
            <AnimatePresence mode="wait">
              
              {/* READ MODE */}
              {activeTab === 'read' && (
                <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert max-w-none">
                  {currentContent ? (
                    <ReactMarkdown>{currentContent.content}</ReactMarkdown>
                  ) : (
                    <div className="text-center text-gray-500 mt-20">No reading material for this module.</div>
                  )}
                </motion.div>
              )}

              {/* VIDEO MODE */}
              {activeTab === 'video' && (
                <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   {currentContent ? (
                     <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                       <iframe src={currentContent.content.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title="Lecture"/>
                     </div>
                   ) : (
                     <div className="text-center text-gray-500 mt-20">No video lecture available.</div>
                   )}
                </motion.div>
              )}

              {/* QUIZ MODE */}
              {activeTab === 'solve' && (
                <motion.div key="solve" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {currentQuestions.length > 0 ? (
                    <div className="space-y-8">
                       {currentQuestions.map((q, idx) => {
                         const isCorrect = quizState.answers[q.id]?.toString().toLowerCase() === q.correct_answer.toString().toLowerCase();
                         return (
                           <div key={q.id} className="bg-[#111] border border-gray-800 p-6 rounded-2xl">
                             <p className="text-lg font-medium text-white mb-4"><span className="text-[#FF4A1F]">Q{idx+1}.</span> {q.question_text}</p>
                             
                             {q.question_type === 'MCQ' ? (
                               <div className="space-y-2">
                                 {q.options?.map((opt, i) => (
                                   <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${quizState.answers[q.id] === opt ? 'bg-[#FF4A1F]/10 border-[#FF4A1F]' : 'border-gray-800 hover:bg-white/5'}`}>
                                      <input type="radio" name={`q-${q.id}`} className="accent-[#FF4A1F]" 
                                        checked={quizState.answers[q.id] === opt} 
                                        onChange={() => !quizState.submitted && setQuizState(prev => ({...prev, answers: {...prev.answers, [q.id]: opt}}))}
                                        disabled={quizState.submitted}
                                      />
                                      {opt}
                                   </label>
                                 ))}
                               </div>
                             ) : (
                               <input type="text" placeholder="Your Answer" className="bg-black border border-gray-800 p-3 rounded w-full text-white"
                                 value={quizState.answers[q.id] || ''}
                                 onChange={(e) => !quizState.submitted && setQuizState(prev => ({...prev, answers: {...prev.answers, [q.id]: e.target.value}}))}
                                 disabled={quizState.submitted}
                               />
                             )}

                             {quizState.submitted && (
                               <div className={`mt-4 p-3 rounded text-sm font-bold flex gap-2 ${isCorrect ? 'text-green-500 bg-green-900/20' : 'text-red-500 bg-red-900/20'}`}>
                                 {isCorrect ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                                 {isCorrect ? 'Correct!' : `Incorrect. Answer: ${q.correct_answer}`}
                               </div>
                             )}
                           </div>
                         );
                       })}

                       <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                          {quizState.submitted && <span className="font-bold text-xl">Score: {quizState.score}/{currentQuestions.length}</span>}
                          {!quizState.submitted ? (
                            <button onClick={handleQuizSubmit} className="bg-[#FF4A1F] text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">Submit Quiz</button>
                          ) : (
                            <button onClick={() => setQuizState({answers:{}, submitted:false, score:0})} className="text-gray-400 underline">Retry</button>
                          )}
                       </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 mt-20">No questions for this module.</div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 w-full p-6 flex justify-center pointer-events-none bg-gradient-to-t from-black to-transparent">
           <div className="pointer-events-auto bg-[#111]/90 backdrop-blur border border-gray-800 p-2 rounded-2xl flex gap-4 shadow-xl">
              <button 
                onClick={handleMarkComplete}
                disabled={completedModuleIds.has(activeModule?.id)}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${completedModuleIds.has(activeModule?.id) ? 'text-green-500 bg-green-500/10 cursor-default' : 'bg-[#FF4A1F] text-black hover:scale-105 transition-transform'}`}
              >
                {completedModuleIds.has(activeModule?.id) ? <><CheckCircle size={18}/> Completed</> : "Mark Complete"}
              </button>
              
              {activeModuleIndex < courseData.length - 1 && (
                <button onClick={handleNextModule} className="px-6 py-3 rounded-xl bg-[#1A1A1A] border border-gray-700 hover:bg-[#222]">
                   Next <ChevronRight size={18} className="inline"/>
                </button>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}