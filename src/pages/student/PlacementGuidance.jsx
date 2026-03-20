import React from 'react';
import { 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  MessageCircle, 
  Users, 
  FileText, 
  UserPlus, 
  Target, 
  Code, 
  Lightbulb 
} from 'lucide-react';

const PlacementGuidance = () => {
  // Array containing all exact Topmate services from your screenshot
  const services = [
    {
      id: 'priority-dm',
      category: 'Priority DM',
      duration: '2 days reply',
      title: 'Ask me anything',
      desc: 'Got a quick question about placements, tech stacks, or my journey to Infosys & Capgemini? Drop a DM.',
      features: ['Direct access to me', 'Personalized text response'],
      price: 'FREE',
      icon: MessageCircle,
      highlight: false,
      linkId: 'ask_me_anything'
    },
    {
      id: 'webinar',
      category: 'Webinar',
      duration: '180 mins',
      title: 'Hustling The Nextstep 60',
      desc: 'One-day placement workshop for 60 students. Learn • Compete • Win.',
      features: ['Mar 25, 2026', '14:00 - 17:00 GMT+05:30'],
      price: '₹9',
      icon: Users,
      highlight: false,
      badge: 'Upcoming',
      linkId: 'hustling_the_nextstep_60'
    },
    {
      id: 'resume-review',
      category: 'Video meeting',
      duration: '30 mins',
      title: 'Resume review',
      desc: 'Transform your resume to bypass ATS. I\'ll optimize your layout using proven selection strategies.',
      features: ['Line-by-line optimization', 'ATS formatting check'],
      price: '₹29',
      icon: FileText,
      highlight: false,
      linkId: 'resume_review'
    },
    {
      id: 'mentorship',
      category: 'Video meeting',
      duration: '30 mins',
      title: '1:1 Mentorship',
      desc: 'Get a clear, step-by-step preparation plan to crack premium tech roles, tailored to your timeline.',
      features: ['Custom study timeline', 'Tech stack roadmap'],
      price: '₹99',
      icon: UserPlus,
      highlight: true, // This card gets the premium gradient
      badge: 'Popular',
      linkId: '1_1_mentorship'
    },
    {
      id: 'guidance',
      category: 'Video meeting',
      duration: '30 mins',
      title: 'Placement guidance',
      desc: 'Navigate the complex placement process with insider tips on company-specific selection patterns.',
      features: ['Company specific strategies', 'Interview dos and don\'ts'],
      price: '₹99',
      icon: Target,
      highlight: false,
      linkId: 'placement_guidance'
    },
    {
      id: 'mock-interview',
      category: 'Video meeting',
      duration: '60 mins',
      title: 'Mock interview',
      desc: 'Experience a rigorous interview simulation covering DSA and core fundamentals with live feedback.',
      features: ['Live DSA problem solving', 'Detailed feedback report'],
      price: '₹99',
      icon: Code,
      highlight: false,
      linkId: 'mock_interview'
    },
    {
      id: 'prep-tips',
      category: 'Video meeting',
      duration: '30 mins',
      title: 'Interview prep & tips',
      desc: 'Last-minute polish before your big day. Core CS concepts, HR rounds, and confidence building.',
      features: ['HR round strategies', 'Core CS (DBMS, OS) tips'],
      price: '₹149',
      icon: Lightbulb,
      highlight: false,
      linkId: 'interview_prep_tips'
    }
  ];

  return (
    <div className="w-full min-h-[80vh] bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Premium Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Level Up With <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Expert Guidance</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Book a personalized session with Sushanta. Leverage proven strategies to bypass ATS, crack technical rounds, and land premium corporate roles.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          
          {services.map((service) => {
            const Icon = service.icon;
            const isHighlighted = service.highlight;

            return (
              <div 
                key={service.id}
                className={`flex flex-col relative overflow-hidden group transition-all duration-300 rounded-2xl p-8 border
                  ${isHighlighted 
                    ? 'bg-gradient-to-b from-[#1a1a2e] to-[#111] border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] md:-translate-y-2' 
                    : 'bg-[#111] border-gray-800 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                  }
                `}
              >
                {/* Badges */}
                {service.badge && (
                  <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-b-lg text-[10px] font-bold tracking-wider uppercase text-white
                    ${isHighlighted ? 'bg-indigo-500' : 'bg-green-600'}
                  `}>
                    {service.badge}
                  </div>
                )}

                {/* Background Watermark Icon */}
                <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity 
                  ${isHighlighted ? 'text-indigo-500' : 'text-blue-500'}
                `}>
                  <Icon size={100} />
                </div>
                
                <div className="relative z-10 flex-grow mt-2">
                  <p className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">{service.category}</p>
                  <h3 className="text-xl font-bold text-white mb-4 pr-8">{service.title}</h3>
                  
                  <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full text-xs font-semibold mb-6 border
                    ${isHighlighted 
                      ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' 
                      : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    }
                  `}>
                    <Clock size={12} /> {service.duration}
                  </div>
                  
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed min-h-[60px]">
                    {service.desc}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> 
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 mt-auto">
                  <div className="text-3xl font-bold text-white mb-4">{service.price}</div>
                  <a 
                    href={`https://topmate.io/sushanta_pal10/${service.linkId}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors font-semibold
                      ${isHighlighted 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/50' 
                        : (service.price === 'FREE' 
                            ? 'bg-white text-black hover:bg-gray-200' 
                            : 'bg-blue-600 text-white hover:bg-blue-500')
                      }
                    `}
                  >
                    {service.price === 'FREE' ? 'Message Now' : 'Book Session'} <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default PlacementGuidance;
