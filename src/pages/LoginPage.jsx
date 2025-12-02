import React, { useState } from "react";
import RotatingText from "../components/texts/RotatingText";
import ClickSpark from "@/components/ClickSpark";
import RolePanelSelector from "../components/auth/RolePanelSelector"; // <- update path if needed
import { supabase } from '../../src/supabaseClient';
import { useNavigate } from 'react-router-dom';


export default function LoginPage() {
    
    // --- STATE FOR INPUTS AND UI CONTROL ---
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("student"); // "student" | "creator"
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [loading, setLoading] = useState(false); 
    
    // --- STATE FOR COGNITO CHALLENGES (The 2-step flow) ---
    const [userObject, setUserObject] = useState(null); 
    const [newPassword, setNewPassword] = useState(""); 
    const [authChallenge, setAuthChallenge] = useState(false); 

    const navigate = useNavigate();

    // --- Core Login Logic (Step 1: Initial Submission) ---
  // Inside LoginPage.jsx

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
        alert("Please enter both email and password.");
        setLoading(false);
        return;
    }

    try {
        // 1. Call Supabase Sign In API (Handles authentication and sets session cookies)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            throw error;
        }
        
        // 2. Retrieve the JWT Access Token and User ID
        // Note: Supabase uses 'access_token' for the JWT sent to the backend.
        const session = data.session;
        const jwtToken = session.access_token;
        const userId = session.user.id;
        
        // 3. Authorization Check (Client-Side, Simplified)
        // **ASSUMPTION:** A successful login is enough to access a default dashboard.
        // The role selected in the UI ('creator' or 'student') dictates the frontend path.
        
        if (role === 'creator') {
             // For a production app, the backend (Motia) MUST verify the role based on the JWT claim.
             console.log("INFO: Frontend redirecting as creator. Backend must verify role for user ID:", userId);
        }
        
        // 4. LOG THE JWT (This is the token Motia needs to validate!)
        console.log("✅ Supabase Sign In Successful. User ID:", userId);
        console.log("--- JWT Access Token for Motia ---");
        // console.log(jwtToken);
        console.log("------------------------------------");


        // 5. Success & Redirection
        const targetPath = (role === 'creator') ? '/teacher-dashboard' : '/';
        navigate(targetPath);

    } catch (error) {
        console.error("Supabase Login Failed:", error);
        // Supabase errors are simple objects
        alert(error.message || "Login failed. Check credentials or verify email.");
    } finally {
        setLoading(false);
    }
};

    // --- Logic for Completing the New Password Challenge (Step 2) ---
    const handleNewPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!newPassword || newPassword.length < 8) {
            alert("New password must be at least 8 characters.");
            setLoading(false);
            return;
        }

        try {
            // Use the stored user object from the initial login attempt (userObject)
            const finalUser = await signIn({
               username: email, // <-- CRITICAL FIX: Pass the stored email state
            password: newPassword, // The new password is the challengeResponse
            continueSignIn: userObject,
            });
            
            // Final success check: If fully signed in, proceed to token validation
            if (finalUser.nextStep.signInStep === 'SIGNED_IN') {
                await completeAuthAndRedirect();
            } else {
                throw new Error('New password submission failed. Try logging in again.');
            }

        } catch (error) {
            console.error("New Password Submission Failed:", error);
            alert(error.message || "Failed to set new password.");
        } finally {
            setLoading(false);
        }
    };

    // --- Shared Logic for Token Validation and Redirection ---
    const completeAuthAndRedirect = async () => {
        // 1. Retrieve the Session (now guaranteed to have tokens)
        const session = await fetchAuthSession();
        
        // 2. Authorization Check (Client-Side)
        const groups = session.tokens.accessToken.payload['cognito:groups'] || [];
        const userIsCreator = groups.includes('Teacher') || groups.includes('Admin');
        
        if (role === 'creator' && !userIsCreator) {
            throw new Error("Access Denied. You do not have creator/teacher privileges.");
        }
        
        console.log(`Login successful for ${email} as ${role}`);

        // 3. Success & Redirection
        const targetPath = (role === 'creator' && userIsCreator) ? '/teacher-dashboard' : '/student-dashboard';
        navigate(targetPath);
    };

    // -------------------------------------------------------------
    // JSX RENDER
    // -------------------------------------------------------------
    return (
        <div className="min-h-screen w-full bg-[#060606] text-white relative overflow-hidden flex">
            {/* ... LEFT PANEL (UI) ... */}
            
            {/* RIGHT — LOGIN FORM */}
            <div className="w-full lg:w-3/5 flex items-center justify-center p-8 lg:p-14 relative z-10">
                <div className="w-full max-w-md bg-[#0C0C0C]/70 backdrop-blur-xl border border-gray-800 p-10 rounded-2xl shadow-xl">
                    <h2 className="text-3xl font-bold">Log in to Fox Bird</h2>
                    
                    {/* --- CONDITIONAL FORM RENDERING --- */}
                    {authChallenge ? (
                        // RENDER NEW PASSWORD FORM (Step 2 UI)
                        <form className="mt-8 space-y-5" onSubmit={handleNewPasswordSubmit}>
                            <h3 className="text-xl font-bold text-[#FF4A1F]">New Password Required</h3>
                            <p className="text-gray-400 text-sm">Please set a new, permanent password to continue.</p>
                            
                            <Input 
                                label="New Permanent Password"
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <ClickSpark>
                                <button type="submit" disabled={loading} className="w-full py-3 bg-[#FF4A1F] rounded-xl">
                                    {loading ? "Setting Password..." : "Set Password & Log In"}
                                </button>
                            </ClickSpark>
                        </form>
                    ) : (
                        // RENDER ORIGINAL LOGIN FORM (Step 1 UI)
                        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                            
                            {/* Role panels: Creator vs Student (Only visible on initial login) */}
                            <div className="mt-6">
                                <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">
                                    Continue as
                                </p>
                                <RolePanelSelector value={role} onChange={setRole} />
                            </div>

                            {/* Email Input */}
                            <Input
                                label="Email Address" id="email" type="email" placeholder="you@example.com"
                                value={email} onChange={(e) => setEmail(e.target.value)} 
                            />

                            {/* Password with toggle */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <input
                                        id="password" type={showPassword ? "text" : "password"} placeholder="•••••••••"
                                        className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4A1F]/50 pr-10"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button type="button" className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500 hover:text-gray-300" onClick={() => setShowPassword((v) => !v)}>
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {/* ... Remainder of Form UI (Remember/Forgot, etc.) ... */}

                            <ClickSpark>
                                <button type="submit" disabled={loading} className="w-full mt-2 py-3 text-black font-semibold text-lg rounded-xl bg-[#FF4A1F] hover:brightness-95 transition-all shadow-[0_0_25px_-6px_#ff4a1f]">
                                    {loading ? "Logging In..." : (role === "creator" ? "Log in as Creator" : "Log in as Student")}
                                </button>
                            </ClickSpark>
                        </form>
                    )}
                    {/* ... Social login and Divider ... */}
                </div>
            </div>
        </div>
    );
}

// --- Sub Components (Defined outside of LoginPage or imported) ---

function Input({ label, id, placeholder, type = "text", onChange, value }) {
    // ... Input implementation (defined in the final provided code block) ...
    // Note: This must be defined correctly in your project.
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-gray-300">{label}</label>
            <input
                id={id} type={type} placeholder={placeholder} onChange={onChange} value={value}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4A1F]/50"
            />
        </div>
    );
}

// ... FeaturePoint and Divider ...

function FeaturePoint({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 rounded-full bg-[#FF4A1F] shadow-[0_0_10px_#ff4a1f]" />
      <p className="text-gray-300">{label}</p>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center my-6">
      <div className="w-full bg-gray-700 h-px" />
      <span className="px-4 text-xs uppercase text-gray-500 tracking-wider">
        OR
      </span>
      <div className="w-full bg-gray-700 h-px" />
    </div>
  );
}
