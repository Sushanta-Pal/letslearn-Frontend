import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Code, Briefcase, Mic, CheckCircle, ArrowRight,
  Globe, Shield, Zap, Menu, X
} from "lucide-react";
import { supabase } from "../supabaseClient";
import MobileNav from "@/components/ui/MobileNav"; // Ensure this path is correct
import Loader from "../components/Loader"; // Ensure this path is correct
import dashboardShot from '../assets/dashboard-screenshot.png'; // Ensure this path is correct

// You might need these components if they exist, otherwise remove them
 import TrustedBy from "../components/TrustedBy"; 
 import PricingCard from "../components/PricingCard";

// Simplified Pricing Card component for this file if not imported
// const PricingCard = ({ tier, price, features, highlighted }) => (
//   <div className={`p-8 rounded-3xl border flex flex-col h-full ${highlighted ? 'bg-[#111] border-[#FF4A1F] shadow-2xl shadow-orange-900/20' : 'bg-[#0A0A0A] border-gray-800'}`}>
//     <h3 className="text-lg font-medium text-gray-400 mb-2">{tier}</h3>
//     <div className="text-4xl font-bold text-white mb-6">
//       ${price}<span className="text-lg text-gray-500 font-normal">/mo</span>
//     </div>
//     <ul className="space-y-4 mb-8 flex-1">
//       {features.map((feat, i) => (
//         <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
//           <CheckCircle size={16} className="text-[#FF4A1F] mt-0.5 shrink-0" />
//           <span>{feat}</span>
//         </li>
//       ))}
//     </ul>
//     <button className={`w-full py-3 rounded-xl font-bold transition-all ${highlighted ? 'bg-[#FF4A1F] text-black hover:brightness-110' : 'bg-white text-black hover:bg-gray-200'}`}>
//       Choose Plan
//     </button>
//   </div>
// );

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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUserRole(extractRole(session));
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserRole(extractRole(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#111] antialiased font-sans selection:bg-[#FF4A1F] selection:text-white dark:bg-[#050505] dark:text-white transition-colors duration-300">
      
      {/* --- NAVBAR --- */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#FF4A1F] flex items-center justify-center font-bold text-white group-hover:rotate-12 transition-transform">
              FB
            </div>
            <span className="font-bold text-xl tracking-tight">Fox Bird</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-[#FF4A1F] transition-colors">Platform</a>
            <a href="#internships" className="hover:text-[#FF4A1F] transition-colors">Internships</a>
            <a href="#pricing" className="hover:text-[#FF4A1F] transition-colors">Pricing</a>
            
            <div className="flex items-center gap-4 ml-4">
              {isLoggedIn ? (
                <a 
                  href="/profile" 
                  className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  Dashboard <ArrowRight size={16}/>
                </a>
              ) : (
                <>
                  <a href="/login" className="hover:text-[#FF4A1F]">Login</a>
                  <a 
                    href="/signup" 
                    className="px-5 py-2 bg-[#FF4A1F] text-white rounded-lg font-semibold hover:bg-[#e03e13] transition-all shadow-md shadow-orange-500/20"
                  >
                    Join Now
                  </a>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-gray-900 dark:text-white"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          >
            {isMobileNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Nav Component */}
        <MobileNav open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} isLoggedIn={isLoggedIn} />
      </header>

      <main className="max-w-7xl mx-auto px-6">

        {/* --- HERO SECTION --- */}
        <section className="pt-24 pb-20 text-center relative">
          {/* Subtle Background Blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#FF4A1F]/10 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/20 text-xs font-bold text-[#FF4A1F] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4A1F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4A1F]"></span>
              </span>
              Now hiring for Virtual Internships
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-gray-900 dark:text-white">
              Build your career <br />
              <span className="text-[#FF4A1F]">in the real world.</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join an inclusive global community for anyone passionate about technology. 
              We foster collaboration, innovation, and career growth through virtual internships.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <a 
                href={isLoggedIn ? "/profile" : "/signup"}
                className="px-8 py-4 bg-[#FF4A1F] text-white rounded-xl font-bold text-lg hover:bg-[#e03e13] transition-all shadow-xl shadow-orange-500/20 flex items-center gap-2"
              >
                Start Learning <ArrowRight size={20}/>
              </a>
              <a 
                href="#features"
                className="px-8 py-4 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold text-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050505] via-transparent to-transparent z-10 pointer-events-none h-40 bottom-0 top-auto" />
              <img 
                src={dashboardShot} 
                alt="Dashboard Preview" 
                className="w-full h-auto object-cover transform transition-transform hover:scale-[1.02] duration-700"
              />
            </div>
          </motion.div>
        </section>

        {/* --- FEATURES GRID (Bento Style) --- */}
        <section id="features" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Everything you need to grow</h2>
            <p className="text-gray-600 dark:text-gray-400">A complete ecosystem designed to take you from student to professional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Briefcase className="text-white" size={24} />}
              color="bg-[#FF4A1F]"
              title="Virtual Internships"
              desc="Work on real-world tasks. Use a Kanban board, submit PRs, and get promoted."
            />
            <FeatureCard 
              icon={<Mic className="text-white" size={24} />}
              color="bg-purple-600"
              title="AI Mock Interviews"
              desc="Practice speaking confidently. Get instant AI analysis on your answers."
            />
            <FeatureCard 
              icon={<Code className="text-white" size={24} />}
              color="bg-green-600"
              title="Coding Arena"
              desc="Solve DSA problems in our IDE. Earn coins for every passing test case."
            />
            <FeatureCard 
              icon={<Zap className="text-white" size={24} />}
              color="bg-yellow-500"
              title="Instant Feedback"
              desc="No waiting. Our AI Senior Architect reviews your code line-by-line."
            />
            <FeatureCard 
              icon={<Globe className="text-white" size={24} />}
              color="bg-blue-600"
              title="Global Leaderboard"
              desc="Compete with thousands. Climb ranks based on XP earned."
            />
            <FeatureCard 
              icon={<Shield className="text-white" size={24} />}
              color="bg-red-600"
              title="Verified Certificates"
              desc="Earn credentials that matter. Download PDF certificates with unique IDs."
            />
          </div>
        </section>

        {/* --- INTERNSHIPS HIGHLIGHT --- */}
        <section id="internships" className="py-20">
          <div className="bg-[#111] dark:bg-[#111] rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4A1F]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <div className="inline-block px-4 py-1.5 bg-[#FF4A1F] rounded-full text-sm font-bold mb-6 text-white">
                  Simulation Engine v2.0
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Experience the job <br/> before you get the job.
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Fox Bird mimics a top-tier tech company workspace. You don't just watch videos; you move Jira tickets, write production code, submit Pull Requests, and debug live issues.
                </p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    "Kanban Board Task Management",
                    "Strict 'Senior Dev' AI Code Review",
                    "Automated XP & Coin Rewards",
                    "GitHub Repository Integration"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                        <CheckCircle size={14} className="text-[#111]" />
                      </div>
                      <span className="text-gray-200 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <a href="/student/internships" className="inline-block px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all">
                  View Available Roles
                </a>
              </div>

              {/* IDE Visual */}
              <div className="relative">
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500">
                  {/* Fake IDE Header */}
                  <div className="bg-[#222] p-3 flex gap-2 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  {/* Fake Code Content */}
                  <div className="p-6 font-mono text-sm space-y-2 text-gray-300">
                    <div className="flex gap-4"><span className="text-gray-600">1</span> <span className="text-purple-400">const</span> <span className="text-blue-400">submitPR</span> = <span className="text-purple-400">async</span> () ={">"} {"{"}</div>
                    <div className="flex gap-4"><span className="text-gray-600">2</span> &nbsp;&nbsp;<span className="text-purple-400">await</span> github.<span className="text-yellow-400">push</span>(code);</div>
                    <div className="flex gap-4"><span className="text-gray-600">3</span> &nbsp;&nbsp;<span className="text-gray-500">// AI Review running...</span></div>
                    <div className="flex gap-4"><span className="text-gray-600">4</span> &nbsp;&nbsp;<span className="text-green-400">return</span> <span className="text-orange-400">"Approved"</span>;</div>
                    <div className="flex gap-4"><span className="text-gray-600">5</span> {"}"}</div>
                  </div>
                  {/* Fake Console */}
                  <div className="bg-black p-4 border-t border-white/10 text-xs font-mono">
                    <div className="text-green-400">{">"} Tests passed: 12/12</div>
                    <div className="text-blue-400">{">"} Deploying to production...</div>
                    <div className="text-white animate-pulse">{">"} _</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Invest in your future</h2>
            <p className="text-gray-600 dark:text-gray-400">Simple, transparent pricing. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              tier="Free Tier" 
              price="0" 
              features={["Access to Practice Arena", "1 Mock Interview", "Community Support"]} 
            />
            <PricingCard 
              tier="Pro Intern" 
              price="49" 
              highlighted={true}
              features={["Unlimited Internships", "AI Code Reviews", "Verified Certificates", "Priority Support"]} 
            />
            <PricingCard 
              tier="Lifetime" 
              price="299" 
              features={["Lifetime Access", "1-on-1 Mentorship", "Job Referrals", "Private Discord"]} 
            />
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-white/10 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#111] dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">FB</div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Fox Bird</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; 2025 Fox Bird. Built for the builders.
          </p>
        </div>
      </footer>

    </div>
  );
}

// --- HELPER COMPONENT: FEATURE CARD (Updated Style) ---
function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all hover:shadow-xl group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-md ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}