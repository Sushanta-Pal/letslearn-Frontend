import React, { useState } from "react";
import RotatingText from "../components/texts/RotatingText";
import RolePanelSelector from "../components/auth/RolePanelSelector";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../src/supabaseClient";

export default function SignUpPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student"); // student | creator
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = () => {
    if (!password) return "empty";
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // LOGIC: Students are auto-verified, Creators are NOT.
      const isCreator = role === "creator";
      const isVerified = !isCreator; 

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
            role: role,
            verified: isVerified,
          },
        },
      });

      if (error) throw error;

      alert(
        isCreator 
          ? "Signup successful! Your Creator account is pending Admin Approval."
          : "Signup successful! Please check your email to confirm."
      );

      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060606] text-white flex flex-col lg:flex-row overflow-y-auto">
      
      {/* --- Left Panel --- */}
      <div className="hidden lg:flex flex-col justify-between p-12 lg:p-16 w-full lg:w-5/12 bg-[#060606]">
        <div className="sticky top-16">
          <h1 className="text-xl font-bold tracking-wide">Fox Bird</h1>
          <h2 className="mt-14 text-4xl lg:text-5xl font-extrabold leading-tight">
            Welcome to the future of
            <div className="text-5xl lg:text-6xl mt-4">
              <RotatingText
                texts={["Creativity", "Innovation", "Tech", "Engineering"]}
                mainClassName="px-3 bg-[#FF4A1F] rounded-lg inline-block text-white"
                rotationInterval={2000}
              />
            </div>
          </h2>
          <p className="mt-6 text-gray-400 max-w-md text-lg">
            Learn, build, and grow with real-world projects and guided learning.
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-12">
          © 2025 Fox Bird — All rights reserved.
        </p>
      </div>

      {/* --- Right Panel --- */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-lg bg-[#0C0C0C] border border-gray-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden mb-8 flex justify-center">
             <h1 className="text-2xl font-bold tracking-wide text-white">Fox Bird</h1>
          </div>

          <h2 className="text-3xl font-bold text-white">Create your account</h2>
          <p className="text-gray-400 mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-[#FF4A1F] font-semibold hover:underline transition-all">
              Login
            </a>
          </p>

          <div className="mt-8">
            <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">
              Choose your panel
            </p>
            <RolePanelSelector value={role} onChange={setRole} />
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSignUp}>
            <Input
              label="Full Name"
              placeholder="John Carter"
              onChange={(e) => setFullName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrengthIndicator strength={passwordStrength()} />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full py-3.5 mt-4 bg-[#FF4A1F] hover:bg-[#e03e15] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Input({ label, type = "text", placeholder, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        onChange={onChange} 
        required 
        className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4A1F] focus:ring-1 focus:ring-[#FF4A1F] transition-all" 
      />
    </div>
  );
}

function PasswordStrengthIndicator({ strength }) {
  const map = { weak: "bg-red-500", medium: "bg-yellow-500", strong: "bg-green-500" };
  
  if (!map[strength] || strength === "empty") return null;

  return (
    <div className="flex items-center gap-3 text-sm pt-2">
      <div className="flex gap-1 h-1.5 w-24">
        <div className={`h-full flex-1 rounded-full ${strength === 'weak' || strength === 'medium' || strength === 'strong' ? map[strength] : 'bg-gray-700'}`} />
        <div className={`h-full flex-1 rounded-full ${strength === 'medium' || strength === 'strong' ? map[strength] : 'bg-gray-700'}`} />
        <div className={`h-full flex-1 rounded-full ${strength === 'strong' ? map[strength] : 'bg-gray-700'}`} />
      </div>
      <span className="text-gray-400 capitalize text-xs font-medium">{strength}</span>
    </div>
  );
}