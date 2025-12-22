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
            verified: isVerified, // <--- NEW FIELD
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

  // ... (Rest of the JSX remains exactly the same as your previous version)
  return (
    <div className="min-h-screen w-full bg-[#060606] text-white flex relative overflow-hidden">
      {/* ... Left Panel ... */}
      <div className="hidden lg:flex flex-col justify-between p-14 w-2/5">
        <div>
          <h1 className="text-xl font-bold">Fox Bird</h1>
          <h2 className="mt-14 text-4xl font-extrabold">
            Welcome to the future of
            <div className="text-6xl mt-2">
              <RotatingText
                texts={["Creativity", "Innovation", "Tech", "Engineering"]}
                mainClassName="px-3 bg-orange-500 rounded-lg"
                rotationInterval={2000}
              />
            </div>
          </h2>
          <p className="mt-6 text-gray-400 max-w-md">
            Learn, build, and grow with real-world projects and guided learning.
          </p>
        </div>
        <p className="text-sm text-gray-600">
          © 2025 Fox Bird — All rights reserved.
        </p>
      </div>

      {/* ... Right Panel ... */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-10">
        <div className="w-full max-w-md bg-[#0C0C0C] border border-gray-800 rounded-2xl p-8">
          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="text-gray-400 mt-1">
            Already have an account?{" "}
            <a href="/login" className="text-[#FF4A1F] font-semibold">
              Login
            </a>
          </p>

          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-2 uppercase">
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

            <div>
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
              className="w-full py-3 bg-[#FF4A1F] text-black font-semibold rounded-xl"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <Divider />
          <OAuthButton label="Continue with Google" icon="https://www.svgrepo.com/show/475656/google-color.svg" provider="google" />
          <OAuthButton label="Continue with GitHub" icon="https://www.svgrepo.com/show/343674/github.svg" provider="github" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS (Keep existing) ---------------- */
function Input({ label, type = "text", placeholder, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-300">{label}</label>
      <input type={type} placeholder={placeholder} onChange={onChange} required className="px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg" />
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center my-6">
      <div className="flex-1 h-px bg-gray-700" />
      <span className="px-4 text-xs text-gray-500">OR</span>
      <div className="flex-1 h-px bg-gray-700" />
    </div>
  );
}

function PasswordStrengthIndicator({ strength }) {
  const map = { weak: "bg-red-500", medium: "bg-yellow-500", strong: "bg-green-500" };
  if (!map[strength]) return null;
  return (
    <div className="mt-2 flex items-center gap-2 text-sm">
      <div className={`w-20 h-1 rounded ${map[strength]}`} />
      <span className="text-gray-400 capitalize">{strength}</span>
    </div>
  );
}

function OAuthButton({ label, icon, provider }) {
  const handleOAuth = async () => { await supabase.auth.signInWithOAuth({ provider }); };
  return (
    <button onClick={handleOAuth} className="w-full flex items-center justify-center gap-3 py-3 mt-3 bg-[#111] border border-gray-800 rounded-xl">
      <img src={icon} className="w-5 h-5" alt={provider} />
      {label}
    </button>
  );
}