import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Save, Plus, Trash2, Search, Database, Code, 
  Mic, BookOpen, Key, CheckSquare, Loader2, Volume2, X 
} from 'lucide-react';

export default function PracticeSetBuilder() {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  const [setData, setSetData] = useState({
    title: "",
    accessKey: "",
    communication: {
      reading: ["", "", "", ""], 
      repetition: ["", "", "", ""], 
      comprehension: { 
        story: "", 
        questions: [{ q: "", options: ["", "", "", ""], ans: "" }] 
      } 
    },
    technical: [], 
    coding: []     
  });

  // --- QUESTION SOURCES ---
  const [dbQuestions, setDbQuestions] = useState([]); 
  const [codingBank, setCodingBank] = useState([]);   
  
  const [techSearch, setTechSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");

  // --- MANUAL ENTRY STATES ---
  const [manualTech, setManualTech] = useState({ q: "", options: ["", "", "", ""], ans: "" });
  
  // Updated Manual Code State to include Test Cases
  const [manualCode, setManualCode] = useState({ 
    title: "", 
    difficulty: "Easy", 
    desc: "",
    testCases: [{ input: "", expected: "" }] // Default 1 empty case
  });

  // --- FETCHING ---
  useEffect(() => {
    const fetchSupabaseTech = async () => {
      const { data } = await supabase.from('module_questions').select('*').eq('question_type', 'MCQ').limit(200); 
      if(data) setDbQuestions(data);
    };

    const fetchSupabaseCoding = async () => {
      const { data } = await supabase.from('coding_questions').select('*').order('created_at', { ascending: false });
      if(data) setCodingBank(data);
    };

    if(step === 3) fetchSupabaseTech();
    if(step === 4) fetchSupabaseCoding();
  }, [step]);

  // --- HANDLERS: COMPREHENSION ---
  const updateCompStory = (val) => {
    setSetData(prev => ({ ...prev, communication: { ...prev.communication, comprehension: { ...prev.communication.comprehension, story: val } } }));
  };
  const updateCompQuestion = (idx, field, val) => {
    const newQuestions = [...setData.communication.comprehension.questions];
    newQuestions[idx][field] = val;
    setSetData(prev => ({ ...prev, communication: { ...prev.communication, comprehension: { ...prev.communication.comprehension, questions: newQuestions } } }));
  };
  const updateCompOption = (qIdx, optIdx, val) => {
    const newQuestions = [...setData.communication.comprehension.questions];
    newQuestions[qIdx].options[optIdx] = val;
    setSetData(prev => ({ ...prev, communication: { ...prev.communication, comprehension: { ...prev.communication.comprehension, questions: newQuestions } } }));
  };
  const addCompQuestion = () => {
    setSetData(prev => ({ ...prev, communication: { ...prev.communication, comprehension: { ...prev.communication.comprehension, questions: [...prev.communication.comprehension.questions, { q: "", options: ["", "", "", ""], ans: "" }] } } }));
  };
  const removeCompQuestion = (idx) => {
    const newQuestions = setData.communication.comprehension.questions.filter((_, i) => i !== idx);
    setSetData(prev => ({ ...prev, communication: { ...prev.communication, comprehension: { ...prev.communication.comprehension, questions: newQuestions } } }));
  };

  // --- HANDLERS: MANUAL CODING TEST CASES ---
  const addManualCodeTestCase = () => {
    setManualCode(prev => ({ ...prev, testCases: [...prev.testCases, { input: "", expected: "" }] }));
  };
  
  const removeManualCodeTestCase = (idx) => {
    const newCases = manualCode.testCases.filter((_, i) => i !== idx);
    setManualCode(prev => ({ ...prev, testCases: newCases }));
  };

  const updateManualCodeTestCase = (idx, field, val) => {
    const newCases = [...manualCode.testCases];
    newCases[idx][field] = val;
    setManualCode(prev => ({ ...prev, testCases: newCases }));
  };

  // --- ADD TO SET HANDLERS ---
  const addManualTechQuestion = () => {
    if(!manualTech.q || !manualTech.ans || manualTech.options.some(o => !o)) return alert("Please fill all fields.");
    const newQ = { id: `manual-${Date.now()}`, q: manualTech.q, options: manualTech.options, ans: manualTech.options.find(o => o.trim() === manualTech.ans.trim()) || manualTech.ans, topic: 'Custom' };
    setSetData(prev => ({...prev, technical: [...prev.technical, newQ]}));
    setManualTech({ q: "", options: ["", "", "", ""], ans: "" });
  };

  const addManualCodingQuestion = () => {
    if(!manualCode.title || !manualCode.desc) return alert("Title and Description required.");
    
    const newProb = { 
      id: `manual-${Date.now()}`, 
      title: manualCode.title, 
      difficulty: manualCode.difficulty, 
      description: manualCode.desc, 
      // Add standard starter code
      starterCode: { 
        java: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}', 
        python: '# Write your code here\n',
        cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    return 0;\n}'
      }, 
      testCases: manualCode.testCases 
    };

    setSetData(prev => ({...prev, coding: [...prev.coding, newProb]}));
    // Reset form
    setManualCode({ title: "", difficulty: "Easy", desc: "", testCases: [{ input: "", expected: "" }] });
  };

  const handleSaveSet = async () => {
    if(!setData.title) return alert("Please enter a title");
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
      created_by: user.id,
      title: setData.title,
      access_key: setData.accessKey || null,
      data: setData 
    };

    const { error } = await supabase.from('practice_sets').insert(payload);
    setLoading(false);
    
    if(error) alert("Error: " + error.message);
    else {
      alert("Practice Set Published! 🎉");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 text-white min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold">Practice Set Builder</h1>
        <div className="flex gap-2">
          {[1,2,3,4].map(s => (
            <div key={s} onClick={() => setStep(s)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${step === s ? 'bg-[#FF4A1F] text-black' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: INFO */}
      {step === 1 && (
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Set Title</label>
            <input className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl text-white focus:border-[#FF4A1F] outline-none" placeholder="e.g. Full Stack Mock Test 1" value={setData.title} onChange={e => setSetData({...setData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2"><Key size={14}/> Access Key (Optional)</label>
            <input className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl text-white focus:border-[#FF4A1F] outline-none" placeholder="e.g. CLASS-A" value={setData.accessKey} onChange={e => setSetData({...setData, accessKey: e.target.value})} />
          </div>
          <button onClick={() => setStep(2)} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200">Next: Communication</button>
        </div>
      )}

      {/* STEP 2: COMMUNICATION */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto pb-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Mic size={18} className="text-blue-500"/> Reading (4 Items)</h3>
              {setData.communication.reading.map((text, i) => (
                <textarea key={i} className="w-full bg-black border border-gray-700 rounded p-2 mb-2 text-sm text-gray-300 focus:border-blue-500 outline-none" rows={2} placeholder={`Reading Sentence ${i+1}`} value={text} onChange={e => {
                    const newArr = [...setData.communication.reading]; newArr[i] = e.target.value;
                    setSetData(prev => ({...prev, communication: {...prev.communication, reading: newArr}}));
                  }} />
              ))}
            </div>
            <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Volume2 size={18} className="text-purple-500"/> Repetition (4 Items)</h3>
              {setData.communication.repetition.map((text, i) => (
                <textarea key={i} className="w-full bg-black border border-gray-700 rounded p-2 mb-2 text-sm text-gray-300 focus:border-purple-500 outline-none" rows={2} placeholder={`Repetition Sentence ${i+1}`} value={text} onChange={e => {
                    const newArr = [...setData.communication.repetition]; newArr[i] = e.target.value;
                    setSetData(prev => ({...prev, communication: {...prev.communication, repetition: newArr}}));
                  }} />
              ))}
            </div>
          </div>
          
          {/* Comprehension Section */}
          <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-xl"><BookOpen size={20} className="text-orange-500"/> Comprehension</h3>
            <div className="mb-6">
                <label className="block text-xs text-gray-500 uppercase mb-2">Story Passage</label>
                <textarea className="w-full bg-black border border-gray-700 rounded-xl p-4 text-sm text-white focus:border-orange-500 outline-none leading-relaxed" rows={6} placeholder="Paste the main story or paragraph here..." value={setData.communication.comprehension.story} onChange={e => updateCompStory(e.target.value)} />
            </div>
            <div className="space-y-4">
                <label className="block text-xs text-gray-500 uppercase">Questions based on story</label>
                {setData.communication.comprehension.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-black/50 border border-gray-700 p-4 rounded-xl relative">
                        <button onClick={() => removeCompQuestion(qIndex)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                        <div className="mb-3 pr-8">
                             <input className="w-full bg-transparent border-b border-gray-700 pb-2 text-white placeholder-gray-600 focus:border-orange-500 outline-none" placeholder={`Question ${qIndex + 1}`} value={q.q} onChange={e => updateCompQuestion(qIndex, 'q', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            {q.options.map((opt, optIndex) => (
                                <input key={optIndex} className="bg-[#111] border border-gray-800 rounded p-2 text-xs text-gray-300 focus:border-orange-500 outline-none" placeholder={`Option ${optIndex + 1}`} value={opt} onChange={e => updateCompOption(qIndex, optIndex, e.target.value)} />
                            ))}
                        </div>
                        <input className="w-full bg-[#111] border border-gray-800 rounded p-2 text-xs text-green-400 placeholder-gray-600 focus:border-green-500 outline-none" placeholder="Paste Correct Answer Here" value={q.ans} onChange={e => updateCompQuestion(qIndex, 'ans', e.target.value)} />
                    </div>
                ))}
                <button onClick={addCompQuestion} className="w-full py-3 border border-dashed border-gray-700 text-gray-400 rounded-xl hover:text-white hover:border-orange-500 transition-colors flex items-center justify-center gap-2">
                    <Plus size={16}/> Add Comprehension Question
                </button>
            </div>
          </div>
          <button onClick={() => setStep(3)} className="float-right bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200">Next: Technical</button>
        </div>
      )}

      {/* STEP 3: TECHNICAL */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in h-[80vh] flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Database className="text-green-500"/> Select 40 Technical Questions
              <span className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-400">Selected: {setData.technical.length}</span>
            </h2>
            <input className="bg-[#111] border border-gray-800 px-3 py-2 rounded-lg text-sm text-white focus:border-green-500 outline-none" placeholder="Search DB..." value={techSearch} onChange={e => setTechSearch(e.target.value)} />
          </div>

          <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
            <div className="col-span-7 bg-[#111] border border-gray-800 rounded-2xl overflow-y-auto p-4 custom-scrollbar">
                {dbQuestions.filter(q => (q.question_text || "").toLowerCase().includes(techSearch.toLowerCase())).map(q => {
                  const isSelected = setData.technical.find(item => item.id === q.id);
                  return (
                    <div key={q.id} className={`p-3 mb-2 rounded border flex justify-between items-center cursor-pointer transition-all ${isSelected ? 'bg-green-900/10 border-green-500' : 'bg-black border-gray-800 hover:border-gray-600'}`}
                      onClick={() => {
                        if(isSelected) setSetData(prev => ({...prev, technical: prev.technical.filter(i => i.id !== q.id)}));
                        else setSetData(prev => ({...prev, technical: [...prev.technical, { id: q.id, q: q.question_text, options: q.options, ans: q.correct_answer, topic: q.topic }]}));
                      }}
                    >
                      <p className="text-sm font-medium text-white truncate w-4/5">{q.question_text}</p>
                      {isSelected ? <CheckSquare size={18} className="text-green-500"/> : <div className="w-4 h-4 border border-gray-600 rounded"/>}
                    </div>
                  )
                })}
            </div>
            <div className="col-span-5 bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col">
               <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Add Custom Question</h3>
               <div className="space-y-4 flex-1 overflow-y-auto">
                  <textarea className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none resize-none" rows={3} placeholder="Type question here..." value={manualTech.q} onChange={e => setManualTech({...manualTech, q: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                    {manualTech.options.map((opt, i) => (
                      <input key={i} className="bg-black border border-gray-700 rounded p-2 text-xs focus:border-green-500 outline-none" placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                          const newOpts = [...manualTech.options]; newOpts[i] = e.target.value;
                          setManualTech({...manualTech, options: newOpts});
                      }} />
                    ))}
                  </div>
                  <input className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none" placeholder="Correct Answer" value={manualTech.ans} onChange={e => setManualTech({...manualTech, ans: e.target.value})} />
                  <button onClick={addManualTechQuestion} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"><Plus size={16}/> Add to List</button>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-700 h-1/3 overflow-y-auto">
                  <p className="text-xs text-gray-400 mb-2">Review Selected ({setData.technical.length})</p>
                  {setData.technical.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-black p-2 mb-1 rounded border border-gray-800">
                       <span className="truncate w-4/5">{t.q}</span>
                       <button onClick={() => setSetData(prev => ({...prev, technical: prev.technical.filter(i => i.id !== t.id)}))}><X size={14} className="text-red-500"/></button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
          <button onClick={() => setStep(4)} className="float-right bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200">Next: Coding</button>
        </div>
      )}

      {/* STEP 4: CODING */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in h-[80vh] flex flex-col">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold flex items-center gap-2">
               <Code className="text-yellow-500"/> Select 2 Coding Questions
               <span className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-400">Selected: {setData.coding.length} / 2</span>
             </h2>
             <input className="bg-[#111] border border-gray-800 px-3 py-2 rounded-lg text-sm text-white focus:border-yellow-500 outline-none" placeholder="Search Problems..." value={codeSearch} onChange={e => setCodeSearch(e.target.value)} />
           </div>

           <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
             {/* LEFT: SUPABASE BANK */}
             <div className="col-span-7 bg-[#111] border border-gray-800 rounded-2xl flex-1 overflow-y-auto p-4 custom-scrollbar">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 sticky top-0 bg-[#111] py-2">From Question Bank</h3>
                 {codingBank.filter(q => q.title.toLowerCase().includes(codeSearch.toLowerCase())).map(q => {
                   const isSelected = setData.coding.find(item => item.id === q.id);
                   return (
                     <div key={q.id} className={`p-4 mb-2 rounded border flex justify-between items-center cursor-pointer transition-colors ${isSelected ? 'bg-yellow-900/10 border-yellow-500' : 'bg-black border-gray-800 hover:border-gray-600'}`}
                       onClick={() => {
                           if(isSelected) setSetData(prev => ({...prev, coding: prev.coding.filter(i => i.id !== q.id)}));
                           else if(setData.coding.length < 2) setSetData(prev => ({...prev, coding: [...prev.coding, q]}));
                       }}
                     >
                         <div>
                           <h4 className="font-bold text-white">{q.title}</h4>
                           <div className="flex gap-2 mt-1"><span className="text-[10px] bg-gray-800 px-2 rounded">{q.difficulty}</span></div>
                         </div>
                         {isSelected ? <CheckSquare className="text-yellow-500"/> : <Plus className="text-gray-600"/>}
                     </div>
                   )
                 })}
             </div>

             {/* RIGHT: MANUAL ENTRY (WITH TEST CASES) */}
             <div className="col-span-5 bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Add Custom Problem</h3>
                 <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     <input className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-yellow-500 outline-none" placeholder="Problem Title" value={manualCode.title} onChange={e => setManualCode({...manualCode, title: e.target.value})} />
                     <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-yellow-500 outline-none" value={manualCode.difficulty} onChange={e => setManualCode({...manualCode, difficulty: e.target.value})}>
                        <option>Easy</option> <option>Medium</option> <option>Hard</option>
                     </select>
                     <textarea className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-yellow-500 outline-none resize-none h-24" placeholder="Problem Description (Markdown supported)..." value={manualCode.desc} onChange={e => setManualCode({...manualCode, desc: e.target.value})} />
                     
                     {/* TEST CASES SECTION */}
                     <div className="bg-black/50 border border-gray-800 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-gray-400 uppercase">Test Cases</span>
                           <button onClick={addManualCodeTestCase} className="text-xs text-yellow-500 hover:underline flex items-center gap-1"><Plus size={12}/> Add Case</button>
                        </div>
                        <div className="space-y-3">
                           {manualCode.testCases.map((tc, tcIdx) => (
                             <div key={tcIdx} className="relative bg-[#111] border border-gray-800 p-2 rounded-lg">
                                {manualCode.testCases.length > 1 && (
                                   <button onClick={() => removeManualCodeTestCase(tcIdx)} className="absolute top-1 right-1 text-gray-600 hover:text-red-500"><X size={12}/></button>
                                )}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                   <textarea className="bg-black border border-gray-700 rounded p-2 text-xs font-mono text-gray-300 resize-none h-16" placeholder="Input" value={tc.input} onChange={e => updateManualCodeTestCase(tcIdx, 'input', e.target.value)} />
                                   <textarea className="bg-black border border-gray-700 rounded p-2 text-xs font-mono text-gray-300 resize-none h-16" placeholder="Output" value={tc.expected} onChange={e => updateManualCodeTestCase(tcIdx, 'expected', e.target.value)} />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     <button onClick={addManualCodingQuestion} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2"><Plus size={16}/> Add Problem</button>
                 </div>

                 <div className="mt-4 pt-4 border-t border-gray-700 h-1/4 overflow-y-auto">
                     <p className="text-xs text-gray-400 mb-2">Selected Problems</p>
                     {setData.coding.map((c, idx) => (
                       <div key={idx} className="flex justify-between items-center text-xs bg-black p-2 mb-1 rounded border border-gray-800">
                         <span className="truncate w-4/5 font-bold text-white">{c.title}</span>
                         <button onClick={() => setSetData(prev => ({...prev, coding: prev.coding.filter(i => i.id !== c.id)}))}><X size={14} className="text-red-500"/></button>
                       </div>
                     ))}
                 </div>
             </div>
           </div>

           <div className="flex justify-end gap-4 border-t border-gray-800 pt-4">
              <button onClick={() => setStep(3)} className="text-gray-400 hover:text-white px-4">Back</button>
              <button onClick={handleSaveSet} disabled={loading} className="bg-[#FF4A1F] text-black px-10 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform">
                {loading ? <Loader2 className="animate-spin"/> : <Save/>} Publish Set
              </button>
           </div>
        </div>
      )}
    </div>
  );
}