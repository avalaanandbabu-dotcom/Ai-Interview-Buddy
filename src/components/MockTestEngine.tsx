import React, { useState, useEffect } from 'react';
import { MOCK_TESTS } from '../data/mockData';
import { Award, Clock, ArrowRight, CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MockTestEngineProps {
  onNavigate: (view: string) => void;
}

export function MockTestEngine({ onNavigate }: MockTestEngineProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  // Test run states
  const [testActive, setTestActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  // Post test states
  const [showScorecard, setShowScorecard] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState<number | null>(null);

  const activeQuestions = selectedSubject ? MOCK_TESTS[selectedSubject] : [];

  // Countdown timer
  useEffect(() => {
    if (!testActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testActive, timeLeft]);

  const handleStartTest = (subject: string) => {
    setSelectedSubject(subject);
    setTestActive(true);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setTimeLeft(300);
    setShowScorecard(false);
  };

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: option
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    setTestActive(false);
    setShowScorecard(true);
    
    // Calculate final score
    let score = 0;
    activeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) score++;
    });

    if (score === activeQuestions.length) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  // Timer formatter
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl w-full mx-auto pt-24 pb-16 px-4 md:px-8 z-10 relative flex flex-col text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-cyber text-white uppercase tracking-wider">
          MOCK TEST ENGINE
        </h1>
        <p className="text-gray-400 text-xs font-mono mt-1">
          Node: EVAL_SANDBOX_SIGMA_9 // Assess your knowledge using timed, adaptive MCQ challenges
        </p>
      </div>

      {/* 1. SELECTION STATE */}
      {!testActive && !showScorecard && (
        <div className="max-w-3xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {[
            { id: 'aptitude', name: 'Aptitude & Reasoning', count: '10 Questions', desc: 'Quantitative questions, logical reasoning, and puzzle solving.' },
            { id: 'cs', name: 'Core CS Subjects', count: '15 Questions', desc: 'Operating systems scheduling, normalization databases, TCP network logs.' },
            { id: 'coding', name: 'Programming Concepts', count: '8 Challenges', desc: 'Time complex analysis, variables references scope, arrays structures.' }
          ].map(subject => (
            <div
              key={subject.id}
              className="glass-panel p-6 rounded-2xl border-white/5 text-left flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{subject.count}</span>
                <h3 className="text-lg font-cyber font-bold text-white mt-4">{subject.name}</h3>
                <p className="text-gray-400 text-xs mt-2 line-clamp-3">{subject.desc}</p>
              </div>

              <button
                onClick={() => handleStartTest(subject.id)}
                className="mt-6 w-full py-3 rounded-xl bg-purple-600/10 border border-purple-500/30 hover:bg-purple-600 text-purple-300 hover:text-white font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                START TEST <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2. RUNNING TEST WORKSPACE */}
      {testActive && activeQuestions.length > 0 && (
        <div className="max-w-3xl w-full mx-auto glass-panel p-8 rounded-2xl border-white/5 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span className="uppercase text-purple-400 font-bold">{selectedSubject} TEST</span>
              <span>•</span>
              <span>Question {currentIndex + 1} of {activeQuestions.length}</span>
            </div>

            <div className="flex items-center gap-1.5 text-pink-400 font-mono text-sm font-semibold">
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question Box */}
          <div className="mb-6">
            <p className="text-base font-semibold text-white leading-relaxed">{activeQuestions[currentIndex].question}</p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3.5 mb-8">
            {activeQuestions[currentIndex].options?.map((opt, i) => {
              const isSelected = selectedAnswers[currentIndex] === opt;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectAnswer(opt)}
                  className={`p-4 rounded-xl border text-left text-xs font-mono transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500 text-purple-300'
                      : 'bg-black/20 border-white/5 text-gray-300 hover:border-white/10'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                    isSelected ? 'border-purple-400 text-purple-400 bg-purple-500/10' : 'border-gray-600'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex + 1 === activeQuestions.length}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {currentIndex + 1 === activeQuestions.length ? (
              <button
                onClick={handleSubmitTest}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-mono text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                SUBMIT TEST
              </button>
            ) : (
              <span className="text-[10px] font-mono text-gray-500">Solve all questions to submit</span>
            )}
          </div>
        </div>
      )}

      {/* 3. POST TEST SCORECARD */}
      {showScorecard && (
        <div className="max-w-3xl w-full mx-auto glass-panel p-8 rounded-2xl border-white/5 animate-fadeIn">
          {/* Header */}
          <div className="text-center pb-6 border-b border-white/5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-4">
              <Award size={24} />
            </div>
            <h2 className="text-xl font-cyber font-bold text-white uppercase">TEST EVALUATION COMPLETED</h2>
            <p className="text-gray-400 text-xs font-mono mt-1">Review your scorecard and explanations below</p>
          </div>

          {/* Score details */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-center">
              <span className="text-gray-500 text-[10px] font-mono block">FINAL SCORE</span>
              <span className="text-2xl font-cyber font-bold text-white">
                {activeQuestions.filter((q, idx) => selectedAnswers[idx] === q.answer).length} / {activeQuestions.length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 text-center">
              <span className="text-gray-500 text-[10px] font-mono block">ACCURACY</span>
              <span className="text-2xl font-cyber font-bold text-white">
                {Math.round(
                  (activeQuestions.filter((q, idx) => selectedAnswers[idx] === q.answer).length / activeQuestions.length) * 100
                )}%
              </span>
            </div>
          </div>

          {/* Question Review Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-cyber font-semibold text-white tracking-wider mb-2 uppercase">QUESTION DEBRIEF</h3>
            
            {activeQuestions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.answer;
              const expExpanded = expandedExplanation === idx;
              
              return (
                <div key={q.id} className="p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 text-xs">
                      <span className="text-gray-400 font-mono">Q{idx + 1}. {q.question}</span>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 font-mono text-[10px]">
                        <span className="flex items-center gap-1">
                          Your Answer: 
                          <span className={isCorrect ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {userAns || 'Skipped'}
                          </span>
                        </span>
                        {!isCorrect && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            Correct: <span className="font-semibold">{q.answer}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCorrect ? (
                        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-red-400 flex-shrink-0" />
                      )}
                      
                      <button
                        onClick={() => setExpandedExplanation(expExpanded ? null : idx)}
                        className="p-1 text-gray-500 hover:text-white transition-colors"
                        title="AI Explanation"
                      >
                        {expExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* AI Explanation slide drawer */}
                  {expExpanded && (
                    <div className="mt-3.5 pt-3.5 border-t border-white/5 text-[11px] font-sans text-purple-200 bg-purple-500/5 p-3 rounded-lg leading-relaxed animate-fadeIn">
                      <div className="flex items-center gap-1 text-purple-400 font-semibold mb-1">
                        <Sparkles size={12} /> AI EXPLANATION WALKTHROUGH:
                      </div>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => {
                setSelectedSubject(null);
                setShowScorecard(false);
              }}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-mono font-semibold transition-all border border-white/10"
            >
              CHOOSE SUBJECT
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
