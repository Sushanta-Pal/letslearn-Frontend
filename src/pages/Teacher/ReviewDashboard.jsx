import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Check, X, ExternalLink, Github, Loader2 } from 'lucide-react';

export default function ReviewDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    setLoading(true);
    // Fetch all submissions waiting for review
    // You might want to filter by the teacher's specific created projects if you have multiple teachers
    const { data, error } = await supabase
      .from('internship_submissions')
      .select(`
        *,
        internship_projects ( title, company_name ),
        profiles:user_id ( email ) 
      `)
      .eq('status', 'pending_review');

    if (error) console.error(error);
    else setSubmissions(data);
    setLoading(false);
  };

  // --- APPROVE LOGIC ---
  
  // --- REJECT LOGIC ---
 // --- REJECT LOGIC (Fixed Column Name) ---
  const handleReject = async (submissionId) => {
    const reason = prompt("Enter reason for rejection (Student will see this):");
    if (!reason) return;

    try {
        const { error } = await supabase
            .from('internship_submissions')
            .update({ 
                status: 'in_progress',    // Send back to student
                admin_feedback: reason    // <--- FIXED: Changed 'feedback' to 'admin_feedback'
            })
            .eq('id', submissionId);

        if (error) throw error;
        alert("Project returned to student for changes.");
        fetchPendingSubmissions();

    } catch (err) {
        console.error("Reject Error:", err); // Log the actual error to console
        alert("Action failed: " + err.message);
    }
  };

  // --- APPROVE LOGIC (Cleanup Feedback) ---
  const handleApprove = async (submissionId) => {
    if(!confirm("Approve this project and generate certificate?")) return;

    try {
        // 1. Mark as Completed AND Clear any old rejection feedback
        const { error: updateError } = await supabase
            .from('internship_submissions')
            .update({ 
                status: 'completed',
                admin_feedback: null // <--- ADDED: Clear old feedback so it doesn't persist
            })
            .eq('id', submissionId);
        
        if (updateError) throw updateError;

        // 2. TRIGGER CERTIFICATE GENERATION
        const { error: rpcError } = await supabase.rpc('complete_internship', { 
            submission_uuid: submissionId 
        });
        
        if (rpcError) throw rpcError;

        alert("Project Approved & Certificate Generated!");
        fetchPendingSubmissions(); 

    } catch (err) {
        console.error(err);
        alert("Approval failed: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading reviews...</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8">Submission Review Queue</h1>

      {submissions.length === 0 ? (
        <div className="text-gray-500">No pending submissions. Great job!</div>
      ) : (
        <div className="grid gap-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-[#111] border border-gray-800 p-6 rounded-xl flex justify-between items-start">
              
              <div>
                <h2 className="text-xl font-bold text-white">{sub.internship_projects.title}</h2>
                <p className="text-sm text-gray-400 mb-4">Student: {sub.profiles?.email}</p>
                
                <div className="flex gap-4">
                    <a href={sub.repo_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-400 hover:underline text-sm">
                        <Github size={16}/> View Code
                    </a>
                    {sub.live_link && (
                        <a href={sub.live_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-400 hover:underline text-sm">
                            <ExternalLink size={16}/> View Live App
                        </a>
                    )}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                    onClick={() => handleReject(sub.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                    <X size={18}/> Reject
                </button>
                <button 
                    onClick={() => handleApprove(sub.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 shadow-lg shadow-green-900/20 transition-colors"
                >
                    <Check size={18}/> Verify & Certify
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}