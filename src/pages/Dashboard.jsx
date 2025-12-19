import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Loader from "../components/Loader";
import SplitText from "../components/texts/SplitText";
import heroImage from "../assets/heroImage.png";
import TrustedBy from "../components/TrustedBy";
import PricingCard from "../components/PricingCard";
import PricingBanner from "../components/PricingBanner";
import CourseCard from "../components/CourseCard";
import Testimonial from "../components/ui/Testimonial";
import FeatureSection from "../components/ui/FeatureSection";
import MobileNav from "@/components/ui/MobileNav";
import { courses as courseMap } from "../data/Course";
// Import Supabase client to check auth status
import { supabase } from "../supabaseClient";

export default function FoxBirdLanding() {
  // --- AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // --- EXISTING DATA STATE ---
  const [courses, setCourses] = useState([
    {
      id: 1,
      slug: "modern-react-with-hooks",
      title: "Modern React with Hooks",
      description:
        "Go from beginner to advanced in React.js by building real-world applications. Master hooks, context, and Redux.",
      level: "Intermediate",
      duration: "12 Hours",
      rating: 4.8,
      imageUrl:
        "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=1470&q=80",
      isTrending: true,
    },
    {
      id: 2,
      slug: "advanced-tailwind-css",
      title: "Advanced Tailwind CSS",
      description:
        "Master the utility-first CSS framework. Learn advanced techniques, customization, and how to build complex responsive layouts.",
      level: "Advanced",
      duration: "8 Hours",
      rating: 4.9,
      imageUrl:
        "https://images.unsplash.com/photo-1667835950375-40b5211a26d7?auto=format&fit=crop&w=1470&q=80",
      isTrending: false,
    },
    {
      id: 3,
      slug: "complete-nodejs-developer",
      title: "Complete Node.js Developer",
      description:
        "Learn Node.js from scratch. Build, test, and deploy real-time applications with Express, MongoDB, and more.",
      level: "All Levels",
      duration: "22 Hours",
      rating: 4.7,
      imageUrl:
        "https://images.unsplash.com/photo-1639628735078-ed2f038a193e?auto=format&fit=crop&w=1470&q=80",
      isTrending: true,
    },
    {
      id: 4,
      slug: "data-structures-and-algorithms",
      title: "Data Structures & Algorithms",
      description:
        "Ace your coding interviews. A deep dive into fundamental data structures and algorithms with practical examples.",
      level: "Intermediate",
      duration: "18 Hours",
      rating: 4.6,
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1470&q=80",
      isTrending: false,
    },
    {
      id: 5,
      slug: "python-django-fullstack-web",
      title: "Python & Django Full Stack Web",
      description:
        "Build and deploy powerful web applications with Python, Django, and a RESTful API. Includes databases and authentication.",
      level: "All Levels",
      duration: "30 Hours",
      rating: 4.7,
      imageUrl:
        "https://images.unsplash.com/photo-1529101091768-7b9ada2a596b?auto=format&fit=crop&w=1470&q=80",
      isTrending: true,
    },
    {
      id: 6,
      slug: "ui-ux-design-fundamentals",
      title: "UI/UX Design Fundamentals",
      description:
        "Learn the principles of user interface and user experience design. Master Figma, wireframing, and prototyping.",
      level: "Beginner",
      duration: "10 Hours",
      rating: 4.8,
      imageUrl:
        "https://images.unsplash.com/photo-1581291518857-4e261b9e566D?auto=format&fit=crop&w=1470&q=80",
      isTrending: false,
    },
  ]);

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- EFFECTS ---
  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUserRole(extractRole(session));
    });

    // 2. Listen for changes (login, logout, auto-refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserRole(extractRole(session));
    });

    // 3. Simulate loading for 1.5s
    const timer = setTimeout(() => setLoading(false), 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <motion.div
      className="min-h-screen bg-[#0A0A0A] text-white antialiased"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
    >
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur-sm bg-black/30">
        {/* Backdrop for mobile menu */}
        {isMobileNavOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
          />
        )}

        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between relative z-50">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF4A1F] flex items-center justify-center font-bold">
              FB
            </div>
            <span className="sr-only">Fox Bird — home</span>
            <span className="hidden sm:inline-block font-semibold">
              Fox Bird
            </span>
          </a>

          {/* Desktop nav */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-6 text-sm text-gray-300"
          >
            <a href="#how-it-works" className="hover:text-white">
              Features
            </a>
            <a href="#courses" className="hover:text-white">
              Courses
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            {/* ⬇️ NEW: ROLE-BASED LINKS */}
            {isLoggedIn && userRole === 'Student' && (
              <a href="/student/questions" className="text-[#FF4A1F] font-bold hover:brightness-125">
                Problems
              </a>
            )}

            {isLoggedIn && userRole === 'Teacher' && (
              <a href="/teacher/add-question" className="text-[#FF4A1F] font-bold hover:brightness-125">
                Contribute
              </a>
            )}
            {/* CONDITIONAL AUTH BUTTONS */}
            {!isLoggedIn ? (
              <>
                <a href="/login" className="hover:text-white">
                  Login
                </a>
                <a
                  href="/signup"
                  className="ml-4 inline-block px-4 py-2 rounded-full bg-[#FF4A1F] text-black font-semibold shadow"
                >
                  Sign Up
                </a>
              </>
            ) : (
              <a
                href="/profile"
                className="ml-4 inline-block px-4 py-2 rounded-full bg-[#FF4A1F] text-black font-semibold shadow hover:brightness-110 transition-all"
              >
                Profile
              </a>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-2 rounded-md hover:bg-white/5 transition"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
          >
            {isMobileNavOpen ? (
              // X icon
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        <MobileNav
          open={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          isLoggedIn={isLoggedIn}
        />
      </header>

      {/* ... REST OF THE DASHBOARD CONTENT ... */}
      <main>
        <section
          id="hero"
          className="max-w-[1200px] mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12"
        >
          {/* Left content */}
          <div className="lg:w-6/12">
            <div className="text-6xl font-semibold text-start">
              {/* Part 1: "Stop guessing. Get instant " */}
              <SplitText
                text="Stop guessing. Get instant "
                delay={100}
                duration={0.4}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="start"
              />

              {/* Part 2: "AI feedback" (Orange) */}
              <SplitText
                text="AI feedback"
                className="text-orange-500 text-7xl font-bold"
                delay={100}
                duration={0.7}
                ease="bounce.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="start"
              />

              {/* Part 3: " on every line..." */}
              <SplitText
                text=" on every line of code you write."
                delay={100}
                duration={0.4}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="start"
                onLetterAnimationComplete={handleAnimationComplete}
              />
            </div>
            <p className="mt-4 text-gray-300 max-w-xl">
              Interactive courses + live code analysis. Practice in the browser,
              fix mistakes instantly, and ship real projects faster.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={isLoggedIn ? "/profile" : "/signup"}
                className="inline-flex items-center px-5 py-3 rounded-full bg-[#FF4A1F] text-black font-semibold shadow"
                aria-label="Start learning"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Learning for Free"}
              </a>

              <a
                href="#courses"
                className="inline-flex items-center px-5 py-3 rounded-full border border-gray-700 text-gray-200"
              >
                Explore Courses
              </a>
            </div>
          </div>

          {/* Right visual */}
          <div className="lg:w-6/12 w-full flex justify-center">
            <div className="w-full max-w-[520px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#111111] to-[#0b0b0b] shadow-lg">
              <img
                src={heroImage}
                alt="Hero demo showing interactive editor"
                loading="lazy"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </section>

        <div className="hidden md:block max-w-[1200px] mx-auto px-6 py-4 w-full items-center justify-between">
          <TrustedBy />
        </div>

        {/* ... Include all other sections (What You'll Get, How It Works, Testimonials, Courses, Pricing) ... */}
        {/* For brevity, I'm just calling the components here as in your original file */}
        <section
          id="what-you-ll-get"
          className="w-full py-28 bg-gradient-to-b from-[#080808] via-[#080808] to-[#060606] relative overflow-hidden"
        >
          {/* ... (Keep original content) ... */}
          {/* Note: In the CTA button inside 'What You'll Get', update the href similarly if you wish */}
          <div className="absolute -right-72 top-10 w-[700px] h-[700px] rounded-full bg-[#FF4A1F]/8 blur-3xl pointer-events-none transform-gpu" />
          <div className="absolute left-[-120px] bottom-24 w-[420px] h-[420px] rounded-full bg-[#5227FF]/6 blur-2xl pointer-events-none transform-gpu" />

          <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
                What You'll Get
              </h2>
              <p className="mt-4 text-gray-400 max-w-xl">
                Everything you need to go from learning to shipping: hands-on
                practice, real projects, and instant feedback so you can improve
                every day.
              </p>
              {/* ... features list ... */}
              <div className="mt-10 space-y-8">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#111] flex items-center justify-center mb-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12l4 4L19 7"
                        stroke="#FF4A1F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      Interactive Editor
                    </h4>
                    <p className="text-gray-400 mt-1">
                      Run code in the browser, see test results, and get inline
                      suggestions — no setup required.
                    </p>
                  </div>
                </div>
                {/* ... other feature items ... */}
              </div>

              <div className="mt-8">
                <a
                  href={isLoggedIn ? "/profile" : "/signup"}
                  className="inline-flex items-center px-5 py-3 rounded-full bg-[#FF4A1F] text-black font-semibold shadow-lg"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Get Started — It's Free"}
                </a>
              </div>
            </div>
            {/* ... Right Visuals Column ... */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="relative w-full flex justify-center lg:justify-end">
                <div className="max-w-[540px] w-full transform transition-transform duration-700 hover:-translate-y-3">
                  <div className="relative">
                    <div className="absolute -left-8 -top-8 opacity-60 transform rotate-6">
                      <InteractiveWhatYouGet />
                    </div>
                    <div className="absolute right-8 top-24 opacity-90 scale-95 drop-shadow-2xl">
                      <InteractiveWhatYouGet small />
                    </div>
                    <div className="relative bg-gradient-to-br from-[#0b0b0b] to-[#0f0f10] p-6 rounded-2xl shadow-2xl">
                      <div className="w-full h-[220px] flex items-center justify-center text-gray-500">
                        <InteractiveWhatYouGet small />
                      </div>
                      <div className="absolute -bottom-6 left-6">
                        <div className="w-14 h-14 bg-[#111] rounded-lg flex items-center justify-center ring-2 ring-[#FF4A1F]/40">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <text
                              x="12"
                              y="15"
                              fontSize="12"
                              fontWeight="700"
                              textAnchor="middle"
                              fill="#FF4A1F"
                            >
                              &lt;/&gt;
                            </text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-[#0F0F10] py-14">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-2xl font-bold">The Fox Bird Difference</h2>
            <p className="mt-2 text-gray-400 max-w-2xl">
              A new way to practice code — learn, practice, and get real-time
              feedback.
            </p>
            <FeatureSection />
          </div>
        </section>

        <section id="testimonials" className="py-14">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-2xl font-bold">
              Don't just take our word for it
            </h2>
            <Testimonial />
          </div>
        </section>

        <section id="courses" className="py-14 bg-[#0F0F10]">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-2xl font-bold">Explore Our Courses</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(courseMap).map(([slug, data], index) => (
                <CourseCard
                  key={slug}
                  course={{
                    slug,
                    id: index + 1,
                    title: data.title,
                    description: data.description,
                    level: data.level,
                    duration: data.duration,
                    rating: data.rating,
                    imageUrl: data.banner,
                    isTrending: index === 0,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-14 bg-[#0F0F10]">
          <div className="flex flex-wrap gap-8 justify-center mt-20">
            <PricingBanner />
            <PricingCard
              tier="Basic"
              price="499"
              features={[
                "Access to all basic courses",
                "Community support",
                "10 practice projects",
                "Completion certificate",
                "Basic code review",
              ]}
            />
            <PricingCard
              tier="Pro"
              price="1499"
              highlighted
              features={[
                "Access to all Pro courses",
                "Priority support",
                "30 practice projects",
                "Completion certificate",
                "Advanced code review",
                "1-on-1 mentoring sessions",
              ]}
            />
            <PricingCard
              tier="Enterprise"
              price="4999"
              features={[
                "All courses",
                "Dedicated support",
                "Unlimited projects",
                "Premium code review",
                "Weekly mentoring",
                "Job guarantee",
              ]}
            />
          </div>
        </section>

        <section
          id="final-cta"
          className="py-16 bg-gradient-to-r from-[#FF4A1F] to-[#E03E13] text-black"
        >
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">
                Ready to master your skills?
              </h3>
              <p className="mt-1">
                Join thousands of learners building real projects and shipping
                code with confidence.
              </p>
            </div>
            <a
              href={isLoggedIn ? "/profile" : "/signup"}
              className="inline-block px-6 py-3 rounded-full bg-black text-white font-semibold"
            >
              {isLoggedIn
                ? "Go to Your Dashboard"
                : "Sign Up and Start Learning Now"}
            </a>
          </div>
        </section>

        <footer className="bg-[#050505] text-gray-300 py-10">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold">Fox Bird</h4>
              <p className="text-sm text-gray-500 mt-2">
                Interactive courses, in-browser projects, and real-time AI
                feedback.
              </p>
            </div>
            <FooterColumn
              title="Product"
              links={[
                { label: "Features", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
                { label: "Courses", href: "#courses" },
              ]}
            />
            <FooterColumn
              title="Resources"
              links={[
                { label: "Docs", href: "/docs" },
                { label: "Blog", href: "/blog" },
                { label: "Help", href: "/help" },
              ]}
            />
            <div>
              <h4 className="font-semibold">Legal</h4>
              <ul className="mt-2 text-sm text-gray-500">
                <li>
                  <a href="/privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms">Terms</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-600">
            © 2025 Fox Bird. All rights reserved.
          </div>
        </footer>
      </main>
    </motion.div>
  );
}

/* --- Internal Helper Components (Keep these as they were) --- */
function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-semibold">{title}</h4>
      <ul className="mt-2 text-sm text-gray-500 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhatYouGetSVG({ small = false }) {
  const w = small ? 260 : 520;
  const h = small ? 160 : 320;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 920 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of overlapping code editor windows"
    >
      <defs>
        <linearGradient id="wg-bg" x1="0" x2="1">
          <stop offset="0" stopColor="#0f0f10" />
          <stop offset="1" stopColor="#0b0b0b" />
        </linearGradient>
        <linearGradient id="wg-panel" x1="0" x2="1">
          <stop offset="0" stopColor="#1b1b1c" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
        <linearGradient id="wg-accent" x1="0" x2="1">
          <stop offset="0" stopColor="#ff6b3a" />
          <stop offset="1" stopColor="#ff3d12" />
        </linearGradient>
        <filter id="wg-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="20"
            stdDeviation="30"
            floodColor="#000"
            floodOpacity="0.6"
          />
        </filter>
        <filter id="wg-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="16"
            floodColor="#000"
            floodOpacity="0.45"
          />
        </filter>
      </defs>
      <g transform="translate(180,30) rotate(-2 300 160)">
        <rect
          x="0"
          y="0"
          rx="22"
          width="560"
          height="320"
          fill="url(#wg-bg)"
          filter="url(#wg-soft)"
        />
        <rect x="0" y="0" rx="22" width="560" height="48" fill="#2a2a2c" />
        <circle cx="34" cy="24" r="6" fill="#ff605c" />
        <circle cx="58" cy="24" r="6" fill="#ffbd2e" />
        <circle cx="82" cy="24" r="6" fill="#28c840" />
        <g opacity="0.65" transform="translate(36,80)">
          <rect x="0" y="0" width="18" height="120" rx="4" fill="#121212" />
          <rect x="36" y="0" width="180" height="12" rx="6" fill="#151515" />
          <rect x="36" y="22" width="120" height="10" rx="6" fill="#151515" />
          <rect x="36" y="44" width="220" height="10" rx="6" fill="#151515" />
        </g>
      </g>
      <g transform="translate(480,120)" filter="url(#wg-shadow)">
        <g id="float-mid">
          <rect
            x="0"
            y="0"
            width="260"
            height="180"
            rx="14"
            fill="#121212"
            stroke="#1a1a1a"
          />
          <rect x="12" y="12" width="236" height="20" rx="8" fill="#171717" />
          <g transform="translate(18,46)">
            <rect x="0" y="0" width="180" height="10" rx="6" fill="#222" />
            <rect x="0" y="22" width="210" height="10" rx="6" fill="#222" />
            <rect x="0" y="44" width="150" height="10" rx="6" fill="#222" />
            <rect x="6" y="0" width="12" height="10" rx="3" fill="#9cdcfe" />
            <rect x="28" y="0" width="40" height="10" rx="3" fill="#c586c0" />
            <rect x="6" y="22" width="22" height="10" rx="3" fill="#dcdcaa" />
            <rect x="34" y="44" width="18" height="10" rx="3" fill="#ce9178" />
          </g>
          <rect
            x="-8"
            y="120"
            width="56"
            height="44"
            rx="8"
            fill="url(#wg-accent)"
            stroke="#2a2a2a"
          />
          <text
            x="20"
            y="148"
            textAnchor="middle"
            fontSize="20"
            fontWeight="700"
            fill="#fff"
          >
            &lt;/&gt;
          </text>
        </g>
        <animateTransform
          xlinkHref="#float-mid"
          attributeName="transform"
          type="translate"
          values="0 0; 0 -8; 0 0"
          dur="5.6s"
          repeatCount="indefinite"
        />
      </g>
      <g transform="translate(240,220)" id="front-window">
        <rect
          x="0"
          y="0"
          rx="16"
          width="340"
          height="180"
          fill="#121212"
          opacity="0.98"
        />
        <rect x="0" y="0" rx="16" width="340" height="48" fill="#222229" />
        <circle cx="28" cy="24" r="6" fill="#ff605c" />
        <circle cx="52" cy="24" r="6" fill="#ffbd2e" />
        <circle cx="76" cy="24" r="6" fill="#28c840" />
        <rect x="26" y="64" width="120" height="12" rx="6" fill="#151515" />
        <rect x="26" y="88" width="260" height="10" rx="6" fill="#151515" />
        <rect x="26" y="106" width="200" height="10" rx="6" fill="#151515" />
        <g id="front-badge" transform="translate(220,110)">
          <rect
            x="0"
            y="0"
            width="72"
            height="56"
            rx="10"
            fill="url(#wg-accent)"
          />
          <text
            x="36"
            y="34"
            textAnchor="middle"
            fontSize="20"
            fontWeight="700"
            fill="#fff"
          >
            &lt;/&gt;
          </text>
        </g>
        <animateTransform
          xlinkHref="#front-badge"
          attributeName="transform"
          type="translate"
          values="220 110; 220 106; 220 110"
          dur="6.8s"
          repeatCount="indefinite"
        />
      </g>
      <g transform="translate(120,320) scale(0.85)" opacity="0.95">
        <rect x="0" y="0" rx="12" width="220" height="120" fill="#0f0f10" />
        <rect x="0" y="0" rx="12" width="220" height="36" fill="#222" />
        <circle cx="20" cy="18" r="5" fill="#ff605c" />
        <rect x="18" y="56" width="180" height="10" rx="6" fill="#151515" />
        <rect x="18" y="76" width="140" height="10" rx="6" fill="#151515" />
        <rect
          x="12"
          y="36"
          width="48"
          height="36"
          rx="8"
          fill="url(#wg-accent)"
        />
        <text
          x="36"
          y="60"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#fff"
        >
          &lt;/&gt;
        </text>
      </g>
    </svg>
  );
}

function InteractiveWhatYouGet({ small = false }) {
  const ref = React.useRef(null);
  const [style, setStyle] = React.useState({ transform: "translate3d(0,0,0)" });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tx = (x - 0.5) * 24;
      const ty = (y - 0.5) * 18;
      const rz = (x - 0.5) * 3;
      setStyle({
        transform: `translate3d(${tx}px, ${ty}px, 0) rotate(${rz}deg)`,
        transition: "transform 160ms linear",
      });
    }
    function onLeave() {
      setStyle({
        transform: "translate3d(0,0,0)",
        transition: "transform 600ms cubic-bezier(.2,.9,.25,1)",
      });
    }
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener(
      "touchmove",
      (ev) => {
        if (!ev.touches || ev.touches.length === 0) return;
        const t = ev.touches[0];
        onMove(t);
      },
      { passive: true }
    );
    el.addEventListener("touchend", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchend", onLeave);
    };
  }, []);
  return (
    <div ref={ref} style={style} className="will-change-transform inline-block">
      <WhatYouGetSVG small={small} />
    </div>
  );
}
