import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for testing the waters and seeing how our AI evaluates you.",
      features: [
        { name: "50 aptitude questions", included: true },
        { name: "Basic resume template (1)", included: true },
        { name: "3 AI mock interviews/month", included: true },
        { name: "Community access", included: true },
        { name: "Live mentor sessions", included: false },
        { name: "Company-specific packs", included: false },
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "₹99",
      period: "per month",
      description: "Everything you need to crack top MNCs like Infosys, TCS, and Wipro.",
      features: [
        { name: "Unlimited aptitude practice", included: true },
        { name: "ATS Resume Builder + Scanner", included: true },
        { name: "Unlimited AI mock interviews", included: true },
        { name: "Company-specific question packs", included: true },
        { name: "2 live mentor sessions/month", included: true },
        { name: "Placement leaderboard", included: true },
      ],
      buttonText: "Start with Pro",
      buttonVariant: "primary",
      highlighted: true,
      badge: "⭐ Most Popular",
      urgency: "⚡ Only 12 Pro seats left this batch"
    },
    {
      name: "Premium",
      price: "₹999",
      period: "lifetime access",
      description: "The ultimate arsenal for the entire placement season.",
      features: [
        { name: "Everything in Pro", included: true },
        { name: "Unlimited mentor sessions", included: true },
        { name: "Priority interview scheduling", included: true },
        { name: "Group Discussion coaching", included: true },
        { name: "Guaranteed resume review", included: true },
        { name: "Placement drive notifications", included: true },
      ],
      buttonText: "Get Lifetime Access",
      buttonVariant: "outline",
      highlighted: false,
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 pt-32 pb-20 px-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-screen-xl h-full pointer-events-none -z-10 opacity-20">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FF4A1F] rounded-full mix-blend-screen filter blur-[150px] animate-pulse"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-[#FF4A1F] font-bold tracking-wider uppercase text-xs mb-4 block">Pricing</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
              Invest Once. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4A1F] to-orange-400">Get Placed.</span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Skip the expensive ₹50,000 coaching institutes. Get AI-driven preparation mapped to exact company patterns for a fraction of the cost.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, idx) => (
            <Reveal delay={idx * 0.15} key={idx}>
              <div 
                className={`relative bg-neutral-900/80 backdrop-blur-xl border rounded-3xl p-8 flex flex-col h-full transition-all duration-300
                  ${plan.highlighted 
                    ? 'border-[#FF4A1F]/60 shadow-2xl shadow-[#FF4A1F]/10 md:scale-105 z-10' 
                    : 'border-neutral-800 hover:border-neutral-700'
                  }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF4A1F] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-lg shadow-[#FF4A1F]/20">
                    <Sparkles size={12} /> {plan.badge}
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2 text-white">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-sm text-neutral-400 font-medium">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8 flex-grow border-t border-neutral-800 pt-6">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      {feat.included ? (
                        <div className="bg-[#FF4A1F]/10 p-1 rounded-md shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-[#FF4A1F]" />
                        </div>
                      ) : (
                        <div className="bg-neutral-800/50 p-1 rounded-md shrink-0 mt-0.5">
                          <X className="w-4 h-4 text-neutral-600" />
                        </div>
                      )}
                      <span className={`text-sm font-medium ${feat.included ? 'text-neutral-200' : 'text-neutral-600 line-through'}`}>
                        {feat.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <Link 
                    to="/signup" 
                    className={`w-full flex justify-center py-4 px-4 rounded-xl font-bold transition-all shadow-lg
                      ${plan.buttonVariant === 'primary' 
                        ? 'bg-[#FF4A1F] text-white hover:bg-[#E03A12] shadow-[#FF4A1F]/20' 
                        : 'bg-neutral-950 text-white hover:bg-neutral-800 border border-neutral-800'
                      }`}
                  >
                    {plan.buttonText}
                  </Link>
                  {plan.urgency && (
                    <p className="text-center text-xs font-bold text-orange-400 mt-4">
                      {plan.urgency}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}