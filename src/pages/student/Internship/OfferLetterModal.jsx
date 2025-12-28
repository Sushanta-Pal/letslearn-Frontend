import React, { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck, X, Loader2, Crown } from 'lucide-react';
import { supabase } from '../../../supabaseClient'; // Ensure path is correct
// import { handlePayment } from '../../../utils/paymentGateway'; // Uncomment if using real Razorpay

export default function OfferLetterModal({ project, user, onAccept, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [isProMember, setIsProMember] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // 1. CHECK IF USER IS PRO (Has valid transaction)
  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'success')
          // You can check for specific plan names here if needed:
          // .eq('plan_name', 'Pro Plan') 
          .limit(1);

        if (data && data.length > 0) {
          setIsProMember(true);
        }
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

    if (isProMember) {
      // --- SCENARIO A: PRO USER (SKIP PAYMENT) ---
      // Simulate brief loading for UX
      setTimeout(() => {
        setProcessing(false);
        onAccept(); // Directly accept
      }, 1000);

    } else {
      // --- SCENARIO B: NORMAL USER (PAYMENT REQUIRED) ---
      
      // NOTE: In production, uncomment the real Razorpay call below
      /*
      await handlePayment({
          amount: project.price || 149,
          name: "Internship Fee",
          description: project.title,
          userEmail: user.email,
          onSuccess: async (response) => {
             // Save transaction first, then accept
             await supabase.from('transactions').insert({
                 user_id: user.id,
                 payment_id: response.razorpay_payment_id,
                 amount: project.price || 149,
                 status: 'success',
                 plan_name: 'Internship Fee'
             });
             onAccept();
          }
      });
      setProcessing(false);
      */

      // For now (Simulation as per your request):
      setTimeout(() => {
        setProcessing(false);
        onAccept(); 
      }, 2000);
    }
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
              {isProMember && (
                  <div className="flex items-center gap-3 text-sm text-yellow-400 font-bold bg-yellow-400/10 p-2 rounded-lg border border-yellow-400/20">
                    <Crown size={18}/> Pro Member Benefit
                  </div>
              )}
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
                       {isProMember ? (
                           <>
                             <span className="text-gray-400 line-through text-xs mr-2">₹{project.price || 149}</span>
                             <span className="text-emerald-600 font-bold text-lg">FREE</span>
                             <p className="text-[10px] text-emerald-600 font-medium">Included with Pro Plan</p>
                           </>
                       ) : (
                           <>
                             <span className="text-gray-400 line-through text-xs mr-2">₹999</span>
                             <span className="text-emerald-700 font-bold text-lg">₹{project.price || 149}</span>
                           </>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-8">
              {checkingStatus ? (
                 <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} /> Checking Eligibility...
                 </button>
              ) : (
                <button 
                    onClick={handleAcceptOffer} 
                    disabled={processing}
                    className={`w-full font-sans font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed ${
                        isProMember 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                >
                    {processing ? (
                        <Loader2 className="animate-spin" />
                    ) : isProMember ? (
                        <>Claim Offer (Free) <CheckCircle size={18}/></>
                    ) : (
                        `Accept Offer & Pay ₹${project.price || 149}`
                    )}
                </button>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}