import React from "react";
import { useParams } from "react-router-dom";
import { courses } from "../data/Course";

export default function CoursePage() {
  const { slug } = useParams();
  const course = courses[slug];

  if (!course) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex items-center justify-center">
        <p className="text-xl text-gray-400">Course Not Found 😢</p>
      </div>
    );
  }

  const {
    title,
    description,
    banner,
    duration,
    level,
    lessons,
    rating,
    tags = [],
    highlights = [],
    syllabus = [],
  } = course;

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* HERO / BANNER */}
      <section className="relative w-full h-[260px] md:h-[340px] lg:h-[380px] overflow-hidden">
        <img
          src={banner}
          alt={title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#060606]" />

        <div className="relative h-full max-w-5xl mx-auto px-6 flex flex-col justify-end pb-10">
          <div className="flex flex-wrap gap-3 items-center mb-3">
            <span className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/15 uppercase tracking-wide text-gray-200">
              Course
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-[#FF4A1F]/10 border border-[#FF4A1F]/40 text-[#FFB199]">
              {level}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            {title}
          </h1>

          <p className="mt-3 text-sm md:text-base text-gray-300 max-w-2xl">
            {description}
          </p>

          <div className="mt-4 flex flex-wrap gap-6 text-xs md:text-sm text-gray-300">
            <MetaStat label="Duration" value={duration} />
            <MetaStat label="Lessons" value={`${lessons} lessons`} />
            <RatingStat rating={rating} />
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-6 py-10 lg:py-12">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs rounded-full border border-gray-800 bg-[#0B0B0B] text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Layout: Left content, Right sticky summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT: Overview & Syllabus */}
          <div className="lg:col-span-8 space-y-10">
            {/* What you'll learn */}
            {highlights.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-semibold">
                  What you&apos;ll learn
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-gray-800 bg-[#0B0B0B] px-3.5 py-3"
                    >
                      <CheckIcon />
                      <p className="text-sm text-gray-200">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Syllabus */}
            {syllabus.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-semibold">
                  Course syllabus
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Step-by-step modules to take you from fundamentals to
                  job-ready skills.
                </p>

                <div className="mt-4 rounded-2xl border border-gray-800 bg-[#050505] overflow-hidden">
                  {syllabus.map((topic, idx) => (
                    <div
                      key={idx}
                      className={`px-4 md:px-5 py-3.5 flex items-start gap-3 text-sm ${
                        idx !== syllabus.length - 1
                          ? "border-b border-gray-900/70"
                          : ""
                      } hover:bg-white/2 transition-colors`}
                    >
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#111] text-[11px] text-gray-300 border border-gray-700">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-200">{topic}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Sticky Summary / CTA */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="relative rounded-2xl border border-gray-800 bg-gradient-to-br from-[#0B0B0B] via-[#080808] to-[#050505] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                {/* Glow accent */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl border border-white/5 ring-1 ring-[#FF4A1F]/5" />

                <div className="relative">
                  <p className="text-xs font-semibold text-[#FFB199] uppercase tracking-wide mb-1">
                    Included
                  </p>

                  <ul className="space-y-1.5 text-sm text-gray-200 mb-4">
                    <li>• Full access to all lessons</li>
                    <li>• Lifetime access to this course</li>
                    <li>• Certificate of completion</li>
                    <li>• Access from any device</li>
                  </ul>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
                    <span className="flex items-center gap-1.5">
                      <Dot /> <span>{duration}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Dot /> <span>{lessons} lessons</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Dot /> <span>{level}</span>
                    </span>
                  </div>

                  <button className="w-full py-3 rounded-xl bg-[#FF4A1F] text-black font-semibold text-sm md:text-base shadow-[0_0_24px_-4px_#ff4a1f] hover:brightness-95 transition-all">
                    Start Learning Now
                  </button>

                  <p className="mt-3 text-[11px] text-gray-500">
                    No credit card required for preview access. Upgrade anytime
                    from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ----------------- Small Presentational Components ----------------- */

function MetaStat({ label, value }) {
  return (
    <div className="flex flex-col text-xs text-gray-300">
      <span className="font-semibold text-sm">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-gray-400">
        {label}
      </span>
    </div>
  );
}

function RatingStat({ rating }) {
  const fullStars = Math.round(rating);

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, idx) => (
          <svg
            key={idx}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={idx < fullStars ? "text-[#FFB020]" : "text-gray-600"}
          >
            <path
              fill="currentColor"
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
        ))}
      </div>
      <span className="text-xs text-gray-300">{rating.toFixed(1)} / 5</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-[#111] border border-gray-700">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 13l3.5 3.5L19 6"
          stroke="#FF4A1F"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Dot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500" />;
}
