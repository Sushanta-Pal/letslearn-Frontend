import React from 'react';
import { Clock, ExternalLink, Briefcase, Code, Rocket, CheckCircle2 } from 'lucide-react';

const PlacementGuidance = () => {
  return (
    <div className="w-full min-h-[80vh] bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Premium Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            1-on-1 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Placement Guidance</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Book a personalized session with Sushanta. Leverage proven strategies to bypass ATS, crack technical rounds, and land premium corporate roles.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Service 1: Resume Review */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 flex flex-col hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
              <Briefcase size={80} />
            </div>
            
            <div className="relative z-10 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Resume Review & Feedback</h3>
              </div>
              <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 w-fit px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-blue-500/20">
                <Clock size={14} /> 15 mins
              </div>
              
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Transform your resume to bypass ATS. I'll optimize your layout using the exact strategies that helped me secure Infosys SP L1 & Capgemini.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-green-500 mt-0.5" /> Line-by-line project optimization</li>
                <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-green-500 mt-0.5" /> ATS formatting check</li>
              </ul>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="text-3xl font-bold text-white mb-4">₹99</div>
              <a 
                href="https://topmate.io/sushanta_pal10/123456" // Replace 123456 with exact service ID
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-500 transition-colors font-semibold"
              >
                Book Session <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Service 2: Mock Interview (Highlighted) */}
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#111] border border-indigo-500/50 rounded-2xl p-8 flex flex-col hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-300 relative overflow-hidden group transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-b-lg text-xs font-bold tracking-wider uppercase">
              Most Popular
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-indigo-500">
              <Code size={80} />
            </div>

            <div className="relative z-10 flex-grow mt-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Mock Technical Interview</h3>
              </div>
              <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 w-fit px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-indigo-500/20">
                <Clock size={14} /> 45 mins
              </div>
              
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Experience a rigorous interview simulation covering DSA and MERN. Receive immediate, actionable feedback to pinpoint your weak spots.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-green-500 mt-0.5" /> Live DSA problem solving</li>
                <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-green-500 mt-0.5" /> Core CS (DBMS, OS) grilling</li>
                <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-green-500 mt-0.5" /> Detailed feedback report</li>
              </ul>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="text-3xl font-bold text-white mb-4">₹249</div>
              <a 
                href="https://topmate.io/sushanta_pal10/123457" // Replace 123457 with exact service ID
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-500 transition-colors font-semibold shadow-lg shadow-indigo-900/50"
              >
                Book Session <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Service 3: Roadmap */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 flex flex-col hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
              <Rocket size={80} />
            </div>

            <div className="relative z-10 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Product Role Roadmap</h3>
              </div>
              <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 w-fit px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-blue-500/20">
                <Clock size={14} /> 30 mins
              </div>
              
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Get a clear, step-by-step preparation plan to crack premium tech roles, tailored specifically to your timeline and current tech stack.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-green-500 mt-0.5" /> Custom study timeline</li>
                <li className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 size={16} className="text-green-500 mt-0.5" /> Which LeetCode patterns to do</li>
              </ul>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="text-3xl font-bold text-white mb-4">₹199</div>
              <a 
                href="https://topmate.io/sushanta_pal10/123458" // Replace 123458 with exact service ID
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors font-semibold border border-gray-700 hover:border-gray-600"
              >
                Book Session <ExternalLink size={18} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlacementGuidance;