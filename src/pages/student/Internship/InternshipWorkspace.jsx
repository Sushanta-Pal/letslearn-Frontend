import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, Github, Plus, MoreHorizontal, Clock, CheckCircle
} from 'lucide-react';
import TaskVerificationModal from './TaskVerificationModal';

const InternshipWorkspace = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [verifyingTask, setVerifyingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], done: [] });

  useEffect(() => {
    fetchWorkspaceData();
  }, [projectId]);

  // --- 1. HELPER: SAVE BOARD STATE ---
  const saveBoardState = async (newState, subId) => {
    const { error } = await supabase
      .from('internship_submissions')
      .update({ board_state: newState })
      .eq('id', subId);
      
    if (error) console.error("Auto-save failed:", error);
  };

  // --- 2. ROBUST DATA FETCHING ---
  const fetchWorkspaceData = async () => {
    try {
      // A. Fetch Project
      const { data: proj, error: projError } = await supabase
        .from('internship_projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projError) throw projError;

      // B. Fetch Submission
      const { data: sub, error: subError } = await supabase
        .from('internship_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single();

      if (subError) {
        alert("You are not enrolled in this workspace.");
        navigate('/student/internships');
        return;
      }

      setProject(proj);
      setSubmission(sub);

      // C. Initialize Tasks
      if (sub.board_state && (sub.board_state.todo?.length || sub.board_state.in_progress?.length || sub.board_state.done?.length)) {
        setTasks(sub.board_state);
      } else {
        const initialTasks = proj.tasks?.map((t, i) => ({ id: `task-${i}`, title: t })) || [];
        const defaultState = { todo: initialTasks, in_progress: [], done: [] };
        setTasks(defaultState);
        saveBoardState(defaultState, sub.id); 
      }

    } catch (error) {
      console.error("Error loading workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. HELPER: PERFORM MOVE ---
  const performMove = async (task, sourceCol, targetCol) => {
    const newTasks = {
      ...tasks,
      [sourceCol]: tasks[sourceCol].filter(t => t.id !== task.id && t.title !== task.title),
      [targetCol]: [...tasks[targetCol], task]
    };

    setTasks(newTasks);
    // Save to Database
    await supabase
      .from('internship_submissions')
      .update({ board_state: newTasks })
      .eq('id', submission.id);
  };

  // --- 4. DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, taskId, sourceCol) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceCol", sourceCol);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = async (e, targetCol) => {
    const taskId = e.dataTransfer.getData("taskId");
    const sourceCol = e.dataTransfer.getData("sourceCol");

    if (!taskId || sourceCol === targetCol) return;

    const taskToMove = tasks[sourceCol].find(t => t.id === taskId || t.title === taskId);
    if (!taskToMove) return;

    // --- INTERCEPTION: Trigger Verification on 'Done' ---
    if (targetCol === 'done') {
      setVerifyingTask({ task: taskToMove, sourceCol }); 
      return; 
    }

    performMove(taskToMove, sourceCol, targetCol);
  };

  // --- 5. VERIFICATION SUCCESS HANDLER (THE TRIGGER) ---
  const handleVerificationSuccess = async (xpReward, coinReward) => {
    if (!verifyingTask) return;
    const { task, sourceCol } = verifyingTask;

    // 1. Move the task to 'Done' in UI & DB
    await performMove(task, sourceCol, 'done');

    // 2. TRIGGER THE SUPABASE RPC (Gamification Logic)
    const { error } = await supabase.rpc('add_xp_and_check_rank', { 
        p_user_id: user.id, 
        p_xp_amount: xpReward || 50 
    });

    if (error) {
      console.error("Gamification Error:", error);
    } else {
      alert(`Task Verified! +${xpReward || 50} XP added to your profile.`);
    }
    
    // 3. Close Modal
    setVerifyingTask(null);
  };

  // --- 6. FINAL SUBMISSION (With Certificate Generation) ---
  const handleFinalSubmit = async () => {
    // A. Validate: Are all tasks done?
    if (tasks.todo.length > 0 || tasks.in_progress.length > 0) {
      return alert("You must complete ALL tasks (move them to 'Done') before submitting.");
    }

    // B. Get Repo Link
    const repoLink = prompt("Please paste your GitHub Repository URL for final review:");
    if (!repoLink) return;

    if (confirm("Are you ready to submit? This will generate your certificate.")) {
       setLoading(true);
       try {
         // C. Save Repo Link
         const { error: updateError } = await supabase
           .from('internship_submissions')
           .update({ repo_link: repoLink })
           .eq('id', submission.id);

         if (updateError) throw updateError;

         // D. Call RPC to Complete Internship & Generate Certificate
         const { error: rpcError } = await supabase.rpc('complete_internship', { 
            submission_uuid: submission.id 
         });

         if (rpcError) throw rpcError;

         alert("Congratulations! Internship Completed. Certificate Generated.");
         navigate('/profile'); // Redirect to profile to see the new certificate

       } catch(err) {
         console.error("Submission failed:", err);
         alert("Submission failed. Please try again or contact support.");
       } finally {
         setLoading(false);
       }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin text-indigo-500" size={40}/></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student/internships')} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg">{project?.company_name} Workspace</h1>
            <p className="text-xs text-gray-400">{project?.role_title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors border border-gray-700">
             <Github size={16}/> Repo
           </button>
           <button 
             onClick={handleFinalSubmit}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
           >
             Submit Project
           </button>
        </div>
      </header>

      {/* Kanban Board Area */}
      <div className="flex-1 p-8 overflow-x-auto bg-[#050505]">
        <div className="flex gap-6 h-full min-w-[1000px]">
          {['todo', 'in_progress', 'done'].map(col => (
            <div 
              key={col}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
              className={`flex-1 rounded-2xl border flex flex-col max-h-[calc(100vh-140px)] transition-colors 
                ${col === 'done' ? 'bg-[#111] border-green-900/30' : 'bg-[#111] border-gray-800'}`}
            >
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#161616] rounded-t-2xl">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${col === 'done' ? 'bg-green-500' : col === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                   <h3 className="font-bold capitalize text-gray-300 text-sm">{col.replace('_', ' ')}</h3>
                   <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400 ml-1">{tasks[col].length}</span>
                </div>
                {col === 'todo' && <button className="text-gray-500 hover:text-white transition-colors"><Plus size={18}/></button>}
              </div>

              <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {tasks[col].length === 0 && (
                  <div className="text-center py-12 text-gray-600 text-sm border-2 border-dashed border-gray-800/50 rounded-xl">Drop items here</div>
                )}
                {tasks[col].map((task, idx) => (
                  <div 
                    key={task.id || idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id || task.title, col)}
                    className="bg-[#1A1A1A] p-4 rounded-xl border border-gray-700 cursor-grab active:cursor-grabbing hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group relative"
                  >
                     <p className="text-sm font-medium mb-3 text-gray-200">{task.title || task}</p>
                     <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700/50">
                        <div className="flex items-center gap-2">
                           {col === 'done' ? (
                             <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-1 rounded font-bold border border-green-500/20 flex items-center gap-1"><CheckCircle size={10} /> Done</span>
                           ) : (
                             <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-1 rounded font-medium border border-gray-700 flex items-center gap-1"><Clock size={10} /> {col === 'in_progress' ? 'Active' : 'Pending'}</span>
                           )}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">{user.email[0].toUpperCase()}</div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- TASK VERIFICATION MODAL --- */}
      {verifyingTask && (
        <TaskVerificationModal 
           task={verifyingTask.task} 
           onClose={() => setVerifyingTask(null)}
           onSuccess={handleVerificationSuccess}
        />
      )}

    </div>
  );
};

export default InternshipWorkspace;