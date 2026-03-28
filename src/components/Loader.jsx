// LandingSkeleton.tsx / LandingSkeleton.jsx
import { motion } from "framer-motion";

const shimmerVariants = {
  shimmer: {
    background: [
      "linear-gradient(90deg, #171717 25%, #222 50%, #171717 75%)",
      "linear-gradient(90deg, #222 25%, #171717 50%, #222 75%)",
    ],
    transition: {
      background: {
        repeat: Infinity,
        duration: 1.4,
        ease: "linear",
      },
    },
  },
};

const SkeletonBlock = ({ className = "" }) => (
  <motion.div
    className={`rounded-lg bg-[#171717] ${className}`}
    variants={shimmerVariants}
    animate="shimmer"
    style={{
      background: "linear-gradient(90deg, #171717 25%, #222 50%, #171717 75%)",
    }}
  />
);

const Loader = () => {
  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-white antialiased"
      aria-busy="true"
      aria-label="Loading Placium"
    >
      {/* NAVBAR SKELETON */}
      <header className="sticky top-0 z-40 backdrop-blur-sm bg-black/30">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <SkeletonBlock className="w-10 h-10 rounded-full" />
            <SkeletonBlock className="hidden sm:block h-4 w-20 rounded-md" />
          </div>

          {/* Nav links + CTA */}
          <div className="hidden md:flex items-center gap-5">
            <SkeletonBlock className="h-4 w-14" />
            <SkeletonBlock className="h-4 w-14" />
            <SkeletonBlock className="h-4 w-14" />
            <SkeletonBlock className="h-4 w-14" />
            <SkeletonBlock className="h-9 w-24 rounded-full" />
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <SkeletonBlock className="w-8 h-8 rounded-md" />
          </div>
        </div>
      </header>

      {/* HERO SKELETON */}
      <main>
        <section className="max-w-[1200px] mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Left column: heading + text + buttons */}
          <div className="lg:w-6/12 w-full space-y-5">
            {/* Simulate multi-line big heading */}
            <SkeletonBlock className="h-10 w-11/12 rounded-md" />
            <SkeletonBlock className="h-10 w-10/12 rounded-md" />
            <SkeletonBlock className="h-10 w-9/12 rounded-md" />
            <SkeletonBlock className="h-10 w-7/12 rounded-md" />

            {/* body text */}
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-9/12" />
              <SkeletonBlock className="h-4 w-7/12" />
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <SkeletonBlock className="h-11 w-52 rounded-full" />
              <SkeletonBlock className="h-11 w-44 rounded-full" />
            </div>
          </div>

          {/* Right column: hero illustration placeholder */}
          <div className="lg:w-6/12 w-full flex justify-center">
            <SkeletonBlock className="w-full max-w-[520px] h-[320px] rounded-2xl" />
          </div>
        </section>

        {/* You can optionally hint at lower sections with light skeletons */}
        <section className="max-w-[1200px] mx-auto px-6 pb-16 space-y-8">
          {/* Trusted by row */}
          <SkeletonBlock className="h-12 w-full rounded-xl" />

          {/* Three small cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <SkeletonBlock className="h-32 w-full rounded-2xl" />
            <SkeletonBlock className="h-32 w-full rounded-2xl" />
            <SkeletonBlock className="h-32 w-full rounded-2xl" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Loader;
