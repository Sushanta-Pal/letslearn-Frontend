import React, { useState, useEffect, useMemo } from "react";
import { 
  Play, Send, CheckCircle, XCircle, 
  Code, Cpu, Clock, Terminal, AlertTriangle, Sparkles, Zap, FileCode 
} from "lucide-react";
import { supabase } from "../../supabaseClient";

// --- FALLBACK DATA ---
const FALLBACK_PROBLEMS = [
  {
    id: "fallback-1",
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    description: "Write a program that reads two integers from standard input and prints their sum.",
    testCases: [{ input: "5 10", expected: "15" }],
    starterCode: {
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner s = new Scanner(System.in);\n        int a = s.nextInt();\n        int b = s.nextInt();\n        System.out.println(a + b);\n    }\n}`,
      python: `import sys\ninput_data = sys.stdin.read().split()\nif len(input_data) >= 2:\n    print(int(input_data[0]) + int(input_data[1]))`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() { int a, b; if(cin >> a >> b) cout << (a+b); return 0; }`
    }
  }
];

const LANGUAGE_VERSIONS = {
  java: { language: "java", version: "15.0.2", file: "Main.java" },
  python: { language: "python", version: "3.10.0", file: "main.py" },
  cpp: { language: "c++", version: "10.2.0", file: "main.cpp" }
};

const CodingModule = ({ user, sessionId, onComplete, onCancel, problems, isEmbedded = false }) => {
  
  // 1. NORMALIZE DATA
  const activeProblem = useMemo(() => {
    const raw = (problems && problems.length > 0) ? problems[0] : FALLBACK_PROBLEMS[0];
    return {
        ...raw,
        testCases: raw.testCases || raw.test_cases || [],
        starterCode: raw.starterCode || raw.starter_code || {}
    };
  }, [problems]);

  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null); 
  const [testResults, setTestResults] = useState([]); 
  const [finalStatus, setFinalStatus] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  
  // Resizable panels
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [consoleHeight, setConsoleHeight] = useState(224);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false); 

  useEffect(() => {
    const initialCode = activeProblem.starterCode?.[language] || getDefaultStarterCode(language);
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

  // Drag Handlers (Omitted for brevity, assume same as before)
  // ... (Keep your existing drag useEffects here) ... 
  
  // Piston Execution Logic
  const getDefaultStarterCode = (lang) => {
    if(lang === 'java') return `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
    if(lang === 'python') return `# Write your code here\nimport sys\n`;
    if(lang === 'cpp') return `#include <iostream>\nusing namespace std;\nint main() {\n    // Write code here\n    return 0;\n}`;
    return "";
  };

  const handleLanguageChange = (e) => setLanguage(e.target.value);

  const executeCode = async (codeToRun, inputData) => {
    const config = LANGUAGE_VERSIONS[language];
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [{ name: config.file, content: codeToRun }],
          stdin: inputData, 
        }),
      });
      return await response.json();
    } catch (err) {
      return null;
    }
  };

  const handleRun = async () => {
    if (!activeProblem.testCases || activeProblem.testCases.length === 0) {
        alert("This problem has no test cases configured. Cannot run tests.");
        return;
    }
    setIsRunning(true);
    setConsoleOutput(null);
    setTestResults([]);
    setFinalStatus(null);

    const results = [];
    let allPassed = true;
    let runtimeError = null;

    for (let i = 0; i < activeProblem.testCases.length; i++) {
        const testCase = activeProblem.testCases[i];
        const apiResult = await executeCode(code, testCase.input); 

        if (!apiResult || !apiResult.run) { runtimeError = "API Connection Failed"; break; }
        if (apiResult.run.stderr) { runtimeError = apiResult.run.stderr; break; }

        const actualOutput = apiResult.run.stdout ? apiResult.run.stdout.trim() : "";
        const expectedOutput = testCase.expected ? testCase.expected.trim() : "";
        const passed = actualOutput === expectedOutput;
        if (!passed) allPassed = false;

        results.push({
            caseIndex: i + 1,
            input: testCase.input,
            expected: testCase.expected,
            actual: actualOutput,
            passed: passed
        });
    }

    setIsRunning(false);
    if (runtimeError) {
        setFinalStatus("Error");
        setConsoleOutput(runtimeError);
    } else {
        setTestResults(results);
        setFinalStatus(allPassed ? "Accepted" : "Wrong Answer");
    }
  };

  const handleSubmit = async () => {
    if (finalStatus !== "Accepted") {
        if(!confirm("Your code has not passed all test cases. Submit anyway?")) return;
    }
    const score = finalStatus === "Accepted" ? 100 : 0;
    // ... (Keep your existing submit logic) ...
    onComplete(score, code, language);
  };

  const getDifficultyColor = (diff) => {
    if(diff === 'Easy') return 'from-emerald-500 to-green-500';
    if(diff === 'Medium') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className={`flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden 
        ${isEmbedded 
            ? 'h-full w-full rounded-none border-none shadow-none'  // Modal Mode: Fill parent
            : 'h-[calc(100vh-100px)] rounded-3xl shadow-2xl border border-slate-800/50' // Page Mode
        }`}>
      
      {/* TOOLBAR */}
      <div className="h-16 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6 shadow-lg shrink-0">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/20">
                    <Code size={20} className="text-white" />
                </div>
                <div>
                    <h2 className="font-bold text-white text-lg">Coding Challenge</h2>
                    <p className="text-xs text-slate-400">Solve • Test • Submit</p>
                </div>
            </div>
            
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold backdrop-blur-sm transition-all duration-300 ${timeLeft < 300 ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-800/50 text-slate-300 border border-slate-700/50'}`}>
                <Clock size={16} />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-slate-900 text-slate-300 text-sm border border-slate-700 rounded-xl px-4 py-2 outline-none">
                <option value="java">☕ Java</option>
                <option value="python">🐍 Python</option>
                <option value="cpp">⚡ C++</option>
            </select>
            <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm rounded-xl border border-slate-600 shadow-lg hover:scale-105 transition-all">
               {isRunning ? <Cpu className="animate-spin" size={16} /> : <Play size={16} />} 
               <span className="font-semibold">{isRunning ? "Running..." : "Run Code"}</span>
            </button>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-105">
               <span>Submit</span>
               <Send size={16} />
            </button>
        </div>
      </div>

      {/* SPLIT VIEW (Flex-1 ensures it fills remaining height) */}
      <div id="split-container" className="flex-1 flex overflow-hidden">
        {/* LEFT: DESCRIPTION PANEL */}
        <div className="border-r border-slate-800/50 p-6 overflow-y-auto bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm" style={{ width: `${leftPanelWidth}%` }}>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                    <div className="flex items-start justify-between mb-3">
                        <h1 className="text-2xl font-bold text-white leading-tight flex-1">{activeProblem.title}</h1>
                        <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold bg-gradient-to-r ${getDifficultyColor(activeProblem.difficulty)} bg-clip-text text-transparent border-slate-600`}>{activeProblem.difficulty || "Medium"}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{activeProblem.description}</p>
                </div>
                {/* ... Test Cases ... */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2"><Sparkles size={16} className="text-orange-400"/><h3 className="text-sm font-bold text-white uppercase tracking-wider">Sample Test Case</h3></div>
                    <div className="bg-slate-950/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/50 font-mono text-sm shadow-xl">
                        <div className="space-y-4">
                            <div><div className="text-slate-500 text-xs mb-2 font-semibold uppercase tracking-wider">Input:</div><div className="text-emerald-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">{activeProblem.testCases?.[0]?.input || "N/A"}</div></div>
                            <div><div className="text-slate-500 text-xs mb-2 font-semibold uppercase tracking-wider">Expected Output:</div><div className="text-orange-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">{activeProblem.testCases?.[0]?.expected || "N/A"}</div></div>
                        </div>
                    </div>
                </div>
                {/* ... Status Badge ... */}
                {finalStatus && (
                    <div className={`p-5 rounded-2xl border-2 shadow-2xl backdrop-blur-xl transition-all duration-500 ${finalStatus === "Accepted" ? "bg-emerald-900/20 border-emerald-500" : "bg-red-900/20 border-red-500"}`}>
                        <div className="flex items-center gap-3">
                            {finalStatus === "Accepted" ? <CheckCircle className="text-emerald-400" size={28}/> : <XCircle className="text-red-400" size={28}/>}
                            <div><span className={`font-bold text-xl ${finalStatus === "Accepted" ? "text-emerald-400" : "text-red-400"}`}>{finalStatus}</span></div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* RESIZER */}
        <div className="w-1 bg-slate-800/50 hover:bg-orange-500/50 cursor-col-resize transition-colors relative group" onMouseDown={() => setIsDraggingVertical(true)}>
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center"><div className="w-1 h-12 bg-slate-700 group-hover:bg-orange-500 rounded-full"></div></div>
        </div>

        {/* RIGHT: EDITOR */}
        <div id="editor-container" className="flex-1 flex flex-col bg-slate-950/90">
            <div className="h-12 bg-slate-900/50 border-b border-slate-800/50 flex items-center px-4 gap-3">
                <FileCode size={16} className="text-slate-400"/>
                <span className="text-sm text-slate-400 font-mono">{LANGUAGE_VERSIONS[language].file}</span>
            </div>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 w-full bg-slate-950 text-slate-200 font-mono text-sm p-6 outline-none resize-none leading-relaxed" placeholder="// Write your solution here..." spellCheck="false" style={{ lineHeight: '1.6', tabSize: 4 }} />
            
            <div className="h-1 bg-slate-800/50 hover:bg-orange-500/50 cursor-row-resize transition-colors relative group" onMouseDown={() => setIsDraggingHorizontal(true)}>
              <div className="absolute inset-x-0 -top-1 -bottom-1 flex items-center justify-center"><div className="h-1 w-12 bg-slate-700 group-hover:bg-orange-500 rounded-full"></div></div>
            </div>
            
            <div className="border-t border-slate-800/50 bg-black flex flex-col shadow-2xl" style={{ height: `${consoleHeight}px` }}>
                <div className="h-10 bg-slate-900/80 border-b border-slate-800/50 flex items-center px-4 gap-3">
                    <Terminal size={14} className="text-slate-400"/>
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Console Output</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                    {/* ... (Keep existing console logic) ... */}
                    {isRunning ? <div className="flex items-center gap-3 text-slate-400"><Cpu className="animate-spin" size={16}/><span>Executing...</span></div> : testResults.length > 0 ? (
                        <div className="space-y-3">{testResults.map((res, i) => <div key={i} className={`p-3 rounded-xl border ${res.passed ? 'border-emerald-700/30 text-emerald-400' : 'border-red-700/30 text-red-400'}`}>{res.passed ? 'PASS' : `FAIL: Expected ${res.expected}, Got ${res.actual}`}</div>)}</div>
                    ) : <div className="text-slate-500 text-sm flex items-center gap-2"><Zap size={16}/><span>Ready.</span></div>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodingModule;