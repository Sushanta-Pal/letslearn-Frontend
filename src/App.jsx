import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useParams, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from './supabaseClient';

// Pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardLanding from "./pages/Dashboard"; // The Public Landing Page
import AssignmentManager from "./pages/Teacher/AssignmentManager";
import StudentAssignmentView from "./pages/student/StudentAssignmentView";
// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Student Views (Formerly Tabs in ProfilePage)
import DashboardOverview from "./pages/student/DashboardOverview"; // NEW FILE (See below)
import CoursesList from "./pages/student/CoursesList";
import QuestionListPage from "./pages/student/QuestionList";
import InternshipDashboard from "./pages/student/Internship/InternshipDashboard";
import InternshipWorkspace from "./pages/student/Internship/InternshipWorkspace";
import MockInterviewView from "./pages/student/MockInterviewView";
import CourseViewer from "./pages/student/CourseViewer";
import SolveProblemPage from "./pages/student/SolveProblemPage";

// Teacher Views
import CreateInternship from "./pages/Teacher/CreateInternship";
import AddQuestionPage from "./pages/Teacher/AddQuestionPage";
import ManageCourses from "./pages/Teacher/ManageCourses";

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
        
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<motion.div {...pageMotionProps}><DashboardLanding /></motion.div>} />
        <Route path="/login" element={<motion.div {...pageMotionProps}><LoginPage /></motion.div>} />
        <Route path="/signup" element={<motion.div {...pageMotionProps}><SignUpPage /></motion.div>} />

        {/* PROTECTED DASHBOARD ROUTES (Wrapped in Layout) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
           {/* The "Index" is the Overview (Stats, Bento Grid) */}
           <Route index element={<motion.div {...pageMotionProps}><DashboardOverview /></motion.div>} />
           
           {/* Clean sub-routes */}
           <Route path="courses" element={<motion.div {...pageMotionProps}><CoursesList /></motion.div>} />
           <Route path="internships" element={<motion.div {...pageMotionProps}><InternshipDashboard /></motion.div>} />
           <Route path="assignments" element={<motion.div {...pageMotionProps}><StudentAssignmentView /></motion.div>} />
           <Route path="interviews" element={<motion.div {...pageMotionProps}><MockInterviewWrapper /></motion.div>} />
           <Route path="practice" element={<motion.div {...pageMotionProps}><QuestionListPage /></motion.div>} />
           <Route path="assignments" element={<motion.div {...pageMotionProps}><StudentAssignmentViewWrapper /></motion.div>} />
           {/* Teacher Specific Routes (Can add role checks inside components) */}
           <Route path="teacher/create-internship" element={<CreateInternship />} />
           <Route path="teacher/add-question" element={<AddQuestionPage />} />
           <Route path="teacher/manage-courses" element={<ManageCourses />} />
           <Route path="teacher/assignments" element={<motion.div {...pageMotionProps}><AssignmentManager /></motion.div>} />
        </Route>

        {/* FULL SCREEN MODES (No Top Nav) */}
        <Route path="/student/internship/:projectId" element={<InternshipWorkspaceWrapper />} />
        <Route path="/student/course/:courseId" element={<CourseViewer />} />
        <Route path="/student/solve/:questionId" element={<SolveProblemPage />} />
        <Route path="/student/mock-interview/:sessionId" element={<MockInterviewSessionWrapper />} />

        {/* Redirect old routes */}
        <Route path="/profile" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </AnimatePresence>
  );
}
function StudentAssignmentViewWrapper() {
    const [user, setUser] = useState(null);
    useEffect(() => { supabase.auth.getUser().then(({data}) => setUser(data.user)) }, []);
    if(!user) return null;
    return <StudentAssignmentView user={user} />;
}
// --- WRAPPERS ---
function InternshipWorkspaceWrapper() {
    const [user, setUser] = useState(null);
    const { projectId } = useParams();
    useEffect(() => { supabase.auth.getUser().then(({data}) => setUser(data.user)) }, []);
    if(!user) return null;
    return <InternshipWorkspace user={user} projectId={projectId} />;
}

function MockInterviewWrapper() {
  // Just the landing page for interviews
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

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}