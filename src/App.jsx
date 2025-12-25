import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import AddQuestionPage from "./pages/Teacher/AddQuestionPage"; 
import QuestionListPage from "./pages/student/QuestionList"; 
import CourseViewer from "./pages/student/CourseViewer";
import SolveProblemPage from "./pages/student/SolveProblemPage";
import CreateInternship from "./pages/Teacher/CreateInternship";

// --- CHANGED IMPORTS HERE ---
import InternshipBoard from "./pages/student/Internship/InternshipDashboard"; // The Dashboard (List of jobs)
import InternshipWorkspace from "./pages/student/Internship/InternshipWorkspace"; // <--- ADD THIS (The Kanban Board)
import MockInterviewView from "./pages/student/MockInterviewView"; 
import { supabase } from './supabaseClient';

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
        <Route path="/" element={<motion.div {...pageMotionProps}><Dashboard /></motion.div>} />
        <Route path="/signup" element={<motion.div {...pageMotionProps}><SignUpPage /></motion.div>} />
        <Route path="/login" element={<motion.div {...pageMotionProps}><LoginPage /></motion.div>} />
        
        {/* --- STUDENT DASHBOARD ROUTES --- */}
        <Route path="/profile" element={<motion.div {...pageMotionProps}><ProfilePage /></motion.div>} />
        <Route path="/student/assignments" element={<motion.div {...pageMotionProps}><ProfilePage defaultTab="assignments" /></motion.div>} />
        <Route path="/student/mock-interview" element={<motion.div {...pageMotionProps}><ProfilePage defaultTab="mock-interview" /></motion.div>} />
        <Route path="/student/courses" element={<motion.div {...pageMotionProps}><ProfilePage defaultTab="courses" /></motion.div>} />
        
        <Route path="/student/internships" element={<motion.div {...pageMotionProps}><ProfilePage defaultTab="internships" /></motion.div>} />
        
        {/* --- FIX IS HERE: This route now uses the Workspace Wrapper --- */}
        <Route path="/student/internship/:projectId" element={<InternshipWorkspaceWrapper />} />
        
        <Route path="/student/mock-interview/:sessionId" element={<MockInterviewViewWrapper />} />

        {/* Practice & Learning Routes */}
        <Route path="/student/questions" element={<motion.div {...pageMotionProps}><QuestionListPage /></motion.div>} />
        <Route path="/student/course/:courseId" element={<CourseViewer />} />
        <Route path="/student/solve/:questionId" element={<SolveProblemPage />} />
        
        {/* --- TEACHER DASHBOARD ROUTES --- */}
        <Route path="/teacher/add-question" element={<motion.div {...pageMotionProps}><AddQuestionPage /></motion.div>} />
        <Route path="/teacher/create-task" element={<motion.div {...pageMotionProps}><ProfilePage defaultTab="task-builder" /></motion.div>} />
        <Route path="/teacher/create-internship" element={<CreateInternship />} />
        <Route path="/teacher/assignments" element={<motion.div {...pageMotionProps}><ProfilePage defaultTab="assignments" /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
}

// --- WRAPPERS ---

// RENAMED & UPDATED: This now renders the WORKSPACE
function InternshipWorkspaceWrapper() {
    const [user, setUser] = useState(null);
    const { projectId } = useParams();

    useEffect(() => { supabase.auth.getUser().then(({data}) => setUser(data.user)) }, []);
    if(!user) return null;
    
    // RENDER WORKSPACE, NOT DASHBOARD
    return <InternshipWorkspace user={user} projectId={projectId} />;
}

function MockInterviewViewWrapper() {
    const [user, setUser] = useState(null);
    const { sessionId } = useParams();

    useEffect(() => { supabase.auth.getUser().then(({data}) => setUser(data.user)) }, []);
    if(!user) return null;
    return <MockInterviewView user={user} initialSessionId={sessionId} />;
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;