import React, { useState } from "react";
import { Upload, Play, Loader2, X } from "lucide-react";
import { supabase } from "../../supabaseClient";

// 🟢 NEW: Import the PDF parser for the browser
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
// Set the worker to a CDN to avoid Vite/Webpack bundler issues
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PREDEFINED_JDS = [
  { 
    id: 'frontend', 
    title: 'Frontend Developer (React)', 
    text: 'Looking for a Frontend Developer with 2+ years of experience in React, Tailwind CSS, and modern JavaScript...' 
  },
  { 
    id: 'backend', 
    title: 'Backend Engineer (Node.js)', 
    text: 'Seeking a Backend Engineer experienced in Node.js, Express, and PostgreSQL/Supabase...' 
  },
  { 
    id: 'civil', 
    title: 'Civil Engineer (Structural/Site)', 
    text: 'Seeking a detail-oriented Civil Engineer with experience in structural design, AutoCAD, project management, and site supervision. Knowledge of local building codes, concrete/steel structures, and quality control is required.' 
  },
  { 
    id: 'custom', 
    title: 'Custom (Paste your own)', 
    text: '' 
  }
];

const InterviewSetup = ({ onInterviewStart, onCancel }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdSelection, setJdSelection] = useState(PREDEFINED_JDS[0].id);
  const [customJdText, setCustomJdText] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStart = async () => {
    setErrorMsg("");
    if (!resumeFile) return setErrorMsg("Please upload your resume.");
    
    const finalJdText = jdSelection === 'custom' ? customJdText : PREDEFINED_JDS.find(jd => jd.id === jdSelection)?.text;
    if (!finalJdText?.trim()) return setErrorMsg("Job description cannot be empty.");

    setIsStarting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please log in.");

      // 🟢 1. EXTRACT TEXT LOCALLY (Bypasses Backend Issues Completely!)
      const arrayBuffer = await resumeFile.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map(item => item.str).join(" ") + "\n";
      }

      if (extractedText.trim().length < 50) {
          throw new Error("Could not read text from this PDF. Please ensure it is a standard text PDF, not a scanned image.");
      }

      // 2. Upload PDF to Supabase Storage (So you still have a copy)
      const filePath = `${session.user.id}/resume_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, resumeFile);
      if (uploadError) throw new Error("Failed to upload resume.");

      const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(filePath);

      // 3. Start Interview via Backend (SENDING THE EXTRACTED TEXT!)
      const backend_url = import.meta.env.VITE_MOTIA_URL || "http://localhost:3000";
      const response = await fetch(`${backend_url}/api/student/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ 
            jobDescription: finalJdText, 
            resumeUrl: urlData.publicUrl,
            resumeText: extractedText // Send the clean text to Motia
        })
      });

      if (!response.ok) throw new Error(`Server Error (${response.status})`);
      const data = await response.json();

      // Safely extract the data whether Motia wraps it in 'body' or not
      const finalSessionId = data.body?.sessionId || data.sessionId;
      const finalQuestion = data.body?.question || data.question;

      onInterviewStart({ sessionId: finalSessionId, firstQuestion: finalQuestion });
    } catch (error) {
      setErrorMsg(error.message);
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#111] rounded-[2.5rem] border border-gray-800 shadow-2xl relative w-full">
      <button onClick={onCancel} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24} /></button>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">Setup Your Interview</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 hover:border-[#FF4A1F] rounded-2xl cursor-pointer">
            {resumeFile ? <p className="text-[#FF4A1F] font-bold">{resumeFile.name}</p> : <p className="text-gray-400">Click to upload PDF</p>}
            <input type="file" className="hidden" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
          </label>
        </div>
        <div className="space-y-4">
          <select className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3" value={jdSelection} onChange={(e) => setJdSelection(e.target.value)}>
            {PREDEFINED_JDS.map(jd => <option key={jd.id} value={jd.id}>{jd.title}</option>)}
          </select>
          {jdSelection === 'custom' && <textarea className="w-full h-32 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 mt-4" placeholder="Paste JD..." onChange={(e) => setCustomJdText(e.target.value)} />}
        </div>
      </div>
      {errorMsg && <p className="text-red-400 text-center mb-4">{errorMsg}</p>}
      <button onClick={handleStart} disabled={isStarting} className="w-full bg-[#FF4A1F] text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2">
        {isStarting ? <Loader2 className="animate-spin"/> : <Play />} Start Interview
      </button>
    </div>
  );
};
export default InterviewSetup;