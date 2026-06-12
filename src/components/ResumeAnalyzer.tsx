import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertTriangle, RefreshCw, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

export function ResumeAnalyzer() {
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  // Rewrite helper states
  const [inputBullet, setInputBullet] = useState('Helped build the frontend dashboard using React.');
  const [outputBullet, setOutputBullet] = useState('');
  const [rewriting, setRewriting] = useState(false);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile({ name: droppedFile.name, size: (droppedFile.size / 1024).toFixed(1) + ' KB' });
      triggerAnalysis();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile({ name: selectedFile.name, size: (selectedFile.size / 1024).toFixed(1) + ' KB' });
      triggerAnalysis();
    }
  };

  const triggerAnalysis = () => {
    setAnalyzing(true);
    setAnalyzed(false);
    
    // Simulate ATS scanning
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 2500);
  };

  const handleRewrite = () => {
    setRewriting(true);
    setTimeout(() => {
      setRewriting(false);
      setOutputBullet(
        'Architected and deployed a highly responsive, glassmorphic analytics dashboard in React 18, enhancing user interaction rates by 35% and reducing initial page load metrics by 1.2 seconds.'
      );
    }, 1200);
  };

  // Mock ATS feedback
  const keywordMatches = [
    { word: 'React', matched: true },
    { word: 'TypeScript', matched: true },
    { word: 'Tailwind CSS', matched: true },
    { word: 'Node.js', matched: true },
    { word: 'Next.js', matched: false },
    { word: 'Docker', matched: false },
    { word: 'Kubernetes', matched: false },
    { word: 'CI/CD', matched: false }
  ];

  return (
    <div className="max-w-7xl w-full mx-auto pt-24 pb-16 px-4 md:px-8 z-10 relative flex flex-col text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-cyber text-white uppercase tracking-wider">
          ATS RESUME ANALYZER
        </h1>
        <p className="text-gray-400 text-xs font-mono mt-1">
          Node: ANALYZER_SIGMA_7 // Upload and optimize your resume for applicant tracking bots
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Upload and Stats */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Dropzone Card */}
          <div className="glass-panel p-8 rounded-2xl border-white/5 relative flex-1 flex flex-col items-center justify-center text-center">
            
            {/* Scan Beam effect when scanning */}
            {analyzing && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent top-0 animate-[bounce_2s_infinite] shadow-[0_0_15px_#8b5cf6]" />
            )}

            {!file && !analyzing && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="w-full h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-xl cursor-pointer transition-all"
              >
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 animate-float">
                    <Upload size={28} />
                  </div>
                  <span className="text-sm font-semibold text-white">Drag & drop your resume file</span>
                  <span className="text-xs text-gray-500 mt-1 font-mono">Supports PDF or DOCX up to 10MB</span>
                  
                  <span className="mt-6 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono tracking-wider transition-colors font-semibold">
                    SELECT FILE
                  </span>
                </label>
              </div>
            )}

            {file && analyzing && (
              <div className="flex flex-col items-center py-10">
                <RefreshCw size={36} className="text-purple-400 animate-spin mb-4" />
                <span className="text-sm font-cyber font-bold text-white uppercase tracking-wider">Parsing Document...</span>
                <span className="text-xs text-gray-500 font-mono mt-1">{file.name} ({file.size})</span>
              </div>
            )}

            {file && analyzed && (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <FileText size={28} />
                </div>
                <span className="text-sm font-semibold text-white">{file.name}</span>
                <span className="text-xs text-gray-500 font-mono mt-1">Parsed successfully • {file.size}</span>

                <button
                  onClick={triggerAnalysis}
                  className="mt-6 flex items-center gap-1.5 text-xs font-mono text-purple-400 hover:text-purple-300"
                >
                  <RefreshCw size={12} /> RE-UPLOAD FILE
                </button>
              </div>
            )}
          </div>

          {/* Score gauge panel (only visible post analysis) */}
          {analyzed && (
            <div className="glass-panel p-6 rounded-2xl border-white/5 text-left animate-fadeIn">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block mb-4">ATS EVALUATION</span>
              
              <div className="flex items-center gap-6">
                {/* SVG circular score dial */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#8b5cf6"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={251}
                      strokeDashoffset={251 - (251 * 72) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-lg font-cyber font-bold text-white">72%</span>
                </div>

                <div className="flex-1 space-y-1">
                  <span className="text-sm font-bold text-white">Score: 72 / 100</span>
                  <p className="text-xs text-gray-400 leading-normal">Your resume scores moderate. Bullet points need quantifiable impact metrics to pass enterprise recruiter bots.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Keyword Match & Rewrite helper */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* ATS Analysis results */}
          {analyzed ? (
            <div className="glass-panel p-6 rounded-2xl border-white/5 text-left flex-1 flex flex-col justify-between animate-fadeIn">
              <div>
                <h3 className="text-sm font-cyber font-semibold text-white tracking-wider mb-2">KEYWORD MATCH ANALYSIS</h3>
                <p className="text-gray-400 text-xs mb-6">Compare parsed keywords against tech stack baseline requirements.</p>

                {/* Keyword Chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {keywordMatches.map((kw, i) => (
                    <div
                      key={i}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
                        kw.matched
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/5 border-red-500/20 text-red-400'
                      }`}
                    >
                      {kw.matched ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {kw.word}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-gray-300 leading-relaxed">
                <span className="font-semibold text-white block mb-1">💡 Optimization Recommendation:</span>
                Add missing skills: **Next.js, Docker, Kubernetes, CI/CD**. You can rewrite your experience statements using the **Bullet Optimizer** below to include metrics.
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border-white/5 text-center flex-1 flex flex-col items-center justify-center text-gray-500">
              <FileText size={40} className="text-white/10 mb-2" />
              <p className="text-sm font-mono">Upload a resume to initialize the ATS Keyword Analyzer</p>
            </div>
          )}

          {/* Resume Rewrite Helper */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-purple-400" size={18} />
              <h3 className="text-sm font-cyber font-semibold text-white tracking-wider">RESUME BULLET OPTIMIZER</h3>
            </div>
            
            <p className="text-gray-400 text-xs mb-4">Rewrite weak statements into achievement-focused, metrics-driven bullet points.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Weak Statement</label>
                <input
                  type="text"
                  value={inputBullet}
                  onChange={(e) => setInputBullet(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleRewrite}
                disabled={rewriting || inputBullet.trim() === ''}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {rewriting ? 'Optimizing...' : 'GENERATE IMPACT BULLET'}
              </button>

              {outputBullet && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed relative animate-fadeIn">
                  <span className="font-semibold block text-white mb-1">Suggested Rewrite:</span>
                  {outputBullet}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
