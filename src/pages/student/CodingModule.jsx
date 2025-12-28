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

const CodingModule = ({ user, sessionId, onComplete, onCancel, problems }) => {
  
  // 1. NORMALIZE DATA (Fixes the test_cases vs testCases mismatch)
  // We use useMemo to prevent re-renders, merging props to ensure camelCase keys exist.
  const activeProblem = useMemo(() => {
    const raw = (problems && problems.length > 0) ? problems[0] : FALLBACK_PROBLEMS[0];
    return {
        ...raw,
        // Check both 'testCases' (JSON) and 'test_cases' (DB)
        testCases: raw.testCases || raw.test_cases || [],
        // Check both 'starterCode' (JSON) and 'starter_code' (DB)
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

  // Load starter code when problem or language changes
  useEffect(() => {
    const initialCode = activeProblem.starterCode?.[language] || getDefaultStarterCode(language);
    setCode(initialCode);
  }, [activeProblem, language]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if(prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Drag Handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingVertical) {
        const container = document.getElementById('split-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
          setLeftPanelWidth(Math.min(Math.max(newWidth, 20), 60)); 
        }
      }
      if (isDraggingHorizontal) {
        const container = document.getElementById('editor-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const newHeight = rect.bottom - e.clientY;
          setConsoleHeight(Math.min(Math.max(newHeight, 150), rect.height - 200)); 
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingVertical(false);
      setIsDraggingHorizontal(false);
    };

    if (isDraggingVertical || isDraggingHorizontal) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingVertical, isDraggingHorizontal]);

  const getDefaultStarterCode = (lang) => {
    if(lang === 'java') return `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
    if(lang === 'python') return `# Write your code here\nimport sys\n`;
    if(lang === 'cpp') return `#include <iostream>\nusing namespace std;\nint main() {\n    // Write code here\n    return 0;\n}`;
    return "";
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(activeProblem.starterCode?.[lang] || getDefaultStarterCode(lang));
  };

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
      console.error(err);
      return null;
    }
  };

  const handleRun = async () => {
    // 2. ERROR HANDLING FOR NO TEST CASES
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

    // Use normalized testCases
    const testCases = activeProblem.testCases;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const apiResult = await executeCode(code, testCase.input); 

        if (!apiResult || !apiResult.run) {
            runtimeError = "API Connection Failed";
            break;
        }
        if (apiResult.run.stderr) {
            runtimeError = apiResult.run.stderr;
            break;
        }

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
    
    if (sessionId) {
      try {
        await supabase.from('mock_interview_sessions')
          .update({
            coding_score: score,
            status: 'completed',
            coding_data: { problemId: activeProblem.id, code, language, passed: score === 100 }
          })
          .eq('id', sessionId);
        
        onComplete(score);
      } catch(err) { 
        console.error(err); 
        alert("Save failed"); 
      }
    } else {
      onComplete(score, code, language); 
    }
  };

  const getDifficultyColor = (diff) => {
    if(diff === 'Easy') return 'from-emerald-500 to-green-500';
    if(diff === 'Medium') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/50">
      
      {/* TOOLBAR */}
      <div className="h-16 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6 shadow-lg">
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
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold backdrop-blur-sm transition-all duration-300 ${
                timeLeft < 300 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/20 animate-pulse' 
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700/50'
            }`}>
                <Clock size={16} />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <select 
                value={language} 
                onChange={handleLanguageChange}
                className="bg-slate-900 text-slate-300 text-sm border border-slate-700 rounded-xl px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all cursor-pointer hover:bg-slate-800"
            >
                <option value="java">☕ Java</option>
                <option value="python">🐍 Python</option>
                <option value="cpp">⚡ C++</option>
            </select>
            
            <button 
                onClick={handleRun} 
                disabled={isRunning} 
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white text-sm rounded-xl border border-slate-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isRunning ? <Cpu className="animate-spin" size={16} /> : <Play size={16} />} 
               <span className="font-semibold">{isRunning ? "Running..." : "Run Code"}</span>
            </button>
            
            <button 
                onClick={handleSubmit} 
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
               <span>Submit</span>
               <Send size={16} />
            </button>
        </div>
      </div>

      {/* SPLIT VIEW */}
      <div id="split-container" className="flex-1 flex overflow-hidden">
        
        {/* LEFT: DESCRIPTION PANEL */}
        <div 
          className="border-r border-slate-800/50 p-6 overflow-y-auto bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm"
          style={{ width: `${leftPanelWidth}%` }}
        >
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                    <div className="flex items-start justify-between mb-3">
                        <h1 className="text-2xl font-bold text-white leading-tight flex-1">{activeProblem.title}</h1>
                        <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold bg-gradient-to-r ${getDifficultyColor(activeProblem.difficulty)} bg-clip-text text-transparent border-slate-600`}>
                            {activeProblem.difficulty || "Medium"}
                        </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{activeProblem.description}</p>
                </div>

                {/* Sample Test Case */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-orange-400"/>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sample Test Case</h3>
                    </div>
                    <div className="bg-slate-950/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/50 font-mono text-sm shadow-xl">
                        <div className="space-y-4">
                            <div>
                                <div className="text-slate-500 text-xs mb-2 font-semibold uppercase tracking-wider">Input:</div>
                                <div className="text-emerald-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
                                    {/* 3. VISUAL FIX: Use normalized testCases */}
                                    {activeProblem.testCases?.[0]?.input || "N/A"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs mb-2 font-semibold uppercase tracking-wider">Expected Output:</div>
                                <div className="text-orange-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
                                    {activeProblem.testCases?.[0]?.expected || "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                {finalStatus && (
                    <div className={`p-5 rounded-2xl border-2 shadow-2xl backdrop-blur-xl transition-all duration-500 ${
                        finalStatus === "Accepted" 
                            ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/50 shadow-emerald-500/20" 
                            : finalStatus === "Error"
                            ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50 shadow-orange-500/20"
                            : "bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/50 shadow-red-500/20"
                    }`}>
                        <div className="flex items-center gap-3">
                            {finalStatus === "Accepted" ? (
                                <CheckCircle className="text-emerald-400" size={28}/>
                            ) : (
                                <XCircle className="text-red-400" size={28}/>
                            )}
                            <div>
                                <span className={`font-bold text-xl ${
                                    finalStatus === "Accepted" ? "text-emerald-400" : "text-red-400"
                                }`}>
                                    {finalStatus}
                                </span>
                                <p className="text-xs text-slate-400 mt-1">
                                    {finalStatus === "Accepted" 
                                        ? "All test cases passed! 🎉 Click Submit to finish." 
                                        : finalStatus === "Error"
                                        ? "Runtime error detected"
                                        : "Some test cases failed"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* RESIZER */}
        <div 
          className="w-1 bg-slate-800/50 hover:bg-orange-500/50 cursor-col-resize transition-colors relative group"
          onMouseDown={() => setIsDraggingVertical(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="w-1 h-12 bg-slate-700 group-hover:bg-orange-500 rounded-full transition-colors shadow-lg"></div>
          </div>
        </div>

        {/* RIGHT: EDITOR */}
        <div id="editor-container" className="flex-1 flex flex-col bg-slate-950/90">
            <div className="h-12 bg-slate-900/50 border-b border-slate-800/50 flex items-center px-4 gap-3">
                <FileCode size={16} className="text-slate-400"/>
                <span className="text-sm text-slate-400 font-mono">{LANGUAGE_VERSIONS[language].file}</span>
                <div className="flex-1"/>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                </div>
            </div>

            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full bg-slate-950 text-slate-200 font-mono text-sm p-6 outline-none resize-none leading-relaxed"
                placeholder="// Write your solution here..."
                spellCheck="false"
                style={{ lineHeight: '1.6', tabSize: 4 }}
            />
            
            <div 
              className="h-1 bg-slate-800/50 hover:bg-orange-500/50 cursor-row-resize transition-colors relative group"
              onMouseDown={() => setIsDraggingHorizontal(true)}
            >
              <div className="absolute inset-x-0 -top-1 -bottom-1 flex items-center justify-center">
                <div className="h-1 w-12 bg-slate-700 group-hover:bg-orange-500 rounded-full transition-colors shadow-lg"></div>
              </div>
            </div>
            
            <div 
              className="border-t border-slate-800/50 bg-black flex flex-col shadow-2xl"
              style={{ height: `${consoleHeight}px` }}
            >
                <div className="h-10 bg-slate-900/80 border-b border-slate-800/50 flex items-center px-4 gap-3">
                    <Terminal size={14} className="text-slate-400"/>
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Console Output</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                    {isRunning ? (
                        <div className="flex items-center gap-3 text-slate-400">
                            <Cpu className="animate-spin" size={16}/>
                            <span>Executing code...</span>
                        </div>
                    ) : finalStatus === "Error" ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-red-400 font-semibold">
                                <AlertTriangle size={16}/>
                                Runtime Error
                            </div>
                            <pre className="text-red-300 bg-red-900/10 p-3 rounded-lg border border-red-800/30 text-xs overflow-x-auto">
                                {consoleOutput}
                            </pre>
                        </div>
                    ) : testResults.length > 0 ? (
                        <div className="space-y-3">
                            {testResults.map((res, i) => (
                                <div 
                                    key={i} 
                                    className={`p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                                        res.passed 
                                            ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-400' 
                                            : 'bg-red-900/20 border-red-700/30 text-red-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {res.passed ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                        <span className="font-bold">Test Case #{i + 1}</span>
                                    </div>
                                    {!res.passed && (
                                        <div className="text-xs space-y-1 ml-6 text-slate-300">
                                            <div><span className="text-slate-500">Expected:</span> {res.expected}</div>
                                            <div><span className="text-slate-500">Got:</span> {res.actual}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm flex items-center gap-2">
                            <Zap size={16}/>
                            <span>Ready to run your code. Click "Run Code" to test.</span>
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