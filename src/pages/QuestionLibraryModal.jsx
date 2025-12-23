import React, { useState, useMemo } from 'react';
import { 
  X, Search, Filter, CheckCircle, Circle, 
  BookOpen, Layers, CheckSquare, ArrowRight 
} from 'lucide-react';

/**
 * Sub-component: The Question Library Modal
 * Integrate this into your main AssignmentManager
 */
export default function QuestionLibraryModal({ 
  isOpen, 
  onClose, 
  questions = [], // The raw data from module_questions
  onImport // Function to handle the final import
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTopic, setActiveTopic] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');

  // --- 1. SMART DATA PROCESSING ---
  // Extract unique topics from the data dynamically
  const uniqueTopics = useMemo(() => {
    const topics = new Set(questions.map(q => q.topic || 'Uncategorized'));
    return ['All', ...Array.from(topics)];
  }, [questions]);

  // Filter the questions based on Search, Topic, and Difficulty
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = (q.question_text || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = activeTopic === 'All' || (q.topic || 'Uncategorized') === activeTopic;
      const matchesDifficulty = activeDifficulty === 'All' || (q.difficulty || 'Medium') === activeDifficulty;
      return matchesSearch && matchesTopic && matchesDifficulty;
    });
  }, [questions, searchTerm, activeTopic, activeDifficulty]);

  // --- 2. HANDLERS ---
  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImport = () => {
    onImport(selectedIds);
    onClose();
  };

  const selectAllFiltered = () => {
    const ids = filteredQuestions.map(q => q.id);
    // If all currently filtered are selected, deselect them. Otherwise, select all.
    const allSelected = ids.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      // Add unique IDs
      setSelectedIds(prev => [...new Set([...prev, ...ids])]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      
      {/* MAIN CONTAINER */}
      <div className="bg-[#090909] w-full max-w-6xl h-[90vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* --- HEADER --- */}
        <div className="h-20 border-b border-white/5 bg-[#0F0F0F] flex justify-between items-center px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400 border border-purple-500/20">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Question Library</h2>
              <p className="text-xs text-gray-500 font-medium">Select questions to import into your assignment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search keywords..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- BODY: SPLIT VIEW --- */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <div className="w-64 bg-[#0c0c0c] border-r border-white/5 flex flex-col p-6 overflow-y-auto custom-scrollbar hidden md:flex">
            
            {/* Filter Section: Difficulty */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter size={12}/> Difficulty
              </h3>
              <div className="space-y-2">
                {['All', 'Easy', 'Medium', 'Hard'].map(level => (
                  <button
                    key={level}
                    onClick={() => setActiveDifficulty(level)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeDifficulty === level 
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Section: Topics */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers size={12}/> Topics
              </h3>
              <div className="space-y-1">
                {uniqueTopics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setActiveTopic(topic)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-xs font-medium truncate transition-all ${
                      activeTopic === topic 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: GRID CONTENT */}
          <div className="flex-1 bg-[#090909] p-6 overflow-y-auto custom-scrollbar relative">
            
            {/* Context Bar */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-bold">{filteredQuestions.length}</span> questions
              </p>
              <button 
                onClick={selectAllFiltered}
                className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-2"
              >
                <CheckSquare size={14}/> 
                {filteredQuestions.every(q => selectedIds.includes(q.id)) && filteredQuestions.length > 0 ? "Deselect All" : "Select All Visible"}
              </button>
            </div>

            {/* THE GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-24">
              {filteredQuestions.map(q => {
                const isSelected = selectedIds.includes(q.id);
                return (
                  <div 
                    key={q.id}
                    onClick={() => toggleSelection(q.id)}
                    className={`relative p-5 rounded-2xl border cursor-pointer group transition-all duration-200 select-none ${
                      isSelected 
                      ? 'bg-[#151118] border-purple-500/50 shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]' 
                      : 'bg-[#111] border-white/5 hover:border-white/10 hover:bg-[#161616]'
                    }`}
                  >
                    {/* Header: Badges */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                         {/* Topic Badge */}
                         <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 border border-white/5">
                           {q.topic || 'General'}
                         </span>
                         {/* Difficulty Badge */}
                         <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            q.difficulty === 'Easy' ? 'bg-emerald-900/20 text-emerald-500 border-emerald-900/30' :
                            q.difficulty === 'Medium' ? 'bg-amber-900/20 text-amber-500 border-amber-900/30' :
                            'bg-red-900/20 text-red-500 border-red-900/30'
                         }`}>
                           {q.difficulty || 'Medium'}
                         </span>
                      </div>
                      
                      {/* Selection Checkbox Visual */}
                      <div className={`transition-all duration-300 ${isSelected ? 'text-purple-500 scale-110' : 'text-gray-700 group-hover:text-gray-500'}`}>
                        {isSelected ? <CheckCircle size={22} fill="currentColor" className="text-purple-500 bg-black rounded-full" /> : <Circle size={22} />}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className={`text-sm font-medium leading-relaxed mb-4 ${isSelected ? 'text-gray-100' : 'text-gray-300'}`}>
                      {q.question_text}
                    </h3>

                    {/* Footer: Answer Preview */}
                    <div className={`mt-auto pt-3 border-t ${isSelected ? 'border-white/10' : 'border-white/5'}`}>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Answer: <span className="text-gray-400 font-mono">{q.correct_answer}</span>
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredQuestions.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                  <Search size={48} className="mb-4 text-gray-600"/>
                  <p className="text-gray-400">No questions found matching your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- STICKY FOOTER --- */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-[#090909] to-transparent pointer-events-none flex justify-center">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-full pl-6 pr-2 py-2 shadow-2xl flex items-center gap-6 pointer-events-auto transform translate-y-0 transition-all">
            <span className="text-sm text-gray-300 font-medium">
              <span className="text-purple-400 font-bold text-lg mr-1">{selectedIds.length}</span> 
              selected
            </span>
            <button 
              onClick={handleImport}
              disabled={selectedIds.length === 0}
              className="bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
            >
              Import Questions <ArrowRight size={16}/>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}