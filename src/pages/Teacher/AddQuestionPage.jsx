import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Save, Plus, Trash2, Code, Database, X } from 'lucide-react';

export default function AddQuestionPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    description: '',
    coins: 10,
    tags: '',
    testCases: [{ input: '', expected: '' }], // Start with 1 test case
    starterCode: {
      java: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
      python: '# Write your code here\n',
      cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    return 0;\n}'
    }
  });

  // Handlers
  const handleTestCaseChange = (idx, field, value) => {
    const newCases = [...formData.testCases];
    newCases[idx][field] = value;
    setFormData({ ...formData, testCases: newCases });
  };

  const addTestCase = () => setFormData({ ...formData, testCases: [...formData.testCases, { input: '', expected: '' }] });
  
  const removeTestCase = (idx) => {
    const newCases = formData.testCases.filter((_, i) => i !== idx);
    setFormData({ ...formData, testCases: newCases });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('coding_questions').insert({
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        test_cases: formData.testCases, // Save as JSON
        starter_code: formData.starterCode,
        coin_reward: parseInt(formData.coins),
        tags: formData.tags.split(',').map(t => t.trim()),
        slug: formData.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now()
      });

      if (error) throw error;
      alert("Problem Created Successfully! 🚀");
      // Reset Form
      setFormData({ ...formData, title: '', description: '', testCases: [{input:'', expected:''}] });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Code className="text-[#FF4A1F]" /> Create Coding Challenge
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Problem Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <input 
              className="bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-[#FF4A1F] outline-none"
              placeholder="Problem Title (e.g. Reverse a String)"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
            <select 
              className="bg-black border border-gray-700 rounded-xl p-3 text-white outline-none"
              value={formData.difficulty}
              onChange={e => setFormData({...formData, difficulty: e.target.value})}
            >
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
          
          <textarea 
            className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white h-32 outline-none resize-none"
            placeholder="Problem Description (Markdown supported)..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            required
          />

          <div className="grid grid-cols-2 gap-4">
             <div className="flex items-center gap-2 bg-black border border-gray-700 rounded-xl p-3">
               <span className="text-yellow-500">🪙</span>
               <input 
                 type="number" className="bg-transparent outline-none text-white w-full" 
                 placeholder="Coin Reward" value={formData.coins}
                 onChange={e => setFormData({...formData, coins: e.target.value})}
               />
             </div>
             <input 
               className="bg-black border border-gray-700 rounded-xl p-3 text-white outline-none"
               placeholder="Tags (Array, DP, String)"
               value={formData.tags}
               onChange={e => setFormData({...formData, tags: e.target.value})}
             />
          </div>
        </div>

        {/* Test Cases */}
        <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Test Cases (Hidden from Student)</h3>
             <button type="button" onClick={addTestCase} className="text-sm text-[#FF4A1F] hover:underline flex items-center gap-1"><Plus size={14}/> Add Case</button>
          </div>
          
          <div className="space-y-3">
            {formData.testCases.map((tc, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="pt-3 text-gray-600 font-mono text-xs">#{idx+1}</span>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <textarea 
                    className="bg-black border border-gray-700 rounded-lg p-2 text-sm text-gray-300 font-mono" 
                    placeholder="Input (StdIn)" rows={2}
                    value={tc.input} onChange={e => handleTestCaseChange(idx, 'input', e.target.value)}
                  />
                  <textarea 
                    className="bg-black border border-gray-700 rounded-lg p-2 text-sm text-gray-300 font-mono" 
                    placeholder="Expected Output (StdOut)" rows={2}
                    value={tc.expected} onChange={e => handleTestCaseChange(idx, 'expected', e.target.value)}
                  />
                </div>
                {formData.testCases.length > 1 && (
                  <button type="button" onClick={() => removeTestCase(idx)} className="text-gray-600 hover:text-red-500 pt-3"><X size={16}/></button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button disabled={loading} className="w-full bg-[#FF4A1F] text-black font-bold py-4 rounded-full hover:scale-[1.01] transition-transform shadow-lg shadow-orange-900/20">
          {loading ? "Publishing..." : "Publish Challenge"}
        </button>
      </form>
    </div>
  );
}