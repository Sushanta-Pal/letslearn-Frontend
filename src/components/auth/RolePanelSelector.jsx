import React from "react";

export default function RolePanelSelector({ value, onChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      {/* --- Student Panel --- */}
      <button
        type="button"
        onClick={() => onChange("student")}
        className={`flex-1 text-left p-4 rounded-xl border transition-all duration-200 ${
          value === "student"
            ? "border-[#FF4A1F] bg-[#140b08] shadow-[0_0_15px_rgba(255,74,31,0.1)]"
            : "border-gray-800 bg-[#0C0C0C] hover:border-gray-700"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
            Student Mode
          </div>
          {/* Neatly aligned Selected Badge */}
          {value === "student" && (
            <span className="bg-[#FF4A1F] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              Selected
            </span>
          )}
        </div>
        
        <div className="font-bold text-lg text-white mb-4">
          Learner / Developer
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] bg-[#1A1A1A] border border-gray-800 text-gray-400 px-2.5 py-1 rounded-full">
            Practice & projects
          </span>
          <span className="text-[11px] bg-[#1A1A1A] border border-gray-800 text-gray-400 px-2.5 py-1 rounded-full">
            Progress tracking
          </span>
        </div>
      </button>

      {/* --- Creator Panel --- */}
      <button
        type="button"
        onClick={() => onChange("creator")}
        className={`flex-1 text-left p-4 rounded-xl border transition-all duration-200 ${
          value === "creator"
            ? "border-[#FF4A1F] bg-[#140b08] shadow-[0_0_15px_rgba(255,74,31,0.1)]"
            : "border-gray-800 bg-[#0C0C0C] hover:border-gray-700"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
            Creator Mode
          </div>
          {value === "creator" && (
            <span className="bg-[#FF4A1F] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              Selected
            </span>
          )}
        </div>

        <div className="font-bold text-lg text-white mb-4">
          Creator / Instructor
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] bg-[#1A1A1A] border border-gray-800 text-gray-400 px-2.5 py-1 rounded-full">
            Publish courses
          </span>
          <span className="text-[11px] bg-[#1A1A1A] border border-gray-800 text-gray-400 px-2.5 py-1 rounded-full">
            Cohorts & insights
          </span>
        </div>
      </button>
    </div>
  );
}