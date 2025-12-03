import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient.js";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  BookOpen,
  Award,
  Settings,
  PlusCircle,
  BarChart2,
  Users,
  DollarSign,
  PlayCircle,
  CheckCircle,
  Clock,
  Home,
  Menu,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student"); // 'student' | 'creator'
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        setUser(user);
        setRole(user.user_metadata?.role || "student");
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4A1F]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row font-sans">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#111]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4A1F] flex items-center justify-center font-bold text-black text-sm">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold">My Dashboard</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:relative z-50 w-full md:w-64 bg-[#111] border-r border-gray-800 p-6 flex flex-col justify-between h-[calc(100vh-65px)] md:h-screen transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        } top-[65px] md:top-0`}
      >
        <div>
          {/* User Info (Desktop) */}
          <div className="hidden md:flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4A1F] to-[#FF8C69] flex items-center justify-center text-xl font-bold text-black shadow-lg shadow-orange-500/20">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold truncate w-32">
                {user?.user_metadata?.fullName || user?.email?.split("@")[0]}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 uppercase tracking-wider">
                {role}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2 relative">
            <SidebarItem
              icon={Home}
              label="Home"
              active={false}
              onClick={() => navigate("/")}
            />

            <div className="my-4 h-px bg-gray-800/50" />

            <SidebarItem
              icon={role === "creator" ? BarChart2 : User}
              label="Overview"
              active={activeTab === "overview"}
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
            />
            <SidebarItem
              icon={role === "creator" ? BookOpen : PlayCircle}
              label={role === "creator" ? "Manage Courses" : "My Learning"}
              active={activeTab === "courses"}
              onClick={() => {
                setActiveTab("courses");
                setMobileMenuOpen(false);
              }}
            />
            {role === "student" && (
              <SidebarItem
                icon={Award}
                label="Achievements"
                active={activeTab === "achievements"}
                onClick={() => {
                  setActiveTab("achievements");
                  setMobileMenuOpen(false);
                }}
              />
            )}
            <SidebarItem
              icon={Settings}
              label="Settings"
              active={activeTab === "settings"}
              onClick={() => {
                setActiveTab("settings");
                setMobileMenuOpen(false);
              }}
            />
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full mt-6"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen bg-[#0A0A0A]">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {activeTab === "overview" && "Dashboard"}
              {activeTab === "courses" &&
                (role === "creator" ? "Your Courses" : "My Learning")}
              {activeTab === "achievements" && "Achievements"}
              {activeTab === "settings" && "Account Settings"}
            </h1>
            <p className="text-gray-400 mt-1">
              Welcome back,{" "}
              <span className="text-white font-medium">
                {user?.user_metadata?.fullName || user?.email?.split("@")[0]}
              </span>
              .
            </p>
          </div>

          {role === "creator" && activeTab === "courses" && (
            <button
              onClick={() => navigate("/courses-upload")}
              className="bg-[#FF4A1F] text-black px-5 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 hover:brightness-110 hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
            >
              <PlusCircle size={18} />
              Create New Course
            </button>
          )}
        </header>

        {/* Dynamic Content based on Role and Tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {role === "creator" ? (
              <CreatorView
                activeTab={activeTab}
                onCreateCourse={() => navigate("/courses-upload")}
              />
            ) : (
              <StudentView activeTab={activeTab} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors duration-200 ${
        active
          ? "text-[#FF4A1F] font-medium"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {active && (
        <motion.div
          layoutId="active-sidebar-bg"
          className="absolute inset-0 bg-[#FF4A1F]/10 border border-[#FF4A1F]/20 rounded-xl"
          initial={false}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <Icon size={20} />
        <span>{label}</span>
      </div>
    </button>
  );
}

/* --- CREATOR VIEW --- */
function CreatorView({ activeTab, onCreateCourse }) {
  if (activeTab === "overview") {
    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            icon={Users}
            title="Total Students"
            value="1,240"
            trend="+12%"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value="$12,450"
            trend="+8.5%"
          />
          <StatCard
            icon={BarChart2}
            title="Avg. Rating"
            value="4.8"
            trend="+0.2"
          />
        </div>

        {/* Analytics Placeholder */}
        <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold mb-4">Revenue Analytics</h3>
          <div className="h-64 flex flex-col items-center justify-center bg-[#0A0A0A] rounded-xl border border-gray-800 border-dashed text-gray-500 gap-3">
            <BarChart2 size={48} className="opacity-20" />
            <span className="text-sm">
              Chart data visualization coming soon
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "courses") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CreatorCourseCard
          title="Advanced React Patterns"
          students={450}
          revenue="$4,500"
          status="Published"
          image="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=500&q=60"
        />
        <CreatorCourseCard
          title="Node.js Microservices"
          students={210}
          revenue="$2,100"
          status="Published"
          image="https://images.unsplash.com/photo-1639628735078-ed2f038a193e?auto=format&fit=crop&w=500&q=60"
        />
        <div
          className="group border border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-500 hover:border-[#FF4A1F] hover:text-[#FF4A1F] hover:bg-[#FF4A1F]/5 cursor-pointer transition-all min-h-[250px]"
          onClick={onCreateCourse}
        >
          <div className="p-4 rounded-full bg-gray-800 group-hover:bg-[#FF4A1F]/20 mb-4 transition-colors">
            <PlusCircle size={32} />
          </div>
          <span className="font-semibold">Create New Course</span>
        </div>
      </div>
    );
  }

  return <PlaceholderSection title={activeTab} />;
}

/* --- STUDENT VIEW --- */
function StudentView({ activeTab }) {
  if (activeTab === "overview") {
    return (
      <div className="space-y-8">
        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-[#FF4A1F] to-[#FF8C69] rounded-2xl p-8 text-black relative overflow-hidden shadow-lg shadow-orange-900/20">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Keep it up! 🔥</h2>
            <p className="font-medium opacity-80 mb-6 max-w-lg">
              You've completed 12 lessons this week. You're on a 3-day streak.
            </p>
            <button className="bg-black text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-md">
              Resume Learning
            </button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 rotate-12 pointer-events-none">
            <Award size={200} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">In Progress</h3>
              <button className="text-xs text-[#FF4A1F] hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-4">
              <CourseProgressCard
                title="Modern React with Hooks"
                progress={65}
                lastAccessed="2 hours ago"
                image="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=150&q=60"
              />
              <CourseProgressCard
                title="CSS Mastery"
                progress={30}
                lastAccessed="1 day ago"
                image="https://images.unsplash.com/photo-1667835950375-40b5211a26d7?auto=format&fit=crop&w=150&q=60"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Completed</h3>
            <div className="space-y-4">
              <CourseCompletedCard
                title="UI/UX Fundamentals"
                finishedDate="Oct 12, 2024"
                grade="98%"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "courses") {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Your Learning Path</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CourseProgressCard
            title="Modern React with Hooks"
            progress={65}
            lastAccessed="2 hours ago"
            image="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=500&q=60"
            large
          />
          <CourseProgressCard
            title="CSS Mastery"
            progress={30}
            lastAccessed="1 day ago"
            image="https://images.unsplash.com/photo-1667835950375-40b5211a26d7?auto=format&fit=crop&w=500&q=60"
            large
          />
        </div>
      </div>
    );
  }

  if (activeTab === "achievements") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AchievementCard title="Fast Starter" icon="🚀" unlocked />
        <AchievementCard title="Code Warrior" icon="⚔️" unlocked />
        <AchievementCard title="React Master" icon="⚛️" unlocked={false} />
        <AchievementCard title="Bug Hunter" icon="🐛" unlocked={false} />
      </div>
    );
  }

  return <PlaceholderSection title={activeTab} />;
}

/* -------------------------------------------------------------------------- */
/* HELPER COMPONENTS                               */
/* -------------------------------------------------------------------------- */

function StatCard({ icon: Icon, title, value, trend }) {
  return (
    <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <h4 className="text-3xl font-bold mt-2 text-white">{value}</h4>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg text-gray-400">
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded">
          {trend}
        </span>
        <span className="text-gray-500 ml-2">from last month</span>
      </div>
    </div>
  );
}

function CreatorCourseCard({ title, students, revenue, status, image }) {
  return (
    <div className="bg-[#111] rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition group cursor-pointer">
      <div className="h-32 overflow-hidden relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-medium border border-white/10">
          {status}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-4 truncate">{title}</h3>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Users size={16} /> {students}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={16} /> {revenue}
          </div>
        </div>
        <button className="w-full mt-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors">
          Manage
        </button>
      </div>
    </div>
  );
}

function CourseProgressCard({ title, progress, lastAccessed, image, large }) {
  return (
    <div
      className={`bg-[#111] rounded-2xl p-4 flex gap-4 border border-gray-800 items-center hover:bg-[#161616] transition-colors cursor-pointer ${
        large ? "flex-col md:flex-row items-start md:items-center" : ""
      }`}
    >
      <img
        src={image}
        alt={title}
        className={`${
          large ? "w-full md:w-32 h-32 md:h-24" : "w-16 h-16"
        } rounded-xl object-cover bg-gray-800`}
      />
      <div className="flex-1 w-full">
        <h4 className="font-bold text-lg truncate pr-4">{title}</h4>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 mb-3">
          <Clock size={12} /> Last studied {lastAccessed}
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#FF4A1F] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#FF4A1F]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-2 text-gray-400">
          <span>{progress}% complete</span>
          <span>12/45 Lessons</span>
        </div>
      </div>
      {large && (
        <button className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition shadow-lg">
          <PlayCircle size={24} />
        </button>
      )}
    </div>
  );
}

function CourseCompletedCard({ title, finishedDate, grade }) {
  return (
    <div className="bg-[#111] rounded-2xl p-4 flex justify-between items-center border border-gray-800 opacity-80 hover:opacity-100 hover:border-gray-600 transition cursor-pointer">
      <div>
        <h4 className="font-bold text-gray-200">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">
          Completed on {finishedDate}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="block text-xs text-gray-500">Grade</span>
          <span className="font-bold text-[#FF4A1F]">{grade}</span>
        </div>
        <CheckCircle className="text-green-500" size={24} />
      </div>
    </div>
  );
}

function AchievementCard({ title, icon, unlocked }) {
  return (
    <div
      className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
        unlocked
          ? "bg-[#111] border-gray-800 text-white shadow-lg shadow-orange-500/5"
          : "bg-[#0A0A0A] border-gray-900 text-gray-600 grayscale opacity-50"
      }`}
    >
      <div className="text-3xl mb-1 filter drop-shadow-md">{icon}</div>
      <span className="text-xs font-bold">{title}</span>
    </div>
  );
}

function PlaceholderSection({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-gray-500 border border-dashed border-gray-800 rounded-2xl bg-[#111]/50">
      <Settings size={48} className="mb-4 opacity-50" />
      <h3 className="text-lg font-semibold capitalize">
        {title} settings coming soon
      </h3>
      <p className="text-sm mt-2 max-w-xs text-center opacity-70">
        We are currently building this feature. Check back later for updates.
      </p>
    </div>
  );
}
