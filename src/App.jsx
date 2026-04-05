import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useParams, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from './supabaseClient';

// --- NEW: Ads Phase 1 ---
import PopupAd from "./components/PopupAd"; 

// --- NEW: Public Marketing Pages ---
import PublicLayout from "./layouts/PublicLayout";
import LandingPage from "./pages/public/LandingPage";
import PricingPage from "./pages/public/PricingPage";
import AboutFounder from "./pages/public/AboutFounder";

// --- Auth Pages ---
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

// --- Layouts ---
import DashboardLayout from "./layouts/DashboardLayout";

// --- Student Views ---
import DashboardOverview from "./pages/student/DashboardOverview";
import CoursesList from "./pages/student/CoursesList";
import QuestionListPage from "./pages/student/QuestionList";
import InternshipDashboard from "./pages/student/Internship/InternshipDashboard";
import InternshipWorkspace from "./pages/student/Internship/InternshipWorkspace";
import MockInterviewView from "./pages/student/MockInterviewView";
import CourseViewer from "./pages/student/CourseViewer";
import SolveProblemPage from "./pages/student/SolveProblemPage";
import StudentAssignmentView from "./pages/student/StudentAssignmentView";
import AIInterviewContainer from "./pages/student/AIInterviewContainer";

// --- Teacher Views ---
import CreateInternship from "./pages/Teacher/CreateInternship";
import AddQuestionPage from "./pages/Teacher/AddQuestionPage";
import ManageCourses from "./pages/Teacher/ManageCourses";
import ReviewDashboard from './pages/Teacher/ReviewDashboard';
import AssignmentManager from "./pages/Teacher/AssignmentManager";
import PracticeSetBuilder from "./pages/Teacher/PracticeSetBuilder";

// --- Freemium & Admin Features ---
import CheckoutPage from './pages/student/CheckoutPage';
import PlacementGuidance from './pages/student/PlacementGuidance';
import AdminPayments from './pages/Teacher/AdminPayments';

const pageMotionProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35 },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* =========================================
            1. PUBLIC FUNNEL (Marketing Pages) 
            ========================================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<motion.div {...pageMotionProps}><LandingPage /></motion.div>} />
          <Route path="/pricing" element={<motion.div {...pageMotionProps}><PricingPage /></motion.div>} />
          <Route path="/founder" element={<motion.div {...pageMotionProps}><AboutFounder /></motion.div>} />
        </Route>

        {/* =========================================
            2. AUTHENTICATION ROUTES
            ========================================= */}
        <Route path="/login" element={<motion.div {...pageMotionProps}><LoginPage /></motion.div>} />
        <Route path="/signup" element={<motion.div {...pageMotionProps}><SignUpPage /></motion.div>} />

        {/* =========================================
            3. PROTECTED DASHBOARD ROUTES
            ========================================= */}
        <Route path="/dashboard" element={<DashboardLayout />}>
           {/* The "Index" is the Overview */}
           <Route index element={<motion.div {...pageMotionProps}><DashboardOverview /></motion.div>} />
           
           {/* Student Routes */}
           <Route path="courses" element={<motion.div {...pageMotionProps}><CoursesList /></motion.div>} />
           <Route path="internships" element={<motion.div {...pageMotionProps}><InternshipDashboard /></motion.div>} />
           <Route path="assignments" element={<motion.div {...pageMotionProps}><StudentAssignmentViewWrapper /></motion.div>} />
           <Route path="interviews" element={<motion.div {...pageMotionProps}><MockInterviewWrapper /></motion.div>} />
           <Route path="practice" element={<motion.div {...pageMotionProps}><QuestionListPage /></motion.div>} />
           <Route path="ai-interview" element={<motion.div {...pageMotionProps}><AIInterviewWrapper /></motion.div>} />
           
           {/* Freemium & Guidance Routes */}
           <Route path="checkout" element={<motion.div {...pageMotionProps}><CheckoutPage /></motion.div>} />
           <Route path="placement-guidance" element={<motion.div {...pageMotionProps}><PlacementGuidance /></motion.div>} />
           
           {/* Teacher Specific Routes */}
           <Route path="teacher/create-internship" element={<CreateInternship />} />
           <Route path="teacher/add-question" element={<AddQuestionPage />} />
           <Route path="teacher/manage-courses" element={<ManageCourses />} />
           <Route path="teacher/assignments" element={<motion.div {...pageMotionProps}><AssignmentManager /></motion.div>} />
           <Route path="teacher/reviews" element={<ReviewDashboard />} />
           <Route path="teacher/practice-builder" element={<motion.div {...pageMotionProps}><PracticeSetBuilder /></motion.div>} />
           
           {/* Admin Payments Route */}
           <Route path="admin/payments" element={<motion.div {...pageMotionProps}><AdminPayments /></motion.div>} />
        </Route>

        {/* =========================================
            4. FULL SCREEN MODES (No Top Nav/Sidebar)
            ========================================= */}
        <Route path="/student/internship/:projectId" element={<InternshipWorkspaceWrapper />} />
        <Route path="/student/course/:courseId" element={<CourseViewer />} />
        <Route path="/student/solve/:questionId" element={<SolveProblemPage />} />
        <Route path="/student/mock-interview/:sessionId" element={<MockInterviewSessionWrapper />} />

        {/* Redirects */}
        <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} /> {/* Changed fallback to landing page */}
      </Routes>
    </AnimatePresence>
  );
}

// --- WRAPPERS ---

function StudentAssignmentViewWrapper() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        supabase.auth.getUser().then(({data}) => {
            setUser(data.user);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-10 text-white text-center">Loading User...</div>;
    if (!user) return <div className="p-10 text-white text-center">Please Log In</div>;
    
    return <StudentAssignmentView user={user} />;
}

function InternshipWorkspaceWrapper() {
    const [user, setUser] = useState(null);
    const { projectId } = useParams();
    useEffect(() => { supabase.auth.getUser().then(({data}) => setUser(data.user)) }, []);
    if(!user) return null;
    return <InternshipWorkspace user={user} projectId={projectId} />;
}

function MockInterviewWrapper() {
  const [user, setUser] = useState(null);
  useEffect(() => { supabase.auth.getUser().then(({data}) => setUser(data.user)) }, []);
  if(!user) return null;
  return <MockInterviewView user={user} />;
}

function MockInterviewSessionWrapper() {
    const [user, setUser] = useState(null);
    const { sessionId } = useParams();
    useEffect(() => { supabase.auth.getUser().then(({data}) => setUser(data.user)) }, []);
    if(!user) return null;
    return <MockInterviewView user={user} initialSessionId={sessionId} />;
}

// 🟢 NEW: Bulletproof Hybrid Authentication Wrapper
function AIInterviewWrapper() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => { 
        const verifyAccess = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data.user;
            
            if (currentUser) {
                setUser(currentUser);
                
                // STEP 1: Check Metadata (Fastest)
                // Assuming 'is_premium' is the flag you use. Change it if yours is different.
                let hasPaidPlan = currentUser.user_metadata?.is_premium === true; 
                
                // STEP 2: Database Fallback (Safest)
                // If metadata says false (maybe they just paid and it hasn't synced), query the DB to be 100% sure.
                if (!hasPaidPlan) {
                    try {
                        const { data: profile } = await supabase
                            .from('users') // Change 'users' to whatever table tracks your payments/roles
                            .select('is_premium') // Change to your specific column name
                            .eq('id', currentUser.id)
                            .single();
                            
                        if (profile && profile.is_premium === true) {
                            hasPaidPlan = true;
                        }
                    } catch (err) {
                        console.error("DB Verification Error:", err);
                    }
                }

                setIsPaid(hasPaidPlan);
            }
            setLoading(false);
        };
        
        verifyAccess();
    }, []);

    if (loading) return <div className="p-10 text-white text-center">Loading User...</div>;
    if (!user) return <div className="p-10 text-white text-center">Please Log In</div>;
    
    // Kick out free users and send them to the Checkout page
    if (!isPaid) {
        return <Navigate to="/dashboard/checkout" replace />; 
    }
    
    return <AIInterviewContainer user={user} />;
}

// --- MAIN APP EXPORT ---
export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Injected PopupAd here so it covers everything globally */}
      <PopupAd />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}