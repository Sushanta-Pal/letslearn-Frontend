import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient"; // Ensure this path is correct based on your folder structure

/**
 * A modal component to display a "Coming Soon" message
 * and collect email signups.
 */
function ComingSoon({ onClose }) {
  const [email, setEmail] = useState(""); // State to store input
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  // Trigger the "enter" animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  /**
   * Handles the form submission.
   * Saves the email to Supabase 'waitlist' table.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to Supabase
      const { error } = await supabase
        .from('waitlist')
        .insert({ email: email });

      if (error) throw error;

      // 2. Success UI
      console.log(`Saved email: ${email}`);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error saving email:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the close action.
   */
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-3xl mx-auto bg-[#070707] border border-gray-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-300 ease-in-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Close coming soon"
          className="absolute right-4 top-4 p-2 rounded-md hover:bg-white/5 z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex flex-col md:flex-row items-stretch gap-6">
          {/* == Left Content Area == */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF4A1F] flex items-center justify-center font-bold flex-shrink-0 text-black">
                FB
              </div>
              <div>
                <h3 className="text-2xl font-extrabold leading-snug">
                  Coming Soon
                </h3>
                <p className="mt-1 text-gray-400 max-w-md">
                  We're putting the finishing touches on this section. Sign up
                  for updates and be the first to know when it launches.
                </p>
              </div>
            </div>

            {/* == Form / Submitted Message == */}
            <div className="mt-6">
              {isSubmitted ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 text-center p-3 rounded-lg bg-green-900/50 border border-green-700 text-green-300">
                    <h4 className="font-bold">Thanks for signing up!</h4>
                    <p className="text-sm">
                      We'll notify you at <strong>{email}</strong> as soon as it's live.
                    </p>
                  </div>
                </div>
              ) : (
                <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-[#0B0B0B] border border-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4A1F]/30"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-lg bg-[#FF4A1F] text-black font-semibold hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Notify Me"}
                  </button>
                </form>
              )}
              <p className="mt-3 text-sm text-gray-500">
                We respect your privacy — no spam. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* == Right Decorative Area == */}
          <div className="w-full md:w-80 flex-shrink-0 hidden md:block">
            <div className="bg-gradient-to-br from-[#0b0b0b] to-[#111] p-4 rounded-xl border border-gray-800 shadow-inner h-full flex flex-col">
              <div className="w-full h-40 flex items-center justify-center text-gray-500 overflow-hidden rounded">
                <svg width="160" height="100" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect width="160" height="100" rx="10" fill="#0F0F10" />
                  <rect x="12" y="12" width="136" height="20" rx="6" fill="#1a1a1a" />
                  <rect x="12" y="40" width="96" height="10" rx="5" fill="#141414" />
                  <rect x="12" y="58" width="120" height="10" rx="5" fill="#141414" />
                  <rect x="110" y="58" width="28" height="28" rx="6" fill="#FF4A1F" />
                </svg>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                Preview of the upcoming feature — interactive lessons & projects, launching soon.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;