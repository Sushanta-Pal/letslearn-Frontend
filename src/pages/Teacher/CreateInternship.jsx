import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Save, DollarSign, BookOpen, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';

const CreateInternship = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [practiceSets, setPracticeSets] = useState([]);
  
  // Task Builder State
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', requirements: '' });

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

  const addTask = () => {
    if (!newTask.title.trim() || !newTask.requirements.trim()) {
        alert("Please enter both a Task Title and Strict Requirements.");
        return;
    }
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setNewTask({ title: '', requirements: '' });
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
        tasks: tasks // Saving array of objects {title, requirements}
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
    <div className="max-w-3xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-2xl mt-10 text-white">
      <div className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-indigo-500" /> Post New Internship
        </h1>
        <p className="text-slate-400 text-sm">Define the role and strict acceptance criteria.</p>
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

        {/* --- NEW TASK BUILDER --- */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
           <label className="block text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
             <AlertCircle size={16}/> Define Tasks & Requirements
           </label>
           
           {/* Task Input Area */}
           <div className="space-y-3 mb-4">
              <input 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full bg-black border border-slate-700 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
                placeholder="Task Title (e.g. Implement Login API)"
              />
              <textarea 
                value={newTask.requirements}
                onChange={(e) => setNewTask({...newTask, requirements: e.target.value})}
                className="w-full h-20 bg-black border border-slate-700 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none font-mono text-slate-300"
                placeholder="Strict Requirements (e.g. Must use JWT, Password must be hashed, Return 401 on failure)"
              />
              <button 
                type="button" 
                onClick={addTask}
                className="w-full py-2 bg-emerald-600/20 text-emerald-500 border border-emerald-600/50 rounded-lg text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16}/> Add Task
              </button>
           </div>

           {/* Task List Preview */}
           <div className="space-y-2">
              {tasks.map((t, idx) => (
                  <div key={t.id} className="flex justify-between items-start bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div>
                          <div className="font-bold text-sm text-white"><span className="text-slate-500 mr-2">#{idx+1}</span>{t.title}</div>
                          <div className="text-xs text-slate-400 mt-1 font-mono">{t.requirements}</div>
                      </div>
                      <button type="button" onClick={() => removeTask(t.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
              ))}
              {tasks.length === 0 && <p className="text-center text-xs text-slate-600 italic">No tasks added yet.</p>}
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