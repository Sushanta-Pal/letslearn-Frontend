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

    // 1. Update payment status
    await supabase.from('payments').update({ status: 'approved' }).eq('id', paymentId);
    
    // 2. Make user premium in the profiles table
    await supabase.from('profiles').update({ is_premium: true }).eq('id', userId);
    
    fetchPayments(); 
    alert("User upgraded to Premium successfully!");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Pending Pro Upgrades</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTR Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No pending payments.</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{p.profiles?.full_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{p.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{p.utr_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">₹{p.amount}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => approvePayment(p.id, p.user_id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition"
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