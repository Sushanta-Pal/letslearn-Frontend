import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles(full_name, email)') 
      .eq('status', 'pending');
      
    if (!error) {
      setPayments(data || []);
    }
  };

  const approvePayment = async (paymentId, userId) => {
    const confirmApprove = window.confirm("Are you sure you want to approve this payment and upgrade the user?");
    if (!confirmApprove) return;

    try {
      // 1. Update payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'approved' })
        .eq('id', paymentId)
        .select() 
        .single();
      if (paymentError) throw new Error("Payment Update Failed: " + paymentError.message);
      
      // 2. Make user premium in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', userId)
        .select()
        .single();
      if (profileError) throw new Error("Profile Update Failed: " + profileError.message);

      // 3. SEND IN-APP NOTIFICATION TO THE STUDENT
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: 'Welcome to Placium Premium! 🎉',
          message: 'Your payment has been verified. You now have unlimited access to mock interviews, premium DSA problems, and priority reviews.',
          type: 'success',
          is_read: false
        }]);
      if (notifError) console.error("Notification failed to send:", notifError);

      // Refresh the admin view
      fetchPayments(); 
      alert("User upgraded to Premium and notified successfully!");

    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Something went wrong: " + error.message);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Pending Pro Upgrades</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Details</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">UTR Number</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {payments.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No pending payments.</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{p.profiles?.full_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{p.profiles?.email}</div>
                  </td>
                  {/* 🟢 CHANGED HERE: Added text-gray-900 and a slight background to make the UTR stand out */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {p.utr_number || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{p.amount}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => approvePayment(p.id, p.user_id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm"
                    >
                      Approve UTR
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;