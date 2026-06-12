import React, { useState } from 'react';
import { Award, Calendar, Clock, BarChart2, Star, CheckCircle, ChevronDown, ChevronUp, Play, Trophy, Sparkles, BookOpen } from 'lucide-react';
import { MOCK_INTERVIEW_FEEDBACK } from '../data/mockData';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  // Mock stats
  const stats = [
    { label: 'Interviews Done', value: '12', icon: Play, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Mock Tests taken', value: '45', icon: BarChart2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Study Streak', value: '8 Days', icon: Calendar, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'XP Earned', value: '4,250', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  // Mock achievements
  const achievements = [
    { id: 'ach1', title: 'First Speech', desc: 'Complete a voice interview', unlocked: true, date: 'June 09' },
    { id: 'ach2', title: 'Bug Squasher', desc: 'Pass a coding challenge', unlocked: true, date: 'June 10' },
    { id: 'ach3', title: 'System Architect', desc: 'Take a System Design interview', unlocked: true, date: 'June 11' },
    { id: 'ach4', title: 'Principal Rank', desc: 'Score 90+ in FAANG interview', unlocked: false, date: 'Locked' },
  ];

  // Mock history logs
  const history = [
    {
      id: 'h1',
      role: 'Software Engineer II (FAANG Mode)',
      type: 'Technical Interview',
      date: 'June 11, 2026',
      score: 82,
      feedback: MOCK_INTERVIEW_FEEDBACK
    },
    {
      id: 'h2',
      role: 'Frontend Developer',
      type: 'React & JS Practice',
      date: 'June 09, 2026',
      score: 89,
      feedback: {
        scores: { communication: 92, technical: 85, confidence: 95, problemSolving: 80, leadership: 82 },
        strengths: ["Great react component design knowledge", "Perfect explanations of virtual DOM"],
        weaknesses: ["Could optimize closure garbage collection questions"],
        roadmap: [{ title: "Study JS memory leaks", desc: "Review JS heap profiler tools" }]
      }
    },
    {
      id: 'h3',
      role: 'Associate Project Manager',
      type: 'Behavioral & Leadership',
      date: 'June 05, 2026',
      score: 74,
      feedback: {
        scores: { communication: 80, technical: 60, confidence: 75, problemSolving: 70, leadership: 85 },
        strengths: ["Strong empathy and team coordination metrics"],
        weaknesses: ["Lacked STAR method framing on project delays"],
        roadmap: [{ title: "Behavioral practice", desc: "Write down 3 stories in STAR format" }]
      }
    }
  ];

  // Custom SVG Radar/Spider Chart calculations (5 points)
  // Axes: Communication (COM), Technical (TEC), Confidence (CNF), Problem Solving (PRB), Leadership (LDR)
  const radarAxes = [
    { name: 'Communication', key: 'communication', angle: -90 },
    { name: 'Technical', key: 'technical', angle: -18 },
    { name: 'Confidence', key: 'confidence', angle: 54 },
    { name: 'Problem Solving', key: 'problemSolving', angle: 126 },
    { name: 'Leadership', key: 'leadership', angle: 198 }
  ];

  const maxVal = 100;
  const radius = 65; // SVG coordinate radius
  const cx = 100; // SVG center X
  const cy = 90; // SVG center Y

  // Helper to convert polar to cartesian coordinates
  const getCoords = (angleDeg: number, val: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = (val / maxVal) * radius;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  };

  // Concentric grids (20%, 40%, 60%, 80%, 100%)
  const gridRings = [20, 40, 60, 80, 100];

  // Calculate points path for active score shape in history
  const activeScores = MOCK_INTERVIEW_FEEDBACK.scores as Record<string, number>;
  const scorePathPoints = radarAxes.map(axis => {
    const val = activeScores[axis.key] || 50;
    const { x, y } = getCoords(axis.angle, val);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="max-w-7xl w-full mx-auto pt-24 pb-16 px-4 md:px-8 z-10 relative">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-3xl font-black font-cyber text-white uppercase tracking-wider">
            ANALYTICS DASHBOARD
          </h1>
          <p className="text-gray-400 text-xs font-mono mt-1">
            Tracking Node: SEC_ALPHA_UNIT4 // Welcome back, Candidate Anand
          </p>
        </div>
        
        <button
          onClick={() => onNavigate('interview')}
          className="btn-neon px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 font-semibold font-mono text-xs tracking-wider text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/20"
        >
          LAUNCH INTERVIEW ROOM
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl text-left flex items-center justify-between border-white/5">
              <div>
                <span className="text-gray-400 text-xs font-mono">{s.label}</span>
                <span className="block text-2xl font-cyber font-bold mt-1 text-white">{s.value}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Column: Skill Analysis & Readiness */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Radar Chart Panel */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-cyber font-semibold text-white tracking-wider">SKILL SPIDER PLOT</h3>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">LATEST MOCK</span>
              </div>
              <p className="text-gray-400 text-xs">Evaluated across five core candidate assessment dimensions.</p>
            </div>
            
            <div className="flex justify-center my-4">
              {/* Custom SVG Radar Chart */}
              <svg viewBox="0 0 200 185" className="w-[200px] h-[185px]">
                {/* Concentric rings */}
                {gridRings.map(val => {
                  const ringPoints = radarAxes.map(axis => {
                    const { x, y } = getCoords(axis.angle, val);
                    return `${x},${y}`;
                  }).join(' ');
                  return (
                    <polygon
                      key={val}
                      points={ringPoints}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="0.8"
                    />
                  );
                })}

                {/* Axes lines & labels */}
                {radarAxes.map((axis, i) => {
                  const outer = getCoords(axis.angle, 100);
                  const labelOffset = getCoords(axis.angle, 122);
                  
                  // Label alignment tweak
                  let textAnchor: 'middle' | 'start' | 'end' = 'middle';
                  if (axis.angle === -18 || axis.angle === 54) textAnchor = 'start';
                  if (axis.angle === 126 || axis.angle === 198) textAnchor = 'end';

                  return (
                    <g key={i}>
                      <line
                        x1={cx}
                        y1={cy}
                        x2={outer.x}
                        y2={outer.y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="0.8"
                      />
                      <text
                        x={labelOffset.x}
                        y={labelOffset.y + 3}
                        fill="#94a3b8"
                        fontSize="7"
                        fontWeight="600"
                        fontFamily="monospace"
                        textAnchor={textAnchor}
                      >
                        {axis.name}
                      </text>
                    </g>
                  );
                })}

                {/* Score polygon */}
                <polygon
                  points={scorePathPoints}
                  fill="rgba(168, 85, 247, 0.18)"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))' }}
                />

                {/* Data points */}
                {radarAxes.map((axis, i) => {
                  const val = activeScores[axis.key] || 50;
                  const { x, y } = getCoords(axis.angle, val);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#ec4899"
                      stroke="#ffffff"
                      strokeWidth="0.5"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="flex justify-center gap-4 text-[9px] font-mono text-gray-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Your Profile</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-gray-700 rounded-full" /> Baseline Bench</span>
            </div>
          </div>

          {/* Job Readiness Dial */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 text-left flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-cyber font-semibold text-white tracking-wider">JOB READINESS RATING</h3>
              <p className="text-gray-400 text-xs mt-1">Consolidated index mapped against target recruiter standards.</p>
            </div>

            <div className="relative flex items-center justify-center my-6">
              {/* Dial SVG */}
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="url(#dialGrad)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * 84) / 100}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))' }}
                />
                <defs>
                  <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center Text */}
              <div className="absolute text-center">
                <span className="block text-3xl font-cyber font-black text-white text-neon-primary">84%</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">READY</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-center text-xs text-purple-300 font-mono flex items-center justify-center gap-1">
              <Sparkles size={14} className="text-purple-400" /> You are in the top 6.5% this week!
            </div>
          </div>
        </div>

        {/* Right Column: Gamification Achievements & Streaks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Level Widget */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono text-pink-400 uppercase tracking-widest">LEVEL 04</span>
                <h4 className="text-lg font-cyber font-bold text-white mt-0.5">ELITE NOMAD</h4>
              </div>
              <Award className="text-pink-400 animate-pulse" size={24} />
            </div>

            {/* XP progress bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                <span>XP Progress</span>
                <span>720 / 1000 XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '72%' }} />
              </div>
            </div>
            
            <p className="text-gray-500 text-[10px] font-mono">280 XP needed to unlock Level 5: Code Sentinel.</p>
          </div>

          {/* Badges Widget */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 text-left flex-1 flex flex-col justify-between">
            <h3 className="text-xs font-cyber font-semibold text-white tracking-wider mb-4 uppercase">UNLOCKABLE BADGES</h3>
            
            <div className="grid grid-cols-4 gap-3">
              {achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`group relative p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    ach.unlocked
                      ? 'bg-purple-500/5 border-purple-500/20 text-purple-300 hover:bg-purple-500/10'
                      : 'bg-black/30 border-white/5 text-gray-600'
                  }`}
                >
                  <Trophy size={20} className={ach.unlocked ? 'text-yellow-400' : 'text-gray-600'} />
                  <span className="block text-[8px] font-mono font-semibold mt-1.5 truncate w-full">{ach.title}</span>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-2 rounded-lg bg-black/90 border border-white/10 text-[9px] font-sans text-gray-300 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 leading-snug">
                    <span className="font-semibold block text-white">{ach.title}</span>
                    {ach.desc}
                    <span className="block text-[8px] text-pink-400 mt-0.5">{ach.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>Unlocked: 3/4 Badges</span>
              <span className="text-yellow-400">View All</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Interview History & Reports */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 text-left">
        <h3 className="text-sm font-cyber font-semibold text-white tracking-wider mb-6">MOCK SESSION HISTORY</h3>
        
        <div className="flex flex-col gap-4">
          {history.map(item => {
            const isExpanded = expandedHistory === item.id;
            return (
              <div 
                key={item.id} 
                className={`rounded-xl border transition-all duration-300 ${
                  isExpanded 
                    ? 'bg-white/[0.02] border-purple-500/30 shadow-lg shadow-purple-500/5' 
                    : 'bg-black/20 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Header row */}
                <div 
                  onClick={() => setExpandedHistory(isExpanded ? null : item.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{item.type}</span>
                    <h4 className="text-base font-semibold text-white mt-1.5">{item.role}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 font-mono">
                      <span className="flex items-center gap-1"><Clock size={12} /> {item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-start md:self-auto">
                    <div className="text-right">
                      <span className="text-xs font-mono text-gray-500 block">SCORE</span>
                      <span className={`text-lg font-cyber font-bold ${item.score >= 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>{item.score} / 100</span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Feedback Panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                    {/* Scoring Breakdown */}
                    <div className="lg:col-span-4 flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">SCORE METRICS</span>
                      {Object.entries(item.feedback.scores).map(([metric, score]) => (
                        <div key={metric} className="text-xs font-mono">
                          <div className="flex justify-between text-gray-400 mb-0.5 capitalize">
                            <span>{metric.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-white font-semibold">{score}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-2 font-semibold">STRENGTHS</span>
                        <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1.5">
                          {item.feedback.strengths.map((str, idx) => (
                            <li key={idx}>{str}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest block mb-2 font-semibold">WEAKNESSES / GAPS</span>
                        <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1.5">
                          {item.feedback.weaknesses.map((weak, idx) => (
                            <li key={idx}>{weak}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommendation Roadmap */}
                    <div className="lg:col-span-4">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-2 font-semibold">SUGGESTED PATH</span>
                      <div className="flex flex-col gap-3">
                        {item.feedback.roadmap.map((path, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-left">
                            <span className="text-[10px] font-mono text-cyan-400 font-semibold block">{path.title}</span>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{path.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
