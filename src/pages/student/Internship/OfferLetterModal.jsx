import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, ShieldCheck, X, Loader2, Crown, 
  Briefcase, Calendar, ArrowRight, Building2, MapPin 
} from 'lucide-react';
import { supabase } from '../../../supabaseClient'; 

export default function OfferLetterModal({ project, user, onAccept, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [isProMember, setIsProMember] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // 1. CHECK IF USER IS PRO
  useEffect(() => {
    const checkProStatus = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'success')
          .limit(1);

        if (data && data.length > 0) setIsProMember(true);
      } catch (err) {
        console.error("Error checking pro status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkProStatus();
  }, [user.id]);

  // 2. HANDLE ACCEPTANCE
  const handleAcceptOffer = async () => {
    setProcessing(true);
    // Simulate delay for effect
    setTimeout(() => {
      setProcessing(false);
      onAccept(); 
    }, 1500);
  };

  if (!project) return null;

  const fees = project.price || 149;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      
      {/* MODAL CARD: Constrained Height & Width */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative">
        
        {/* --- 1. HEADER (Fixed) --- */}
        <div className="bg-[#0A0A0A] text-white p-6 shrink-0 flex justify-between items-start relative overflow-hidden">
            {/* Abstract bg element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"/>
            
            <div className="flex gap-4 relative z-10">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-black font-black text-2xl shadow-lg shrink-0">
                    {project.company_name?.[0]}
                </div>
                <div>
                    <h2 className="text-xl font-bold leading-tight">{project.company_name}</h2>
                    <div className="flex items-center gap-3 text-gray-400 text-xs mt-1">
                        <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-400"/> Verified</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> Remote</span>
                    </div>
                </div>
            </div>

            <button onClick={onClose} className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={18}/>
            </button>
        </div>

        {/* --- 2. SCROLLABLE CONTENT (Middle) --- */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0 bg-gray-50/50">
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subject</p>
                        <h1 className="text-xl font-serif font-bold text-gray-900">Internship Offer Letter</h1>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                        <p className="text-sm font-medium text-gray-700 font-mono">{today}</p>
                    </div>
                </div>

                <div className="prose prose-sm text-gray-600 leading-relaxed">
                    <p>Dear <strong>{user.user_metadata?.full_name || "Applicant"}</strong>,</p>
                    <p>
                        We are delighted to offer you the position of <strong className="text-black bg-yellow-200/50 px-1 rounded">{project.role_title}</strong> at {project.company_name}. 
                        Your skills and background are an excellent match for our team.
                    </p>
                </div>

                {/* Compact Job Details Table */}
                <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                            <span className="block text-xs text-gray-400 font-bold uppercase">Position</span>
                            <span className="font-semibold text-gray-900">{project.role_title}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 font-bold uppercase">Duration</span>
                            <span className="font-semibold text-gray-900">4 Weeks (Flexible)</span>
                        </div>
                        <div className="col-span-2 border-t border-gray-200 pt-3 flex justify-between items-center">
                            <span className="block text-xs text-gray-400 font-bold uppercase">Certification Fee</span>
                            <div className="text-right">
                                {isProMember ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 line-through text-xs">₹{fees}</span>
                                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-xs flex items-center gap-1">
                                            WAIVED <Crown size={10} className="fill-emerald-600"/>
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[#FF4A1F] font-bold text-lg">₹{fees}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center px-4">
                * By clicking accept, you agree to the terms of the FoxBird Virtual Internship Program. 
                This offer includes a verified certificate upon completion.
            </p>
        </div>

        {/* --- 3. STICKY FOOTER (Bottom) --- */}
        <div className="p-5 border-t border-gray-200 bg-white shrink-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            {checkingStatus ? (
                <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                    <Loader2 className="animate-spin" size={18} /> Verifying Eligibility...
                </button>
            ) : (
                <button 
                    onClick={handleAcceptOffer} 
                    disabled={processing}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] text-sm md:text-base shadow-lg ${
                        isProMember 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200" 
                        : "bg-black hover:bg-gray-900 text-white shadow-gray-200"
                    }`}
                >
                    {processing ? (
                        <>Processing... <Loader2 className="animate-spin" size={18}/></>
                    ) : isProMember ? (
                        <>Claim Internship Free <ArrowRight size={18}/></>
                    ) : (
                        <>Accept Offer & Pay ₹{fees} <Briefcase size={18}/></>
                    )}
                </button>
            )}
        </div>

      </div>
    </div>
  );
}