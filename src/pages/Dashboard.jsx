import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Code, Briefcase, Mic, CheckCircle, ArrowRight, 
  Globe, Shield, Zap 
} from "lucide-react";
import { supabase } from "../supabaseClient";
import MobileNav from "@/components/ui/MobileNav";
import Loader from "../components/Loader";
import dashboardShot from '../assets/dashboard-screenshot.png'; 

import TrustedBy from "../components/TrustedBy"; 
import PricingCard from "../components/PricingCard";

export default function FoxBirdLanding() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth Logic
  const extractRole = (session) => {
    if (!session || !session.user) return null;
    return (
      session.user.app_metadata?.user_role || 
      session.user.user_metadata?.user_role || 
      'Student'
    );
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUserRole(extractRole(session));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserRole(extractRole(session));
    });

    const timer = setTimeout(() => setLoading(false), 1500);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (loading) return <Loader />;

  return (
    <motion.div
      className="min-h-screen bg-[#0A0A0A] text-white antialiased font-sans selection:bg-[#FF4A1F] selection:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* --- NAVBAR --- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4A1F] to-[#FF8C69] flex items-center justify-center font-bold text-black group-hover:rotate-12 transition-transform">
              FB
            </div>
            <span className="font-bold text-lg tracking-tight">Fox Bird</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#internships" className="hover:text-white transition-colors">Internships</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            
            {/* Dynamic Dashboard Link */}
            {isLoggedIn ? (
              <a 
                href="/profile" 
                className="ml-4 px-5 py-2.5 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight size={16}/>
              </a>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <a href="/login" className="hover:text-white">Login</a>
                <a 
                  href="/signup" 
                  className="px-5 py-2.5 bg-[#FF4A1F] text-black rounded-full font-bold hover:brightness-110 transition-all shadow-lg shadow-orange-500/20"
                >
                  Get Started
                </a>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileNavOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-opacity ${isMobileNavOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileNavOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
        
        {/* Mobile Nav Component */}
        <MobileNav open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} isLoggedIn={isLoggedIn} />
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#FF4A1F]/10 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#FF4A1F] mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4A1F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4A1F]"></span>
            </span>
            Now hiring for Virtual Internships
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Bridge the gap between <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4A1F] to-[#FF8C69]">College & Corporate</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Stop watching tutorials. Start building. Join AI-powered internships, 
            get code reviews from senior bots, and earn verified certificates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a 
              href={isLoggedIn ? "/profile" : "/signup"}
              className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              Start Your Career <ArrowRight size={20}/>
            </a>
            <a 
              href="#features"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
            >
              Explore Features
            </a>
          </div>

          {/* Hero Visual Dashboard Preview (FIXED IMAGE SCALING) */}
          <div className="relative mx-auto max-w-6xl">
  {/* top fade */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10 pointer-events-none" />

  <div className="rounded-xl border border-white/10 bg-[#111] p-2 shadow-2xl">
    <div className="rounded-lg overflow-hidden bg-[#0A0A0A]">
      
      <div className="relative w-full h-auto group">
        {/* Screenshot */}
        <img
          src={dashboardShot}
          alt="Internship Workspace Screenshot"
          className="
            w-full h-auto object-contain
            transition-all duration-700 ease-out
            group-hover:scale-[1.01]
          "
        />

        {/* 🔥 Overlay Content */}
        <div className="absolute inset-0 flex items-end justify-center z-20 pointer-events-none">
          <div
            className="
              mb-6
              backdrop-blur-md bg-black/50
              px-8 py-5
              rounded-2xl
              border border-white/10
              text-center
              shadow-xl
              transition-all duration-700
              group-hover:translate-y-[-6px]
              group-hover:bg-black/60
            "
          >
            <div className="w-14 h-14 bg-[#FF4A1F] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/40">
              <Briefcase className="text-black" size={28} />
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white">
              Internship Workspace
            </h3>

            <p className="text-gray-300 text-sm md:text-base mt-1">
              Kanban Board • Code Review • Repo Sync
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>

        </div>
      </section>

     
     

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-20 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete Career Ecosystem</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We don't just teach syntax. We simulate the entire job experience so you are ready for Day 1.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Briefcase className="text-[#FF4A1F]" size={28} />}
              title="Virtual Internships"
              desc="Work on real-world tasks (e.g. 'Fix Auth Bug'). Use a Kanban board, submit PRs, and get promoted from Intern to Architect."
            />
            <FeatureCard 
              icon={<Mic className="text-purple-500" size={28} />}
              title="AI Mock Interviews"
              desc="Speak your answers. Our AI analyzes your voice, confidence, and technical accuracy to give you a hiring score instantly."
            />
            <FeatureCard 
              icon={<Code className="text-green-500" size={28} />}
              title="Coding Arena"
              desc="Solve DSA problems and build mini-projects in our browser-based IDE. Earn coins and badges for every passing test case."
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-500" size={28} />}
              title="Instant Feedback"
              desc="No waiting for mentors. Our AI Senior Architect reviews your code line-by-line and rejects lazy submissions immediately."
            />
            <FeatureCard 
              icon={<Globe className="text-blue-500" size={28} />}
              title="Global Leaderboard"
              desc="Compete with thousands of students. Climb the ranks based on XP earned from internships and challenges."
            />
            <FeatureCard 
              icon={<Shield className="text-red-500" size={28} />}
              title="Verified Certificates"
              desc="Earn credentials that actually matter. Download PDF certificates with unique IDs upon project completion."
            />
          </div>
        </div>
      </section>

      {/* --- INTERNSHIP PREVIEW SECTION --- */}
      <section id="internships" className="py-20 bg-[#0F0F10] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 bg-orange-500/10 text-[#FF4A1F] rounded-full text-sm font-bold mb-4 border border-orange-500/20">
              Simulation Engine
            </div>
            <h2 className="text-4xl font-bold mb-4">Experience the Job <br/> Before You Get the Job.</h2>
            <p className="text-gray-400 text-lg mb-6">
              Fox Bird gives you a workspace that mimics top tech companies. You don't just watch videos; you move tickets, write code, and push to production.
            </p>
            
            <ul className="space-y-3 mb-8">
              {[
                "Kanban Board Task Management",
                "Strict 'Senior Dev' AI Code Review",
                "Automated XP & Coin Rewards",
                "GitHub Repository Integration"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF4A1F]/20 flex items-center justify-center">
                    <CheckCircle size={14} className="text-[#FF4A1F]" />
                  </div>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>

            <a href="/student/internships" className="px-8 py-3 bg-[#FF4A1F] text-black font-bold rounded-full hover:brightness-110 transition-all">
              View Available Roles
            </a>
          </div>

          <div className="relative">
            {/* Visual Representation of Kanban/IDE */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl relative z-10 rotate-1 hover:rotate-0 transition-transform duration-500">
               <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500"/>
                     <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                     <div className="w-3 h-3 rounded-full bg-green-500"/>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">FoxBird Workspace v2.0</div>
               </div>
               
               <div className="flex gap-4">
                  {/* Fake Kanban Columns */}
                  <div className="w-1/3 bg-[#111] rounded-lg p-3 space-y-3">
                     <div className="text-xs text-gray-500 font-bold uppercase">To Do</div>
                     <div className="bg-[#222] p-3 rounded text-xs border-l-2 border-orange-500">Fix Login API</div>
                     <div className="bg-[#222] p-3 rounded text-xs border-l-2 border-orange-500">Setup Database</div>
                  </div>
                  <div className="w-1/3 bg-[#111] rounded-lg p-3 space-y-3">
                     <div className="text-xs text-gray-500 font-bold uppercase">In Progress</div>
                     <div className="bg-[#222] p-3 rounded text-xs border-l-2 border-blue-500">
                        Design Home Page
                        <div className="mt-2 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 w-2/3"></div>
                        </div>
                     </div>
                  </div>
                  <div className="w-1/3 bg-[#111] rounded-lg p-3 space-y-3">
                     <div className="text-xs text-gray-500 font-bold uppercase">Done</div>
                     <div className="bg-[#222] p-3 rounded text-xs border-l-2 border-green-500 flex justify-between items-center">
                        <span>Deploy App</span>
                        <CheckCircle size={12} className="text-green-500"/>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FF4A1F]/20 blur-[100px] -z-10 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-20 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">Invest in Your Career</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            {/* Simplified Pricing Cards for Layout */}
            <PricingCard 
               tier="Free Tier" 
               price="0" 
               features={["Access to Practice Arena", "1 Mock Interview", "Community Support"]} 
            />
            <PricingCard 
               tier="Pro Intern" 
               price="499" 
               highlighted={true}
               features={["Unlimited Internships", "AI Code Reviews", "Verified Certificates", "Priority Support"]} 
            />
            <PricingCard 
               tier="Lifetime" 
               price="2999" 
               features={["Lifetime Access", "1-on-1 Mentorship", "Job Referrals", "Private Discord"]} 
            />
          </div>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <section className="py-16 border-t border-white/10 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to become a Senior Dev?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join the community of developers who are learning by doing. No more passive watching.
          </p>
          <a href="/signup" className="inline-block px-10 py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform">
            Get Started Now
          </a>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-black py-8 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>&copy; 2025 Fox Bird (Motia). All rights reserved.</p>
      </footer>

    </motion.div>
  );
}

// --- HELPER COMPONENT: FEATURE CARD ---
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-[#111] border border-white/5 hover:border-white/10 hover:bg-[#161616] transition-all group">
      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/5">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}