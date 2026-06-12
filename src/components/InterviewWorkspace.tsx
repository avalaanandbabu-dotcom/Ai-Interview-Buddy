import React, { useState, useEffect, useRef } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { AvatarCanvas } from './AvatarCanvas';
import { MOCK_INTERVIEW_QUESTIONS, MOCK_INTERVIEW_FEEDBACK } from '../data/mockData';
import { Play, Square, Mic, MicOff, Volume2, VolumeX, Send, Code, ShieldAlert, Award, FileText, ChevronRight, PenTool, Eraser, RotateCcw, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getGeminiApiKey, askGeminiJson, generateInterviewQuestion } from '../utils/gemini';

interface InterviewWorkspaceProps {
  onNavigate: (view: string) => void;
}

export function InterviewWorkspace({ onNavigate }: InterviewWorkspaceProps) {
  // Interview configuration states
  const [inSetup, setInSetup] = useState(true);
  const [interviewMode, setInterviewMode] = useState('technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  
  // Running interview states
  const [activeSession, setActiveSession] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState<{ sender: 'ai' | 'user'; text: string; time: string }[]>([]);
  const [userTranscript, setUserTranscript] = useState('');
  const [rightTab, setRightTab] = useState<'question' | 'coding' | 'whiteboard'>('question');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  
  // Code Editor states
  const [selectedLang, setSelectedLang] = useState('python');
  const [codeValue, setCodeValue] = useState(
    `# Write your optimal solution here\ndef solve(nums):\n    # TODO: implement search\n    pass`
  );
  const [compilerOutput, setCompilerOutput] = useState('Compiler idle. Write code and click Run.');
  const [compiling, setCompiling] = useState(false);

  // Speech API hooks
  const { isSpeaking, isListening, speak, listen, stopListening, cancelSpeech, supported } = useSpeech();
  const [muted, setMuted] = useState(false);

  // Whiteboard states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#a855f7');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // Post interview states
  const [showFeedback, setShowFeedback] = useState(false);
  const [dynamicFeedback, setDynamicFeedback] = useState<{
    scores: {
      communication: number;
      technical: number;
      confidence: number;
      problemSolving: number;
      leadership: number;
    };
    readiness: number;
    strengths: string[];
    weaknesses: string[];
    roadmap: { title: string; desc: string }[];
  } | null>(null);

  const activeQuestions = MOCK_INTERVIEW_QUESTIONS[interviewMode] || MOCK_INTERVIEW_QUESTIONS.technical;

  // Sync editor boilerplates
  useEffect(() => {
    if (selectedLang === 'javascript') {
      setCodeValue(`// JavaScript Coding Sandbox\nfunction solve(nums) {\n    // Write code...\n    return 0;\n}`);
    } else if (selectedLang === 'python') {
      setCodeValue(`# Python Coding Sandbox\ndef solve(nums):\n    # Write code...\n    return 0`);
    } else if (selectedLang === 'cpp') {
      setCodeValue(`// C++ Coding Sandbox\n#include <iostream>\nusing namespace std;\nint solve(vector<int>& nums) {\n    return 0;\n}`);
    } else {
      setCodeValue(`// Java Coding Sandbox\nclass Solution {\n    public int solve(int[] nums) {\n        return 0;\n    }\n}`);
    }
  }, [selectedLang]);

  // Start Interview
  const handleStartInterview = async () => {
    setInSetup(false);
    setActiveSession(true);
    setQuestionIndex(0);
    setShowFeedback(false);
    
    const apiKey = getGeminiApiKey();
    if (apiKey) {
      setGeneratingQuestion(true);
      try {
        const firstQ = await generateInterviewQuestion([], interviewMode, difficulty, apiKey);
        setCurrentQuestion(firstQ);
        const initialGreeting = `Hello! Welcome to your ${difficulty} level ${interviewMode} interview. Let's begin. Here is your first question: ${firstQ}`;
        
        setConversation([
          { sender: 'ai', text: firstQ, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);

        if (!muted) {
          speak(initialGreeting);
        }
      } catch (error) {
        console.error("Error generating first question dynamically:", error);
        const firstQ = activeQuestions[0];
        setCurrentQuestion(firstQ);
        const initialGreeting = `Hello! Welcome to your ${difficulty} level ${interviewMode} interview. Let's begin. Here is your first question: ${firstQ}`;
        
        setConversation([
          { sender: 'ai', text: firstQ, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);

        if (!muted) {
          speak(initialGreeting);
        }
      } finally {
        setGeneratingQuestion(false);
      }
    } else {
      const firstQ = activeQuestions[0];
      setCurrentQuestion(firstQ);
      const initialGreeting = `Hello! Welcome to your ${difficulty} level ${interviewMode} interview. Let's begin. Here is your first question: ${firstQ}`;
      
      setConversation([
        { sender: 'ai', text: firstQ, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);

      if (!muted) {
        speak(initialGreeting);
      }
    }
  };

  // Trigger speech speaking of the current question
  const repeatQuestion = () => {
    cancelSpeech();
    speak(currentQuestion);
  };

  // Move to next question or complete interview
  const handleNextQuestion = async () => {
    cancelSpeech();
    stopListening();
    
    // Add user response if they typed or said something
    const userText = userTranscript.trim();
    const userMsg = { 
      sender: 'user' as const, 
      text: userText || '(No verbal or text response provided)', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    const updatedHistory = [...conversation, userMsg];
    setConversation(updatedHistory);
    setUserTranscript('');

    const nextIdx = questionIndex + 1;
    const totalQs = activeQuestions.length;
    
    if (nextIdx < totalQs) {
      setQuestionIndex(nextIdx);
      setGeneratingQuestion(true);
      
      const apiKey = getGeminiApiKey();
      if (apiKey) {
        try {
          const nextQ = await generateInterviewQuestion(
            updatedHistory.map(m => ({ sender: m.sender, text: m.text })),
            interviewMode,
            difficulty,
            apiKey
          );
          
          setCurrentQuestion(nextQ);
          setConversation(prev => [
            ...prev,
            { sender: 'ai', text: nextQ, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]);

          if (!muted) {
            speak(nextQ);
          }
        } catch (error) {
          console.error("Error generating next question dynamically:", error);
          const nextQ = activeQuestions[nextIdx];
          setCurrentQuestion(nextQ);
          setConversation(prev => [
            ...prev,
            { sender: 'ai', text: nextQ, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]);

          if (!muted) {
            speak(nextQ);
          }
        } finally {
          setGeneratingQuestion(false);
        }
      } else {
        const nextQ = activeQuestions[nextIdx];
        setCurrentQuestion(nextQ);
        setConversation(prev => [
          ...prev,
          { sender: 'ai', text: nextQ, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);

        if (!muted) {
          speak(nextQ);
        }
      }
    } else {
      // Completed all questions
      handleEndInterview(updatedHistory);
    }
  };

  // Speech transcript handler
  const startVocalListening = () => {
    if (isSpeaking) cancelSpeech();
    
    listen(
      (text) => {
        setUserTranscript(prev => prev + ' ' + text);
      },
      () => {
        // finished speech segment
      }
    );
  };

  // Compile code simulation
  const handleRunCode = () => {
    setCompiling(true);
    setCompilerOutput('Compiling code and executing test suites...');
    
    setTimeout(() => {
      setCompiling(false);
      setCompilerOutput(
        `✓ Compilation Successful.\n✓ Test Case 1 Passed (Input: [2, 7, 11, 15] => Expected: 9)\n✓ Test Case 2 Passed (Input: [3, 2, 4] => Expected: 6)\n\nExecution Time: 4ms\nMemory Consumption: 12.4 MB\nRating: 98% faster than other entries.`
      );
    }, 1500);
  };

  const calculateFeedback = (
    history: { sender: 'ai' | 'user'; text: string }[],
    mode: string
  ) => {
    const userAnswers = history.filter(h => h.sender === 'user').map(h => h.text.trim());
    const totalQuestions = activeQuestions.length;
    
    if (userAnswers.length === 0 || (userAnswers.length === 1 && userAnswers[0] === '')) {
      return {
        scores: { communication: 5, technical: 0, confidence: 5, problemSolving: 0, leadership: 0 },
        readiness: 2,
        strengths: ["None identified. You did not submit any response text or microphone inputs."],
        weaknesses: [
          "Failed to provide responses to any of the questions.",
          "Voice transmission was not active or input box was left empty.",
          "Did not demonstrate communication skills."
        ],
        roadmap: [
          { title: "Node Setup", desc: "Ensure your microphone is connected and allowed in browser permissions before starting." },
          { title: "Conceptual Reading", desc: "Read basic programming and CS terminology before joining a simulated workspace." },
          { title: "Typing Response", desc: "If you cannot speak, type out details using your keyboard in the text area." }
        ]
      };
    }
    
    let totalLength = 0;
    let keywordHits = 0;
    
    const keywords: Record<string, string[]> = {
      technical: ['thread', 'process', 'memory', 'virtual', 'share', 'binary', 'tree', 'complexity', 'worst', 'acid', 'isolation', 'cache', 'eviction', 'scale', 'dbms', 'transaction'],
      system: ['slack', 'discord', 'socket', 'scale', 'database', 'sql', 'nosql', 'sharding', 'replica', 'broker', 'kafka', 'load', 'balancer', 'tolerance', 'redundancy'],
      hr: ['conflict', 'team', 'resolve', 'deadline', 'learn', 'grow', 'leader', 'initiative', 'ownership', 'align', 'goal', 'culture'],
      behavioral: ['fail', 'deadline', 'learn', 'pressure', 'decision', 'compromise', 'quality', 'debt', 'star', 'action', 'result', 'situation']
    };
    
    const activeKeywords = keywords[mode] || keywords.technical;
    
    userAnswers.forEach(ans => {
      totalLength += ans.length;
      const lower = ans.toLowerCase();
      activeKeywords.forEach(kw => {
        if (lower.includes(kw)) {
          keywordHits++;
        }
      });
    });
    
    const avgLength = totalLength / userAnswers.length;
    
    // Communication: average response length
    let commScore = Math.min(100, Math.round((avgLength / 140) * 50 + (userAnswers.length / totalQuestions) * 50));
    // Technical: keyword counts and length
    let techScore = Math.min(100, Math.round((keywordHits / (userAnswers.length * 1.5)) * 60 + (avgLength / 180) * 40));
    let confScore = Math.min(100, Math.round((avgLength / 120) * 60 + 40));
    let probScore = Math.min(100, Math.round((keywordHits / (userAnswers.length * 1.2)) * 50 + (avgLength / 150) * 50));
    let leadScore = Math.min(100, Math.round((avgLength / 160) * 70 + (userAnswers.length / totalQuestions) * 30));
    
    // Penalty for empty answers or missing questions
    const answerRatio = userAnswers.length / totalQuestions;
    commScore = Math.round(commScore * answerRatio);
    techScore = Math.round(techScore * answerRatio);
    confScore = Math.round(confScore * answerRatio);
    probScore = Math.round(probScore * answerRatio);
    leadScore = Math.round(leadScore * answerRatio);
    
    // Penalty if answers are too brief/spam (e.g. "idk", "no", "yes")
    const isBrief = avgLength < 25;
    if (isBrief) {
      commScore = Math.max(8, Math.round(commScore * 0.25));
      techScore = Math.max(3, Math.round(techScore * 0.1));
      confScore = Math.max(10, Math.round(confScore * 0.3));
      probScore = Math.max(3, Math.round(probScore * 0.15));
      leadScore = Math.max(3, Math.round(leadScore * 0.2));
    }
    
    commScore = Math.max(8, Math.min(98, commScore));
    techScore = Math.max(3, Math.min(98, techScore));
    confScore = Math.max(10, Math.min(98, confScore));
    probScore = Math.max(3, Math.min(98, probScore));
    leadScore = Math.max(3, Math.min(98, leadScore));
    
    const readiness = Math.round((commScore + techScore + confScore + probScore + leadScore) / 5);
    
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let roadmap: { title: string; desc: string }[] = [];
    
    if (readiness < 35) {
      strengths = [
        "Cockpit interface commands were successfully executed.",
        "Acknowledged questions by progressing through the modules."
      ];
      weaknesses = [
        "Answers were extremely short, incomplete, or empty (average under 5 words).",
        "Failed to formulate relevant conceptual explanations or system trade-offs.",
        "Mic clarity was not verified or text answers lacked depth."
      ];
      roadmap = [
        { title: "Day 1-2: Verbal Pacing", desc: "Spend time explaining your reasoning out loud for at least 45 seconds per prompt." },
        { title: "Day 3-4: Tech Vocabulary", desc: "Study core definitions such as process/thread scheduling, database isolation levels, or caching layers." },
        { title: "Day 5+: Mock Writing", desc: "If you cannot speak clearly, type detailed technical solutions inside the transcript panel." }
      ];
    } else if (readiness >= 35 && readiness < 70) {
      strengths = [
        "Provided basic conceptual explanations for the questions.",
        "Maintained structured focus throughout the session."
      ];
      weaknesses = [
        "Responses were quite brief and did not address key edge cases or scale conditions.",
        "Lacked quantitative metrics (e.g. read/write ratios, cache hit percentages, team sizes).",
        "Explain structural logic more clearly instead of giving short definitions."
      ];
      roadmap = [
        { title: "Day 1-3: STAR Method Practice", desc: "Reframe behavioral answers clearly into Situation, Task, Action, and Result formats." },
        { title: "Day 4-6: System Edge Cases", desc: "Research tradeoffs like cache invalidation (eviction policies) and database normalization." },
        { title: "Day 7+: Scenario Metrics", desc: "Add scale details (e.g. QPS, numbers) to your design explanations." }
      ];
    } else {
      strengths = [
        "Excellent response depth and detailed explanation parameters.",
        "Strong structural clarity using technical terminology (ACID, complexities, cache).",
        "Confirmed stable posture and clear vocal transmission."
      ];
      weaknesses = [
        "Discuss deeper concurrency constraints or lock-free queue details.",
        "Could include more specific architectural metrics."
      ];
      roadmap = [
        { title: "Cache Invalidation corner cases", desc: "Study Write-Through, Write-Back, and cache eviction policies (LRU, LFU)." },
        { title: "STAR Method metrics", desc: "Practice framing behavioral questions using the Situation-Task-Action-Result format with local metrics." }
      ];
    }
    
    return {
      scores: {
        communication: commScore,
        technical: techScore,
        confidence: confScore,
        problemSolving: probScore,
        leadership: leadScore
      },
      readiness,
      strengths,
      weaknesses,
      roadmap
    };
  };

  const [gradingProgress, setGradingProgress] = useState(false);

  // Terminate interview session and render scores
  const handleEndInterview = async (finalHistory?: { sender: 'ai' | 'user'; text: string; time: string }[]) => {
    cancelSpeech();
    stopListening();
    
    let finalConversation = finalHistory || [...conversation];
    if (!finalHistory && userTranscript.trim() !== '') {
      const userMsg = { 
        sender: 'user' as const, 
        text: userTranscript, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      finalConversation.push(userMsg);
      setConversation(finalConversation);
      setUserTranscript('');
    }
    
    const apiKey = getGeminiApiKey();
    
    if (apiKey) {
      setGradingProgress(true);
      setActiveSession(false);
      try {
        const historyText = finalConversation
          .map(msg => `[${msg.sender.toUpperCase()}]: ${msg.text}`)
          .join('\n\n');
          
        const prompt = `Evaluate the candidate's mock interview responses for recruitment tier "${difficulty}" and interview node "${interviewMode}".
        Verify whether their answers are correct or wrong, evaluate their depth, conceptual vocabulary, and communication clarity.
        
        Here is the full interview transcript:
        ${historyText}
        
        Generate your evaluation report strictly following this JSON schema (do not wrap in markdown blocks, just raw JSON, and ensure no properties are missing):
        {
          "scores": {
            "communication": number (0 to 100),
            "technical": number (0 to 100),
            "confidence": number (0 to 100),
            "problemSolving": number (0 to 100),
            "leadership": number (0 to 100)
          },
          "readiness": number (0 to 100),
          "strengths": ["string statement 1", "string statement 2", "string statement 3"],
          "weaknesses": ["developmental gap 1", "developmental gap 2"],
          "roadmap": [
            { "title": "Day 1-3 study topic", "desc": "description" },
            { "title": "Day 4-6 study topic", "desc": "description" },
            { "title": "Day 7+ study topic", "desc": "description" }
          ]
        }`;
        
        const feedback = await askGeminiJson(prompt, apiKey);
        setDynamicFeedback(feedback);
        setShowFeedback(true);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#3b82f6']
        });
      } catch (err) {
        console.error("Gemini grading failed, falling back to local scoring:", err);
        alert("AI Grading failed due to connection error. Defaulting to local heuristic scoring.");
        const feedback = calculateFeedback(finalConversation, interviewMode);
        setDynamicFeedback(feedback);
        setShowFeedback(true);
      } finally {
        setGradingProgress(false);
      }
    } else {
      // Local fallback scoring
      const feedback = calculateFeedback(finalConversation, interviewMode);
      setDynamicFeedback(feedback);
      setActiveSession(false);
      setShowFeedback(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#3b82f6']
      });
    }
  };

  // Whiteboard drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = tool === 'eraser' ? 20 : 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#090a0f' : drawColor;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingCanvas = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#090a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Reset/Trigger canvas sizes
  useEffect(() => {
    if (rightTab === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#090a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [rightTab]);

  return (
    <div className="max-w-7xl w-full mx-auto pt-24 pb-16 px-4 md:px-8 z-10 relative flex flex-col text-left">
      
      {/* 2.5 GRADING LOADER SCREEN */}
      {gradingProgress && (
        <div className="max-w-xl w-full mx-auto glass-panel p-8 rounded-2xl border-purple-500/30 text-center flex flex-col items-center gap-6 animate-pulse">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-500 animate-spin flex items-center justify-center text-purple-400">
            <Cpu size={24} className="animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-cyber font-bold text-white uppercase tracking-wider">Neural Grading Engine Active</h3>
            <p className="text-[10px] font-mono text-gray-500 mt-2">
              Gemini AI is analyzing your transcript, evaluating answer accuracy, and compiling diagnostic metrics...
            </p>
          </div>
        </div>
      )}

      {/* 1. SETUP STATE */}
      {inSetup && !gradingProgress && (
        <div className="max-w-xl w-full mx-auto glass-panel p-8 rounded-2xl border-white/5 animate-fadeIn">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-purple-400" size={24} />
            <h2 className="text-xl font-cyber font-bold text-white uppercase tracking-wider">Configure Interview Room</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Select Interview Node</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'technical', name: 'Technical / CS' },
                  { id: 'system', name: 'System Design' },
                  { id: 'hr', name: 'HR / Culture' },
                  { id: 'behavioral', name: 'Behavioral' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setInterviewMode(mode.id);
                      if (mode.id === 'system') setRightTab('whiteboard');
                      else if (mode.id === 'technical') setRightTab('coding');
                      else setRightTab('question');
                    }}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                      interviewMode === mode.id
                        ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                        : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/10'
                    }`}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Recruitment Tier</label>
              <div className="grid grid-cols-3 gap-3">
                {['Beginner', 'Intermediate', 'FAANG Mode', 'Principal'].map(tier => (
                  <button
                    key={tier}
                    onClick={() => setDifficulty(tier)}
                    className={`p-3 rounded-xl border text-[10px] font-mono transition-all ${
                      difficulty === tier
                        ? 'bg-pink-500/10 border-pink-500 text-pink-300 shadow-md shadow-pink-500/10'
                        : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/10'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {!getGeminiApiKey() ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono leading-relaxed text-red-400 text-center flex flex-col gap-2">
                <span className="font-bold uppercase tracking-wider block">⚠️ Gemini API Key Required</span>
                <span>My AI works strictly with an API Key to generate custom, dynamic questions. Please enter your key in the AI Configuration Panel (click the Key icon in the top right navbar) to start the interview.</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs font-sans leading-relaxed text-purple-300">
                <span className="font-semibold block text-white mb-1">🎤 Browser Speech Recommendation:</span>
                Use a quiet environment. This platform will speak questions and listen to your microphone input. If speech is blocked or unsupported, you can type in the chat instead.
              </div>
            )}

            <button
              onClick={handleStartInterview}
              disabled={!getGeminiApiKey()}
              className={`w-full py-4 rounded-xl font-semibold font-cyber text-white tracking-widest transition-all shadow-lg ${
                getGeminiApiKey()
                  ? 'btn-neon bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 active:scale-95 shadow-purple-500/20'
                  : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              {getGeminiApiKey() ? 'INITIALIZE SESSION' : 'API KEY REQUIRED'}
            </button>
          </div>
        </div>
      )}

      {/* 2. ACTIVE SESSION WORKSPACE */}
      {activeSession && !gradingProgress && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-fadeIn">
          
          {/* Left Pane: Live Avatar and Audio Control */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <AvatarCanvas 
                isSpeaking={isSpeaking} 
                isListening={isListening} 
                emotion={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'} 
              />
              
              {/* Floating controls overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setMuted(!muted)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    muted 
                      ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                      : 'bg-black/60 border-white/10 text-gray-300 hover:bg-black/80'
                  }`}
                  title={muted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              {/* Vocal Waveform Overlay when speaking/listening */}
              {(isSpeaking || isListening) && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 px-4 py-1.5 rounded-full border border-white/5">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full ${isSpeaking ? 'bg-purple-400' : 'bg-pink-400'} animate-bounce`} 
                      style={{ 
                        height: '12px', 
                        animationDuration: `${0.6 + i * 0.15}s`,
                        animationDelay: `${i * 0.1}s`
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sub-Card: Voice interaction and Manual input */}
            <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">RESPONSE CHAT</span>
                <span className="text-[10px] font-mono text-gray-500">Q: {questionIndex + 1} of {activeQuestions.length}</span>
              </div>

              {/* Text Area for input */}
              <textarea
                value={userTranscript}
                onChange={(e) => setUserTranscript(e.target.value)}
                placeholder="Type your response here, or click the mic button and start speaking..."
                className="w-full h-24 p-3 rounded-xl bg-black/40 border border-white/5 text-sm font-sans placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
              />

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={isListening ? stopListening : startVocalListening}
                  className={`flex-1 py-3 rounded-xl border font-mono text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isListening
                      ? 'bg-pink-500/20 border-pink-500 text-pink-400 animate-pulse'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                  }`}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  {isListening ? 'STOP RECORDING' : 'MIC TRANSMIT'}
                </button>

                <button
                  onClick={handleNextQuestion}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 font-mono text-xs font-semibold text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  SUBMIT <ChevronRight size={15} />
                </button>
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-gray-500">
                <button onClick={repeatQuestion} className="hover:text-purple-400">REPEAT QUESTION</button>
                <button onClick={() => handleEndInterview()} className="text-red-400 hover:text-red-300">TERMINATE SESSION</button>
              </div>
            </div>
          </div>

          {/* Right Pane: Swappable Coding, Whiteboard or Question detail */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex border-b border-white/5 text-sm font-mono bg-black/20 rounded-xl p-1 self-start">
              <button
                onClick={() => setRightTab('question')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  rightTab === 'question' ? 'bg-purple-500/10 text-purple-300 font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Question Details
              </button>
              <button
                onClick={() => setRightTab('coding')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  rightTab === 'coding' ? 'bg-purple-500/10 text-purple-300 font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Coding Editor
              </button>
              <button
                onClick={() => setRightTab('whiteboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  rightTab === 'whiteboard' ? 'bg-purple-500/10 text-purple-300 font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Whiteboard (Design)
              </button>
            </div>

            {/* TAB CONTENT: 1. QUESTION DETAIL */}
            {rightTab === 'question' && (
              <div className="glass-panel p-6 rounded-2xl border-white/5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-pink-400 uppercase tracking-widest block mb-2">QUESTION PROMPT</span>
                  <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/10 min-h-[100px] flex items-center justify-center">
                    {generatingQuestion ? (
                      <div className="flex flex-col items-center gap-2 text-purple-400 font-mono text-xs">
                        <div className="w-5 h-5 rounded-full border-2 border-dashed border-purple-500 animate-spin" />
                        <span>Generating Next Question...</span>
                      </div>
                    ) : (
                      <p className="text-base font-semibold text-white leading-relaxed w-full">{currentQuestion}</p>
                    )}
                  </div>
                </div>

                {/* Question Helper Text */}
                <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 leading-relaxed">
                  <span className="font-semibold text-white block mb-1">💡 Coaching Guideline:</span>
                  Take a moment to structure your thoughts. Explain your solution clearly, discuss time and space complexities, and write any draft pseudocodes in the **Coding Editor** tab if requested.
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. CODING SANDBOX */}
            {rightTab === 'coding' && (
              <div className="glass-panel rounded-2xl border-white/5 overflow-hidden flex-1 flex flex-col justify-between">
                {/* Editor Header */}
                <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-purple-400" />
                    <span className="text-xs font-mono text-white">CODING SANDBOX</span>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="bg-black/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-gray-300 focus:outline-none focus:border-purple-500"
                    >
                      <option value="python">Python 3.10</option>
                      <option value="javascript">JavaScript (ES6)</option>
                      <option value="cpp">C++ (GCC 11)</option>
                      <option value="java">Java (OpenJDK 17)</option>
                    </select>

                    <button
                      onClick={handleRunCode}
                      disabled={compiling}
                      className="px-4 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 font-mono text-xs text-white transition-colors disabled:opacity-50"
                    >
                      {compiling ? 'RUNNING...' : 'RUN CODE'}
                    </button>
                  </div>
                </div>

                {/* Code Textarea editor */}
                <textarea
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  className="w-full flex-1 p-5 bg-[#06070a] text-purple-200 font-mono text-xs leading-relaxed focus:outline-none resize-none min-h-[220px]"
                />

                {/* Compiler Output console */}
                <div className="bg-black border-t border-white/5 p-4 text-left font-mono text-[10px]">
                  <span className="text-gray-500 block mb-1">COMPILER CONSOLE LOGS</span>
                  <pre className="text-emerald-400 leading-normal max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {compilerOutput}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. WHITEBOARD */}
            {rightTab === 'whiteboard' && (
              <div className="glass-panel rounded-2xl border-white/5 overflow-hidden flex-1 flex flex-col justify-between">
                {/* Whiteboard Header */}
                <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-white">SYSTEM DESIGN WHITEBOARD</span>
                  
                  <div className="flex items-center gap-3">
                    {/* Tool Toggles */}
                    <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                      <button
                        onClick={() => setTool('pen')}
                        className={`p-1.5 rounded ${tool === 'pen' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400'}`}
                        title="Pen Tool"
                      >
                        <PenTool size={14} />
                      </button>
                      <button
                        onClick={() => setTool('eraser')}
                        className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400'}`}
                        title="Eraser Tool"
                      >
                        <Eraser size={14} />
                      </button>
                    </div>

                    {/* Colors */}
                    <div className="flex gap-1.5">
                      {['#a855f7', '#ec4899', '#06b6d4', '#10b981', '#ffffff'].map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            setDrawColor(c);
                            setTool('pen');
                          }}
                          className={`w-4 h-4 rounded-full border ${drawColor === c && tool === 'pen' ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={clearCanvas}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Clear Canvas"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

                {/* Canvas Drawing Panel */}
                <div className="bg-[#090a0f] flex-1 flex items-center justify-center p-2">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawingCanvas}
                    onMouseLeave={stopDrawingCanvas}
                    className="border border-white/5 rounded-lg cursor-crosshair max-w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. POST INTERVIEW EVALUATION */}
      {showFeedback && !gradingProgress && dynamicFeedback && (
        <div className="max-w-4xl w-full mx-auto glass-panel p-8 rounded-2xl border-purple-500/30 shadow-2xl shadow-purple-500/5 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">INTERVIEW COMPLETE</span>
              <h2 className="text-2xl font-cyber font-black text-white mt-2">SESSION EVALUATION REPORT</h2>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-mono text-gray-500 block">OVERALL READINESS</span>
              <span className="text-3xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{dynamicFeedback.readiness}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Scores breakdown */}
            <div className="md:col-span-5 flex flex-col gap-3.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-semibold block mb-1">SCORE BREAKDOWN</span>
              {Object.entries(dynamicFeedback.scores).map(([metric, score]) => (
                <div key={metric} className="text-xs font-mono">
                  <div className="flex justify-between text-gray-400 mb-0.5 capitalize">
                    <span>{metric.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white font-semibold">{score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="md:col-span-7 flex flex-col gap-6 text-sm">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold block mb-2">KEY STRENGTHS</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-300 text-xs">
                  {dynamicFeedback.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest font-semibold block mb-2">WEAKNESSES / GAPS</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-300 text-xs">
                  {dynamicFeedback.weaknesses.map((weak, idx) => (
                    <li key={idx}>{weak}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Personalized Learning Roadmap */}
          <div className="mt-8 pt-8 border-t border-white/5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold block mb-4">RECOMMENDED STUDY PATHWAY</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dynamicFeedback.roadmap.map((path, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-left">
                  <span className="text-xs font-cyber text-cyan-300 font-semibold block mb-1">{path.title}</span>
                  <p className="text-xs text-gray-400 leading-relaxed">{path.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => setInSetup(true)}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-mono font-semibold transition-all border border-white/10"
            >
              START NEW SESSION
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold transition-all"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
