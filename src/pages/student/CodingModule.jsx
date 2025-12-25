import React, { useState, useEffect } from "react";
import { 
  Play, Send, CheckCircle, XCircle, 
  Code as CodeIcon, Cpu, Clock, Terminal, AlertTriangle 
} from "lucide-react";
import { supabase } from "../../supabaseClient";

// --- FALLBACK DATA (Keep this just in case no questions are passed) ---
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

// ✅ 1. Accept 'problems' prop from MockInterviewView
const CodingModule = ({ user, sessionId, onComplete, onCancel, problems }) => {
  
  // Use passed problems, or fallback if empty
  const availableProblems = (problems && problems.length > 0) ? problems : FALLBACK_PROBLEMS;

  const [problem, setProblem] = useState(availableProblems[0]); // Default to first problem
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("");
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null); 
  const [testResults, setTestResults] = useState([]); 
  const [finalStatus, setFinalStatus] = useState(null); 

  const [timeLeft, setTimeLeft] = useState(45 * 60); 

  // ✅ 2. Initialize with the selected problem
  useEffect(() => {
    // If multiple problems were passed, you could let user choose or rotate them.
    // For now, we take the first one.
    const activeProblem = availableProblems[0];
    setProblem(activeProblem);
    
    // Safety check for starterCode (in case MongoDB data is missing it)
    const initialCode = activeProblem.starterCode?.[language] || getDefaultStarterCode(language);
    setCode(initialCode);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if(prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [availableProblems]); // Run when problems prop changes

  // Helper to generate basic starter code if missing
  const getDefaultStarterCode = (lang) => {
    if(lang === 'java') return `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
    if(lang === 'python') return `# Write your code here\nimport sys\n`;
    if(lang === 'cpp') return `#include <iostream>\nusing namespace std;\nint main() {\n    // Write code here\n    return 0;\n}`;
    return "";
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    // Try to get starter code from problem, else default
    setCode(problem.starterCode?.[lang] || getDefaultStarterCode(lang));
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
    setIsRunning(true);
    setConsoleOutput(null);
    setTestResults([]);
    setFinalStatus(null);

    const results = [];
    let allPassed = true;
    let runtimeError = null;

    // Ensure we have test cases
    const testCases = problem.testCases || [];

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
        // Simple string comparison (watch out for hidden newlines in complex problems)
        const passed = actualOutput == testCase.expected?.trim();

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
    
    // CASE A: INTERVIEW MODE (Session ID exists)
    if (sessionId) {
      try {
        await supabase.from('mock_interview_sessions')
          .update({
            coding_score: score,
            status: 'completed',
            coding_data: { problemId: problem.id, code, language, passed: score === 100 }
          })
          .eq('id', sessionId);
        onComplete(score);
      } catch(err) { console.error(err); alert("Save failed"); }
    } 
    
    // CASE B: PRACTICE MODE (No Session ID)
    else {
      // Just return the score to the parent (SolveProblemPage)
      // The parent handles the DB updates for coins/progress
      onComplete(score);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden animate-in fade-in">
      
      {/* TOOLBAR */}
      <div className="h-14 bg-[#111] border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
            <h2 className="font-bold text-white flex items-center gap-2">
                <CodeIcon size={18} className="text-[#FF4A1F]" /> Coding Round
            </h2>
            <div className="h-4 w-px bg-gray-700" />
            <div className={`flex items-center gap-2 font-mono text-sm ${timeLeft < 300 ? 'text-red-500' : 'text-gray-400'}`}>
                <Clock size={16} />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <select 
                value={language} 
                onChange={handleLanguageChange}
                className="bg-black text-gray-300 text-sm border border-gray-700 rounded-lg px-3 py-1.5 focus:border-[#FF4A1F] outline-none"
            >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
            </select>
            <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg border border-gray-700">
               {isRunning ? <Cpu className="animate-spin" size={14} /> : <Play size={14} />} 
               {isRunning ? "Running..." : "Run Code"}
            </button>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-1.5 bg-[#FF4A1F] text-black font-bold text-sm rounded-lg">
               Submit <Send size={14} />
            </button>
        </div>
      </div>

      {/* SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: DESCRIPTION */}
        <div className="w-1/3 border-r border-gray-800 p-6 overflow-y-auto bg-[#0A0A0A]">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">{problem.title}</h1>
                <span className="text-xs px-2 py-1 rounded border border-green-800 text-green-500 bg-green-900/10">{problem.difficulty || "Medium"}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{problem.description}</p>

            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-widest text-xs">Sample Case</h3>
            <div className="bg-[#111] p-4 rounded-lg border border-gray-800 font-mono text-sm mb-6">
                <div className="text-gray-500 text-xs mb-1">Input:</div>
                <div className="text-white mb-3">{problem.testCases?.[0]?.input || "N/A"}</div>
                <div className="text-gray-500 text-xs mb-1">Expected:</div>
                <div className="text-[#FF4A1F]">{problem.testCases?.[0]?.expected || "N/A"}</div>
            </div>

            {finalStatus && (
                <div className={`mt-4 p-4 rounded-xl border ${finalStatus === "Accepted" ? "bg-green-900/20 border-green-500/50" : "bg-red-900/20 border-red-500/50"}`}>
                    <span className={`font-bold text-lg ${finalStatus === "Accepted" ? "text-green-500" : "text-red-500"}`}>{finalStatus}</span>
                </div>
            )}
        </div>

        {/* RIGHT: EDITOR */}
        <div className="flex-1 flex flex-col bg-[#111]">
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full bg-[#111] text-gray-300 font-mono text-sm p-4 outline-none resize-none"
                placeholder="// Type your solution here..."
                spellCheck="false"
            />
            {/* CONSOLE */}
            <div className="h-48 border-t border-gray-800 bg-black flex flex-col">
                <div className="h-8 bg-[#0A0A0A] border-b border-gray-800 flex items-center px-4 gap-2 text-xs text-gray-500 uppercase">
                     <Terminal size={12} /> Console
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-gray-400">
                    {isRunning ? "Executing..." : 
                     finalStatus === "Error" ? <span className="text-red-400">{consoleOutput}</span> :
                     testResults.map((res, i) => (
                        <div key={i} className={res.passed ? "text-green-500" : "text-red-500"}>
                           Test Case #{i+1}: {res.passed ? "PASSED" : `FAILED (Expected: ${res.expected}, Got: ${res.actual})`}
                        </div>
                     ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodingModule;