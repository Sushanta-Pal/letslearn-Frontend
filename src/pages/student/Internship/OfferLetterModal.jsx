import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, X, Loader2 } from 'lucide-react';

export default function OfferLetterModal({ project, user, onAccept, onClose }) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate Payment Gateway delay
    setTimeout(() => {
      setProcessing(false);
      onAccept(); 
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
      <div className="bg-white text-black max-w-2xl w-full rounded-xl relative shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Branding Side */}
        <div className="bg-[#0A0A0A] text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-transparent pointer-events-none"/>
           <div>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-black font-bold text-2xl mb-6 shadow-lg">
                 {project.company_name?.[0]}
              </div>
              <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Official Offer</h3>
              <h1 className="text-2xl font-bold leading-tight">{project.company_name}</h1>
           </div>
           <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                 <ShieldCheck className="text-emerald-400" size={18}/> Verified Role
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                 <CheckCircle className="text-emerald-400" size={18}/> Certificate Included
              </div>
           </div>
        </div>

        {/* Right: The Letter */}
        <div className="p-8 md:w-2/3 font-serif relative">
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full p-1 transition-colors"><X size={20}/></button>
           
           <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Offer of Internship</h2>
              <p className="text-sm text-gray-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
           </div>

           <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              <p>Dear <strong>{user.user_metadata?.full_name || user.email?.split('@')[0]}</strong>,</p>
              <p>
                We are pleased to offer you the position of <strong>{project.role_title}</strong> at {project.company_name}. 
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 my-4 font-sans">
                 <div className="flex justify-between mb-2">
                    <span className="text-gray-500 text-xs uppercase">Role</span>
                    <span className="font-bold text-gray-900">{project.role_title}</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-500 text-xs uppercase">Fee</span>
                    <div className="text-right">
                       <span className="text-gray-400 line-through text-xs mr-2">₹999</span>
                       <span className="text-emerald-700 font-bold text-lg">₹{project.price || 149}</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-8">
              <button 
                onClick={handlePayment} 
                disabled={processing}
                className="w-full bg-black text-white hover:bg-gray-800 font-sans font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? <Loader2 className="animate-spin" /> : `Accept Offer & Pay ₹${project.price || 149}`}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}