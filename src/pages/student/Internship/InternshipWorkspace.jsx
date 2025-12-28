import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, Github, Plus, Clock, CheckCircle, 
  AlertTriangle, Lock, ChevronDown, ChevronUp, Globe, X 
} from 'lucide-react';
import TaskVerificationModal from './TaskVerificationModal';

const InternshipWorkspace = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], done: [] });

  // UI State
  const [verifyingTask, setVerifyingTask] = useState(null);
  const [viewingTaskRequirements, setViewingTaskRequirements] = useState(null); 
  const [expandedTasks, setExpandedTasks] = useState({}); 
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ repo: '', live: '' });

  useEffect(() => {
    fetchWorkspaceData();
  }, [projectId]);

  const saveBoardState = async (newState, subId) => {
    const { error } = await supabase.from('internship_submissions').update({ board_state: newState }).eq('id', subId);
    if (error) console.error("Auto-save failed:", error);
  };

  const fetchWorkspaceData = async () => {
    try {
      const { data: proj, error: projError } = await supabase.from('internship_projects').select('*').eq('id', projectId).single();
      if (projError) throw projError;

      const { data: sub, error: subError } = await supabase.from('internship_submissions').select('*').eq('user_id', user.id).eq('project_id', projectId).single();

      if (subError) {
        alert("Not enrolled.");
        navigate('/student/internships');
        return;
      }

      setProject(proj);
      setSubmission(sub);

      if (sub.board_state && (sub.board_state.todo?.length || sub.board_state.in_progress?.length || sub.board_state.done?.length)) {
        setTasks(sub.board_state);
      } else {
        const initialTasks = proj.tasks?.map((t, i) => {
            if (typeof t === 'string') return { id: `task-${i}`, title: t, requirements: "Standard implementation required." };
            return { id: `task-${i}`, ...t }; 
        }) || [];
        
        const defaultState = { todo: initialTasks, in_progress: [], done: [] };
        setTasks(defaultState);
        saveBoardState(defaultState, sub.id); 
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const performMove = async (task, sourceCol, targetCol) => {
    const newTasks = {
      ...tasks,
      [sourceCol]: tasks[sourceCol].filter(t => t.id !== task.id),
      [targetCol]: [...tasks[targetCol], task]
    };
    setTasks(newTasks);
    await supabase.from('internship_submissions').update({ board_state: newTasks }).eq('id', submission.id);
  };

  const handleDrop = async (e, targetCol) => {
    const taskId = e.dataTransfer.getData("taskId");
    const sourceCol = e.dataTransfer.getData("sourceCol");
    if (!taskId || sourceCol === targetCol) return;

    // Prevent dropping INTO 'todo' or 'in_progress' IF coming from 'done'
    // (This is a double check, primarily solved by disabling drag on 'done' items)
    if (sourceCol === 'done') return;

    const taskToMove = tasks[sourceCol].find(t => t.id === taskId);
    if (!taskToMove) return;

    if (targetCol === 'done') {
      setVerifyingTask({ task: taskToMove, sourceCol }); 
      return; 
    }
    performMove(taskToMove, sourceCol, targetCol);
  };

  const handleVerificationSuccess = async (xpReward) => {
    if (!verifyingTask) return;
    const { task, sourceCol } = verifyingTask;
    await performMove(task, sourceCol, 'done');
    await supabase.rpc('add_xp_and_check_rank', { p_user_id: user.id, p_xp_amount: xpReward || 50 });
    alert(`Task Verified! +${xpReward || 50} XP`);
    setVerifyingTask(null);
  };

  const handleOpenSubmitModal = () => {
    if (tasks.todo.length > 0 || tasks.in_progress.length > 0) {
      return alert("You must complete ALL tasks (move to 'Done') before submitting.");
    }
    setShowSubmitModal(true);
  };

  const submitProject = async () => {
    const { repo, live } = submitForm;

    if (!repo || !repo.includes("github.com")) {
        return alert("Invalid GitHub URL. You must provide a valid repository link.");
    }

    if (!confirm("Submit project for final review? This will lock your board and generate your certificate.")) return;

    setLoading(true);
    try {
        const { error: updateError } = await supabase
        .from('internship_submissions')
        .update({ 
            repo_link: repo,
            live_link: live || null,
            status: 'completed',
            submitted_at: new Date()
        })
        .eq('id', submission.id);

        if (updateError) throw updateError;

        const { error: rpcError } = await supabase.rpc('complete_internship', { submission_uuid: submission.id });
        if (rpcError) throw rpcError;

        alert("Project Submitted! Certificate Generated.");
        navigate('/profile'); 

    } catch(err) {
        console.error("Submission failed:", err);
        alert("Submission failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const toggleTaskExpand = (e, taskId) => {
    e.stopPropagation();
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin text-indigo-500" size={40}/></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student/internships')} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="font-bold text-lg">{project?.company_name}</h1>
            <p className="text-xs text-gray-400">Workspace</p>
          </div>
        </div>
        <button onClick={handleOpenSubmitModal} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20">
             Submit Project
        </button>
      </header>

      <div className="flex-1 p-8 overflow-x-auto bg-[#050505]">
        <div className="flex gap-6 h-full min-w-[1000px]">
          {['todo', 'in_progress', 'done'].map(col => (
            <div key={col} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, col)} className={`flex-1 rounded-2xl border flex flex-col transition-colors ${col === 'done' ? 'bg-[#111] border-green-900/30' : 'bg-[#111] border-gray-800'}`}>
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#161616] rounded-t-2xl">
                <h3 className="font-bold capitalize text-gray-300 text-sm">{col.replace('_', ' ')}</h3>
                <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{tasks[col].length}</span>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {tasks[col].map((task) => (
                  <div 
                    key={task.id} 
                    // FIX: Disable drag if column is 'done'
                    draggable={col !== 'done'}
                    onDragStart={(e) => {
                        if (col === 'done') {
                            e.preventDefault();
                            return;
                        }
                        e.dataTransfer.setData("taskId", task.id); 
                        e.dataTransfer.setData("sourceCol", col);
                    }} 
                    onClick={() => col === 'in_progress' ? setViewingTaskRequirements(task) : null}
                    className={`bg-[#1A1A1A] p-4 rounded-xl border border-gray-700 relative 
                        ${col !== 'done' ? 'cursor-grab hover:border-indigo-500 hover:shadow-lg' : 'cursor-default opacity-80'} 
                        ${col === 'in_progress' ? 'hover:bg-indigo-900/10' : ''}
                    `}
                  >
                     <p className="text-sm font-medium mb-1 text-gray-200">{task.title}</p>
                     
                     {/* REQUIREMENTS BOX */}
                     {task.requirements && (
                         <div className="text-[10px] text-gray-500 mt-2 bg-black/30 p-2 rounded border border-white/5">
                             <div className="flex items-start gap-1">
                                 <AlertTriangle size={10} className="mt-0.5 text-orange-500 shrink-0"/>
                                 <span className={`transition-all duration-200 ${expandedTasks[task.id] ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
                                     {task.requirements}
                                 </span>
                             </div>
                             <button 
                                 onClick={(e) => toggleTaskExpand(e, task.id)}
                                 className="w-full flex justify-center mt-1 text-gray-600 hover:text-indigo-400 transition-colors pt-1 border-t border-white/5"
                             >
                                 {expandedTasks[task.id] ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                             </button>
                         </div>
                     )}

                     <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700/50">
                        {col === 'done' ? (
                            <span className="text-green-500 text-[10px] flex items-center gap-1 font-bold">
                                <CheckCircle size={10} /> Verified & Locked
                            </span>
                        ) : (
                            <span className="text-gray-500 text-[10px]">Pending</span>
                        )}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- REQUIREMENTS POPUP --- */}
      {viewingTaskRequirements && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-[#111] border border-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
                 <div className="flex justify-between items-start mb-4">
                     <h3 className="font-bold text-lg text-white">{viewingTaskRequirements.title}</h3>
                     <button onClick={() => setViewingTaskRequirements(null)}><X className="text-gray-500 hover:text-white" size={20}/></button>
                 </div>
                 <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mb-6">
                     <p className="text-xs text-indigo-400 font-bold uppercase mb-2 flex items-center gap-2"><Lock size={12}/> Strict Requirements</p>
                     <p className="text-sm text-gray-300 font-mono leading-relaxed">
                         {viewingTaskRequirements.requirements || "No specific strict requirements."}
                     </p>
                 </div>
                 <button onClick={() => setViewingTaskRequirements(null)} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200">Close</button>
             </div>
        </div>
      )}

      {/* --- VERIFICATION MODAL --- */}
      {verifyingTask && (
        <TaskVerificationModal 
           task={verifyingTask.task} 
           onClose={() => setVerifyingTask(null)}
           onSuccess={handleVerificationSuccess}
        />
      )}

      {/* --- SUBMISSION MODAL --- */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-[#111] border border-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative animate-in slide-in-from-bottom-4">
                <button onClick={() => setShowSubmitModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                
                <h2 className="text-2xl font-bold text-white mb-2">Submit Project</h2>
                <p className="text-gray-400 text-sm mb-6">Provide your code repository for final review.</p>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-emerald-500 uppercase mb-2 block flex items-center gap-2">
                            <Github size={14}/> GitHub Repository <span className="text-red-500">*</span>
                        </label>
                        <input 
                            value={submitForm.repo}
                            onChange={(e) => setSubmitForm({...submitForm, repo: e.target.value})}
                            placeholder="https://github.com/username/project"
                            className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-blue-500 uppercase mb-2 block flex items-center gap-2">
                            <Globe size={14}/> Live Deployment Link <span className="text-gray-600 lowercase font-normal">(optional)</span>
                        </label>
                        <input 
                            value={submitForm.live}
                            onChange={(e) => setSubmitForm({...submitForm, live: e.target.value})}
                            placeholder="https://my-project.vercel.app"
                            className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 bg-gray-900 text-gray-300 rounded-xl font-bold hover:bg-gray-800">Cancel</button>
                    <button onClick={submitProject} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/20">Confirm Submission</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default InternshipWorkspace;