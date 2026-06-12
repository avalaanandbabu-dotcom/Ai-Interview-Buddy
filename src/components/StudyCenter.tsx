import React, { useState } from 'react';
import { CS_MODULES, COURSES, CSModule } from '../data/mockData';
import { BookOpen, ExternalLink, HelpCircle, Check, Award, Compass, ArrowRight, RotateCw, Eye } from 'lucide-react';

export function StudyCenter() {
  const [activeTab, setActiveTab] = useState('os');
  
  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const activeModule = CS_MODULES.find(m => m.id === activeTab) || CS_MODULES[0];
  const activeFlashcards = activeModule.flashcards;

  // Filter courses related to this topic
  const getRelatedCourses = (topicId: string) => {
    if (topicId === 'os') {
      return COURSES.filter(c => c.title.toLowerCase().includes('algorithm') || c.title.toLowerCase().includes('system'));
    } else if (topicId === 'dbms') {
      return COURSES.filter(c => c.title.toLowerCase().includes('sql') || c.title.toLowerCase().includes('react') || c.title.toLowerCase().includes('system'));
    } else {
      return COURSES.filter(c => c.title.toLowerCase().includes('machine') || c.title.toLowerCase().includes('kubernetes'));
    }
  };

  const handleNextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(prev => (prev + 1) % activeFlashcards.length);
    }, 150);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentCardIndex(0);
    setFlipped(false);
  };

  return (
    <div className="max-w-7xl w-full mx-auto pt-24 pb-16 px-4 md:px-8 z-10 relative flex flex-col text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-cyber text-white uppercase tracking-wider">
          SYLLABUS & COURSES
        </h1>
        <p className="text-gray-400 text-xs font-mono mt-1">
          Node: CURRICULUM_MATRIX_99 // Dive into cheat sheets, flashcards, and top course resources
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Subjects Menu */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">SELECT PREP NODE</span>
          {CS_MODULES.map(subj => (
            <button
              key={subj.id}
              onClick={() => handleTabChange(subj.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                activeTab === subj.id
                  ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                  : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/10'
              }`}
            >
              <h3 className="text-sm font-cyber font-bold uppercase tracking-wider">{subj.title}</h3>
              <p className="text-gray-500 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">{subj.description}</p>
            </button>
          ))}
        </div>

        {/* Right Column: Syllabus Detail & Flashcards */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Flashcard segment */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 text-center flex flex-col items-center">
            <div className="w-full flex items-center justify-between border-b border-white/5 pb-3 mb-6">
              <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest font-bold">Interactive Flashcards</span>
              <span className="text-[10px] font-mono text-gray-500">Card {currentCardIndex + 1} of {activeFlashcards.length}</span>
            </div>

            {/* Flipper container */}
            <div
              onClick={() => setFlipped(!flipped)}
              className="relative w-full max-w-[420px] h-[180px] cursor-pointer perspective-1000 group mb-6"
            >
              <div 
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                  flipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden glass-panel border-purple-500/20 rounded-xl p-6 flex flex-col justify-between items-center text-center bg-purple-900/5 hover:bg-purple-900/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <HelpCircle size={16} />
                  </div>
                  <p className="text-sm font-semibold text-white leading-relaxed">{activeFlashcards[currentCardIndex].question}</p>
                  <span className="text-[9px] font-mono text-purple-400 flex items-center gap-1">
                    <RotateCw size={10} /> TAP TO FLIP ANSWER
                  </span>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel border-pink-500/20 rounded-xl p-6 flex flex-col justify-between items-center text-center bg-pink-900/5">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                    <Eye size={16} />
                  </div>
                  <p className="text-xs text-pink-200 leading-relaxed max-w-[340px]">{activeFlashcards[currentCardIndex].answer}</p>
                  <span className="text-[9px] font-mono text-pink-400">TAP TO SHOW QUESTION</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextCard}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-mono text-xs font-semibold text-white transition-colors"
            >
              NEXT CARD
            </button>
          </div>

          {/* Topic cheat sheets */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 text-left">
            <h3 className="text-sm font-cyber font-semibold text-white tracking-wider mb-4 uppercase">Topic Cheat Sheet</h3>
            
            <div className="space-y-6">
              {activeModule.topics.map((topic, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="text-xs font-semibold text-white font-mono">{topic.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed pl-3.5">{topic.summary}</p>
                  
                  {topic.codeSnippet && (
                    <div className="pl-3.5">
                      <pre className="p-3.5 rounded-xl bg-black text-emerald-400 font-mono text-[10px] leading-relaxed border border-white/5 max-w-full overflow-x-auto whitespace-pre">
                        {topic.codeSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Course recommendations */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 text-left">
            <h3 className="text-sm font-cyber font-semibold text-white tracking-wider mb-4 uppercase">RECOMMENDED RECRUITER PATHS</h3>
            
            <div className="flex flex-col gap-3">
              {getRelatedCourses(activeTab).map(course => (
                <div key={course.id} className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{course.platform}</span>
                    <h4 className="text-xs font-semibold text-white mt-1.5">{course.title}</h4>
                    <span className="text-[10px] font-mono text-gray-500 mt-0.5 block">Instructor: {course.instructor} • {course.duration}</span>
                  </div>

                  <a
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    className="self-start sm:self-auto px-4 py-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-white font-mono text-[10px] flex items-center gap-1 transition-all"
                  >
                    Enroll <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS flip card helper */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
