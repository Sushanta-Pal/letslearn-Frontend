import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Play, Send, CheckCircle, XCircle, 
  Code, Cpu, Clock, Terminal, AlertTriangle, Sparkles, Zap, FileCode, GripVertical,
  Globe, Eye, Layout, ListChecks // Added ListChecks icon for Requirements
} from "lucide-react";

// --- FALLBACK DATA (For Practice/Interview Mode) ---
const FALLBACK_PROBLEMS = [
  {
    id: "fallback-1",
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    // Practice Mode uses 'description'
    description: "Write a program that reads two integers from standard input and prints their sum.",
    testCases: [{ input: "5 10", expected: "15" }],
    // Practice Mode uses object starterCode
    starterCode: {
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner s = new Scanner(System.in);\n        int a = s.nextInt();\n        int b = s.nextInt();\n        System.out.println(a + b);\n    }\n}`
    }
  }
];

const LANGUAGE_VERSIONS = {
  java: { language: "java", version: "15.0.2", file: "Main.java" },
  python: { language: "python", version: "3.10.0", file: "main.py" },
  cpp: { language: "c++", version: "10.2.0", file: "main.cpp" },
  javascript: { language: "javascript", version: "18.15.0", file: "script.js" },
  html: { language: "html", version: "5", file: "index.html" },
  css: { language: "css", version: "3", file: "style.css" }
};

const CodingModule = ({ user, sessionId, onComplete, onCancel, problems, isEmbedded = false }) => {
  
  // --- 1. SMART DATA MAPPING ---
  const activeProblem = useMemo(() => {
    // If no problem provided, use fallback (Interview Mode)
    const raw = (problems && problems.length > 0) ? problems[0] : FALLBACK_PROBLEMS[0];
    
    return {
        ...raw,
        // ADAPTER: Check for 'description' (Interview) OR 'requirements' (Internship)
        description: raw.description || raw.requirements || "No details provided for this task.",
        
        // ADAPTER: Handle Snake_Case (DB) vs CamelCase (Frontend)
        starterCode: raw.starterCode || raw.starter_code || {},
        
        testCases: raw.testCases || raw.test_cases || []
    };
  }, [problems]);

  // --- 2. LANGUAGE DETECTION ---
  const [language, setLanguage] = useState(() => {
     // Priority 1: DB explicitly sends "language": "html"
     if (activeProblem.language) return activeProblem.language.toLowerCase();
     
     // Priority 2: Guess from starterCode Object keys (Interview Mode)
     if (typeof activeProblem.starterCode === 'object') {
        if (activeProblem.starterCode.html) return 'html';
        if (activeProblem.starterCode.javascript) return 'javascript';
        if (activeProblem.starterCode.java) return 'java';
        if (activeProblem.starterCode.python) return 'python';
        if (activeProblem.starterCode.cpp) return 'cpp';
     }
     return 'java'; // Default
  });

  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null); 
  const [testResults, setTestResults] = useState([]); 
  const [finalStatus, setFinalStatus] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  
  // Preview & Layout State
  const [viewMode, setViewMode] = useState("console"); 
  const [htmlPreview, setHtmlPreview] = useState(""); 
  const containerRef = useRef(null); 
  const rightPanelRef = useRef(null); 
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [consoleHeight, setConsoleHeight] = useState(250);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isDraggingConsole, setIsDraggingConsole] = useState(false);

  // --- 3. CODE INITIALIZATION & FORMATTING ---
  useEffect(() => {
    let initialCode = "";

    // Case A: Starter Code is a simple String (Internship HTML/CSS tasks)
    if (typeof activeProblem.starterCode === 'string') {
        initialCode = activeProblem.starterCode;
    } 
    // Case B: Starter Code is an Object (Interview/Practice tasks)
    else if (activeProblem.starterCode && typeof activeProblem.starterCode === 'object') {
        initialCode = activeProblem.starterCode[language];
    }

    // FIX: Clean up escaped newlines from DB (Turn "\n" text into real Enters)
    if (initialCode && typeof initialCode === 'string') {
        initialCode = initialCode.replace(/\\n/g, '\n');
    }

    // Case C: Fallback if nothing found
    if (!initialCode) {
        initialCode = getDefaultStarterCode(language);
    }

    setCode(initialCode);
  }, [activeProblem, language]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if(prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 4. RESIZING LOGIC (Standard) ---
  useEffect(() => {
    const handleMouseMove = (e) => {
        if (isDraggingSplit && containerRef.current) {
            e.preventDefault(); 
            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            if (newWidth > 20 && newWidth < 70) setLeftPanelWidth(newWidth);
        }
        if (isDraggingConsole && rightPanelRef.current) {
            e.preventDefault();
            const containerRect = rightPanelRef.current.getBoundingClientRect();
            const newHeight = containerRect.bottom - e.clientY;
            if (newHeight > 40 && newHeight < (containerRect.height * 0.8)) setConsoleHeight(newHeight);
        }
    };
    const handleMouseUp = () => { setIsDraggingSplit(false); setIsDraggingConsole(false); };

    if (isDraggingSplit || isDraggingConsole) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = isDraggingSplit ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none'; 
    }
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    };
  }, [isDraggingSplit, isDraggingConsole]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const newValue = code.substring(0, start) + "    " + code.substring(end);
        setCode(newValue);
        setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4; }, 0);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    alert("⚠️ Pasting is disabled in the Coding Arena.");
  };

  const getDefaultStarterCode = (lang) => {
    if(lang === 'java') return `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code starts here\n    }\n}`;
    if(lang === 'python') return `# Write your code here\nimport sys\n`;
    if(lang === 'cpp') return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}`;
    if(lang === 'javascript') return `// Write code to generate HTML output\nconsole.log("<h1>Hello World</h1>");`;
    if(lang === 'html') return `<!DOCTYPE html>\n<html>\n<body>\n  <h1>My Portfolio</h1>\n  <p>Welcome.</p>\n</body>\n</html>`;
    if(lang === 'css') return `body {\n  background: #111;\n  color: white;\n}`;
    return "";
  };

  const executeCode = async (codeToRun, inputData) => {
    const config = LANGUAGE_VERSIONS[language] || LANGUAGE_VERSIONS.java;
    try {
      const safeInput = (inputData !== undefined && inputData !== null) ? String(inputData) : "";
      
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [{ name: config.file, content: codeToRun }],
          stdin: safeInput,
        }),
      });
      return await response.json();
    } catch (err) {
      return null;
    }
  };

  const handleRun = async () => {
    // A. HANDLE HTML/CSS (Client-Side Render)
    if (language === 'html' || language === 'css') {
        setHtmlPreview(code);
        setConsoleOutput("Rendering preview...");
        setViewMode("browser"); 
        if (consoleHeight < 100) setConsoleHeight(300);
        return;
    }

    // B. HANDLE STANDARD LANGUAGES (Server-Side)
    const hasTestCases = activeProblem.testCases && activeProblem.testCases.length > 0;
    
    setIsRunning(true);
    setConsoleOutput(null);
    setTestResults([]);
    setFinalStatus(null);
    setHtmlPreview(""); 
    if (consoleHeight < 100) setConsoleHeight(250);

    // B1. Playground Mode
    if (!hasTestCases) {
        const apiResult = await executeCode(code, "");
        if (apiResult && apiResult.run) {
            const output = apiResult.run.stdout;
            setConsoleOutput(output);
            
            // Smart Check: If code outputs HTML, show it!
            if (output && output.trim().startsWith("<")) {
                setHtmlPreview(output);
                setViewMode("browser");
            } else {
                setViewMode("console");
            }
        }
        setIsRunning(false);
        return;
    }

    // B2. Test Case Mode
    const results = [];
    let errorMessage = null;
    let lastOutput = "";

    for (let i = 0; i < activeProblem.testCases.length; i++) {
        const testCase = activeProblem.testCases[i];
        const apiResult = await executeCode(code, testCase.input); 

        if (!apiResult) { errorMessage = "API Connection Failed."; break; }
        if (apiResult.compile && apiResult.compile.code !== 0) {
            errorMessage = `Compilation Error:\n${apiResult.compile.stderr}`;
            break;
        }
        if (apiResult.run && (apiResult.run.signal === 'SIGKILL' || apiResult.run.signal === 'SIGTERM')) {
            errorMessage = `Time Limit Exceeded on Test Case ${i+1}.`;
            break;
        }
        if (apiResult.run && apiResult.run.stderr) { 
            errorMessage = `Runtime Error:\n${apiResult.run.stderr}`; 
            break; 
        }

        const actualOutput = apiResult.run && apiResult.run.stdout ? apiResult.run.stdout.trim() : "";
        lastOutput = actualOutput;

        const expectedRaw = testCase.expected;
        const expectedOutput = (expectedRaw !== undefined && expectedRaw !== null) ? String(expectedRaw).trim() : "";
        const passed = actualOutput === expectedOutput;
        
        results.push({
            caseIndex: i + 1,
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
            passed: passed
        });
    }

    setIsRunning(false);

    if (errorMessage) {
        setFinalStatus("Error");
        setConsoleOutput(errorMessage);
        setViewMode("console");
    } else {
        const allPassed = results.every(r => r.passed);
        setTestResults(results);
        setFinalStatus(allPassed ? "Accepted" : "Wrong Answer");
        
        if (lastOutput && lastOutput.trim().startsWith("<")) {
            setHtmlPreview(lastOutput);
        }
    }
  };

  const handleSubmit = () => {
    // For visual tasks (HTML/CSS), we trust the user's check
    if (language === 'html' || language === 'css') {
        onComplete(100, code, language);
        return;
    }

    if (finalStatus !== "Accepted") {
        if(!confirm("Your code has not passed all test cases. Submit anyway?")) return;
    }
    const score = finalStatus === "Accepted" ? 100 : 0;
    onComplete(score, code, language);
  };

  const getDifficultyColor = (diff) => {
    if(diff === 'Easy') return 'from-emerald-500 to-green-500';
    if(diff === 'Medium') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className={`flex flex-col bg-[#050505] overflow-hidden ${isEmbedded ? 'h-full w-full' : 'h-[calc(100vh-100px)] rounded-3xl border border-white/10 shadow-2xl'}`}>
      
      {/* TOOLBAR */}
      <div className="h-16 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-6 shrink-0 select-none">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF4A1F]/10 rounded-xl">
                    <Code size={20} className="text-[#FF4A1F]" />
                </div>
                <div>
                    <h2 className="font-bold text-white text-lg">Coding Arena</h2>
                    <p className="text-xs text-gray-400">Time Limit: 45m</p>
                </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border ${timeLeft < 300 ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-white/5 text-gray-300 border-white/5'}`}>
                <Clock size={16} />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-[#111] text-white text-sm border border-white/10 rounded-xl px-4 py-2 outline-none hover:border-white/20 transition-colors cursor-pointer">
                <option value="java">☕ Java</option>
                <option value="python">🐍 Python</option>
                <option value="cpp">⚡ C++</option>
                <option value="javascript">🌐 JavaScript</option>
                <option value="html">🎨 HTML</option>
                <option value="css">💅 CSS</option>
            </select>
            <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2 px-5 py-2 bg-white/5 text-white text-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all font-medium disabled:opacity-50">
               {isRunning ? <Cpu className="animate-spin" size={16} /> : <Play size={16} />} 
               <span>{language === 'html' ? "Preview" : isRunning ? "Running..." : "Run Code"}</span>
            </button>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2 bg-[#FF4A1F] text-white font-bold text-sm rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20">
               <span>Submit</span>
               <Send size={16} />
            </button>
        </div>
      </div>

      {/* SPLIT VIEW */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL */}
        <div className="flex flex-col bg-[#0f0f0f] overflow-hidden" style={{ width: `${leftPanelWidth}%`, minWidth: '20%', maxWidth: '70%' }}>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-white">{activeProblem.title}</h1>
                            <span className={`text-xs px-3 py-1 rounded-full border font-bold bg-gradient-to-r ${getDifficultyColor(activeProblem.difficulty)} bg-clip-text text-transparent border-white/10`}>
                                {activeProblem.difficulty || "Medium"}
                            </span>
                        </div>
                        {/* DESCRIPTION / REQUIREMENTS AREA */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[#FF4A1F] font-bold text-xs uppercase tracking-wider">
                                <ListChecks size={14} /> Requirements
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-[#141414] p-4 rounded-xl border border-white/5">
                                {activeProblem.description}
                            </p>
                        </div>
                    </div>
                    {/* Sample Case (Only shows if test cases exist) */}
                    {activeProblem.testCases?.[0] && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2"><Sparkles size={16} className="text-[#FF4A1F]"/><h3 className="text-sm font-bold text-white uppercase tracking-wider">Sample Case</h3></div>
                            <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 font-mono text-sm">
                                <div className="space-y-4">
                                    <div><div className="text-gray-500 text-xs mb-2 font-bold uppercase">Input</div><div className="text-white bg-black/50 px-4 py-3 rounded-lg border border-white/5">{activeProblem.testCases[0].input || "N/A"}</div></div>
                                    <div><div className="text-gray-500 text-xs mb-2 font-bold uppercase">Expected Output</div><div className="text-[#FF4A1F] bg-black/50 px-4 py-3 rounded-lg border border-white/5">{activeProblem.testCases[0].expected || "N/A"}</div></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {finalStatus && (
                <div className={`p-4 border-t ${finalStatus === "Accepted" ? "bg-emerald-900/10 border-emerald-500/20" : finalStatus === "Error" ? "bg-pink-900/10 border-pink-500/20" : "bg-red-900/10 border-red-500/20"}`}>
                    <div className="flex items-center gap-3">
                        {finalStatus === "Accepted" ? <CheckCircle className="text-emerald-500" size={24}/> : finalStatus === "Error" ? <AlertTriangle className="text-pink-500" size={24}/> : <XCircle className="text-red-500" size={24}/>}
                        <span className={`font-bold ${finalStatus === "Accepted" ? "text-emerald-500" : finalStatus === "Error" ? "text-pink-500" : "text-red-500"}`}>{finalStatus === "Error" ? "Runtime / Compilation Error" : finalStatus}</span>
                    </div>
                </div>
            )}
        </div>

        <div className="w-1 bg-[#1a1a1a] hover:bg-[#FF4A1F] cursor-col-resize transition-colors flex items-center justify-center z-50 hover:w-1.5 active:bg-[#FF4A1F]" onMouseDown={() => setIsDraggingSplit(true)}><GripVertical size={12} className="text-gray-600"/></div>

        {/* RIGHT PANEL (Editor + Output) */}
        <div ref={rightPanelRef} className="flex-1 flex flex-col bg-[#050505] min-w-[30%] relative">
            <div className="h-10 bg-[#0f0f0f] border-b border-white/5 flex items-center px-4 gap-3 select-none">
                <FileCode size={14} className="text-gray-500"/>
                <span className="text-xs text-gray-500 font-mono">{LANGUAGE_VERSIONS[language]?.file}</span>
            </div>
            
            <textarea value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} className="flex-1 w-full bg-[#050505] text-gray-300 font-mono text-sm p-6 outline-none resize-none leading-relaxed selection:bg-[#FF4A1F]/30" placeholder="// Write your solution here..." spellCheck="false" style={{ lineHeight: '1.6', tabSize: 4, pointerEvents: isDraggingSplit || isDraggingConsole ? 'none' : 'auto' }} />
            
            <div className="h-1 bg-[#1a1a1a] hover:bg-[#FF4A1F] cursor-row-resize transition-colors z-50 hover:h-1.5 active:bg-[#FF4A1F]" onMouseDown={() => setIsDraggingConsole(true)}/>
            
            <div className="bg-[#0f0f0f] border-t border-white/5 flex flex-col" style={{ height: `${consoleHeight}px` }}>
                
                {/* TABS */}
                <div className="h-10 bg-[#141414] border-b border-white/5 flex items-center px-4 justify-between select-none">
                    <div className="flex gap-4 h-full">
                        <button 
                            onClick={() => setViewMode("console")}
                            className={`flex items-center gap-2 h-full border-b-2 px-2 text-xs font-bold uppercase tracking-wider transition-colors ${viewMode === "console" ? "border-[#FF4A1F] text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
                        >
                            <Terminal size={14}/> Console
                        </button>
                        <button 
                            onClick={() => setViewMode("browser")}
                            className={`flex items-center gap-2 h-full border-b-2 px-2 text-xs font-bold uppercase tracking-wider transition-colors ${viewMode === "browser" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}
                        >
                            <Globe size={14}/> Live Preview
                        </button>
                    </div>
                    <button onClick={() => setConsoleHeight(40)} className="text-[10px] text-gray-600 hover:text-white uppercase font-bold">Minimize</button>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-hidden relative bg-[#0A0A0A]">
                    {viewMode === "console" ? (
                        <div className="p-4 h-full overflow-y-auto font-mono text-xs scrollbar-thin scrollbar-thumb-white/10">
                            {isRunning ? (
                                <div className="flex items-center gap-3 text-gray-400"><Cpu className="animate-spin" size={16}/><span>Executing...</span></div>
                            ) : consoleOutput ? (
                                <div className="text-pink-400 whitespace-pre-wrap bg-pink-900/10 p-3 rounded-lg border border-pink-500/10">{consoleOutput}</div>
                            ) : testResults.length > 0 ? (
                                <div className="space-y-2">
                                    {testResults.map((res, i) => (
                                        <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${res.passed ? 'bg-emerald-900/10 border-emerald-500/20 text-emerald-400' : 'bg-red-900/10 border-red-500/20 text-red-400'}`}>
                                            <div className="flex flex-col">
                                                <span className="font-bold">Test Case #{res.caseIndex}</span>
                                                {!res.passed && <span className="text-[10px] opacity-70 mt-1">Expected: {res.expected} | Got: {res.actual || "(Empty)"}</span>}
                                            </div>
                                            <span className="font-bold">{res.passed ? 'PASS' : 'FAIL'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-600 flex items-center gap-2 mt-2"><Zap size={14}/><span>Run your code to see output here.</span></div>
                            )}
                        </div>
                    ) : (
                        // BROWSER PREVIEW
                        <div className="w-full h-full bg-white relative">
                            {htmlPreview ? (
                                <iframe 
                                    srcDoc={htmlPreview} 
                                    title="Live Preview"
                                    className="w-full h-full border-none"
                                    sandbox="allow-scripts" 
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Eye size={32} className="mb-2 opacity-50"/>
                                    <p className="text-xs">No HTML output detected.</p>
                                    <p className="text-[10px] opacity-50 mt-1">Try running code that outputs HTML.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodingModule;