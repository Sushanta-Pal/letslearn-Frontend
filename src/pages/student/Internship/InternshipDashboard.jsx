import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, MessageSquare, Zap, Loader2, 
  ArrowRight, CheckCircle, Lock, Trophy, Clock, 
  Search, TrendingUp
} from 'lucide-react';
import OfferLetterModal from './OfferLetterModal';

const InternshipDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [activeInternships, setActiveInternships] = useState([]); 
  const [availableInternships, setAvailableInternships] = useState([]); 
  const [applications, setApplications] = useState([]); 
  
  const [stats, setStats] = useState({ applications: 0, interviews: 0, offers: 0 });
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      console.log("Fetching dashboard data for:", user.id);

      // --- 1. FETCH DATA SEPARATELY (Avoids 400 Error on Joins) ---
      const [submissionsRes, interviewsRes, projectsRes, qualifiersRes] = await Promise.all([
        // A. Submissions (Get everything for this user)
        supabase.from('internship_submissions')
  .select('*')
  .eq('user_id', user.id)
  .order('started_at', { ascending: false }), // <--- Use started_at instead
        // B. Interview Count
        supabase.from('mock_interview_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        
        // C. All Projects
        supabase.from('internship_projects').select('*').order('created_at', { ascending: false }),

        // D. Qualifiers Passed
        supabase.from('mock_interview_sessions').select('metadata, technical_score, coding_score, status').eq('user_id', user.id).eq('status', 'completed')
      ]);

      if (submissionsRes.error) console.error("Submissions Fetch Error:", submissionsRes.error);
      
      const submissions = submissionsRes.data || [];
      const allProjects = projectsRes.data || [];
      const qualifiers = qualifiersRes.data || [];

      // --- 2. CALCULATE STATS ---
      setStats({
        applications: submissions.length,
        interviews: interviewsRes.count || 0,
        offers: submissions.filter(s => s.status === 'qualified').length
      });

      // --- 3. MANUAL MERGE (Robust Logic) ---
      // Create Lookup Maps
      const subMap = new Map(submissions.map(s => [s.project_id, s]));
      const qualMap = new Map(qualifiers.map(q => [q.metadata?.set_id, q]));
      const projectMap = new Map(allProjects.map(p => [p.id, p]));

      const myActive = [];
      const market = [];
      const history = [];

      allProjects.forEach(project => {
        const submission = subMap.get(project.id);
        const qualifier = qualMap.get(project.qualifying_set_id);

        // Determine UI State
        let uiState = 'APPLY';
        
        if (submission) {
            // PRIORITY: Check specific statuses from your DB
            if (submission.status === 'completed') uiState = 'DONE';
            else if (submission.is_paid === true || submission.status === 'hired') uiState = 'WORK';
            else if (submission.status === 'qualified') uiState = 'OFFER';
            else uiState = 'APPLIED'; 
        } else if (qualifier) {
            const passed = qualifier.technical_score >= 60 && qualifier.coding_score >= 60;
            if (!passed) uiState = 'REJECTED'; 
        }

        const projectData = { ...project, uiState, submission };

        // Segregate
        if (uiState === 'WORK' || uiState === 'DONE') {
            myActive.push(projectData);
        } else {
            market.push(projectData);
        }
      });

      // Build Application History manually since we didn't join in the API
      submissions.forEach(sub => {
          const project = projectMap.get(sub.project_id);
          // Determine local UI state again for the history table buttons
          let histState = 'APPLIED';
          if (sub.status === 'completed') histState = 'DONE';
          else if (sub.is_paid) histState = 'WORK';
          else if (sub.status === 'qualified') histState = 'OFFER';

          history.push({
              id: sub.id,
              title: project?.title || "Unknown Role",
              company: project?.company_name || "Unknown Company",
              date: new Date(sub.created_at).toLocaleDateString(),
              status: sub.status,
              isPaid: sub.is_paid,
              uiState: histState,
              project_id: sub.project_id
          });
      });

      setActiveInternships(myActive);
      setAvailableInternships(market);
      setApplications(history);

    } catch (error) {
      console.error("Dashboard Logic Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (project) => {
    if (project.uiState === 'APPLY') {
       if(confirm(`Apply for ${project.role_title}? You must pass the Qualifying Assessment first.`)) {
           startQualifier(project.qualifying_set_id);
       }
    } else if (project.uiState === 'OFFER') {
       setSelectedOffer(project);
    } else if (project.uiState === 'WORK' || project.uiState === 'DONE') {
       navigate(`/student/internship/${project.id}`);
    }
  };

  const startQualifier = async (setId) => {
     try {
        const { data: set } = await supabase.from('practice_sets').select('title').eq('id', setId).single();
        const { data: session, error } = await supabase.from('mock_interview_sessions').insert({
            user_id: user.id,
            user_email: user.email,
            status: 'in_progress',
            metadata: { set_id: setId, title: set?.title || 'Internship Qualifier' }
        }).select().single();

        if (error) throw error;
        navigate(`/student/mock-interview/${session.id}`);
     } catch (err) {
        alert("Could not start interview. Please ensure the practice set exists.");
     }
  };

  const onPaymentSuccess = async () => {
    try {
      const { error } = await supabase.from('internship_submissions').upsert({
         user_id: user.id,
         project_id: selectedOffer.id,
         is_paid: true,
         status: 'hired',
         started_at: new Date(),
         board_state: { todo: [], in_progress: [], done: [] }
      }, { onConflict: 'user_id, project_id' }); 

      if (error) throw error;
      setSelectedOffer(null);
      fetchDashboardData(); 
      navigate(`/student/internship/${selectedOffer.id}`);
    } catch (err) {
      alert("Payment record failed.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#050505] text-[#FF4A1F]"><Loader2 className="animate-spin" size={40}/></div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. HERO HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-[#FF4A1F]"></span>
              <span className="text-[#FF4A1F] text-xs font-bold uppercase tracking-widest">Career Launchpad</span>
           </div>
           <h1 className="text-4xl font-extrabold text-white tracking-tight">Internship Hub</h1>
           <p className="text-gray-400 mt-2 text-lg">Build real-world experience. Get hired.</p>
        </div>
        
        {/* User Stats Pill */}
        <div className="flex gap-4">
            <StatPill label="Applied" value={stats.applications} />
            <StatPill label="Offers" value={stats.offers} highlight={stats.offers > 0} />
        </div>
      </div>

      {/* 2. MY WORKSPACE (Active/Completed) */}
      {activeInternships.length > 0 && (
          <section>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-500"/> My Workspace
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeInternships.map(job => (
                      <div key={job.id} onClick={() => handleCardClick(job)} className="cursor-pointer group bg-[#111] border border-white/10 hover:border-emerald-500/50 p-6 rounded-3xl transition-all hover:-translate-y-1 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Briefcase size={80} className="text-emerald-500" />
                          </div>
                          <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg bg-gradient-to-br ${getGradient(job.company_name)}`}>
                                      {job.company_name?.[0]}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-white text-lg">{job.role_title}</h3>
                                      <p className="text-gray-400 text-sm">{job.company_name}</p>
                                  </div>
                              </div>
                              {job.uiState === 'DONE' ? (
                                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                                      <CheckCircle size={12}/> Completed
                                  </span>
                              ) : (
                                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 flex items-center gap-1">
                                      <Clock size={12}/> In Progress
                                  </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-6 relative z-10">
                              <span>Enter Workspace</span>
                              <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform"/>
                          </div>
                      </div>
                  ))}
              </div>
          </section>
      )}

      {/* 3. EXPLORE OPPORTUNITIES (Marketplace) */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search size={20} className="text-blue-500"/> Explore Opportunities
            </h2>
        </div>
        
        {availableInternships.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-white/10 rounded-3xl bg-[#111]">
                <p className="text-gray-500">No new internships available right now.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableInternships.map((job) => (
                <div key={job.id} className="group flex flex-col bg-[#111] border border-white/5 hover:border-[#FF4A1F]/30 p-6 rounded-3xl transition-all hover:shadow-2xl hover:shadow-orange-900/10 h-full">
                  
                  <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg bg-gradient-to-br ${getGradient(job.company_name)}`}>
                          {job.company_name?.[0]}
                      </div>
                      {job.uiState === 'OFFER' && <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20 animate-pulse">Action Required</span>}
                      {job.uiState === 'APPLIED' && <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs font-bold">Applied</span>}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FF4A1F] transition-colors">{job.role_title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{job.company_name}</p>

                  <div className="flex-1">
                      <p className="text-sm text-gray-400 line-clamp-2 mb-6 leading-relaxed">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                          <Tag text={job.difficulty} />
                          <Tag text={`${job.price === 0 ? 'Free' : '₹' + job.price}`} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                      </div>
                  </div>

                  <button 
                    onClick={() => handleCardClick(job)}
                    disabled={job.uiState === 'REJECTED' || job.uiState === 'APPLIED'}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        job.uiState === 'OFFER' 
                            ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                        : job.uiState === 'APPLIED'
                            ? 'bg-gray-800 text-gray-500 cursor-default'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {job.uiState === 'OFFER' && "Accept Offer"}
                    {job.uiState === 'APPLIED' && "Application Sent"}
                    {job.uiState === 'APPLY' && <>Apply Now <ArrowRight size={16}/></>}
                    {job.uiState === 'REJECTED' && "Locked (Cooldown)"}
                  </button>

                </div>
              ))}
            </div>
        )}
      </section>

      {/* 4. APPLICATION HISTORY (Compact) */}
      {applications.length > 0 && (
          <section className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden mt-12">
             <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><TrendingUp size={20}/></div>
                <h3 className="font-bold text-lg text-white">Application History</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-black/20 text-gray-500 text-xs uppercase tracking-wider">
                   <tr>
                     <th className="px-6 py-4 font-medium">Role</th>
                     <th className="px-6 py-4 font-medium">Company</th>
                     <th className="px-6 py-4 font-medium">Date</th>
                     <th className="px-6 py-4 font-medium">Status</th>
                     <th className="px-6 py-4 font-medium text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {applications.map((app) => (
                     <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="px-6 py-4 font-medium text-white">{app.title}</td>
                       <td className="px-6 py-4 text-gray-400">{app.company}</td>
                       <td className="px-6 py-4 text-gray-500 font-mono text-xs">{app.date}</td>
                       <td className="px-6 py-4">
                          <StatusPill status={app.status} uiState={app.uiState} />
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/student/internship/${app.project_id}`)} 
                            className="text-gray-400 hover:text-white font-medium text-xs underline"
                            disabled={app.uiState === 'APPLIED' || app.uiState === 'REJECTED'}
                          >
                             {(app.uiState === 'WORK' || app.uiState === 'DONE') ? "Open" : "View"}
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </section>
      )}

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

// --- HELPER COMPONENTS ---

const StatPill = ({ label, value, highlight }) => (
    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${highlight ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-[#111] border-white/10'}`}>
        <span className={`text-sm font-bold ${highlight ? 'text-yellow-500' : 'text-white'}`}>{value}</span>
        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{label}</span>
    </div>
);

const Tag = ({ text, icon: Icon, color = "text-gray-400", bg = "bg-white/5", border = "border-white/5" }) => (
    <span className={`px-3 py-1 rounded-lg ${bg} border ${border} ${color} text-xs font-medium flex items-center gap-1.5`}>
        {Icon && <Icon size={12} />}
        {text}
    </span>
);

const StatusPill = ({ status, uiState }) => {
    if (uiState === 'DONE') return <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">Completed</span>;
    if (uiState === 'WORK') return <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold border border-emerald-500/20">Hired</span>;
    if (status === 'qualified') return <span className="text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">Offer Pending</span>;
    return <span className="text-gray-400 bg-white/10 px-2 py-1 rounded text-xs font-bold">Applied</span>;
};

const getGradient = (name = "") => {
    const gradients = [
        "from-indigo-500 to-purple-600",
        "from-blue-500 to-cyan-500",
        "from-rose-500 to-orange-500",
        "from-emerald-500 to-green-600",
        "from-fuchsia-500 to-pink-600"
    ];
    const index = (name?.length || 0) % gradients.length;
    return gradients[index];
}

const DashboardSkeleton = () => (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
        <div className="h-20 bg-[#111] rounded-3xl animate-pulse w-full"></div>
        <div className="grid grid-cols-2 gap-6">
            <div className="h-60 bg-[#111] rounded-3xl animate-pulse"></div>
            <div className="h-60 bg-[#111] rounded-3xl animate-pulse"></div>
        </div>
    </div>
);

export default InternshipDashboard;