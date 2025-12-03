import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CourseCard from "../components/CourseCard.jsx";
import {
  Plus,
  Trash2,
  UploadCloud,
  GripVertical,
  FileVideo,
  FileText,
  X,
  ImageIcon,
  CheckCircle2,
  Youtube,
  Sparkles,
} from "lucide-react";

export default function CourseUploadPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [banner, setBanner] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [lessonsCount, setLessonsCount] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [highlights, setHighlights] = useState([""]);

  const thumbnailInputRef = useRef(null);

  // Curriculum State: 'videoUrl' replaces 'file'
  const [curriculum, setCurriculum] = useState([
    {
      id: 1,
      title: "The Vibe Check (Intro)",
      lectures: [
        {
          id: 101,
          title: "What we're building fr",
          type: "video",
          videoUrl: "",
        },
      ],
    },
  ]);

  // --- Handlers (Standard inputs) ---
  const handleTitleChange = (value) => {
    setTitle(value);
    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBanner(URL.createObjectURL(file));
  };

  // --- Curriculum Actions ---
  const addSection = () => {
    setCurriculum((prev) => [
      ...prev,
      { id: Date.now(), title: `Section ${prev.length + 1}`, lectures: [] },
    ]);
  };

  const deleteSection = (id) =>
    setCurriculum((prev) => prev.filter((s) => s.id !== id));

  const addLecture = (sectionId) => {
    setCurriculum((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lectures: [
                ...s.lectures,
                { id: Date.now(), title: "", type: "video", videoUrl: "" },
              ],
            }
          : s
      )
    );
  };

  const deleteLecture = (sectionId, lectureId) => {
    setCurriculum((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lectures: s.lectures.filter((l) => l.id !== lectureId),
            }
          : s
      )
    );
  };

  const updateLecture = (sectionId, lectureId, field, value) => {
    setCurriculum((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lectures: s.lectures.map((l) =>
                l.id === lectureId ? { ...l, [field]: value } : l
              ),
            }
          : s
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const courseData = {
      title,
      slug,
      description,
      banner,
      level,
      curriculum, // Now contains YouTube links
    };
    console.log("Submitting:", courseData);
    alert("Bet. Course data ready to ship! 🚀");
  };

  const previewCourse = {
    title: title || "Untitled Masterpiece",
    description: description || "No cap, this course is fire...",
    level: level,
    duration: duration || "0h 0m",
    rating: 0,
    imageUrl: banner,
    isTrending: false,
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-[#FF4A1F] selection:text-black font-sans">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b border-gray-800 bg-[#060606]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
            >
              <X
                size={20}
                className="group-hover:rotate-90 transition-transform"
              />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#FF4A1F] font-bold flex items-center gap-1">
                Creator Studio <Sparkles size={10} />
              </p>
              <h1 className="text-lg font-bold">Cook Up A New Course</h1>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#FF4A1F] text-black font-bold rounded-full hover:brightness-110 hover:scale-105 active:scale-95 transition-all text-sm shadow-[0_0_15px_rgba(255,74,31,0.4)]"
          >
            Publish 🚀
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Editor */}
          <section className="lg:col-span-7 space-y-10">
            <div className="p-6 rounded-3xl border border-gray-800 bg-[#0A0A0A] space-y-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✨</span>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                  The Basics
                </h2>
              </div>

              <Field label="Course Title" required>
                <input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FF4A1F] focus:ring-1 focus:ring-[#FF4A1F] focus:outline-none transition-all placeholder:text-gray-600"
                  placeholder="e.g. Building the next Facebook (fr)"
                />
              </Field>

              <Field label="Slug (The URL vibe)">
                <div className="flex items-center bg-[#111] border border-gray-700 rounded-xl px-4 py-3 text-gray-500 focus-within:border-[#FF4A1F] focus-within:ring-1 focus-within:ring-[#FF4A1F] transition-all">
                  <span className="text-xs mr-1 text-gray-400">
                    foxbird.com/course/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-transparent text-white focus:outline-none flex-1 placeholder:text-gray-700"
                    placeholder="your-cool-course"
                  />
                </div>
              </Field>

              <Field label="The Tea (Description)" required>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FF4A1F] focus:ring-1 focus:ring-[#FF4A1F] focus:outline-none transition-all resize-none placeholder:text-gray-600"
                  placeholder="Tell 'em why this course is a banger..."
                />
              </Field>

              <Field label="Thumbnail (Make it pop)">
                <div className="flex gap-3">
                  <input
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    placeholder="https://... or upload a pic"
                    className="flex-1 bg-[#111] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FF4A1F] focus:ring-1 focus:ring-[#FF4A1F] focus:outline-none transition-all placeholder:text-gray-600"
                  />
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="bg-[#161616] border border-gray-700 p-3 rounded-xl hover:bg-[#222] hover:border-gray-500 transition-all active:scale-95"
                  >
                    <UploadCloud size={20} className="text-gray-400" />
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Difficulty">
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FF4A1F] focus:ring-1 focus:ring-[#FF4A1F] focus:outline-none appearance-none cursor-pointer hover:bg-[#161616] transition-colors"
                  >
                    <option>Beginner (Noob)</option>
                    <option>Intermediate (Mid)</option>
                    <option>Advanced (Pro)</option>
                    <option>God Tier</option>
                  </select>
                </Field>
                <Field label="Duration">
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 10h 30m"
                    className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#FF4A1F] focus:ring-1 focus:ring-[#FF4A1F] focus:outline-none transition-all placeholder:text-gray-600"
                  />
                </Field>
              </div>
            </div>

            {/* Curriculum */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                  The Content
                </h2>
              </div>

              <AnimatePresence>
                {curriculum.map((section, sIndex) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0A0A0A] border border-gray-800 rounded-3xl overflow-hidden shadow-lg"
                  >
                    <div className="bg-[#111] p-4 flex items-center gap-3 border-b border-gray-800 group">
                      <GripVertical
                        className="text-gray-600 cursor-move hover:text-white transition-colors"
                        size={18}
                      />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Section {sIndex + 1}
                      </span>
                      <input
                        value={section.title}
                        onChange={(e) =>
                          setCurriculum((prev) =>
                            prev.map((s) =>
                              s.id === section.id
                                ? { ...s, title: e.target.value }
                                : s
                            )
                          )
                        }
                        className="bg-transparent font-bold text-white focus:outline-none flex-1 placeholder:text-gray-600"
                        placeholder="Name this section..."
                      />
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="text-gray-600 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      {section.lectures.map((lecture, lIndex) => (
                        <div
                          key={lecture.id}
                          className="flex flex-col gap-3 bg-[#060606] p-4 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors group/lecture"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center text-[10px] text-gray-500 font-mono">
                              {lIndex + 1}
                            </div>
                            <input
                              value={lecture.title}
                              onChange={(e) =>
                                updateLecture(
                                  section.id,
                                  lecture.id,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="bg-transparent text-sm font-medium focus:outline-none flex-1 placeholder:text-gray-600"
                              placeholder="What's this lesson called?"
                            />
                            <button
                              onClick={() =>
                                deleteLecture(section.id, lecture.id)
                              }
                              className="text-gray-600 hover:text-red-500 opacity-0 group-hover/lecture:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* YouTube Link Input */}
                          <div className="flex items-center gap-3 pl-9">
                            <div
                              className={`flex items-center gap-2 flex-1 bg-[#111] border ${
                                lecture.videoUrl
                                  ? "border-green-500/30 bg-green-500/5"
                                  : "border-gray-800"
                              } rounded-xl px-3 py-2.5 transition-all focus-within:border-[#FF4A1F] focus-within:ring-1 focus-within:ring-[#FF4A1F]/20`}
                            >
                              <Youtube
                                size={16}
                                className={
                                  lecture.videoUrl
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              />
                              <input
                                value={lecture.videoUrl}
                                onChange={(e) =>
                                  updateLecture(
                                    section.id,
                                    lecture.id,
                                    "videoUrl",
                                    e.target.value
                                  )
                                }
                                className="bg-transparent text-xs text-gray-300 w-full focus:outline-none placeholder-gray-600"
                                placeholder="Paste the YouTube link (e.g. https://youtu.be/...)"
                              />
                              {lecture.videoUrl && (
                                <CheckCircle2
                                  size={16}
                                  className="text-green-500"
                                />
                              )}
                            </div>
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${
                                lecture.videoUrl
                                  ? "text-green-500 border-green-500/20 bg-green-500/10"
                                  : "text-gray-600 border-gray-800"
                              }`}
                            >
                              {lecture.videoUrl ? "Linked" : "No Link"}
                            </span>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addLecture(section.id)}
                        className="mt-2 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-[#111] rounded-xl border border-dashed border-gray-800 hover:border-gray-600 transition-all"
                      >
                        <Plus size={14} /> Add Lesson
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={addSection}
                className="w-full py-4 border border-dashed border-gray-700 rounded-2xl text-gray-400 hover:border-[#FF4A1F] hover:text-[#FF4A1F] hover:bg-[#FF4A1F]/5 transition-all flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.99]"
              >
                <Plus size={18} /> Add New Section
              </button>
            </div>
          </section>

          {/* Sticky Preview */}
          <aside className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Live Preview
                </h3>
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 animate-pulse">
                  ● Live
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={title + banner}
                  initial={{ opacity: 0.8, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative group bg-[#111] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl hover:shadow-[#FF4A1F]/10 hover:border-gray-600 transition-all duration-300"
                >
                  <div className="relative aspect-video bg-[#161616] flex items-center justify-center overflow-hidden">
                    {previewCourse.imageUrl ? (
                      <img
                        src={previewCourse.imageUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt=""
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-700">
                        <ImageIcon size={48} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          No Thumbnail Yet
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 uppercase tracking-wide shadow-lg">
                      {previewCourse.level}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex gap-2 mb-3">
                      <span className="text-[10px] font-bold bg-[#FF4A1F]/10 text-[#FF4A1F] px-2 py-1 rounded-md border border-[#FF4A1F]/20">
                        COURSE
                      </span>
                      <span className="text-[10px] font-bold bg-gray-800 text-gray-400 px-2 py-1 rounded-md border border-gray-700">
                        {previewCourse.duration || "0m"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-[#FF4A1F] transition-colors">
                      {previewCourse.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                      {previewCourse.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF4A1F] to-purple-600" />
                        <span className="text-xs font-medium text-gray-300">
                          By You
                        </span>
                      </div>
                      <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                        New Drop 🔥
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <label className="text-xs uppercase tracking-wider font-bold text-gray-400">
          {label}
        </label>
        {required && <span className="text-[#FF4A1F] text-xs">*</span>}
      </div>
      {children}
    </div>
  );
}
