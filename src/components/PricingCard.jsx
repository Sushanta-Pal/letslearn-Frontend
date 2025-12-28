import React from "react";
import ReactDOM from "react-dom";
import ComingSoon from "./screens/ComingSoon"; 
import { handlePayment } from "../paymentGateway"; 
import { supabase } from "../supabaseClient"; // Import Supabase

export default function PricingCard({ tier, price, features, highlighted }) {
  const [showComingSoon, setShowComingSoon] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleButtonClick = async () => {
    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login to subscribe.");
      return;
    }

    if (tier === "Lifetime" || tier === "Pro Intern") {
      setShowComingSoon(true);
      return;
    }

    // 2. Trigger Payment
    handlePayment({
      amount: price,
      name: "Your App Name",
      description: `${tier} Plan Subscription`,
      userEmail: user.email,
      
      // 3. HANDLE SUCCESS (Save to Supabase)
      onSuccess: async (response) => {
        try {
          setLoading(true);
          
          // A. Insert into Transactions Table
          const { error } = await supabase.from('transactions').insert({
            user_id: user.id,
            payment_id: response.razorpay_payment_id,
            amount: price,
            plan_name: tier,
            status: 'success'
          });

          if (error) throw error;

          // B. (Optional) Update User Profile Role
          // e.g., Make them a 'pro' user
          /* await supabase.from('profiles')
            .update({ role: 'pro_user' })
            .eq('id', user.id); 
          */

          alert(`Payment Successful! Transaction saved. ID: ${response.razorpay_payment_id}`);
        
        } catch (err) {
          console.error("Database Error:", err);
          alert("Payment succeeded, but saving failed. Contact support.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div
      className={`relative w-80 p-8 rounded-2xl border transition-all duration-300 backdrop-blur-sm
      ${
        highlighted
          ? "bg-[#FF4A1F] text-black border-[#FF6B3A] shadow-xl scale-[1.03]"
          : "bg-[#0D0D0D] text-gray-300 border-gray-800 hover:border-gray-600"
      }
      `}
    >
      {highlighted && (
        <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 text-xs font-semibold rounded-full shadow">
          Most Popular
        </span>
      )}

      <h3 className="text-xl font-bold">{tier}</h3>
      <h1 className="text-4xl font-extrabold mt-2">
        ₹{price}
        <span className="text-sm font-normal opacity-70">/month</span>
      </h1>

      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z"
                fill={highlighted ? "#000" : "#FF4A1F"}
              />
            </svg>
            <p>{f}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        className={`w-full py-2 rounded-md font-semibold mt-8 transition-all
        ${
          highlighted
            ? "bg-black text-[#FF4A1F] hover:bg-black/80"
            : "bg-[#FF4A1F] text-black hover:bg-[#ff5c2d]"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {loading ? "Processing..." : "Get Started"}
      </button>

      {showComingSoon &&
        ReactDOM.createPortal(
          <ComingSoon onClose={() => setShowComingSoon(false)} />,
          document.body
        )}
    </div>
  );
}