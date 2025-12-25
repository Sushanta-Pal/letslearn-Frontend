import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient.js";
import { useNavigate } from "react-router-dom";

// --- EXISTING COMPONENTS ---
import MockInterviewView from "./student/MockInterviewView.jsx";
import CoursesList from "./student/CoursesList.jsx"; 
import ManageCourses from "./Teacher/ManageCourses.jsx"; 
import PracticeSetBuilder from "./Teacher/PracticeSetBuilder.jsx"; 

// --- NEW IMPORTS ---
import AssignmentManager from "./Teacher/AssignmentManager.jsx"; 
import StudentAssignmentView from "./student/StudentAssignmentView.jsx";
import InternshipDashboard from "./student/Internship/InternshipDashboard.jsx"; 

import {
  LogOut, User, BookOpen, Award, Settings, PlusCircle,
  BarChart2, Users, DollarSign, CheckCircle,
  Clock, Home, Menu, X, ClipboardList, Mic, Layers, 
  Code, TrendingUp, FileText, Briefcase, PenTool,
  ChevronLeft, ChevronRight
} from "lucide-react";

export default function ProfilePage({ defaultTab = "overview" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null); 
  const [role, setRole] = useState("student"); 
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // --- NEW: State to control sidebar visibility ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
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
        } else {
          setRole(user.user_metadata?.role || "student");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [navigate]);

  // --- NEW: Auto-collapse sidebar when entering specific tabs ---
  useEffect(() => {
    if (activeTab === "internships" || activeTab === "task-builder") {
      setIsSidebarOpen(false); // Close sidebar for full-screen tools
    } else {
      setIsSidebarOpen(true); // Open sidebar for standard views
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;
  
  const userInitial = (profileData?.full_name || user?.email || "U").charAt(0).toUpperCase();
  const displayUserName = profileData?.full_name || user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#111]">
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
          fixed md:relative z-50 bg-[#111] border-r border-gray-800 flex flex-col justify-between h-screen transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0 w-64" : "translate-x-full md:translate-x-0"}
          ${isSidebarOpen ? "md:w-64" : "md:w-0 md:opacity-0 md:overflow-hidden md:border-none"}
        `}
      >
        <div className="p-6">
          {/* User Info Block */}
          <div className="hidden md:flex items-center gap-3 mb-10 whitespace-nowrap">
            <div className="w-12 h-12 min-w-[3rem] rounded-full bg-gradient-to-br from-[#FF4A1F] to-[#FF8C69] flex items-center justify-center text-xl font-bold text-black shadow-lg shadow-orange-500/20">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold truncate w-32">{displayUserName}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 uppercase tracking-wider">{role}</span>
            </div>
          </div>

          <nav className="space-y-2 relative">
            <SidebarItem icon={Home} label="Home" active={false} onClick={() => navigate("/")} />
            <div className="my-4 h-px bg-gray-800/50" />
            
            <SidebarItem 
              icon={BarChart2} 
              label="Overview" 
              active={activeTab === "overview"} 
              onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }} 
            />

            {role === "student" ? (
              <>
                <SidebarItem icon={BookOpen} label="My Courses" active={activeTab === "courses"} onClick={() => { setActiveTab("courses"); setMobileMenuOpen(false); }} />
                
                {/* Internships Click: This will trigger the useEffect to close sidebar */}
                <SidebarItem icon={Briefcase} label="Internships" active={activeTab === "internships"} onClick={() => { setActiveTab("internships"); setMobileMenuOpen(false); }} />
                
                <SidebarItem icon={FileText} label="Assignments" active={activeTab === "assignments"} onClick={() => { setActiveTab("assignments"); setMobileMenuOpen(false); }} />
                <SidebarItem icon={Mic} label="Mock Interview" active={activeTab === "mock-interview"} onClick={() => { setActiveTab("mock-interview"); setMobileMenuOpen(false); }} />
                <SidebarItem icon={Code} label="Practice Arena" active={false} onClick={() => navigate("/student/questions")} />
                <SidebarItem icon={Award} label="Achievements" active={activeTab === "achievements"} onClick={() => { setActiveTab("achievements"); setMobileMenuOpen(false); }} />
              </>
            ) : (
              <>
                 <SidebarItem icon={BookOpen} label="Manage Content" active={activeTab === "manage-content"} onClick={() => { setActiveTab("manage-content"); setMobileMenuOpen(false); }} />
                 
                 {/* Task Builder Click: This will trigger the useEffect to close sidebar */}
                  <SidebarItem
  icon={Briefcase} 
  label="Post Internship" 
  active={false} 
  onClick={() => navigate("/teacher/create-internship")} 
/>
                 <SidebarItem icon={FileText} label="Assignments" active={activeTab === "assignments"} onClick={() => { setActiveTab("assignments"); setMobileMenuOpen(false); }} />
                 <SidebarItem icon={Layers} label="Practice Sets" active={activeTab === "practice-sets"} onClick={() => { setActiveTab("practice-sets"); setMobileMenuOpen(false); }} />
                 <SidebarItem icon={Code} label="Add Coding Qs" active={false} onClick={() => navigate("/teacher/add-question")} />
              </>
            )}

            <SidebarItem icon={Settings} label="Settings" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }} />
          </nav>
        </div>

        <button onClick={handleLogout} className="m-6 flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all whitespace-nowrap">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative h-screen overflow-hidden bg-[#0A0A0A]">
        
        {/* --- TOGGLE BUTTON (Floating) --- */}
        {/* Only show this button if the sidebar is closed */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-40 p-2 bg-[#111] border border-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="h-full overflow-y-auto">
            {/* If sidebar is OPEN, we add padding. If CLOSED (Internships), no padding for full screen feel */}
            <div className={isSidebarOpen ? "p-6 md:p-10" : "p-0"}>
                
                {/* Standard Header (Hide on full screen views) */}
                {activeTab !== "internships" && activeTab !== "task-builder" && (
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
                      <StudentView activeTab={activeTab} user={user} profile={profileData} />
                    )}
                  </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- SUB-COMPONENTS ---------------- */

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`relative flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors duration-200 ${active ? "text-[#FF4A1F] font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
      {active && (
        <motion.div layoutId="active-sidebar-bg" className="absolute inset-0 bg-[#FF4A1F]/10 border border-[#FF4A1F]/20 rounded-xl" initial={false} transition={{ type: "spring", stiffness: 350, damping: 30 }} />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <Icon size={20} />
        <span>{label}</span>
      </div>
    </button>
  );
}

// --- STUDENT VIEW ---
function StudentView({ activeTab, user, profile }) {
  const [history, setHistory] = useState([]);
  const [loadingHist, setLoadingHist] = useState(true);

  useEffect(() => {
    if (activeTab === 'overview' && user) {
      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from('student_solutions')
          .select(`
            id, status, earned_coins, created_at,
            coding_questions ( title, difficulty )
          `)
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
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-900/40 to-black border border-yellow-700/30 p-6 rounded-2xl relative overflow-hidden shadow-lg group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <DollarSign size={100} />
             </div>
             <h3 className="text-yellow-500 font-bold uppercase text-xs tracking-widest mb-1">Total Balance</h3>
             <div className="text-4xl font-black text-white flex items-center gap-2">
                {profile?.total_coins || 0} <span className="text-2xl text-yellow-500">🪙</span>
             </div>
             <p className="text-gray-400 text-xs mt-2">Earn more by solving challenges!</p>
          </div>
          <StatCard icon={CheckCircle} title="Problems Solved" value={history.length} trend="+2 this week" color="green" />
          <StatCard icon={TrendingUp} title="Global Rank" value="#42" trend="Top 5%" color="blue" />
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
           <div className="p-6 border-b border-gray-800 flex justify-between items-center">
             <h3 className="font-bold text-lg flex items-center gap-2"><Clock size={20} className="text-[#FF4A1F]"/> Submission History</h3>
             <button className="text-xs text-gray-500 hover:text-white">View All</button>
           </div>
           
           <div className="p-0">
             {loadingHist ? (
               <div className="p-8 text-center text-gray-500">Loading history...</div>
             ) : history.length === 0 ? (
               <div className="p-8 text-center text-gray-500 italic">No problems solved yet. Go to Practice Arena!</div>
             ) : (
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="bg-black/50 text-gray-500 uppercase text-xs">
                     <th className="px-6 py-3 font-medium">Problem</th>
                     <th className="px-6 py-3 font-medium">Status</th>
                     <th className="px-6 py-3 font-medium">Reward</th>
                     <th className="px-6 py-3 font-medium text-right">Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                   {history.map((item) => (
                     <tr key={item.id} className="hover:bg-white/5 transition-colors">
                       <td className="px-6 py-4 font-medium text-white">
                         {item.coding_questions?.title || "Unknown Problem"}
                         <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">{item.coding_questions?.difficulty}</span>
                       </td>
                       <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Solved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{item.status}</span></td>
                       <td className="px-6 py-4 text-yellow-500 font-bold">+{item.earned_coins} 🪙</td>
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

  // --- RENDERING TABS ---
  if (activeTab === "courses") return <CoursesList />;
  if (activeTab === "assignments") return <StudentAssignmentView user={user} />;
  
  // NEW: This renders the Full Screen Glass Dashboard
  if (activeTab === "internships") return <InternshipDashboard />; 
  
  if (activeTab === "mock-interview") return <MockInterviewView user={user} />;
  
  if (activeTab === "achievements") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AchievementCard title="Fast Starter" icon="🚀" unlocked />
        <AchievementCard title="Code Warrior" icon="⚔️" unlocked />
        <AchievementCard title="React Master" icon="⚛️" unlocked={false} />
      </div>
    );
  }

  return <PlaceholderSection title={activeTab} icon={ClipboardList} />;
}

// --- CREATOR VIEW ---
function CreatorView({ activeTab }) {
  if (activeTab === "overview") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={Users} title="Total Students" value="1,240" trend="+12%" />
        <StatCard icon={DollarSign} title="Total Revenue" value="$12,450" trend="+8.5%" />
        <StatCard icon={BarChart2} title="Avg. Rating" value="4.8" trend="+0.2" />
      </div>
    );
  }
  
  if (activeTab === "manage-content") return <ManageCourses />;
  if (activeTab === "assignments") return <AssignmentManager />;
  
  // NEW: This renders the Full Screen Task Builder
  if (activeTab === "task-builder") return <TaskBuilder />; 
  
  if (activeTab === "practice-sets") return <PracticeSetBuilder />;

  return <PlaceholderSection title={activeTab} icon={BookOpen} />;
}

/* HELPER COMPONENTS */
function StatCard({ icon: Icon, title, value, trend, color="orange" }) {
  const colors = { orange: "text-[#FF4A1F]", green: "text-green-500", blue: "text-blue-500" };
  return (
    <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h4 className="text-3xl font-bold mt-2">{value}</h4>
          <span className="text-xs text-gray-500 mt-1 block">{trend}</span>
        </div>
        <div className={`p-3 bg-gray-800/50 rounded-lg ${colors[color] || colors.orange}`}><Icon size={24} /></div>
      </div>
    </div>
  );
}

function AchievementCard({ title, icon, unlocked }) {
  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 ${unlocked ? "bg-[#111] border-gray-800" : "bg-[#0A0A0A] border-gray-900 opacity-50 grayscale"}`}>
      <div className="text-3xl mb-1">{icon}</div>
      <span className="text-xs font-bold">{title}</span>
    </div>
  );
}

function PlaceholderSection({ title, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-gray-500 border border-dashed border-gray-800 rounded-2xl bg-[#111]/50">
      <Icon size={48} className="mb-4 opacity-50" />
      <h3 className="text-lg font-semibold capitalize">{title} Content Coming Soon</h3>
      <p className="text-sm mt-2 max-w-xs text-center opacity-70">We're working on building the {title} module.</p>
    </div>
  );
}