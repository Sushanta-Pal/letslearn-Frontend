import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient.js";
import { useNavigate } from "react-router-dom";

// --- COMPONENTS ---
import MockInterviewView from "./student/MockInterviewView.jsx";
import CoursesList from "./student/CoursesList.jsx"; 
import ManageCourses from "./Teacher/ManageCourses.jsx"; 
import PracticeSetBuilder from "./Teacher/PracticeSetBuilder.jsx"; 
import AssignmentManager from "./Teacher/AssignmentManager.jsx"; 
import StudentAssignmentView from "./student/StudentAssignmentView.jsx";
import InternshipDashboard from "./student/Internship/InternshipDashboard.jsx"; 
import CertificateModal from "./student/CertificateModal"; 

import {
  LogOut, User, BookOpen, Award, Settings,
  BarChart2, Users, DollarSign, CheckCircle,
  Clock, Home, Menu, X, ClipboardList, Mic, Layers, 
  Code, TrendingUp, FileText, Briefcase,
  Zap, Shield
} from "lucide-react";

export default function ProfilePage({ defaultTab = "overview" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null); 
  const [unifiedStats, setUnifiedStats] = useState({
    xp: 0,
    coins: 0,
    rank: "Intern"
  });
  
  // Certificate State
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);

  const [role, setRole] = useState("student"); 
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUser(user);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setProfileData(profile);
        setRole(profile.role || "student");
      }

      const { data: internStats } = await supabase
        .from('user_internship_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: certs } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });
      
      setCertificates(certs || []);

      const practiceCoins = profile?.total_coins || 0; 
      const internshipCoins = internStats?.coins || 0;
      
      setUnifiedStats({
          xp: internStats?.total_xp || 0,
          coins: practiceCoins + internshipCoins,
          rank: internStats?.career_role || "Intern"
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "internships") {
      setIsSidebarOpen(false); 
    } else {
      setIsSidebarOpen(true); 
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF4A1F]"></div></div>;
  
  const userInitial = (profileData?.full_name || user?.email || "U").charAt(0).toUpperCase();
  const displayUserName = profileData?.full_name || user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#111] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4A1F] flex items-center justify-center font-bold text-black text-sm">
             {userInitial}
          </div>
          <span className="font-semibold">My Dashboard</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed md:relative z-50 bg-[#111] border-r border-gray-800 flex flex-col h-screen transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${isSidebarOpen ? "md:w-64" : "md:w-0 md:opacity-0 md:overflow-hidden md:border-none"}
        `}
      >
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="hidden md:flex items-center gap-3 mb-10 whitespace-nowrap">
            <div className="w-12 h-12 min-w-[3rem] rounded-full bg-gradient-to-br from-[#FF4A1F] to-[#FF8C69] flex items-center justify-center text-xl font-bold text-black shadow-lg shadow-orange-500/20">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold truncate w-32">{displayUserName}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 uppercase tracking-wider">
                {unifiedStats.rank}
              </span>
            </div>
          </div>

          <nav className="space-y-2 relative">
            <SidebarItem icon={Home} label="Home" active={false} onClick={() => navigate("/")} />
            <div className="my-4 h-px bg-gray-800/50" />
            
            <SidebarItem icon={BarChart2} label="Overview" active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }} />

            {role === "student" ? (
              <>
                <SidebarItem icon={BookOpen} label="My Courses" active={activeTab === "courses"} onClick={() => { setActiveTab("courses"); setMobileMenuOpen(false); }} />
                <SidebarItem icon={Briefcase} label="Internships" active={activeTab === "internships"} onClick={() => { setActiveTab("internships"); setMobileMenuOpen(false); }} />
                <SidebarItem icon={FileText} label="Assignments" active={activeTab === "assignments"} onClick={() => { setActiveTab("assignments"); setMobileMenuOpen(false); }} />
                <SidebarItem icon={Mic} label="Mock Interview" active={activeTab === "mock-interview"} onClick={() => { setActiveTab("mock-interview"); setMobileMenuOpen(false); }} />
                <SidebarItem icon={Code} label="Practice Arena" active={false} onClick={() => navigate("/student/questions")} />
                <SidebarItem icon={Award} label="Achievements" active={activeTab === "achievements"} onClick={() => { setActiveTab("achievements"); setMobileMenuOpen(false); }} />
              </>
            ) : (
              <>
                 <SidebarItem icon={BookOpen} label="Manage Content" active={activeTab === "manage-content"} onClick={() => { setActiveTab("manage-content"); setMobileMenuOpen(false); }} />
                 <SidebarItem icon={Briefcase} label="Post Internship" active={false} onClick={() => navigate("/teacher/create-internship")} />
                 <SidebarItem icon={FileText} label="Assignments" active={activeTab === "assignments"} onClick={() => { setActiveTab("assignments"); setMobileMenuOpen(false); }} />
                 <SidebarItem icon={Layers} label="Practice Sets" active={activeTab === "practice-sets"} onClick={() => { setActiveTab("practice-sets"); setMobileMenuOpen(false); }} />
                 <SidebarItem icon={Code} label="Add Coding Qs" active={false} onClick={() => navigate("/teacher/add-question")} />
              </>
            )}

            <SidebarItem icon={Settings} label="Settings" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }} />
          </nav>
        </div>

        {/* Pinned Sign Out Button */}
        <div className="p-4 border-t border-gray-800 bg-[#111]">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all whitespace-nowrap font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative h-screen overflow-hidden bg-[#0A0A0A]">
        
        {/* Toggle Button (Visible when sidebar is closed) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-40 p-3 bg-[#111] border border-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="h-full overflow-y-auto">
            <div className={isSidebarOpen ? "p-6 md:p-10" : "p-0"}>
                
                {activeTab !== "internships" && (
                  <header className="mb-8">
                    <h1 className="text-3xl font-bold capitalize">{activeTab.replace("-", " ")}</h1>
                    <p className="text-gray-400 mt-1">Welcome back, <span className="text-white font-medium">{displayUserName}</span>.</p>
                  </header>
                )}

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {role === "creator" || role === "teacher" ? (
                      <CreatorView activeTab={activeTab} />
                    ) : (
                      <StudentView 
                        activeTab={activeTab} 
                        user={user} 
                        stats={unifiedStats}
                        certificates={certificates}
                        onViewCert={setSelectedCert} 
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </main>

      {/* --- CERTIFICATE MODAL --- */}
      {selectedCert && (
        <CertificateModal 
          certificate={selectedCert} 
          user={user} 
          onClose={() => setSelectedCert(null)} 
        />
      )}

    </div>
  );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`relative flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors duration-200 ${active ? "text-[#FF4A1F] font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
      {active && (
        <motion.div layoutId="active-sidebar-bg" className="absolute inset-0 bg-[#FF4A1F]/10 border border-[#FF4A1F]/20 rounded-xl" />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <Icon size={20} />
        <span>{label}</span>
      </div>
    </button>
  );
}

// --- STUDENT VIEW ---
function StudentView({ activeTab, user, stats, certificates, onViewCert }) {
  const [history, setHistory] = useState([]);
  const [loadingHist, setLoadingHist] = useState(true);

  useEffect(() => {
    if (activeTab === 'overview' && user) {
      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from('student_solutions')
          .select(`id, status, earned_coins, created_at, coding_questions(title, difficulty)`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && data) setHistory(data);
        setLoadingHist(false);
      };
      fetchHistory();
    }
  }, [activeTab, user]);

  if (activeTab === "overview") {
    const { xp, coins, rank } = stats;
    let nextRankXp = 1000;
    if(xp >= 1000) nextRankXp = 5000;
    if(xp >= 5000) nextRankXp = 15000;
    const progressPercent = Math.min((xp / nextRankXp) * 100, 100);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-700/30 p-6 rounded-2xl relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100} /></div>
             <h3 className="text-indigo-400 font-bold uppercase text-xs tracking-widest mb-1">Experience Points</h3>
             <div className="text-4xl font-black text-white">{xp} <span className="text-lg text-indigo-400">XP</span></div>
             <div className="mt-4 w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
             </div>
             <p className="text-xs text-gray-500 mt-2">{xp} / {nextRankXp} to next Level</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/40 to-black border border-yellow-700/30 p-6 rounded-2xl relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={100} /></div>
             <h3 className="text-yellow-500 font-bold uppercase text-xs tracking-widest mb-1">Total Balance</h3>
             <div className="text-4xl font-black text-white flex items-center gap-2">
                {coins} <span className="text-2xl text-yellow-500">🪙</span>
             </div>
             <p className="text-gray-400 text-xs mt-2">Combined wallet</p>
          </div>

          <div className="bg-[#111] border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
             <h3 className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Current Title</h3>
             <div className="text-3xl font-black text-white flex items-center gap-2">
                <Shield className="text-[#FF4A1F]" /> {rank}
             </div>
             <p className="text-xs text-gray-500 mt-2">Promotions happen automatically.</p>
          </div>
        </div>

        {certificates && certificates.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Award className="text-emerald-500"/> Earned Certificates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-[#161616] p-4 rounded-xl border border-gray-800 flex items-center justify-between hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => onViewCert(cert)}>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-900/20 p-3 rounded-lg text-emerald-500"><Award size={24}/></div>
                    <div>
                      <h4 className="font-bold text-white">{cert.title || "Certificate"}</h4>
                      <p className="text-xs text-gray-500">{new Date(cert.issued_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button className="text-xs bg-gray-800 px-3 py-1.5 rounded text-white">View</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden mt-8">
           <div className="p-6 border-b border-gray-800 flex justify-between items-center">
             <h3 className="font-bold text-lg flex items-center gap-2"><Clock size={20} className="text-[#FF4A1F]"/> Recent Activity</h3>
           </div>
           <div className="p-0">
             {loadingHist ? <div className="p-8 text-center text-gray-500">Loading history...</div> : history.length === 0 ? <div className="p-8 text-center text-gray-500">No activity yet.</div> : (
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="bg-black/50 text-gray-500 uppercase text-xs">
                     <th className="px-6 py-3">Problem</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3">Reward</th>
                     <th className="px-6 py-3 text-right">Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                   {history.map((item) => (
                     <tr key={item.id} className="hover:bg-white/5">
                       <td className="px-6 py-4">{item.coding_questions?.title}</td>
                       <td className="px-6 py-4"><span className="text-green-500">{item.status}</span></td>
                       <td className="px-6 py-4 text-yellow-500">+{item.earned_coins} 🪙</td>
                       <td className="px-6 py-4 text-right text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
           </div>
        </div>
      </div>
    );
  }

  if (activeTab === "courses") return <CoursesList />;
  if (activeTab === "assignments") return <StudentAssignmentView user={user} />;
  if (activeTab === "internships") return <InternshipDashboard />; 
  if (activeTab === "mock-interview") return <MockInterviewView user={user} />;
  
  if (activeTab === "achievements") {
    const { xp, coins } = stats;
    const earnedBadges = [
      { id: 1, title: "First Step", icon: "🚀", unlocked: true },
      { id: 2, title: "Intern", icon: "👨‍💻", unlocked: xp >= 0 },
      { id: 3, title: "SDE I", icon: "⚔️", unlocked: xp >= 5000 },
      { id: 4, title: "Richie Rich", icon: "💰", unlocked: coins >= 1000 },
    ];
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {earnedBadges.map(b => (
           <AchievementCard key={b.id} title={b.title} icon={b.icon} unlocked={b.unlocked} />
        ))}
      </div>
    );
  }

  return <PlaceholderSection title={activeTab} icon={ClipboardList} />;
}

// --- CREATOR VIEW ---
function CreatorView({ activeTab }) {
  if (activeTab === "overview") return <div className="text-gray-500">Teacher Dashboard</div>;
  if (activeTab === "manage-content") return <ManageCourses />;
  if (activeTab === "assignments") return <AssignmentManager />;
  if (activeTab === "practice-sets") return <PracticeSetBuilder />;
  return <PlaceholderSection title={activeTab} icon={BookOpen} />;
}

function StatCard({ icon: Icon, title, value, trend, color="orange" }) { /* ... same as before ... */ return null; }
function AchievementCard({ title, icon, unlocked }) {
  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 ${unlocked ? "bg-[#111] border-gray-800" : "bg-[#0A0A0A] border-gray-900 opacity-50 grayscale"}`}>
      <div className="text-3xl mb-1">{icon}</div>
      <span className="text-xs font-bold">{title}</span>
      {unlocked ? <span className="text-[10px] text-green-500">Unlocked</span> : <span className="text-[10px] text-gray-600">Locked</span>}
    </div>
  );
}
function PlaceholderSection({ title, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-gray-500 border border-dashed border-gray-800 rounded-2xl bg-[#111]/50">
      <Icon size={48} className="mb-4 opacity-50" />
      <h3 className="text-lg font-semibold capitalize">{title} Content Coming Soon</h3>
    </div>
  );
}