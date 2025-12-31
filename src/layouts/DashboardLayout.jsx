import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { LogOut, User, Bell, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Start null to wait for check
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
      
      // 1. EXTRACT ROLE SAFELY
      // Check both app_metadata (secure) and user_metadata (editable)
      const rawRole = data.user.app_metadata?.user_role || data.user.user_metadata?.user_role || 'student';
      setRole(rawRole);
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // 2. DEFINE LINKS
  const studentLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Internships", path: "/dashboard/internships" },
    { name: "Courses", path: "/dashboard/courses" },
    { name: "Assignments", path: "/dashboard/assignments" },
    { name: "Practice", path: "/dashboard/practice" },
    { name: "Mock Interview", path: "/dashboard/interviews" }, // <--- ADDED
  ];

  const teacherLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Manage Courses", path: "/dashboard/teacher/manage-courses" },
    { name: "Assignments", path: "/dashboard/teacher/assignments" },
    { name: "Post Job", path: "/dashboard/teacher/create-internship" },
    { name: "Add Question", path: "/dashboard/teacher/add-question" },
  ];

  // 3. ROBUST ROLE CHECK (Case Insensitive)
  // Handles 'Teacher', 'teacher', 'Creator', 'creator'
  const isTeacher = ['Teacher', 'teacher', 'Creator', 'creator'].includes(role);
  
  const currentLinks = isTeacher ? teacherLinks : studentLinks;

  // Prevent rendering until auth is checked
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#FF4A1F] selection:text-white">
      
      {/* --- TOP NAVIGATION (Sticky) --- */}
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

          {/* Desktop Links (Dynamic) */}
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
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4A1F] rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
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
                    
                    {/* Mobile Menu Links (Visible only on small screens inside dropdown) */}
                    <div className="md:hidden border-b border-white/5 pb-2 mb-2">
                        {currentLinks.map(link => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                onClick={() => setIsProfileDropdownOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <Link to="/dashboard/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                      <User size={16} /> Profile Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 text-left"
                    >
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