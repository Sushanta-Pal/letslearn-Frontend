import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, Star, LayoutDashboard, Briefcase, 
  BookOpen, FileEdit, Dumbbell, Mic, Users, Crown, Sparkles, 
  BarChart3, Check, Loader2 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; 

// --- Advanced 3D Hover Card Wrapper ---
const Hover3DCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div
      style={{ perspective: 1000 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      <motion.div style={{ rotateX, rotateY }} className="w-full h-full transition-shadow duration-300">
        {children}
      </motion.div>
    </motion.div>
  );
};

// --- Smooth Reveal Animation Wrapper ---
const Reveal = ({ children, delay = 0, direction = "up" }) => {
  const yOffset = direction === "up" ? 40 : direction === "down" ? -40 : 0;
  const xOffset = direction === "left" ? 40 : direction === "right" ? -40 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, type: "spring", bounce: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// --- Infinite Testimonial Slider ---
const InfiniteSlider = ({ items }) => {
  const duplicatedItems = [...items, ...items, ...items]; 

  return (
    <div className="relative w-full overflow-hidden py-10">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none"></div>
      
      <motion.div
        className="flex gap-6 w-max cursor-grab active:cursor-grabbing"
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
      >
        {duplicatedItems.map((testi, idx) => (
          <div key={idx} className="w-[350px] md:w-[420px] bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-8 rounded-3xl flex flex-col shrink-0 hover:border-[#FF4A1F]/50 hover:bg-neutral-900 transition-all duration-300 group">
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-[#FF4A1F] text-[#FF4A1F]" />
              ))}
            </div>
            <p className="text-neutral-300 mb-8 leading-relaxed text-sm md:text-base flex-grow">"{testi.quote}"</p>
            <div className="flex items-center gap-4 border-t border-neutral-800 pt-6">
              {testi.avatar_url ? (
                <img src={testi.avatar_url} alt={testi.name} className="w-12 h-12 rounded-full object-cover border-2 border-neutral-800 group-hover:border-[#FF4A1F] transition-colors" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-[#FF4A1F] border-2 border-neutral-700 group-hover:border-[#FF4A1F] transition-colors">
                  {testi.name.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="text-white font-bold">{testi.name}</h4>
                <p className="text-xs font-medium text-[#FF4A1F]">{testi.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTesti, setLoadingTesti] = useState(true);

  const defaultTestimonials = [
    { quote: "The mock interview feedback was a game-changer. It caught that I was fumbling my STAR method answers. Fixed it and cracked Infosys.", name: "Priya K.", role: "SDE — Infosys", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { quote: "I was ignoring aptitude until I saw my Placium dashboard scores. The practice sets are exactly what companies ask.", name: "Arjun M.", role: "Associate — Wipro", avatar_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80" },
    { quote: "Upgrading to Pro for the 1-on-1 guidance was the best ROI. My mentor completely restructured my ATS resume.", name: "Sneha B.", role: "Analyst — TCS", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(defaultTestimonials);
        }
      } catch (error) {
        console.error("Error fetching testimonials, using fallback.", error.message);
        setTestimonials(defaultTestimonials);
      } finally {
        setLoadingTesti(false);
      }
    };
    fetchTestimonials();
  }, []);

  const features = [
    { icon: LayoutDashboard, title: "Overview", desc: "Your personal command center. Track your ATS score, upcoming interviews, and daily progress." },
    { icon: Briefcase, title: "Internships", desc: "Access verified, real-world internship opportunities to build your resume." },
    { icon: BookOpen, title: "Courses", desc: "Structured learning paths for Aptitude, DSA, and Core CS subjects." },
    { icon: FileEdit, title: "Assignments", desc: "Validate your skills with hands-on assignments. Get instant feedback." },
    { icon: Dumbbell, title: "Practice", desc: "Grind through 500+ company-specific questions for TCS, Infosys, and Wipro." },
    { icon: Mic, title: "Mock Interview", desc: "Face our AI interviewer. Get real-time feedback on tone and structure." },
    { icon: Users, title: "1-on-1 Guidance", desc: "Book sessions with mentors working at your dream companies." },
    { icon: Crown, title: "Upgrade Pro", desc: "Unlock unlimited AI interviews and guaranteed resume reviews." },
  ];

  return (
    <div className="min-h-screen bg-transparent text-neutral-50 font-sans relative overflow-hidden">
      
      <Helmet>
        <title>Placium | Your Campus to Corporate Roadmap</title>
        <meta name="description" content="Bridge the gap between college and your dream job. Internships, mock interviews, practice sets, and 1-on-1 guidance for engineering freshers." />
      </Helmet>

      {/* --- DYNAMIC AMBIENT GLOW --- */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FF4A1F] rounded-full mix-blend-screen filter blur-[150px] pointer-events-none -z-10"
      />

      {/* =========================================
          1. HERO SECTION
          ========================================= */}
      <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-32">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="flex flex-col items-start text-left z-10">
            <Reveal>
              <motion.div 
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255,74,31,0.4)" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-medium mb-8 cursor-pointer transition-shadow duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF4A1F]/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF4A1F]" />
                </div>
                <span>Meet Placium — The Ultimate Placement OS</span>
              </motion.div>
            </Reveal>
            
            <Reveal delay={0.1}>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 text-white">
                Stop Guessing. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4A1F] to-orange-400 drop-shadow-lg">
                  Start Getting Placed.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-lg leading-relaxed">
                The ultimate ecosystem for freshers. From securing your first internship to cracking technical rounds with AI mock interviews.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link to="/signup" className="relative overflow-hidden w-full sm:w-auto bg-[#FF4A1F] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center group transition-all shadow-[0_0_40px_-10px_rgba(255,74,31,0.6)] hover:shadow-[0_0_60px_-10px_rgba(255,74,31,0.8)] hover:-translate-y-1">
                  <span className="relative z-10 flex items-center">
                    Enter Workspace <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                </Link>
                <Link to="/pricing" className="w-full sm:w-auto bg-transparent text-white border border-neutral-700 px-8 py-4 rounded-xl font-bold flex items-center justify-center hover:bg-neutral-900 transition-colors">
                  View Pro Features
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right Visual - Redesigned Pro Floating Widgets */}
          <Reveal delay={0.4} direction="left">
            <Hover3DCard className="relative w-full h-[380px] md:h-[450px] lg:h-[600px] flex items-center justify-center mt-12 md:mt-0">
              
              {/* Pulsing Holographic Aura for the widgets */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr from-[#FF4A1F]/20 to-orange-500/10 rounded-full blur-3xl z-0"
              />

              {/* Main Central Widget: AI Interview Feedback */}
              <motion.div 
                animate={{ y: [-8, 8, -8] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute z-20 w-[280px] sm:w-[320px] md:w-[400px] bg-neutral-900/90 backdrop-blur-2xl border border-neutral-800/80 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-5 md:p-7"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5 md:mb-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#FF4A1F]/20 to-orange-500/10 border border-[#FF4A1F]/30 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
                      <Mic className="w-5 h-5 md:w-6 md:h-6 text-[#FF4A1F]" />
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-bold text-white leading-none mb-1">AI Feedback</p>
                      <p className="text-[10px] md:text-xs text-neutral-400 font-medium">Technical Round</p>
                    </div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-xs font-bold">
                    88 / 100
                  </div>
                </div>
                
                {/* Summary Box */}
                <div className="bg-neutral-950/60 border border-neutral-800/50 rounded-xl p-3 md:p-4 mb-5 md:mb-6">
                  <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
                    <span className="text-white font-bold">Strong:</span> Excellent STAR method usage.<br/>
                    <span className="text-orange-400 font-bold">Focus:</span> Pacing is slightly fast.
                  </p>
                </div>

                {/* Metrics */}
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <div className="flex justify-between text-xs md:text-sm font-medium mb-1.5 md:mb-2">
                      <span className="text-neutral-400">Communication</span>
                      <span className="text-white font-bold">92%</span>
                    </div>
                    <div className="h-1.5 md:h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-[#FF4A1F] rounded-full"></motion.div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs md:text-sm font-medium mb-1.5 md:mb-2">
                      <span className="text-neutral-400">Technical Depth</span>
                      <span className="text-white font-bold">85%</span>
                    </div>
                    <div className="h-1.5 md:h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 1.5, delay: 0.7 }} className="h-full bg-orange-400 rounded-full"></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Top Accent Widget: ATS Resume Score */}
              <motion.div 
                animate={{ y: [10, -10, 10] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-8 right-0 md:-top-6 md:-right-8 z-30 w-44 md:w-56 bg-neutral-900/95 backdrop-blur-3xl border border-neutral-800 p-4 md:p-5 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
              >
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <div className="bg-neutral-800/80 p-1.5 md:p-2 rounded-lg">
                    <BarChart3 className="text-white w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider">ATS Match</p>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl md:text-4xl font-black text-white">94%</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1.5 rounded-md w-max">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Shortlist Ready
                </div>
              </motion.div>

            </Hover3DCard>
          </Reveal>
        </div>
      </section>

      {/* =========================================
          2. PLATFORM ECOSYSTEM (Staggered Grid)
          ========================================= */}
      <section className="py-24 relative bg-neutral-950 border-t border-neutral-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <Reveal>
              <span className="text-[#FF4A1F] font-bold tracking-widest uppercase text-xs mb-3 block">Everything You Need</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2 text-white">One Workspace.<br/>Infinite Opportunities.</h2>
            </Reveal>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -10 }}
                className={`p-6 rounded-3xl border h-full transition-all duration-300 cursor-default
                  ${feature.title === 'Upgrade Pro' 
                    ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-[#FF4A1F]/50 shadow-[0_0_30px_-10px_rgba(255,74,31,0.3)]' 
                    : 'bg-neutral-900/30 border-neutral-800 hover:bg-neutral-900/80 hover:border-neutral-700 shadow-xl'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner
                  ${feature.title === 'Upgrade Pro' ? 'bg-[#FF4A1F] text-white' : 'bg-neutral-800 text-[#FF4A1F]'}`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  {feature.title} 
                  {feature.title === 'Upgrade Pro' && <span className="flex h-2 w-2 rounded-full bg-[#FF4A1F] animate-pulse"></span>}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================
          3. SUPABASE TESTIMONIAL SLIDER
          ========================================= */}
      <section className="py-24 bg-neutral-950 border-y border-neutral-900">
        <div className="container mx-auto px-6 mb-12">
          <div className="text-center">
            <Reveal>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-10">Our alumni are cracking offers at</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500 mb-16">
                  <span className="font-extrabold text-xl md:text-2xl text-white tracking-tighter">TCS</span>
                  <span className="font-extrabold text-xl md:text-2xl text-[#007CC3] tracking-tighter">Infosys</span>
                  <span className="font-extrabold text-xl md:text-2xl text-white tracking-tighter">Wipro</span>
                  <span className="font-extrabold text-xl md:text-2xl text-[#A100FF] tracking-tighter">Accenture</span>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal>
           {loadingTesti ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-[#FF4A1F] animate-spin" />
             </div>
           ) : (
             <InfiniteSlider items={testimonials} />
           )}
        </Reveal>
      </section>

      {/* =========================================
          4. CTA BANNER
          ========================================= */}
      <section className="py-24 px-6 relative bg-neutral-950">
        <Reveal>
          <div className="container mx-auto max-w-5xl bg-[#FF4A1F] rounded-[3rem] p-10 md:p-20 text-center shadow-[0_0_80px_-20px_rgba(255,74,31,0.5)] relative overflow-hidden group">
            <motion.div 
              animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-white/30 transition-colors"
            />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">Your dream company is hiring.<br/>Are you ready?</h2>
              <p className="text-white/90 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
                Join 10,000+ students who stopped wishing and started preparing. Access the premium workspace today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link to="/signup" className="w-full sm:w-auto bg-neutral-950 text-white px-10 py-5 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl flex items-center justify-center border border-neutral-800 text-lg">
                  Launch Workspace <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
}