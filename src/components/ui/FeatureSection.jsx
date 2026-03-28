import React from "react";

/**
 * FeatureSection — Placium themed features area
 * - Dark theme, orange accent, subtle microinteractions
 * - Accessible (semantic elements + focus states)
 *
 * Paste this component into your project and render where needed.
 */

const FEATURES = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        className="text-[#FF4A1F] shrink-0"
        aria-hidden="true"
      >
        <path
          d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
          stroke="currentColor"
          strokeWidth="0"
          fill="currentColor"
        />
      </svg>
    ),
    title: "Lightning-fast setup",
    description:
      "Launch production-ready pages in minutes with prebuilt components and starter kits.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        className="text-[#FF4A1F] shrink-0"
        aria-hidden="true"
      >
        <path
          d="M7 10v12"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Pixel perfect",
    description:
      "Modern Figma-driven UI that translates 1:1 to pixel-perfect code components.",
    highlight: true,
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        className="text-[#FF4A1F] shrink-0"
        aria-hidden="true"
      >
        <path
          d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"
          fill="currentColor"
        />
        <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
        <circle cx="17.5" cy="17.5" r="3.5" fill="currentColor" />
      </svg>
    ),
    title: "Highly customizable",
    description:
      "Tailwind utility-first classes and tokens make customization trivial.",
  },
  {
    icon: (
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="text-[#FF4A1F] shrink-0"
      >
        <path
          d="M12 2v20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 12h18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Real projects",
    description:
      "Hands-on guided projects that become portfolio-ready with deployable demos.",
  },
];

export default function FeatureSection() {
  return (
    <section
      className="w-full bg-gradient-to-b from-[#060606] to-[#070707] py-16 lg:py-24"
      aria-labelledby="features-heading"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Intro */}
        <div className="text-center lg:text-left max-w-3xl mx-auto lg:mx-0">
          <span className="inline-flex items-center px-4 py-1 rounded-full bg-[#0F0F10] border border-gray-800 text-sm text-[#FFDCCB] font-medium">
            Features
          </span>

          <h2
            id="features-heading"
            className="mt-6 text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Built for builders — fast, reliable, delightful.
          </h2>

          <p className="mt-3 text-gray-400 max-w-2xl">
            Components, patterns, and end-to-end projects — everything you need
            to practice, build, and ship with confidence.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, idx) => {
            const isHighlighted = !!f.highlight;
            return (
              <article
                key={idx}
                className={`relative group rounded-2xl p-6 border transition-transform duration-300 focus-within:translate-y-0.5
                  ${
                    isHighlighted
                      ? "bg-gradient-to-br from-[#FF4A1F] to-[#FF6B3A] text-black border-transparent shadow-xl scale-[1.01]"
                      : "bg-[#0B0B0B] border-gray-800 text-gray-200 hover:translate-y-[-6px]"
                  }
                `}
                tabIndex={0}
                aria-labelledby={`feature-${idx}`}
                role="article"
              >
                {/* subtle animated background glow for highlighted */}
                {isHighlighted && (
                  <span
                    aria-hidden
                    className="absolute -inset-0.5 rounded-2xl blur-[30px] opacity-30"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,74,31,0.12), rgba(255,107,58,0.08))",
                    }}
                  />
                )}

                <div className="relative z-10 flex items-start gap-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                      isHighlighted ? "bg-black/10" : "bg-[#111]"
                    } shrink-0`}
                  >
                    {f.icon}
                  </div>

                  <div className="min-w-0">
                    <h3
                      id={`feature-${idx}`}
                      className={`text-base font-semibold ${
                        isHighlighted ? "text-black" : "text-white"
                      }`}
                    >
                      {f.title}
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        isHighlighted ? "text-black/80" : "text-gray-400"
                      } line-clamp-3`}
                    >
                      {f.description}
                    </p>

                    {/* micro CTA for highlighted item */}
                    {isHighlighted && (
                      <div className="mt-4">
                        <a
                          href="#signup"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black text-[#FF4A1F] font-semibold text-sm shadow-sm hover:opacity-95 transition"
                        >
                          Try Pro features
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* focus ring */}
                <span className="absolute -inset-px rounded-2xl ring-0 focus-within:ring-2 focus-within:ring-[#FF4A1F]/40" />
              </article>
            );
          })}
        </div>

        {/* Extra row with badges / benefits */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 bg-[#0F0F10] border border-gray-800 px-3 py-2 rounded-lg">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden
                className="text-[#FF4A1F]"
              >
                <path
                  d="M12 2v20"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm text-gray-300 font-medium">
                Trusted by learners
              </span>
            </div>

            <div className="inline-flex items-center gap-2 bg-[#0F0F10] border border-gray-800 px-3 py-2 rounded-lg">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden
                className="text-[#FF4A1F]"
              >
                <path
                  d="M5 12h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm text-gray-300 font-medium">
                Zero setup required
              </span>
            </div>
          </div>

          <div className="mt-4 sm:mt-0">
            <a
              href="#courses"
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#FF4A1F] text-black font-semibold shadow hover:brightness-95 transition"
            >
              Explore Courses
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
