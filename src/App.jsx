import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import AddQuestionPage from "./pages/Teacher/AddQuestionPage"; 
import QuestionListPage from "./pages/student/QuestionList"; 
import CourseViewer from "./pages/student/CourseViewer";
import SolveProblemPage from "./pages/student/SolveProblemPage";


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
        
        {/* Profile & Student Dashboard Routes */}
        <Route path="/profile" element={<motion.div {...pageMotionProps}><ProfilePage /></motion.div>} />
        <Route path="/student/assignments" element={<motion.div {...pageMotionProps}><ProfilePage defaultTab="assignments" /></motion.div>} />
        <Route path="/student/mock-interview" element={<motion.div {...pageMotionProps}><ProfilePage defaultTab="mock-interview" /></motion.div>} />
        <Route path="/student/courses" element={<motion.div {...pageMotionProps}><ProfilePage defaultTab="courses" /></motion.div>} />
        <Route path="/student/questions" element={<motion.div {...pageMotionProps}><QuestionListPage /></motion.div>} />
        <Route path="/student/course/:courseId" element={<CourseViewer />} />
        <Route path="/student/solve/:questionId" element={<SolveProblemPage />} />
        {/* Teacher Routes */}
        <Route path="/teacher/add-question" element={<motion.div {...pageMotionProps}><AddQuestionPage /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;