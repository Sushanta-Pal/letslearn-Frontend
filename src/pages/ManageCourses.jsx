import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Save, Trash2, Edit3, Video, FileText, Code, CheckCircle, XCircle, List } from 'lucide-react';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  // Content Editor State
  const [editingModule, setEditingModule] = useState(null);
  const [contentType, setContentType] = useState('read');
  const [contentValue, setContentValue] = useState(''); // For Read/Video
  
  // --- NEW STATE FOR QUESTIONS ---
  const [questions, setQuestions] = useState([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    type: 'MCQ', // 'MCQ' or 'NAT'
    text: '',
    options: ['', '', '', ''], // Default 4 options
    correctAnswer: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchModules(selectedCourse.id);
  }, [selectedCourse]);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*');
    setCourses(data || []);
  };

  const fetchModules = async (courseId) => {
    const { data } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');
    setModules(data || []);
  };

  // --- Fetch Content Logic ---
  const loadContent = async (module, type) => {
    setEditingModule(module);
    setContentType(type);
    setContentValue('');
    setQuestions([]);
    setIsAddingQuestion(false);
    
    if (type === 'solve') {
      // Fetch Questions List
      const { data } = await supabase
        .from('module_questions')
        .select('*')
        .eq('module_id', module.id)
        .order('created_at');
      setQuestions(data || []);
    } else {
      // Fetch Read/Video Content
      const { data } = await supabase
        .from('module_content')
        .select('content')
        .eq('module_id', module.id)
        .eq('type', type)
        .single();
      if (data) setContentValue(data.content);
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle) return;
    await supabase.from('course_modules').insert({
      course_id: selectedCourse.id,
      title: newModuleTitle,
      order_index: modules.length
    });
    setNewModuleTitle("");
    fetchModules(selectedCourse.id);
  };

  // --- Save Logic for Read/Video ---
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

  // --- QUESTION HANDLERS ---
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

    const { error } = await supabase.from('module_questions').insert(payload);
    if (error) {
      console.error(error);
      alert("Error saving question");
    } else {
      // Refresh list
      const { data } = await supabase.from('module_questions').select('*').eq('module_id', editingModule.id).order('created_at');
      setQuestions(data || []);
      setIsAddingQuestion(false);
      setNewQuestion({ type: 'MCQ', text: '', options: ['', '', '', ''], correctAnswer: '' }); // Reset
    }
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
            <button
              key={c.id}
              onClick={() => { setSelectedCourse(c); setEditingModule(null); }}
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
              <input 
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                className="bg-black border border-gray-700 rounded px-3 py-2 flex-1 text-sm text-white"
                placeholder="New Topic Name..."
              />
              <button onClick={handleAddModule} className="bg-white text-black p-2 rounded hover:bg-gray-200"><Plus/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {modules.map(m => (
                <div key={m.id} className="bg-black p-3 rounded border border-gray-800 flex justify-between items-center group">
                  <span className="text-sm font-medium">{m.title}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => loadContent(m, 'read')} className="text-blue-400 hover:bg-blue-900/30 p-1.5 rounded"><FileText size={14}/></button>
                    <button onClick={() => loadContent(m, 'solve')} className="text-yellow-400 hover:bg-yellow-900/30 p-1.5 rounded"><Code size={14}/></button>
                    <button onClick={() => loadContent(m, 'video')} className="text-red-400 hover:bg-red-900/30 p-1.5 rounded"><Video size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">Select a course first</div>
        )}
      </div>

      {/* 3. Content Editor */}
      <div className="col-span-5 bg-[#111] p-4 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
        {editingModule ? (
          <>
             <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800">
               <div>
                 <span className="text-xs text-gray-500 uppercase">Editing: {editingModule.title}</span>
                 <h2 className="font-bold text-xl flex items-center gap-2 capitalize">
                   {contentType === 'read' && <FileText size={20} className="text-blue-500"/>}
                   {contentType === 'solve' && <Code size={20} className="text-yellow-500"/>}
                   {contentType === 'video' && <Video size={20} className="text-red-500"/>}
                   {contentType === 'solve' ? 'Questions' : `${contentType} Content`}
                 </h2>
               </div>
               
               {/* Show Save button only for Read/Video. Solve has its own save logic. */}
               {contentType !== 'solve' && (
                 <button onClick={handleSaveSimpleContent} className="bg-[#FF4A1F] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                   <Save size={16} /> Save
                 </button>
               )}
             </div>

             <div className="flex-1 overflow-y-auto pr-2">
               
               {/* --- READ & VIDEO EDITORS --- */}
               {contentType === 'read' && (
                 <textarea 
                   value={contentValue} 
                   onChange={e => setContentValue(e.target.value)}
                   className="w-full h-full bg-[#0A0A0A] p-4 text-gray-300 font-mono text-sm border border-gray-800 rounded-lg focus:outline-none focus:border-[#FF4A1F]"
                   placeholder="# Write Markdown Content Here..."
                 />
               )}

               {contentType === 'video' && (
                  <div className="space-y-4">
                    <label className="text-sm text-gray-400">YouTube URL</label>
                    <input 
                      value={contentValue}
                      onChange={e => setContentValue(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-gray-800 p-3 rounded text-white" 
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    {contentValue && (
                       <div className="aspect-video bg-black rounded overflow-hidden">
                          <iframe src={contentValue.replace("watch?v=", "embed/")} className="w-full h-full" title="preview" />
                       </div>
                    )}
                  </div>
               )}

               {/* --- NEW QUESTIONS EDITOR (SOLVE) --- */}
               {contentType === 'solve' && (
                  <div className="space-y-6">
                     
                     {/* List of Existing Questions */}
                     {!isAddingQuestion && (
                       <div className="space-y-3">
                         {questions.length === 0 && <p className="text-gray-500 text-center py-4">No questions added yet.</p>}
                         {questions.map((q, idx) => (
                           <div key={q.id} className="bg-[#0A0A0A] p-4 rounded-lg border border-gray-800 relative group">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-bold text-[#FF4A1F] bg-[#FF4A1F]/10 px-2 py-0.5 rounded uppercase">{q.question_type}</span>
                                  <p className="font-bold text-white mt-1">Q{idx+1}. {q.question_text}</p>
                                  <p className="text-sm text-gray-400 mt-1">Answer: <span className="text-green-500">{q.correct_answer}</span></p>
                                </div>
                                <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                              </div>
                           </div>
                         ))}
                         
                         <button 
                           onClick={() => setIsAddingQuestion(true)} 
                           className="w-full py-3 border border-dashed border-gray-700 text-gray-400 rounded-xl hover:border-[#FF4A1F] hover:text-[#FF4A1F] transition-colors flex items-center justify-center gap-2"
                         >
                           <Plus size={18}/> Add New Question
                         </button>
                       </div>
                     )}

                     {/* Add New Question Form */}
                     {isAddingQuestion && (
                       <div className="bg-[#0A0A0A] p-4 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-4">
                         <div className="flex justify-between mb-4">
                           <h3 className="font-bold">New Question</h3>
                           <button onClick={() => setIsAddingQuestion(false)}><XCircle className="text-gray-500 hover:text-white" size={20}/></button>
                         </div>

                         {/* Type Selector */}
                         <div className="flex gap-4 mb-4">
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="qType" checked={newQuestion.type === 'MCQ'} onChange={() => setNewQuestion({...newQuestion, type: 'MCQ'})} className="accent-[#FF4A1F]" />
                             <span className="text-sm">Multiple Choice (MCQ)</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="qType" checked={newQuestion.type === 'NAT'} onChange={() => setNewQuestion({...newQuestion, type: 'NAT'})} className="accent-[#FF4A1F]" />
                             <span className="text-sm">Numerical (NAT)</span>
                           </label>
                         </div>

                         {/* Question Text */}
                         <div className="mb-4">
                           <label className="text-xs text-gray-400 block mb-1">Question Text</label>
                           <textarea 
                             className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-[#FF4A1F] outline-none"
                             rows={3}
                             value={newQuestion.text}
                             onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                             placeholder="e.g., What is the time complexity of QuickSort?"
                           />
                         </div>

                         {/* MCQ Options */}
                         {newQuestion.type === 'MCQ' && (
                           <div className="mb-4 space-y-2">
                             <label className="text-xs text-gray-400 block">Options (Select the correct radio button)</label>
                             {newQuestion.options.map((opt, idx) => (
                               <div key={idx} className="flex gap-2 items-center">
                                 <input 
                                   type="radio" 
                                   name="correctOpt" 
                                   className="accent-green-500"
                                   checked={newQuestion.correctAnswer === opt && opt !== ''}
                                   onChange={() => setNewQuestion({...newQuestion, correctAnswer: opt})}
                                 />
                                 <input 
                                   className="flex-1 bg-black border border-gray-800 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                   placeholder={`Option ${String.fromCharCode(65+idx)}`}
                                   value={opt}
                                   onChange={(e) => updateOption(idx, e.target.value)}
                                 />
                               </div>
                             ))}
                           </div>
                         )}

                         {/* NAT Answer */}
                         {newQuestion.type === 'NAT' && (
                           <div className="mb-4">
                             <label className="text-xs text-gray-400 block mb-1">Correct Answer (Number)</label>
                             <input 
                               type="number"
                               className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-green-500 outline-none"
                               placeholder="e.g. 42"
                               value={newQuestion.correctAnswer}
                               onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                             />
                           </div>
                         )}

                         <button onClick={handleSaveQuestion} className="w-full bg-[#FF4A1F] text-black font-bold py-2 rounded-lg hover:bg-[#E03E13]">
                           Save Question
                         </button>
                       </div>
                     )}

                  </div>
               )}
             </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <Edit3 size={48} className="mb-4 opacity-20"/>
            <p>Select a module icon to edit content</p>
          </div>
        )}
      </div>
    </div>
  );
}