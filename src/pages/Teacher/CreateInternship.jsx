import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Save, DollarSign, Loader2, Plus, Trash2, AlertCircle, Code, FileJson } from 'lucide-react';

const CreateInternship = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [practiceSets, setPracticeSets] = useState([]);
  
  // Task Builder State
  const [tasks, setTasks] = useState([]);
  
  // NEW: Added language, starter_code, test_cases
  const [newTask, setNewTask] = useState({ 
    title: '', 
    requirements: '', 
    language: 'javascript', 
    starter_code: '', 
    test_cases: [] 
  });

  // Helper state for the raw text input of test cases (before parsing)
  const [rawTestCases, setRawTestCases] = useState(''); 

  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    description: '',
    price: 149,
    difficulty: 'Medium',
    qualifying_set_id: ''
  });

  useEffect(() => {
    const fetchSets = async () => {
      const { data } = await supabase.from('practice_sets').select('id, title');
      if (data) setPracticeSets(data);
    };
    fetchSets();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Raw JSON Input for Test Cases
  const handleTestCaseChange = (e) => {
    const val = e.target.value;
    setRawTestCases(val);
    try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
            setNewTask(prev => ({ ...prev, test_cases: parsed }));
        }
    } catch (err) {
        // Invalid JSON, ignore update to state but keep text
    }
  };

  const addTask = () => {
    if (!newTask.title.trim() || !newTask.requirements.trim()) {
        alert("Please enter both a Task Title and Strict Requirements.");
        return;
    }
    
    // Validate Test Cases if provided
    if (rawTestCases && newTask.test_cases.length === 0) {
        alert("Invalid JSON format in Test Cases. Please fix before adding.");
        return;
    }

    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    
    // Reset Form
    setNewTask({ title: '', requirements: '', language: 'javascript', starter_code: '', test_cases: [] });
    setRawTestCases('');
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (tasks.length === 0) {
        alert("Please add at least one task!");
        setLoading(false);
        return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('internship_projects').insert({
        created_by: user.id,
        company_name: formData.company_name,
        role_title: formData.role_title,
        description: formData.description,
        price: parseInt(formData.price),
        difficulty: formData.difficulty,
        qualifying_set_id: formData.qualifying_set_id,
        title: `${formData.company_name} - ${formData.role_title}`,
        tasks: tasks // Now includes starter_code & test_cases
      });

      if (error) throw error;
      
      alert("Internship Created Successfully!");
      navigate('/profile'); 

    } catch (error) {
      console.error(error);
      alert("Failed to create internship.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-2xl mt-10 text-white">
      <div className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-indigo-500" /> Post New Internship
        </h1>
        <p className="text-slate-400 text-sm">Define the role and create engineering-grade tasks.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Company & Role */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Company Name</label>
            <input name="company_name" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 focus:border-indigo-500 outline-none" placeholder="e.g. Netflix" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Role Title</label>
            <input name="role_title" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 focus:border-indigo-500 outline-none" placeholder="e.g. React Developer" />
          </div>
        </div>

        <div>
           <label className="block text-xs text-slate-500 mb-1">Job Description</label>
           <textarea name="description" required onChange={handleChange} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 focus:border-indigo-500 outline-none" placeholder="Role overview..." />
        </div>

        {/* --- ENGINEERING TASK BUILDER --- */}
        <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800">
           <label className="block text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
             <Code size={16}/> Define Coding Tasks (One-by-One)
           </label>
           
           {/* Task Input Area */}
           <div className="space-y-4 mb-6 border border-slate-800 p-4 rounded-xl bg-slate-900/30">
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">Task Title</label>
                    <input 
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        className="w-full bg-black border border-slate-700 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
                        placeholder="e.g. Implement Login API"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500 mb-1 block">Language</label>
                    <select 
                        value={newTask.language} 
                        onChange={(e) => setNewTask({...newTask, language: e.target.value})}
                        className="w-full bg-black border border-slate-700 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
                    >
                        <option value="javascript">JavaScript / Node</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
              </div>

              <div>
                 <label className="text-xs text-slate-500 mb-1 block">Task Requirements (Instructions)</label>
                 <textarea 
                    value={newTask.requirements}
                    onChange={(e) => setNewTask({...newTask, requirements: e.target.value})}
                    className="w-full h-20 bg-black border border-slate-700 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none font-mono text-slate-300"
                    placeholder="Describe exactly what function or API endpoint to build..."
                 />
              </div>

              <div>
                 <label className="text-xs text-slate-500 mb-1 block">Starter Code (Template)</label>
                 <textarea 
                    value={newTask.starter_code}
                    onChange={(e) => setNewTask({...newTask, starter_code: e.target.value})}
                    className="w-full h-32 bg-black border border-slate-700 rounded-lg p-3 text-xs focus:border-emerald-500 outline-none font-mono text-slate-300"
                    placeholder="// Write the starting template code here..."
                 />
              </div>

              <div>
                 <label className="text-xs text-slate-500 mb-1 block flex items-center gap-2"><FileJson size={12}/> Test Cases (JSON Array)</label>
                 <textarea 
                    value={rawTestCases}
                    onChange={handleTestCaseChange}
                    className="w-full h-24 bg-black border border-slate-700 rounded-lg p-3 text-xs focus:border-emerald-500 outline-none font-mono text-yellow-300/80"
                    placeholder='[ { "input": "arg1", "expected": "result" } ]'
                 />
                 <p className="text-[10px] text-slate-500 mt-1">Format: JSON Array of objects with 'input' and 'expected' keys.</p>
              </div>

              <button 
                type="button" 
                onClick={addTask}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16}/> Add Task to Workflow
              </button>
           </div>

           {/* Task List Preview */}
           <div className="space-y-2">
              {tasks.map((t, idx) => (
                  <div key={t.id} className="flex justify-between items-start bg-slate-900 p-4 rounded-lg border border-slate-800">
                      <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2">
                             <span className="bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-400">Step {idx+1}</span>
                             {t.title}
                             <span className="text-[10px] px-1.5 py-0.5 bg-indigo-900/30 text-indigo-400 border border-indigo-500/20 rounded uppercase">{t.language}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-mono line-clamp-1">{t.requirements}</div>
                      </div>
                      <button type="button" onClick={() => removeTask(t.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
              ))}
              {tasks.length === 0 && <p className="text-center text-xs text-slate-600 italic">No tasks defined yet.</p>}
           </div>
        </div>

        {/* Qualifier & Price */}
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Qualifying Assessment</label>
                <select name="qualifying_set_id" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 outline-none">
                    <option value="">-- Select Test --</option>
                    {practiceSets.map(set => <option key={set.id} value={set.id}>{set.title}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs text-slate-500 mb-1">Fee (₹)</label>
                <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="number" name="price" defaultValue={149} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pl-10 outline-none" />
                </div>
            </div>
            <div>
                <label className="block text-xs text-slate-500 mb-1">Difficulty</label>
                <select name="difficulty" onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 outline-none">
                <option>Beginner</option><option>Medium</option><option>Hard</option>
                </select>
            </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin"/> : <><Save size={20}/> Launch Internship</>}
        </button>

      </form>
    </div>
  );
};

export default CreateInternship;