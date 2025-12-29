import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Eye, Save, Trash2, Edit3, Video, FileText, Code, CheckCircle, XCircle } from 'lucide-react';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  
  // Results View State
  const [viewingResults, setViewingResults] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState([]);

  // Editor State
  const [editingModule, setEditingModule] = useState(null);
  const [contentType, setContentType] = useState('read');
  const [contentValue, setContentValue] = useState(''); 
  const [questions, setQuestions] = useState([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ type: 'MCQ', text: '', options: ['', '', '', ''], correctAnswer: '' });

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchModules(selectedCourse.id); }, [selectedCourse]);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*');
    setCourses(data || []);
  };

  const fetchModules = async (courseId) => {
    const { data } = await supabase.from('course_modules').select('*').eq('course_id', courseId).order('order_index');
    setModules(data || []);
  };

  // --- VIEW RESULTS ---
  const loadResults = async (moduleId) => {
    setViewingResults(moduleId);
    setEditingModule(null); // Close editor
    
    const { data } = await supabase
      .from('student_quiz_attempts')
      .select('*, user:profiles(email, full_name)')
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false });
    
    setStudentAttempts(data || []);
  };

  // --- LOAD EDITOR ---
  const loadContent = async (module, type) => {
    setEditingModule(module);
    setViewingResults(null); // Close results
    setContentType(type);
    setContentValue('');
    setQuestions([]);
    setIsAddingQuestion(false);
    
    if (type === 'solve') {
      const { data } = await supabase.from('module_questions').select('*').eq('module_id', module.id).order('created_at');
      setQuestions(data || []);
    } else {
      const { data } = await supabase.from('module_content').select('content').eq('module_id', module.id).eq('type', type).single();
      if (data) setContentValue(data.content);
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle) return;
    await supabase.from('course_modules').insert({ course_id: selectedCourse.id, title: newModuleTitle, order_index: modules.length });
    setNewModuleTitle("");
    fetchModules(selectedCourse.id);
  };

  const handleSaveSimpleContent = async () => {
    if (!editingModule) return;
    const { data: existing } = await supabase.from('module_content').select('id').eq('module_id', editingModule.id).eq('type', contentType).single();

    if (existing) {
      await supabase.from('module_content').update({ content: contentValue }).eq('id', existing.id);
    } else {
      await supabase.from('module_content').insert({ module_id: editingModule.id, type: contentType, content: contentValue });
    }
    alert("Content Saved!");
  };

  const handleSaveQuestion = async () => {
    if (!newQuestion.text || !newQuestion.correctAnswer) {
      alert("Please provide question text and a correct answer.");
      return;
    }
    const payload = {
      module_id: editingModule.id,
      question_text: newQuestion.text,
      question_type: newQuestion.type,
      options: newQuestion.type === 'MCQ' ? newQuestion.options : null,
      correct_answer: newQuestion.correctAnswer
    };

    await supabase.from('module_questions').insert(payload);
    loadContent(editingModule, 'solve'); // Refresh
    setNewQuestion({ type: 'MCQ', text: '', options: ['', '', '', ''], correctAnswer: '' });
  };

  const handleDeleteQuestion = async (id) => {
    if(!confirm("Are you sure?")) return;
    await supabase.from('module_questions').delete().eq('id', id);
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateOption = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[85vh]">
      {/* 1. Course Selector */}
      <div className="col-span-3 bg-[#111] p-4 rounded-xl border border-gray-800 overflow-y-auto">
        <h3 className="font-bold text-gray-400 mb-4 uppercase text-xs tracking-wider">Select Course</h3>
        <div className="space-y-2">
          {courses.map(c => (
            <button key={c.id} onClick={() => { setSelectedCourse(c); setEditingModule(null); setViewingResults(null); }}
              className={`w-full text-left p-3 rounded-lg ${selectedCourse?.id === c.id ? 'bg-[#FF4A1F] text-black font-bold' : 'text-gray-300 hover:bg-white/5'}`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Module Manager */}
      <div className="col-span-4 bg-[#111] p-4 rounded-xl border border-gray-800 flex flex-col">
        {selectedCourse ? (
          <>
            <h3 className="font-bold text-white mb-4">{selectedCourse.title} Modules</h3>
            <div className="flex gap-2 mb-4">
              <input value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2 flex-1 text-sm text-white" placeholder="New Topic Name..." />
              <button onClick={handleAddModule} className="bg-white text-black p-2 rounded hover:bg-gray-200"><Plus/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {modules.map(m => (
                <div key={m.id} className="bg-black p-3 rounded border border-gray-800 flex justify-between items-center group">
                  <span className="text-sm font-medium truncate w-32">{m.title}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => loadContent(m, 'read')} className="text-blue-400 hover:bg-blue-900/30 p-1.5 rounded"><FileText size={14}/></button>
                    <button onClick={() => loadContent(m, 'solve')} className="text-yellow-400 hover:bg-yellow-900/30 p-1.5 rounded"><Code size={14}/></button>
                    <button onClick={() => loadContent(m, 'video')} className="text-red-400 hover:bg-red-900/30 p-1.5 rounded"><Video size={14}/></button>
                    <button onClick={() => loadResults(m.id)} className="text-green-400 hover:bg-green-900/30 p-1.5 rounded" title="View Results"><Eye size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : <div className="flex items-center justify-center h-full text-gray-600">Select a course</div>}
      </div>

      {/* 3. Editor OR Results View */}
      <div className="col-span-5 bg-[#111] p-4 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
        
        {/* VIEW A: STUDENT RESULTS */}
        {viewingResults ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between mb-4 border-b border-gray-800 pb-4">
               <h2 className="font-bold text-white">Quiz Results</h2>
               <button onClick={() => setViewingResults(null)} className="text-gray-400 hover:text-white"><XCircle/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
               {studentAttempts.length === 0 && <p className="text-gray-500 text-center mt-10">No attempts yet.</p>}
               {studentAttempts.map(attempt => (
                 <div key={attempt.id} className="bg-black p-4 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-white">{attempt.user?.full_name || 'Student'}</span>
                       <span className={`text-xs px-2 py-1 rounded font-bold ${attempt.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                         {attempt.score}/{attempt.total_questions} ({Math.round(attempt.score/attempt.total_questions*100)}%)
                       </span>
                    </div>
                    <div className="text-xs text-gray-500">Submitted: {new Date(attempt.created_at).toLocaleString()}</div>
                 </div>
               ))}
            </div>
          </div>
        ) : editingModule ? (
           /* VIEW B: EDITOR (Restored!) */
           <>
             <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800">
               <div>
                 <span className="text-xs text-gray-500 uppercase">Editing: {editingModule.title}</span>
                 <h2 className="font-bold text-xl flex items-center gap-2 capitalize">
                   {contentType === 'read' ? <FileText className="text-blue-500"/> : contentType === 'solve' ? <Code className="text-yellow-500"/> : <Video className="text-red-500"/>}
                   {contentType === 'solve' ? 'Questions' : `${contentType} Content`}
                 </h2>
               </div>
               {contentType !== 'solve' && (
                 <button onClick={handleSaveSimpleContent} className="bg-[#FF4A1F] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={16} /> Save</button>
               )}
             </div>

             <div className="flex-1 overflow-y-auto pr-2">
               {contentType === 'read' && (
                 <textarea value={contentValue} onChange={e => setContentValue(e.target.value)} className="w-full h-full bg-[#0A0A0A] p-4 text-gray-300 font-mono text-sm border border-gray-800 rounded-lg focus:outline-none focus:border-[#FF4A1F]" placeholder="# Markdown Content..." />
               )}

               {contentType === 'video' && (
                  <div className="space-y-4">
                    <label className="text-sm text-gray-400">YouTube URL</label>
                    <input value={contentValue} onChange={e => setContentValue(e.target.value)} className="w-full bg-[#0A0A0A] border border-gray-800 p-3 rounded text-white" placeholder="https://youtube.com/watch?v=..." />
                    {contentValue && (
                       <div className="aspect-video bg-black rounded overflow-hidden">
                          <iframe src={contentValue.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} className="w-full h-full" title="preview" />
                       </div>
                    )}
                  </div>
               )}

               {contentType === 'solve' && (
                  <div className="space-y-6">
                     {!isAddingQuestion && (
                       <div className="space-y-3">
                         {questions.length === 0 && <p className="text-gray-500 text-center py-4">No questions added.</p>}
                         {questions.map((q, idx) => (
                           <div key={q.id} className="bg-[#0A0A0A] p-4 rounded-lg border border-gray-800 flex justify-between">
                              <div><span className="text-xs text-[#FF4A1F] uppercase">{q.question_type}</span><p className="font-bold text-white">Q{idx+1}. {q.question_text}</p><p className="text-sm text-gray-400">Ans: {q.correct_answer}</p></div>
                              <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                           </div>
                         ))}
                         <button onClick={() => setIsAddingQuestion(true)} className="w-full py-3 border border-dashed border-gray-700 text-gray-400 rounded-xl hover:border-[#FF4A1F] hover:text-[#FF4A1F] flex items-center justify-center gap-2"><Plus size={18}/> Add Question</button>
                       </div>
                     )}

                     {isAddingQuestion && (
                       <div className="bg-[#0A0A0A] p-4 rounded-xl border border-gray-700">
                         <div className="flex justify-between mb-4"><h3 className="font-bold">New Question</h3><button onClick={() => setIsAddingQuestion(false)}><XCircle size={20}/></button></div>
                         <div className="flex gap-4 mb-4">
                           <label className="flex gap-2"><input type="radio" checked={newQuestion.type === 'MCQ'} onChange={() => setNewQuestion({...newQuestion, type: 'MCQ'})}/> MCQ</label>
                           <label className="flex gap-2"><input type="radio" checked={newQuestion.type === 'NAT'} onChange={() => setNewQuestion({...newQuestion, type: 'NAT'})}/> NAT</label>
                         </div>
                         <textarea className="w-full bg-black border border-gray-800 rounded p-3 mb-4 text-sm" placeholder="Question Text" value={newQuestion.text} onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}/>
                         
                         {newQuestion.type === 'MCQ' && newQuestion.options.map((opt, idx) => (
                           <div key={idx} className="flex gap-2 mb-2 items-center">
                             <input type="radio" name="cOpt" checked={newQuestion.correctAnswer === opt && opt !== ''} onChange={() => setNewQuestion({...newQuestion, correctAnswer: opt})}/>
                             <input className="flex-1 bg-black border border-gray-800 rounded p-2 text-sm" placeholder={`Option ${idx+1}`} value={opt} onChange={(e) => updateOption(idx, e.target.value)}/>
                           </div>
                         ))}

                         {newQuestion.type === 'NAT' && (
                           <input type="number" className="w-full bg-black border border-gray-800 rounded p-3 mb-4 text-sm" placeholder="Correct Number Answer" value={newQuestion.correctAnswer} onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}/>
                         )}

                         <button onClick={handleSaveQuestion} className="w-full bg-[#FF4A1F] text-black font-bold py-2 rounded-lg">Save Question</button>
                       </div>
                     )}
                  </div>
               )}
             </div>
           </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <Edit3 size={48} className="mb-4 opacity-20"/>
            <p>Select a module content to edit or view results</p>
          </div>
        )}
      </div>
    </div>
  );
}