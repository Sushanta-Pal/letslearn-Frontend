import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Save, DollarSign, BookOpen, Loader2, ListChecks } from 'lucide-react';

const CreateInternship = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [practiceSets, setPracticeSets] = useState([]);
  
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    description: '',
    price: 149,
    difficulty: 'Medium',
    qualifying_set_id: '',
    tasksRaw: '' // <--- NEW: Raw text for tasks
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Process Tasks: Split by new line -> Clean whitespace -> Filter empty
    const taskArray = formData.tasksRaw.split('\n').map(t => t.trim()).filter(t => t.length > 0);

    if (taskArray.length === 0) {
        alert("Please add at least one task for the intern!");
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
        tasks: taskArray // <--- SAVING THE ARRAY TO DB
      });

      if (error) throw error;
      
      alert("Internship Created with Tasks!");
      navigate('/profile'); 

    } catch (error) {
      console.error(error);
      alert("Failed to create internship.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-2xl mt-10 text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-indigo-500" /> Post New Internship
        </h1>
        <p className="text-slate-400 text-sm">Create a role, define tasks, and link a qualifying test.</p>
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

        {/* Description */}
        <div>
           <label className="block text-xs text-slate-500 mb-1">Job Description</label>
           <textarea name="description" required onChange={handleChange} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 focus:border-indigo-500 outline-none" placeholder="What will the intern do?" />
        </div>

        {/* --- NEW SECTION: TASK LIST --- */}
        <div>
           <label className="block text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
             <ListChecks size={16}/> Define Intern Tasks
           </label>
           <p className="text-xs text-slate-500 mb-2">Enter tasks one per line. These will appear in the student's Kanban board.</p>
           <textarea 
             name="tasksRaw" 
             required 
             onChange={handleChange} 
             className="w-full h-32 bg-slate-950 border border-emerald-500/30 rounded-lg p-3 focus:border-emerald-500 outline-none font-mono text-sm" 
             placeholder={`Setup React Project\nIntegrate Supabase Auth\nBuild User Profile Page\nFix CSS Bugs`} 
           />
        </div>

        {/* Qualifier Selection */}
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <label className="block text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
            <BookOpen size={16}/> Link Qualifying Assessment
          </label>
          <select 
            name="qualifying_set_id" 
            required 
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
          >
            <option value="">-- Select a Practice Set --</option>
            {practiceSets.map(set => (
              <option key={set.id} value={set.id}>{set.title}</option>
            ))}
          </select>
        </div>

        {/* Price & Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Acceptance Fee (₹)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-slate-500" size={16} />
              <input type="number" name="price" defaultValue={149} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pl-10 focus:border-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Difficulty</label>
            <select name="difficulty" onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 outline-none">
              <option>Beginner</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin"/> : <><Save size={20}/> Launch Internship</>}
        </button>

      </form>
    </div>
  );
};

export default CreateInternship;