import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { LogOut, User, Bell, ChevronDown, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // --- NOTIFICATIONS & STREAK STATE ---
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. SINGLE INITIALIZATION EFFECT (Clean & Fast) ---
  useEffect(() => {
    const initData = async () => {
      // A. Check Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);
      
      // B. Determine Role
      const rawRole = user.app_metadata?.user_role || user.user_metadata?.user_role || 'student';
      setRole(rawRole);

      // C. Student Specific Logic (Streak & Notifs)
      if (rawRole === 'student') {
          // 1. Sync Streak (Server-Side Calculation)
          const { data: streakData } = await supabase.rpc('check_daily_streak');
          if (streakData) {
              console.log("Streak Sync:", streakData);
              setStreak(streakData.streak);
          }

          // 2. Fetch Notifications
          fetchNotifications(user.id);
      }
    };

    initData();
  }, [navigate]);

  // --- 2. NOTIFICATION HELPERS ---
  const fetchNotifications = async (userId) => {
      const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
      
      if (data) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
      }
  };

  const markRead = async () => {
      if (unreadCount === 0) return;
      
      // Update Local State (Instant UI feedback)
      const updated = notifications.map(n => ({ ...n, is_read: true }));
      setNotifications(updated);
      setUnreadCount(0);
      
      // Update Database (Background)
      await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // --- 3. NAVIGATION LINKS ---
  const studentLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Internships", path: "/dashboard/internships" },
    { name: "Courses", path: "/dashboard/courses" },
    { name: "Assignments", path: "/dashboard/assignments" },
    { name: "Practice", path: "/dashboard/practice" },
    { name: "Mock Interview", path: "/dashboard/interviews" }, 
  ];

  const teacherLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Manage Courses", path: "/dashboard/teacher/manage-courses" },
    { name: "Assignments", path: "/dashboard/teacher/assignments" },
    { name: "Post Job", path: "/dashboard/teacher/create-internship" },
    { name: "Add Question", path: "/dashboard/teacher/add-question" },
  ];

  const isTeacher = ['Teacher', 'teacher', 'Creator', 'creator'].includes(role);
  const currentLinks = isTeacher ? teacherLinks : studentLinks;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#FF4A1F] selection:text-white">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#FF4A1F] flex items-center justify-center font-bold text-white text-sm group-hover:rotate-12 transition-transform">
              FB
            </div>
            <span className="font-bold tracking-tight">Fox Bird</span>
            {isTeacher && (
                <span className="hidden sm:block text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 border border-white/5 uppercase tracking-wide">
                    Instructor
                </span>
            )}
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {currentLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            
            {/* STREAK INDICATOR (Students Only) */}
            {!isTeacher && (
                <div className="hidden sm:flex items-center gap-1 text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20" title="Daily Streak">
                    <Flame size={16} className={streak > 0 ? "fill-orange-500 animate-pulse" : ""} />
                    <span className="text-xs font-bold">{streak}</span>
                </div>
            )}

            {/* NOTIFICATION BELL */}
            <div className="relative">
                <button 
                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileDropdownOpen(false); if(!isNotifOpen) markRead(); }}
                    className="p-2 text-gray-400 hover:text-white transition-colors relative"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF4A1F] rounded-full border-2 border-[#0A0A0A]"></span>
                    )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                    {isNotifOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-white">Notifications</h3>
                                {unreadCount > 0 && <span className="text-xs text-[#FF4A1F]">{unreadCount} new</span>}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 text-xs">No notifications yet.</div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.is_read ? 'bg-white/[0.02]' : ''}`}>
                                            <div className="flex gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'warning' ? 'bg-yellow-500' : 'bg-[#FF4A1F]'}`}></div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{notif.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1 leading-snug">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-600 mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setIsProfileDropdownOpen(!isProfileDropdownOpen); setIsNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF4A1F] to-[#FF8C69] flex items-center justify-center text-xs font-bold text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={14} className="text-gray-500 mr-1" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden z-50"
                  >
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user.email}</p>
                      <p className="text-[10px] text-[#FF4A1F] uppercase mt-1">{role}</p>
                    </div>
                    
                    {/* Mobile Links */}
                    <div className="md:hidden border-b border-white/5 pb-2 mb-2">
                        {currentLinks.map(link => (
                            <Link key={link.path} to={link.path} onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <Link to="/dashboard/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                      <User size={16} /> Profile Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 text-left">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet /> 
      </main>
    </div>
  );
}