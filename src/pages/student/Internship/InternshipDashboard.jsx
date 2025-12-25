import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';
import { 
  Search, Briefcase, MapPin, Bell, LayoutGrid, MessageSquare, 
  User, Zap, Loader2, ArrowRight, ArrowUpRight, CheckCircle, Lock 
} from 'lucide-react';
import OfferLetterModal from './OfferLetterModal';

const InternshipDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ applications: 0, interviews: 0, offers: 0 });
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    fetchUserDataAndProjects();
  }, []);

  const fetchUserDataAndProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // --- 1. FETCH DATA FOR STATS & STATUS ---
      
      // A. Get all submissions (Used for Stats AND Project Status)
      const { data: submissions, error: subError } = await supabase
        .from('internship_submissions')
        .select('project_id, status, is_paid')
        .eq('user_id', user.id);

      if (subError) console.error("Error fetching submissions:", subError);

      // B. Get mock interviews count (For Dashboard Stats)
      const { count: interviewCount } = await supabase
        .from('mock_interview_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // C. Calculate & Set Stats
      const applicationCount = submissions?.length || 0;
      // "Offers" count includes qualified candidates (offer pending) and hired ones
      const offerCount = submissions?.filter(s => s.status === 'qualified' || s.status === 'hired').length || 0;

      setStats({
        applications: applicationCount,
        interviews: interviewCount || 0,
        offers: offerCount
      });

      // --- 2. FETCH PROJECTS ---
      const { data: projData, error: projError } = await supabase
        .from('internship_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projError) throw projError;

      // --- 3. FETCH QUALIFIERS (To check if user passed tests for new projects) ---
      const { data: mockData } = await supabase
        .from('mock_interview_sessions')
        .select('metadata, technical_score, coding_score, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // --- 4. MERGE LOGIC (Determine Button State: APPLY / OFFER / WORK) ---
      const merged = projData.map(p => {
        // Find the specific submission for THIS project
        const mySubmission = submissions?.find(s => s.project_id === p.id);

        // Default State
        let uiState = 'APPLY'; 

        // PRIORITY 1: If they paid, they are HIRED.
        if (mySubmission?.is_paid === true) {
          uiState = 'WORK';
        } 
        // PRIORITY 2: If they qualified but didn't pay yet.
        else if (mySubmission?.status === 'qualified') {
          uiState = 'OFFER';
        }
        // PRIORITY 3: Check Mock Interview results if no submission exists yet
        else {
          const qualifier = mockData?.find(m => m.metadata?.set_id === p.qualifying_set_id);
          const passedQualifier = qualifier && qualifier.technical_score >= 60 && qualifier.coding_score >= 60;
          
          if (passedQualifier) uiState = 'OFFER';
          else if (qualifier && !passedQualifier) uiState = 'REJECTED';
        }

        return { ...p, uiState };
      });

      setProjects(merged);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleCardClick = (project) => {
    if (project.uiState === 'APPLY') {
       if(confirm("To apply, you must pass the Qualifying Assessment. Start now?")) {
           startQualifier(project.qualifying_set_id);
       }
    } 
    else if (project.uiState === 'OFFER') {
       setSelectedOffer(project);
    } 
    else if (project.uiState === 'WORK') {
       navigate(`/student/internship/${project.id}`); // Go to Kanban Board
    }
  };

  const startQualifier = async (setId) => {
     // Fetch practice set details to get title
     const { data: set } = await supabase.from('practice_sets').select('title').eq('id', setId).single();
     
     const { data: session, error } = await supabase.from('mock_interview_sessions').insert({
        user_id: user.id,
        user_email: user.email,
        status: 'in_progress',
        metadata: { set_id: setId, title: set?.title || 'Internship Qualifier' }
     }).select().single();

     if (error) {
       alert("Error starting interview. Check if qualifier ID exists.");
       return;
     }

     navigate(`/student/mock-interview/${session.id}`);
  };

  const onPaymentSuccess = async () => {
    try {
      // 1. Create submission record
      const { error } = await supabase.from('internship_submissions').upsert({
         user_id: user.id,
         project_id: selectedOffer.id,
         is_paid: true,
         status: 'hired',
         started_at: new Date(),
         board_state: { todo: [], in_progress: [], done: [] } // Init Kanban
      }, { onConflict: 'user_id, project_id' }); 

      if (error) throw error;

      alert("Payment Successful! Redirecting to workspace...");
      setSelectedOffer(null);
      fetchUserDataAndProjects(); // Refresh UI
      navigate(`/student/internship/${selectedOffer.id}`);
    } catch (err) {
      console.error(err);
      alert("Payment failed to record.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-indigo-500"><Loader2 className="animate-spin" size={40}/></div>;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* Sidebar is handled by ProfilePage, so we just focus on Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 w-full">
        
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
          <div>
            <h1 className="text-xl font-semibold text-white">Internship Hub</h1>
            <p className="text-sm text-slate-500">Track applications and manage your workspace.</p>
          </div>
          <div className="flex items-center gap-4">
             {/* Add User Rank/Coins here from user_internship_stats if desired */}
             <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold">
                Level: Intern
             </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Stats Section (Dynamic) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <StatBox label="Applications" value={stats.applications} icon={Briefcase} color="text-blue-400" bg="bg-blue-400/10" />
             <StatBox label="Interviews Taken" value={stats.interviews} icon={MessageSquare} color="text-purple-400" bg="bg-purple-400/10" />
             <StatBox label="Active Offers" value={stats.offers} icon={Zap} color="text-emerald-400" bg="bg-emerald-400/10" />
          </div>

          {/* Premium Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 shadow-2xl shadow-indigo-900/20">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white mb-3 border border-white/10">Career Launchpad</span>
                <h2 className="text-3xl font-bold text-white mb-2">Get Real Experience</h2>
                <p className="text-indigo-100 max-w-md">Complete tasks, build your portfolio, and earn verified certificates.</p>
              </div>
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-black/10 flex items-center gap-2">
                View Leaderboard <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Job Listings Grid (Dynamic) */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Available Internships</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-10">No internships available at the moment.</div>
              ) : projects.map((job) => (
                <div key={job.id} className="group bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 relative overflow-hidden flex flex-col">
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 right-4 z-10">
                     {job.uiState === 'WORK' && <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-500/20 flex items-center gap-1"><CheckCircle size={12}/> Hired</span>}
                     {job.uiState === 'OFFER' && <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20 animate-pulse">Offer Pending</span>}
                     {job.uiState === 'REJECTED' && <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/20">Cooldown</span>}
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg`}>
                      <span className="font-bold text-white text-lg">{job.company_name?.[0]}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{job.role_title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{job.company_name}</p>

                  <div className="flex-1">
                     <p className="text-slate-500 text-sm line-clamp-2 mb-4">{job.description}</p>
                     <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-xs border border-slate-700/50">{job.difficulty}</span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-xs border border-slate-700/50">4 Weeks</span>
                     </div>
                  </div>

                  <button 
                     onClick={() => handleCardClick(job)}
                     disabled={job.uiState === 'REJECTED'}
                     className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        job.uiState === 'WORK' ? 'bg-slate-800 text-white hover:bg-slate-700' :
                        job.uiState === 'OFFER' ? 'bg-emerald-500 text-black hover:bg-emerald-400' :
                        job.uiState === 'REJECTED' ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                        'bg-white text-indigo-950 hover:bg-indigo-50'
                     }`}
                  >
                     {job.uiState === 'WORK' && "Open Workspace"}
                     {job.uiState === 'OFFER' && "Accept Offer"}
                     {job.uiState === 'REJECTED' && "Not Qualified"}
                     {job.uiState === 'APPLY' && <>Apply Now <ArrowRight size={16}/></>}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Payment Modal */}
      {selectedOffer && (
         <OfferLetterModal 
            project={selectedOffer} 
            user={user} 
            onAccept={onPaymentSuccess} 
            onClose={() => setSelectedOffer(null)} 
         />
      )}
    </div>
  );
};

// Helper Component for Stats
const StatBox = ({ label, value, icon: Icon, color, bg }) => (
   <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group">
      <div className="flex justify-between items-start mb-4">
         <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
         </div>
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-500 text-sm">{label}</p>
   </div>
);

export default InternshipDashboard;