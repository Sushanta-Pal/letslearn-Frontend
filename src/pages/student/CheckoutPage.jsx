import React, { useState } from 'react';
// import { supabase } from '../../supabaseClient'; // Ensure this path is correct
// import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, CreditCard, ChevronLeft } from 'lucide-react';

const CheckoutPage = () => {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  // const navigate = useNavigate();

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // --- SIMULATED SUBMISSION FOR DEMO PURPOSES ---
    setTimeout(() => {
        setMessageType('success');
        setMessage("Payment submitted successfully! Admin will verify and activate your session within 2 hours.");
        setLoading(false);
        // setTimeout(() => navigate('/dashboard'), 3000);
    }, 1500);

    /* --- REAL SUPABASE LOGIC (Uncomment when ready) ---
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to continue.");

      const { error } = await supabase
        .from('payments')
        .insert([{ 
          user_id: user.id, 
          utr_number: utr, 
          amount: 99 // Replace with dynamic amount if needed
        }]);

      if (error) throw error;

      setMessageType('success');
      setMessage("Payment submitted successfully! Admin will verify and activate your session within 2 hours.");
      setTimeout(() => navigate('/dashboard'), 3000);
      
    } catch (error) {
      setMessageType('error');
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
    -------------------------------------------------- */
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 py-12 px-4 sm:px-6 flex items-center justify-center font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 bg-[#111] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Left Side: Order Summary */}
        <div className="p-8 md:p-10 bg-[#151515] flex flex-col justify-between">
          <div>
            <button 
              // onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-medium w-fit"
            >
              <ChevronLeft size={16} /> Back to Services
            </button>
            
            <h2 className="text-3xl font-extrabold text-white mb-2">Order Summary</h2>
            <p className="text-gray-400 text-sm mb-8">Review your selection before proceeding to payment.</p>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">1:1 Mentorship</h3>
                  <p className="text-gray-500 text-sm">Video meeting • 30 mins</p>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                  Popular
                </span>
              </div>
              
              <ul className="space-y-3 mt-6 border-t border-gray-800 pt-6">
                <li className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">₹99.00</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="text-white font-medium">₹0.00</span>
                </li>
                <li className="flex justify-between text-lg font-bold border-t border-gray-800 pt-4 mt-4">
                  <span className="text-white">Total Amount</span>
                  <span className="text-indigo-400">₹99.00</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
            <ShieldCheck className="text-green-500 shrink-0" size={20} />
            <p>100% Secure Payment. Your transaction is encrypted and safe.</p>
          </div>
        </div>

        {/* Right Side: Payment Details */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <CreditCard className="text-indigo-500" /> Complete Payment
            </h2>
            <p className="text-gray-400 text-sm">Scan the QR code below using any UPI app.</p>
          </div>

          {/* QR Code Section */}
          <div className="bg-[#151515] border border-gray-800 p-6 rounded-2xl flex flex-col items-center mb-8 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
            
            <div className="bg-white p-3 rounded-xl mb-4">
               {/* Note: Ensure the image path is correct relative to your public folder */}
              <img src="/images/upi-qr (1).png" alt="Placium UPI QR Code" className="w-40 h-40 object-contain" />
            </div>
            
            <p className="font-semibold text-white mb-1">Scan with PhonePe, GPay, or Paytm</p>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-black px-4 py-2 rounded-lg border border-gray-800 mt-2">
              <span>UPI ID:</span>
              <span className="text-white font-mono select-all">8918357997-2@ybl</span>
            </div>
          </div>

          {/* UTR Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter 12-Digit UTR / Ref Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                maxLength={12}
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                className="w-full px-4 py-3 bg-[#151515] border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white font-mono transition-all"
                placeholder="e.g. 312345678901"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Clock size={12} /> Find this in your UPI app's transaction history.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading || utr.length !== 12}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex justify-center items-center gap-2
                ${loading || utr.length !== 12 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying Payment...
                </span>
              ) : 'Confirm Payment'}
            </button>
          </form>

          {/* Success/Error Messages */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 text-sm
              ${messageType === 'error' 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-green-500/10 border-green-500/20 text-green-400'
              }
            `}>
              {messageType === 'error' ? (
                 <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              ) : (
                <ShieldCheck className="w-5 h-5 shrink-0" />
              )}
              <p>{message}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
