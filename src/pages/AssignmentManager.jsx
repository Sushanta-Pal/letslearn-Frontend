import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Plus, Users, Clock, CheckCircle, Trash2, Key, 
  Search, BarChart3, Loader2, Save, BookOpen, X, 
  CheckSquare, Square, Filter, ChevronDown, ChevronUp, ArrowRight 
} from 'lucide-react';

export default function AssignmentManager() {
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'create'
  
  // --- DATA STATES ---
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- LIBRARY STATES (For Inline Browser) ---
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryQuestions, setLibraryQuestions] = useState([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedLibraryIds, setSelectedLibraryIds] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  // --- FORM STATE ---
  const [form, setForm] = useState({
    title: '',
    access_key: '',
    time_limit: 30,
    questions: []
  });

  // --- INITIAL FETCH ---
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('assignments')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });
    setAssignments(data || []);
  };

  // --- LIBRARY HANDLERS ---
  const toggleLibrary = async () => {
    if (!isLibraryOpen) {
        // Fetch only when opening
        setLibraryLoading(true);
        const { data, error } = await supabase
            .from('module_questions') 
            .select('*')
            .limit(100);
        
        if (!error) setLibraryQuestions(data || []);
        setLibraryLoading(false);
    }
    setIsLibraryOpen(!isLibraryOpen);
  };

  const handleLibraryImport = () => {
    // 1. Get selected objects
    const questionsToAdd = libraryQuestions
        .filter(q => selectedLibraryIds.includes(q.id))
        .map(q => ({
            id: Date.now() + Math.random(), // New unique ID for the assignment
            question: q.question_text,
            options: q.options || ['', '', '', ''],
            answer: q.correct_answer
        }));

    // 2. Add to form
    setForm(prev => ({
        ...prev,
        questions: [...prev.questions, ...questionsToAdd]
    }));

    // 3. Reset library selection
    setSelectedLibraryIds([]);
    setIsLibraryOpen(false); // Close the inline browser
  };

  const toggleLibrarySelection = (id) => {
    setSelectedLibraryIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // --- SUBMISSIONS HANDLER ---
  const fetchSubmissions = async (assignId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        profiles ( full_name, email ) 
      `) // <--- Fixed line
      .eq('assignment_id', assignId)
      .order('total_score', { ascending: false });

    if (error) {
        console.error("Error fetching submissions:", error);
    } else {
        setSubmissions(data || []);
    }
    setLoading(false);
  };

  // --- FORM HANDLERS ---
  const addManualQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, { id: Date.now(), question: '', options: ['', '', '', ''], answer: '' }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    const newQs = [...form.questions];
    newQs[index][field] = value;
    setForm({ ...form, questions: newQs });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQs = [...form.questions];
    newQs[qIndex].options[oIndex] = value;
    setForm({ ...form, questions: newQs });
  };

  const removeQuestion = (index) => {
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== index) });
  };

  const handlePublish = async () => {
    if (!form.title || !form.access_key || form.questions.length === 0) return alert("Missing fields!");
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('assignments').insert({
      created_by: user.id,
      title: form.title,
      access_key: form.access_key,
      time_limit: form.time_limit,
      data: { technical: form.questions } 
    });

    if (!error) {
      setForm({ title: '', access_key: '', time_limit: 30, questions: [] });
      setActiveTab('results');
      fetchAssignments();
    } else {
        alert(error.message);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if(!confirm("Delete assignment?")) return;
    await supabase.from('assignments').delete().eq('id', id);
    fetchAssignments();
    if(selectedAssignment?.id === id) setSelectedAssignment(null);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans p-6 selection:bg-orange-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-bold text-white">Assignment <span className="text-orange-500">Manager</span></h1>
            <p className="text-gray-400 text-sm mt-1">Manage tests and view live results.</p>
          </div>
          <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
             <button onClick={() => setActiveTab('results')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'results' ? 'bg-[#222] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
               <BarChart3 size={16}/> Results
             </button>
             <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'create' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-gray-500 hover:text-gray-300'}`}>
               <Plus size={16}/> Create
             </button>
          </div>
        </div>

        {/* --- VIEW: CREATE --- */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2">
            
            {/* LEFT: SETTINGS (Sticky) */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 sticky top-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Key size={18} className="text-orange-500"/> Assignment Setup
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 mt-1 focus:border-orange-500 outline-none transition-colors" placeholder="e.g. Java Finals"/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Access Key</label>
                            <input type="text" value={form.access_key} onChange={e => setForm({...form, access_key: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 mt-1 focus:border-orange-500 outline-none font-mono" placeholder="SecretPassword"/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Time Limit (Min)</label>
                            <input type="number" value={form.time_limit} onChange={e => setForm({...form, time_limit: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 mt-1 focus:border-orange-500 outline-none" />
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-400">Questions Added:</span>
                            <span className="text-xl font-bold text-white">{form.questions.length}</span>
                        </div>
                        <button onClick={handlePublish} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20 flex justify-center items-center gap-2">
                            <Save size={18}/> Publish Assignment
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: QUESTION MANAGER (No Overlap) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Added Questions List */}
                <div className="space-y-4">
                    {form.questions.map((q, i) => (
                        <div key={q.id} className="bg-[#0F0F0F] border border-white/10 p-5 rounded-xl group relative hover:border-white/20 transition-all">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => removeQuestion(i)} className="text-red-500 bg-red-900/20 p-2 rounded-lg hover:bg-red-900/40"><Trash2 size={16}/></button>
                            </div>
                            
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Question {i+1}</h4>
                            <input type="text" value={q.question} onChange={(e) => updateQuestion(i, 'question', e.target.value)} className="w-full bg-transparent text-lg font-medium text-white border-b border-transparent focus:border-white/20 outline-none mb-4" placeholder="Type question here..."/>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className={`flex items-center gap-2 p-2 rounded-lg border ${q.answer === opt && opt !== '' ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/5 bg-[#050505]'}`}>
                                        <div onClick={() => updateQuestion(i, 'answer', opt)} className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center shrink-0 ${q.answer === opt && opt !== '' ? 'border-orange-500 bg-orange-500' : 'border-gray-600'}`}>
                                            {q.answer === opt && opt !== '' && <div className="w-1.5 h-1.5 bg-black rounded-full"/>}
                                        </div>
                                        <input type="text" value={opt} onChange={(e) => updateOption(i, optIndex, e.target.value)} className="w-full bg-transparent text-sm outline-none text-gray-300" placeholder={`Option ${optIndex+1}`}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={addManualQuestion} className="py-4 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/5 transition-all flex flex-col items-center justify-center gap-2">
                        <Plus size={24}/> 
                        <span className="font-bold text-sm">Add Manual Question</span>
                    </button>
                    <button onClick={toggleLibrary} className={`py-4 border border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${isLibraryOpen ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/20 text-gray-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/5'}`}>
                        <BookOpen size={24}/>
                        <span className="font-bold text-sm">{isLibraryOpen ? 'Close Library' : 'Browse Library'}</span>
                    </button>
                </div>

                {/* 3. INLINE LIBRARY BROWSER (Expands here, pushing content down) */}
                {isLibraryOpen && (
                    <div className="bg-[#0F0F0F] border border-purple-500/30 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4">
                        <div className="p-4 bg-[#141414] border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2"><BookOpen size={18} className="text-purple-500"/> Question Library</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14}/>
                                <input type="text" placeholder="Search..." value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} className="bg-[#050505] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-purple-500"/>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#0A0A0A]">
                            {libraryLoading && <div className="text-center py-10 text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Loading questions...</div>}
                            
                            {!libraryLoading && libraryQuestions
                                .filter(q => (q.question_text || "").toLowerCase().includes(librarySearch.toLowerCase()))
                                .map(q => {
                                    const isSelected = selectedLibraryIds.includes(q.id);
                                    return (
                                        <div key={q.id} onClick={() => toggleLibrarySelection(q.id)} className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-4 ${isSelected ? 'bg-purple-900/20 border-purple-500/50' : 'bg-[#111] border-white/5 hover:bg-[#161616]'}`}>
                                            <div className={`mt-1 ${isSelected ? 'text-purple-500' : 'text-gray-600'}`}>
                                                {isSelected ? <CheckSquare size={20}/> : <Square size={20}/>}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-200">{q.question_text}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">{q.topic || 'General'}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${q.difficulty === 'Easy' ? 'text-green-400 border-green-900/30 bg-green-900/10' : 'text-yellow-400 border-yellow-900/30 bg-yellow-900/10'}`}>{q.difficulty || 'Medium'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                            })}
                        </div>

                        <div className="p-4 bg-[#141414] border-t border-white/10 flex justify-between items-center">
                            <span className="text-sm text-gray-500">{selectedLibraryIds.length} Selected</span>
                            <button onClick={handleLibraryImport} disabled={selectedLibraryIds.length === 0} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                                Import Selected <ArrowRight size={16}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* --- VIEW: RESULTS DASHBOARD (Unchanged) --- */}
        {activeTab === 'results' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
             {/* LEFT SIDEBAR */}
             <div className="lg:col-span-4 bg-[#0F0F0F] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-[#141414]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                        <input type="text" placeholder="Search assignments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500/50"/>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {assignments.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).map(a => (
                        <div key={a.id} onClick={() => { setSelectedAssignment(a); fetchSubmissions(a.id); }} className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedAssignment?.id === a.id ? 'bg-[#1A1A1A] border-orange-500/40' : 'border-transparent hover:bg-white/5'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold text-sm ${selectedAssignment?.id === a.id ? 'text-white' : 'text-gray-400'}`}>{a.title}</h4>
                                <button onClick={(e) => {e.stopPropagation(); handleDeleteAssignment(a.id)}} className="text-gray-600 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                            <div className="flex gap-2 text-[10px] font-mono opacity-60">
                                <span className="bg-[#2A1C15] text-orange-400 px-1.5 rounded border border-orange-900/30">KEY: {a.access_key}</span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* RIGHT MAIN */}
             <div className="lg:col-span-8 bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden flex flex-col relative">
                {selectedAssignment ? (
                    <>
                        <div className="p-6 border-b border-white/5 bg-[#141414] flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedAssignment.title}</h2>
                                <p className="text-xs text-gray-500 mt-1">Submissions: {submissions.length}</p>
                            </div>
                            <button onClick={() => fetchSubmissions(selectedAssignment.id)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400">{loading ? <Loader2 size={18} className="animate-spin"/> : <Users size={18}/>}</button>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-[#0A0A0A] sticky top-0">
                                    <tr><th className="px-6 py-3">Student</th><th className="px-6 py-3">Score</th><th className="px-6 py-3 text-right">Status</th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {submissions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-200">{sub.profiles?.full_name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-600">{sub.profiles?.email}</div>
                                            </td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${sub.technical_score >= 50 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{sub.technical_score}%</span></td>
                                            <td className="px-6 py-4 text-right">{sub.status === 'submitted' ? <span className="text-gray-500 text-xs flex items-center justify-end gap-1"><CheckCircle size={12}/> Done</span> : <span className="text-orange-500 text-xs flex items-center justify-end gap-1"><Clock size={12}/> Live</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {submissions.length === 0 && !loading && <div className="text-center py-20 text-gray-600 text-sm">No data available.</div>}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600"><BarChart3 size={48} className="mb-4 opacity-20"/><p>Select an assignment</p></div>
                )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
}