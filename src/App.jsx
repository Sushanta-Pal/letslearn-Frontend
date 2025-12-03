// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";
import ProfilePage from "./pages/ProfilePage";
import CourseUploadPage from "./pages/CourseUploadPage"; // ⬅️ NEW

// AWS Amplify
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION,
    },
  },
});

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
        {/* Landing / Dashboard */}
        <Route
          path="/"
          element={
            <motion.div {...pageMotionProps}>
              <Dashboard />
            </motion.div>
          }
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={
            <motion.div {...pageMotionProps}>
              <SignUpPage />
            </motion.div>
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            <motion.div {...pageMotionProps}>
              <LoginPage />
            </motion.div>
          }
        />

        {/* Course Detail */}
        <Route
          path="/course/:slug"
          element={
            <motion.div {...pageMotionProps}>
              <CoursePage />
            </motion.div>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <motion.div {...pageMotionProps}>
              <ProfilePage />
            </motion.div>
          }
        />

        {/* ⬇️ NEW: Creator Course Upload Page */}
        <Route
          path="/courses-upload"
          element={
            <motion.div {...pageMotionProps}>
              <CourseUploadPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
