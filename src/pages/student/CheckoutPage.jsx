import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Please log in to continue.");

      const { error } = await supabase
        .from('payments')
        .insert([{ 
          user_id: user.id, 
          utr_number: utr, 
          amount: 99 // Your Pro price
        }]);

      if (error) throw error;

      setMessage("Payment details submitted! Admin will verify and activate your Pro account within 2 hours.");
      setTimeout(() => navigate('/dashboard'), 3000);
      
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">Upgrade to Platform Pro</h2>
      <p className="text-gray-600 mb-6">Unlock unlimited mock interviews and coding guidance. Price: ₹99</p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6 flex flex-col items-center">
        {/* Make sure you add your actual QR code image to the public folder */}
        <img src="/images/upi-qr (1).png" alt="Scan to Pay" className="w-48 h-48 mb-2 border-2 border-dashed border-gray-300" />
        <p className="font-semibold text-sm">Scan with PhonePe, GPay, or Paytm</p>
        <p className="text-xs text-gray-500 mt-1">UPI ID: 8918357997-2@ybl</p>
      </div>
      <form onSubmit={handlePaymentSubmit} className="space-y-4">
        <div>
          <label className="block text-left text-sm font-medium mb-1">Enter 12-Digit UTR / Ref No.</label>
          <input 
            type="text" 
            required
            maxLength={12}
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. 312345678901"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Verify Payment'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm font-medium text-green-600">{message}</p>}
    </div>
  );
};

export default CheckoutPage;
