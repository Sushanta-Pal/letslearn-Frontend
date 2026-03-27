import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { CheckCircle2, Trophy, Code, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, type: "spring", bounce: 0.2 }}
  >
    {children}
  </motion.div>
);

// Advanced 3D Hover for the Founder Photo
const Hover3DImage = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  return (
    <motion.div
      style={{ perspective: 1000, rotateX, rotateY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-8 rounded-[2.5rem] shadow-2xl transition-all"
    >
      {children}
    </motion.div>
  );
};

export default function AboutFounder() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 pt-32 pb-20 overflow-hidden relative">
      
      {/* --- DYNAMIC AMBIENT GLOW --- */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.2, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF4A1F] rounded-full mix-blend-screen filter blur-[150px] pointer-events-none -z-10"
      />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          
          <div className="order-2 lg:order-1 flex flex-col">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-medium mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#FF4A1F] animate-pulse"></span>
                Founder's Story
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
                Built by someone who cracked the system — <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4A1F] to-orange-400">and wants you to, too.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="space-y-6 text-lg text-neutral-400 leading-relaxed font-medium">
                <p>
                  I started Placium after seeing brilliant batch-mates lose out on placement drives simply because they didn't know how to present their skills or navigate the ATS filters.
                </p>
                <p>
                  As an Information Technology student myself, I realized preparation shouldn't be based on luck. I structured my own learning, mastered full-stack development, and ultimately cracked the highly competitive <strong className="text-white">SP L1 role at Infosys</strong>.
                </p>
                <p>
                  I didn't pay for ₹50,000 coaching institutes. I relied on structured patterns, rigorous mock interviews, and continuous feedback. Placium is the exact framework I used, scaled into an AI platform for you.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-wrap gap-4">
                <span className="px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 text-white text-sm font-bold flex items-center gap-2 hover:border-[#FF4A1F] transition-colors shadow-lg">
                  <Trophy className="w-4 h-4 text-[#FF4A1F]" /> Infosys SP L1 Selected
                </span>
                <span className="px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 text-white text-sm font-bold flex items-center gap-2 hover:border-[#FF4A1F] transition-colors shadow-lg">
                  <Code className="w-4 h-4 text-orange-400" /> B.Tech Information Technology
                </span>
                <span className="px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 text-white text-sm font-bold flex items-center gap-2 hover:border-[#FF4A1F] transition-colors shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> 360+ LeetCode Solved
                </span>
              </div>
            </Reveal>
          </div>

          {/* IMAGE COLUMN WITH 3D HOVER */}
          <Reveal delay={0.4}>
            <div className="order-1 lg:order-2 relative group cursor-crosshair">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF4A1F]/30 to-transparent rounded-[3rem] blur-3xl transform rotate-6 group-hover:rotate-12 transition-all duration-700"></div>
              
              <Hover3DImage>
                {/* PHOTO ADDED HERE */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full mb-8 border-4 border-neutral-950 shadow-[0_0_30px_rgba(255,74,31,0.3)] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=400&q=80" 
                    alt="Sushanta Pal - Founder of Placium" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-2">Sushanta Pal</h3>
                <p className="text-[#FF4A1F] font-bold tracking-widest uppercase text-sm mb-8">Founder & Architect, Placium</p>
                
                <blockquote className="text-xl italic font-medium text-neutral-300 border-l-4 border-[#FF4A1F] pl-6 py-2 leading-relaxed bg-neutral-950/30 rounded-r-2xl pr-4">
                  "If I can crack a top MNC role with just structured preparation and the right strategy, so can you. Stop guessing, start preparing."
                </blockquote>
              </Hover3DImage>
            </div>
          </Reveal>

        </div>

        {/* CTA Section */}
        <Reveal delay={0.5}>
          <div className="bg-gradient-to-br from-[#FF4A1F] to-[#d63b15] rounded-[3rem] p-10 md:p-20 text-center shadow-[0_0_60px_-15px_rgba(255,74,31,0.6)] relative overflow-hidden">
             <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white leading-tight">Ready to start your journey?</h2>
               <p className="text-white/90 mb-10 max-w-2xl mx-auto text-xl font-medium">
                 Join the students who stopped wishing and started preparing. Access the exact roadmap used to clear top IT service companies.
               </p>
               <Link to="/signup" className="inline-flex items-center justify-center bg-neutral-950 text-white px-10 py-5 rounded-2xl font-bold hover:scale-105 transition-transform shadow-2xl border border-neutral-800 text-lg">
                 Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
               </Link>
             </div>
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-black/30 rounded-full blur-2xl"></div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}