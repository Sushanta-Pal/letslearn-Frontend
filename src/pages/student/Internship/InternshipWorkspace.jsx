import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, Github, Plus, Clock, CheckCircle, 
  AlertTriangle, Lock, ChevronDown, ChevronUp, Globe, X, Trophy, RefreshCw 
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
  
  // GitHub State
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [repoStatus, setRepoStatus] = useState('idle'); 

  // UI State
  const [verifyingTask, setVerifyingTask] = useState(null);
  const [viewingTaskRequirements, setViewingTaskRequirements] = useState(null); 
  const [expandedTasks, setExpandedTasks] = useState({}); 
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ repo: '', live: '' });

  useEffect(() => {
    fetchWorkspaceData();
    handleGitHubFlow();
  }, [projectId]);

  // --- 1. GITHUB LOGIC ---

  const handleGitHubFlow = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.provider_token) {
        setIsGithubConnected(true);
        
        // CHECK LOCAL STORAGE
        const repoCreated = localStorage.getItem(`foxbird_repo_${user.id}`);
        
        if (!repoCreated) {
            await createInternshipRepo(session.provider_token, session.user.user_metadata.user_name);
        } else {
            setRepoStatus('ready');
        }
    }
  };

  const connectGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { scopes: 'repo', redirectTo: window.location.href }
    });
    if (error) alert("Connection Failed: " + error.message);
  };

  // --- NEW FUNCTION: FORCE RE-CREATE REPO ---
  const handleManualRepair = async () => {
    if(!confirm("This will recreate the 'foxbird-internship' repository on your GitHub if it is missing. Continue?")) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.provider_token) {
        // 1. Clear local memory
        localStorage.removeItem(`foxbird_repo_${user.id}`);
        // 2. Try creating again
        await createInternshipRepo(session.provider_token, session.user.user_metadata.user_name);
    } else {
        alert("Session expired. Please reconnect GitHub.");
        connectGitHub();
    }
  };

  const createInternshipRepo = async (token, username) => {
    setRepoStatus('creating');
    const repoName = "foxbird-internship";

    try {
        // Step A: Check if repo exists
        const check = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (check.status === 404) {
            // Step B: CREATE it
            const create = await fetch(`https://api.github.com/user/repos`, {
                method: 'POST',
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: repoName,
                    description: "My Internship Portfolio powered by Fox Bird",
                    private: false, 
                    auto_init: true 
                })
            });

            if (!create.ok) throw new Error("Failed to create repo");
            alert("Repository 'foxbird-internship' has been restored!");
        } else {
             console.log("Repo found. Reconnecting...");
             alert("Repository found and reconnected!");
        }

        // Set flag back to true
        localStorage.setItem(`foxbird_repo_${user.id}`, 'true');
        setRepoStatus('ready');

    } catch (err) {
        console.error("Repo Setup Error:", err);
        alert("Error: " + err.message);
        setRepoStatus('idle');
    }
  };

  // ... (Keep fetchWorkspaceData, performMove, handleDrop, handleVerificationSuccess, handleOpenSubmitModal, submitProject, toggleTaskExpand exactly as they were) ...
  // [Paste those functions here unchanged]
  
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
        alert("Not enrolled in this internship.");
        navigate('/student/internships');
        return;
      }

      setProject(proj);
      setSubmission(sub);

      let boardIsStale = false;
      if (sub.board_state && (sub.board_state.todo.length || sub.board_state.in_progress.length || sub.board_state.done.length)) {
          const allTasks = [...sub.board_state.todo, ...sub.board_state.in_progress, ...sub.board_state.done];
          if (allTasks.length > 0) {
              const sampleTask = allTasks[0];
              if (!sampleTask.test_cases && !sampleTask.testCases) {
                  boardIsStale = true;
              }
          }
      } else {
          boardIsStale = true; 
      }

      if (boardIsStale) {
        const initialTasks = proj.tasks?.map((t, i) => {
            const tId = t.id || `task-${i}`;
            return { ...t, id: tId }; 
        }) || [];
        const newState = { todo: initialTasks, in_progress: [], done: [] };
        setTasks(newState);
        saveBoardState(newState, sub.id);
      } else {
        setTasks(sub.board_state);
      }

    } catch (error) {
      console.error("Workspace Load Error:", error);
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
    await supabase.rpc('add_xp_and_check_rank', { p_user_id: user.id, p_xp_amount: xpReward || 100 });
    
    alert(`Task Verified & Pushed to GitHub! +${xpReward || 100} XP`);
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
    if (!repo || !repo.includes("github.com")) return alert("Invalid GitHub URL.");
    if (!confirm("Submit project for final review? This will lock your board.")) return;

    setLoading(true);
    try {
        const { error: updateError } = await supabase.from('internship_submissions').update({ 
            repo_link: repo,
            live_link: live || null,
            status: 'completed',
            submitted_at: new Date()
        }).eq('id', submission.id);

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

  const totalTasks = tasks.todo.length + tasks.in_progress.length + tasks.done.length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((tasks.done.length / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student/internships')} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="font-bold text-lg">{project?.company_name}</h1>
            <p className="text-xs text-gray-400">Engineering Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            
            {/* UPDATED GITHUB BUTTON */}
            {isGithubConnected ? (
                // If Connected, show REPAIR option
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 cursor-default">
                        <Github size={16} /> Connected
                    </span>
                    <button 
                        onClick={handleManualRepair}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Repository missing? Click to Repair"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            ) : (
                // If Disconnected
                <button 
                    onClick={connectGitHub}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border bg-[#24292e] text-white border-gray-700 hover:bg-[#2f363d] transition-all"
                >
                    {repoStatus === 'creating' ? <Loader2 className="animate-spin" size={16}/> : <Github size={16} />}
                    {repoStatus === 'creating' ? "Setting up Repo..." : "Connect GitHub"}
                </button>
            )}

            <button onClick={handleOpenSubmitModal} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20">
                Submit Project
            </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto bg-[#050505]">
        <div className="max-w-7xl mx-auto">
            
            <MilestoneJourney progress={progressPercent} />

            <div className="flex gap-6 h-[600px] overflow-x-auto pb-4">
            {['todo', 'in_progress', 'done'].map(col => (
                <div key={col} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, col)} className={`flex-1 min-w-[300px] rounded-2xl border flex flex-col transition-colors ${col === 'done' ? 'bg-[#111] border-green-900/30' : 'bg-[#111] border-gray-800'}`}>
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#161616] rounded-t-2xl">
                    <h3 className="font-bold capitalize text-gray-300 text-sm flex items-center gap-2">
                        {col === 'todo' && <div className="w-2 h-2 rounded-full bg-gray-500"/>}
                        {col === 'in_progress' && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/>}
                        {col === 'done' && <div className="w-2 h-2 rounded-full bg-green-500"/>}
                        {col.replace('_', ' ')}
                    </h3>
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{tasks[col].length}</span>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                    {tasks[col].map((task) => (
                    <div 
                        key={task.id} 
                        draggable={col !== 'done'}
                        onDragStart={(e) => {
                            if (col === 'done') { e.preventDefault(); return; }
                            e.dataTransfer.setData("taskId", task.id); 
                            e.dataTransfer.setData("sourceCol", col);
                        }} 
                        onClick={() => col === 'in_progress' ? setViewingTaskRequirements(task) : null}
                        className={`bg-[#1A1A1A] p-4 rounded-xl border border-gray-700 relative group
                            ${col !== 'done' ? 'cursor-grab hover:border-indigo-500 hover:shadow-lg' : 'cursor-default opacity-80'} 
                            ${col === 'in_progress' ? 'hover:bg-indigo-900/10' : ''}
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium mb-1 text-gray-200">{task.title}</p>
                            {task.language && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 uppercase">{task.language}</span>
                            )}
                        </div>
                        
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
                                    <CheckCircle size={10} /> Committed to GitHub
                                </span>
                            ) : (
                                <span className="text-gray-500 text-[10px] flex items-center gap-1">
                                    <Clock size={10}/> {col === 'in_progress' ? 'Active' : 'Pending'}
                                </span>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {viewingTaskRequirements && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-[#111] border border-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
                 <div className="flex justify-between items-start mb-4">
                     <h3 className="font-bold text-lg text-white">{viewingTaskRequirements.title}</h3>
                     <button onClick={() => setViewingTaskRequirements(null)}><X className="text-gray-500 hover:text-white" size={20}/></button>
                 </div>
                 <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mb-6">
                     <p className="text-xs text-indigo-400 font-bold uppercase mb-2 flex items-center gap-2"><Lock size={12}/> Task Requirements</p>
                     <p className="text-sm text-gray-300 font-mono leading-relaxed">
                         {viewingTaskRequirements.requirements}
                     </p>
                     {!isGithubConnected && (
                         <p className="mt-4 text-xs text-red-400 flex items-center gap-1">
                             <AlertTriangle size={12}/> Connect GitHub to start coding.
                         </p>
                     )}
                 </div>
                 <button onClick={() => setViewingTaskRequirements(null)} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200">Close</button>
             </div>
        </div>
      )}

      {verifyingTask && (
        <TaskVerificationModal 
           task={verifyingTask.task}
           projectTitle={project?.title || "Internship_Project"} 
           onClose={() => setVerifyingTask(null)}
           onSuccess={handleVerificationSuccess}
        />
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-[#111] border border-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative animate-in slide-in-from-bottom-4">
                <button onClick={() => setShowSubmitModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                <h2 className="text-2xl font-bold text-white mb-2">Generate Certificate</h2>
                <p className="text-gray-400 text-sm mb-6">Your code will be locked and sent for final review.</p>
                <div className="mt-8 flex gap-3">
                    <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 bg-gray-900 text-gray-300 rounded-xl font-bold hover:bg-gray-800">Cancel</button>
                    <button onClick={submitProject} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/20">Confirm & Graduate</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

const MilestoneJourney = ({ progress }) => {
    return (
      <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 mb-8 relative overflow-hidden">
         <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
               <h3 className="text-xl font-bold text-white flex items-center gap-2">Internship Trajectory <Trophy size={16} className="text-yellow-500"/></h3>
               <p className="text-sm text-gray-500">Milestone based progress tracking</p>
            </div>
            <div className="text-right">
               <span className="text-3xl font-black text-indigo-500">{progress}%</span>
               <p className="text-xs text-gray-400 uppercase tracking-widest">Completion</p>
            </div>
         </div>
  
         <div className="relative h-32 w-full">
            <div className="absolute inset-0 grid grid-cols-4 gap-4 opacity-10">
               <div className="border-r border-white/20"></div>
               <div className="border-r border-white/20"></div>
               <div className="border-r border-white/20"></div>
            </div>
  
            <MilestonePoint percent={10} label="Onboard" current={progress} left="10%" bottom="10%" />
            <MilestonePoint percent={50} label="Mid-Term" current={progress} left="50%" bottom="40%" />
            <MilestonePoint percent={100} label="Launch" current={progress} left="90%" bottom="80%" />
  
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
               <path 
                 d="M 50 120 C 200 120, 500 80, 1000 20" 
                 fill="none" 
                 stroke={progress > 0 ? "#6366f1" : "#334155"} 
                 strokeWidth="3" 
                 strokeLinecap="round"
                 strokeDasharray="6,6"
               />
            </svg>
         </div>
      </div>
    );
};

const MilestonePoint = ({ percent, label, current, left, bottom }) => (
    <div className="absolute flex flex-col items-center transform -translate-x-1/2" style={{ left, bottom }}>
       <div className={`w-4 h-4 rounded-full border-2 border-[#111] z-20 transition-all duration-500 ${current >= percent ? 'bg-indigo-500 scale-125 shadow-lg shadow-indigo-500/50' : 'bg-gray-700'}`}></div>
       <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${current >= percent ? 'text-indigo-400' : 'text-gray-600'}`}>{label}</span>
    </div>
);

export default InternshipWorkspace;