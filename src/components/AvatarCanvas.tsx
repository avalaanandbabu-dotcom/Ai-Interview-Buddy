import React, { useState, useEffect, useRef } from 'react';

interface AvatarCanvasProps {
  isSpeaking: boolean;
  isListening: boolean;
  emotion?: 'idle' | 'speaking' | 'listening' | 'thinking' | 'success';
}

export function AvatarCanvas({ isSpeaking, isListening, emotion = 'idle' }: AvatarCanvasProps) {
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Visor Scan Line Pulse (Simulated blink/recalibration)
  useEffect(() => {
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        triggerBlink();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Oscilloscope wave mouth animation when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    const interval = setInterval(() => {
      setMouthOpen(Math.random() * 7 + 2); // random wave height
    }, 70);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Mouse follow effect for the visor tracking node
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized delta (-1 to 1)
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      
      // Limit range to max 12px shift for horizontal, 3px for vertical
      setMousePos({
        x: Math.max(-12, Math.min(12, dx * 12)),
        y: Math.max(-3, Math.min(3, dy * 3))
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Determine expressions based on state
  const activeEmotion = isSpeaking ? 'speaking' : isListening ? 'listening' : emotion;
  
  // Custom styling attributes
  let auraGlowColor = 'rgba(139, 92, 246, 0.35)'; // primary purple
  let headgearColor = '#8b5cf6';

  if (activeEmotion === 'thinking') {
    auraGlowColor = 'rgba(6, 182, 212, 0.4)'; // cyan
    headgearColor = '#06b6d4';
  } else if (activeEmotion === 'listening') {
    auraGlowColor = 'rgba(236, 72, 153, 0.4)'; // pink
    headgearColor = '#ec4899';
  } else if (activeEmotion === 'success') {
    auraGlowColor = 'rgba(16, 185, 129, 0.4)'; // green
    headgearColor = '#10b981';
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[320px] md:min-h-[400px] flex items-center justify-center rounded-2xl overflow-hidden glass-panel border-purple-500/20"
      style={{
        boxShadow: `0 0 35px ${auraGlowColor}`
      }}
    >
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.012)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"
      />

      {/* Futuristic HUD target ring behind robot */}
      <div className="absolute w-[270px] h-[270px] md:w-[330px] md:h-[330px] border border-dashed rounded-full animate-spin [animation-duration:35s] opacity-25 pointer-events-none"
        style={{ borderColor: headgearColor, filter: `drop-shadow(0 0 2px ${headgearColor})` }}
      />
      <div className="absolute w-[240px] h-[240px] md:w-[290px] md:h-[290px] border border-dotted rounded-full animate-spin [animation-duration:18s] [animation-direction:reverse] opacity-15 pointer-events-none"
        style={{ borderColor: headgearColor }}
      />

      {/* Aura background blur */}
      <div 
        className="absolute w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full filter blur-[50px] transition-all duration-700 pointer-events-none"
        style={{
          background: auraGlowColor,
          transform: isSpeaking ? 'scale(1.3)' : isListening ? 'scale(1.2)' : 'scale(1)'
        }}
      />

      {/* Live SVG Neural Robot Avatar */}
      <svg
        viewBox="0 0 200 220"
        className="w-[220px] h-[240px] md:w-[280px] md:h-[300px] z-10 drop-shadow-[0_12px_20px_rgba(0,0,0,0.75)] animate-float"
      >
        <defs>
          {/* Futuristic Gradients */}
          <linearGradient id="metalChassis" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="60%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="chassisShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" opacity="0.6" />
            <stop offset="100%" stopColor="#090d16" opacity="0.9" />
          </linearGradient>
          <linearGradient id="plateHighlights" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="glassVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c111d" />
            <stop offset="100%" stopColor="#04060a" />
          </linearGradient>
        </defs>

        {/* 1. MECHANICAL NECK */}
        <g>
          {/* Hydraulic Cylinder */}
          <rect x="85" y="145" rx="2" width="30" height="28" fill="url(#plateHighlights)" stroke="#1e293b" strokeWidth="1.5" />
          {/* Vertical wiring stripes */}
          <line x1="92" y1="145" x2="92" y2="173" stroke={headgearColor} strokeWidth="1.5" opacity="0.8" style={{ filter: `drop-shadow(0 0 2px ${headgearColor})` }} />
          <line x1="100" y1="145" x2="100" y2="173" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="108" y1="145" x2="108" y2="173" stroke={headgearColor} strokeWidth="1.5" opacity="0.8" style={{ filter: `drop-shadow(0 0 2px ${headgearColor})` }} />
          {/* Neck flange */}
          <ellipse cx="100" cy="146" rx="16" ry="3.5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        </g>

        {/* 2. ARMORED SHOULDERS & CHEST CORE */}
        <g>
          <path
            d="M 35,220 C 45,192 68,168 85,168 L 115,168 C 132,168 155,192 165,220 Z"
            fill="url(#chassisShadow)"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <path
            d="M 42,220 C 50,198 70,174 85,174 L 115,174 C 130,174 150,198 158,220 Z"
            fill="url(#plateHighlights)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          
          {/* Chest panel seam line */}
          <path d="M 100,174 L 100,185" fill="none" stroke="#1e293b" strokeWidth="2" />
          <path d="M 75,192 L 125,192" fill="none" stroke="#1e293b" strokeWidth="1" />

          {/* Glowing Reactor / Chest Core (Telemetry indicator) */}
          <circle cx="100" cy="198" r="12" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <circle 
            cx="100" 
            cy="198" 
            r="8" 
            fill={headgearColor} 
            className={isSpeaking || isListening ? "animate-pulse" : ""}
            style={{ filter: `drop-shadow(0 0 6px ${headgearColor})` }}
            opacity="0.9"
          />
          <circle cx="100" cy="198" r="3.5" fill="#ffffff" />
        </g>

        {/* 3. HEADPHONE SENSOR DISKS (COMM GEAR) */}
        <g>
          {/* Band */}
          <path
            d="M 50,75 C 50,22 150,22 150,75"
            fill="none"
            stroke="#1e293b"
            strokeWidth="5"
          />
          <path
            d="M 50,75 C 50,22 150,22 150,75"
            fill="none"
            stroke={headgearColor}
            strokeWidth="1.5"
            opacity="0.7"
            style={{ filter: `drop-shadow(0 0 2px ${headgearColor})` }}
          />
          {/* Sensor Disks */}
          <circle cx="44" cy="76" r="10" fill="#1e293b" stroke={headgearColor} strokeWidth="1.5" />
          <circle cx="44" cy="76" r="6" fill="#090d16" />
          <circle cx="44" cy="76" r="3" fill={headgearColor} className="animate-ping" style={{ animationDuration: '3s' }} />

          <circle cx="156" cy="76" r="10" fill="#1e293b" stroke={headgearColor} strokeWidth="1.5" />
          <circle cx="156" cy="76" r="6" fill="#090d16" />
          <circle cx="156" cy="76" r="3" fill={headgearColor} className="animate-ping" style={{ animationDuration: '3s' }} />
        </g>

        {/* 4. METALLIC FACE PLATE */}
        <path
          d="M 60,90 C 60,65 140,65 140,90 C 140,116 138,144 100,150 C 62,144 60,116 60,90 Z"
          fill="url(#metalChassis)"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Panel Seams (Cyber mechanical lines) */}
        <path d="M 100,90 L 100,148" fill="none" stroke="#101726" strokeWidth="1" opacity="0.6" />
        <path d="M 60,112 L 80,114" fill="none" stroke="#101726" strokeWidth="1" opacity="0.6" />
        <path d="M 140,112 L 120,114" fill="none" stroke="#101726" strokeWidth="1" opacity="0.6" />

        {/* Cheek diagnostic telemetry widgets instead of blush */}
        <g opacity="0.8">
          <rect x="66" y="117" width="12" height="1.5" fill={headgearColor} opacity="0.75" />
          <rect x="66" y="121" width="7" height="1.5" fill="#06b6d4" opacity="0.6" />
          <rect x="122" y="117" width="12" height="1.5" fill={headgearColor} opacity="0.75" />
          <rect x="127" y="121" width="7" height="1.5" fill="#06b6d4" opacity="0.6" />
        </g>

        {/* 5. HOLOGRAPHIC NEURAL BRAIN DOME */}
        <g>
          {/* Glass dome outline */}
          <path
            d="M 60,90 C 60,32 140,32 140,90"
            fill="rgba(15, 23, 42, 0.45)"
            stroke={headgearColor}
            strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 0 3px ${headgearColor})` }}
          />

          {/* Internal Neural Web (Constellation) */}
          <g>
            {/* Synaptic pathways */}
            <line x1="72" y1="75" x2="95" y2="52" stroke={headgearColor} strokeWidth="1" opacity="0.3" />
            <line x1="95" y1="52" x2="128" y2="75" stroke={headgearColor} strokeWidth="1" opacity="0.3" />
            <line x1="72" y1="75" x2="128" y2="75" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />
            <line x1="98" y1="52" x2="100" y2="82" stroke="#06b6d4" strokeWidth="1" opacity="0.3" />
            <line x1="84" y1="62" x2="114" y2="62" stroke={headgearColor} strokeWidth="0.5" opacity="0.2" />
            
            {/* Pulsing Synaptic Nodes */}
            <circle cx="72" cy="75" r="2.5" fill={headgearColor} />
            <circle cx="128" cy="75" r="2.5" fill={headgearColor} />
            <circle cx="95" cy="52" r="3.5" fill="#ffffff" style={{ filter: `drop-shadow(0 0 3px ${headgearColor})` }} />
            <circle cx="100" cy="82" r="2.5" fill="#06b6d4" />
            <circle cx="84" cy="62" r="2.0" fill="#06b6d4" />
            <circle cx="114" cy="62" r="2.0" fill={headgearColor} />
          </g>
        </g>

        {/* 6. GLOWING INTERACTIVE VISOR (EYES) */}
        <g>
          {/* Visor Border */}
          <rect x="62" y="93" rx="4" width="76" height="18" fill="url(#glassVisor)" stroke="#1e293b" strokeWidth="2" />
          <rect 
            x="62" 
            y="93" 
            rx="4" 
            width="76" 
            height="18" 
            fill="none" 
            stroke={headgearColor} 
            strokeWidth="1.2" 
            opacity={blink ? 0.2 : 0.8}
            style={{ filter: `drop-shadow(0 0 4px ${headgearColor})` }} 
          />

          {/* Grid telemetry inside visor */}
          {!blink && (
            <>
              <line x1="64" y1="102" x2="136" y2="102" stroke={headgearColor} strokeWidth="0.5" opacity="0.3" />
              {/* Vertical subdivisions */}
              <line x1="72" y1="96" x2="72" y2="108" stroke={headgearColor} strokeWidth="0.5" opacity="0.2" />
              <line x1="100" y1="96" x2="100" y2="108" stroke={headgearColor} strokeWidth="0.5" opacity="0.1" />
              <line x1="128" y1="96" x2="128" y2="108" stroke={headgearColor} strokeWidth="0.5" opacity="0.2" />
            </>
          )}

          {/* Laser Core - Shifts to track the mouse coordinates (Pupil Replacement) */}
          {!blink && (
            <g transform={`translate(${mousePos.x * 2 + 100}, ${mousePos.y * 0.8 + 102})`}>
              {/* Core glow */}
              <circle 
                cx="0" 
                cy="0" 
                r="4.5" 
                fill={headgearColor} 
                style={{ filter: `drop-shadow(0 0 5px ${headgearColor})` }} 
              />
              <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
              {/* Crosshair telemetry */}
              <line x1="-9" y1="0" x2="9" y2="0" stroke="#ffffff" strokeWidth="0.5" opacity="0.65" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#ffffff" strokeWidth="0.5" opacity="0.65" />
            </g>
          )}

          {/* Visor off state when blinking */}
          {blink && (
            <line x1="66" y1="102" x2="134" y2="102" stroke={headgearColor} strokeWidth="2" opacity="0.9" style={{ filter: `drop-shadow(0 0 3px ${headgearColor})` }} />
          )}
        </g>

        {/* 7. OSCILLOSCOPE WAVE MOUTH */}
        <g>
          {isSpeaking ? (
            // Animated oscillating waveform representing speech
            <path
              d={`M 82,133 Q 91,${133 - mouthOpen * 1.5} 100,133 Q 109,${133 + mouthOpen * 1.5} 118,133`}
              fill="none"
              stroke={headgearColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${headgearColor})` }}
            />
          ) : activeEmotion === 'success' ? (
            // Happy pulsing static curve
            <path
              d="M 84,131 Q 100,139 116,131"
              fill="none"
              stroke={headgearColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 3px ${headgearColor})` }}
            />
          ) : (
            // Flat, glowing idle oscilloscope line
            <line
              x1="84"
              y1="133"
              x2="116"
              y2="133"
              stroke={headgearColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.85"
              style={{ filter: `drop-shadow(0 0 3px ${headgearColor})` }}
            />
          )}
        </g>
      </svg>

      {/* Floating Status Indicator Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/5 text-xs text-gray-400 font-mono">
        <div className="flex items-center gap-2">
          <span 
            className={`w-2 h-2 rounded-full ${
              isSpeaking 
                ? 'bg-purple-500 animate-ping' 
                : isListening 
                ? 'bg-pink-500 animate-pulse' 
                : emotion === 'thinking'
                ? 'bg-cyan-500 animate-bounce'
                : 'bg-emerald-500'
            }`}
            style={{
              backgroundColor: headgearColor,
              boxShadow: `0 0 8px ${headgearColor}`
            }}
          />
          <span className="uppercase tracking-wider">
            {isSpeaking 
              ? 'Buddy: Speaking' 
              : isListening 
              ? 'Buddy: Listening...' 
              : emotion === 'thinking'
              ? 'Buddy: Thinking...'
              : 'Buddy: Online'}
          </span>
        </div>
        <div>
          <span>MODEL: COGNITIVE_BOY_V3</span>
        </div>
      </div>
    </div>
  );
}
