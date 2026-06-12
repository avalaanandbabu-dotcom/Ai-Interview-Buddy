import React, { useState, useEffect, useRef } from 'react';
import { AvatarCanvas } from './AvatarCanvas';
import { 
  Terminal, Award, FileText, Cpu, BookOpen, MessageSquare, 
  ArrowRight, Play, Compass, Volume2, VolumeX, ChevronDown, Award as TrophyIcon 
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const synthRef = useRef<any>(null);
  const hasGreetedCommandCenter = useRef(false);

  // States
  const [audioActive, setAudioActive] = useState(false);
  const [isWelcoming, setIsWelcoming] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [bubbleText, setBubbleText] = useState(
    "Hi there! I am your AI Interview Buddy. Ready to crush your next interview? Let's practice!"
  );

  // Framer Motion Scroll Hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Spring physics for smooth scroll transitions (mitigates notchiness)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 25,
    restDelta: 0.001
  });

  // Transform maps for each Realm
  // Realm 1: Floating Sky Kingdom
  const skyOpacity = useTransform(smoothProgress, [0, 0.2, 0.26], [1, 1, 0]);
  const skyScale = useTransform(smoothProgress, [0, 0.26], [1, 1.25]);
  const skyY = useTransform(smoothProgress, [0, 0.26], [0, -120]);

  // Realm 2: Cyber City
  const cyberOpacity = useTransform(smoothProgress, [0.18, 0.25, 0.46, 0.52], [0, 1, 1, 0]);
  const cyberScale = useTransform(smoothProgress, [0.18, 0.25, 0.46, 0.52], [0.8, 1, 1, 1.25]);
  const cyberY = useTransform(smoothProgress, [0.18, 0.52], [100, -120]);

  // Realm 3: AI Universe
  const aiOpacity = useTransform(smoothProgress, [0.44, 0.51, 0.72, 0.78], [0, 1, 1, 0]);
  const aiScale = useTransform(smoothProgress, [0.44, 0.51, 0.72, 0.78], [0.8, 1, 1, 1.25]);
  const aiY = useTransform(smoothProgress, [0.44, 0.78], [100, -120]);

  // Realm 4: Interview Command Center
  const cmdOpacity = useTransform(smoothProgress, [0.72, 0.81], [0, 1]);
  const cmdScale = useTransform(smoothProgress, [0.72, 0.81], [0.9, 1]);
  const cmdY = useTransform(smoothProgress, [0.72, 0.81], [60, 0]);

  // Update active stage and audio synth dynamically as scroll moves
  const progressRef = useRef(0);
  
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    progressRef.current = latest;

    // Determine active stage for HUD
    if (latest < 0.24) {
      setActiveStage(0);
    } else if (latest >= 0.24 && latest < 0.50) {
      setActiveStage(1);
    } else if (latest >= 0.50 && latest < 0.76) {
      setActiveStage(2);
    } else {
      setActiveStage(3);
    }

    // Adapt web audio synth parameters
    updateSynthParameters(latest);

    // Auto-Greeting trigger on entering the Command Center
    if (latest >= 0.78 && !hasGreetedCommandCenter.current) {
      hasGreetedCommandCenter.current = true;
      triggerCommandCenterGreeting();
    }
  });

  // Web Audio Synthesizer Initialization
  const initSynth = () => {
    if (synthRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.08; // soft ambient volume
    masterGain.connect(ctx.destination);

    // Low pulsing drone
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'triangle';
    droneOsc.frequency.value = 55; // A1
    
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.45;
    
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 170;

    droneOsc.connect(droneGain);
    droneGain.connect(droneFilter);
    droneFilter.connect(masterGain);

    // Space pads (detuned pair for natural chorus beating)
    const padOsc1 = ctx.createOscillator();
    padOsc1.type = 'sine';
    padOsc1.frequency.value = 110; // A2
    
    const padOsc2 = ctx.createOscillator();
    padOsc2.type = 'sine';
    padOsc2.frequency.value = 110.6; // detuned by 0.6Hz

    const padGain = ctx.createGain();
    padGain.gain.value = 0.35;

    padOsc1.connect(padGain);
    padOsc2.connect(padGain);
    padGain.connect(masterGain);

    // High lead sine voice for airy celestial tones
    const leadOsc = ctx.createOscillator();
    leadOsc.type = 'sine';
    leadOsc.frequency.value = 440; // A4
    
    const leadGain = ctx.createGain();
    leadGain.gain.value = 0.02; // soft start

    leadOsc.connect(leadGain);
    leadGain.connect(masterGain);

    // Filter LFO to sweep drone filter cutoff
    const filterLFO = ctx.createOscillator();
    filterLFO.type = 'sine';
    filterLFO.frequency.value = 0.06; // ~16s cycles
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 35; // swing cutoff frequency

    filterLFO.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);

    // Start synth nodes
    droneOsc.start();
    padOsc1.start();
    padOsc2.start();
    leadOsc.start();
    filterLFO.start();

    synthRef.current = {
      ctx,
      masterGain,
      droneOsc,
      droneGain,
      droneFilter,
      padOsc1,
      padOsc2,
      padGain,
      leadOsc,
      leadGain,
      filterLFO
    };
  };

  // Update Synth Nodes depending on Scroll Progress
  const updateSynthParameters = (progress: number) => {
    const synth = synthRef.current;
    if (!synth || synth.ctx.state === 'suspended' || !audioActive) return;

    const t = synth.ctx.currentTime;

    if (progress < 0.24) {
      // Realm 1: Sky Kingdom -> A major / warm airy pad
      synth.droneFilter.frequency.setValueAtTime(170, t);
      synth.droneOsc.frequency.setValueAtTime(55, t); // A1
      synth.padOsc1.frequency.setValueAtTime(110, t); // A2
      synth.padOsc2.frequency.setValueAtTime(110.5, t);
      synth.padGain.gain.linearRampToValueAtTime(0.35, t + 0.1);
      
      synth.leadOsc.type = 'sine';
      synth.leadOsc.frequency.setValueAtTime(440, t); // A4
      synth.leadGain.gain.linearRampToValueAtTime(0.06, t + 0.1);

    } else if (progress >= 0.24 && progress < 0.50) {
      // Realm 2: Cyber City -> D minor / futuristic tech resonance
      synth.droneFilter.frequency.setValueAtTime(280, t);
      synth.droneOsc.frequency.setValueAtTime(36.7, t); // D1
      synth.padOsc1.frequency.setValueAtTime(73.4, t); // D2
      synth.padOsc2.frequency.setValueAtTime(73.9, t);
      synth.padGain.gain.linearRampToValueAtTime(0.18, t + 0.1);

      synth.leadOsc.type = 'triangle'; // digital wave
      synth.leadOsc.frequency.setValueAtTime(293.7, t); // D4
      synth.leadGain.gain.linearRampToValueAtTime(0.04, t + 0.1);

    } else if (progress >= 0.50 && progress < 0.76) {
      // Realm 3: AI Universe -> E minor / cold deep space echo
      synth.droneFilter.frequency.setValueAtTime(130, t);
      synth.droneOsc.frequency.setValueAtTime(41.2, t); // E1
      synth.padOsc1.frequency.setValueAtTime(82.4, t); // E2
      synth.padOsc2.frequency.setValueAtTime(82.9, t);
      synth.padGain.gain.linearRampToValueAtTime(0.4, t + 0.1);

      synth.leadOsc.type = 'sine';
      synth.leadOsc.frequency.setValueAtTime(659.3, t); // E5 (shiny star pitch)
      synth.leadGain.gain.linearRampToValueAtTime(0.1, t + 0.1);

    } else {
      // Realm 4: Command Center -> A minor / focus & telemetry state
      synth.droneFilter.frequency.setValueAtTime(180, t);
      synth.droneOsc.frequency.setValueAtTime(55, t); // A1
      synth.padOsc1.frequency.setValueAtTime(110, t); // A2
      synth.padOsc2.frequency.setValueAtTime(110.5, t);
      synth.padGain.gain.linearRampToValueAtTime(0.28, t + 0.1);

      synth.leadOsc.type = 'sine';
      synth.leadOsc.frequency.setValueAtTime(329.6, t); // E4 (focused fifth)
      synth.leadGain.gain.linearRampToValueAtTime(0.02, t + 0.1);
    }
  };

  // Toggle audio engine
  const toggleAudio = () => {
    if (!synthRef.current) {
      initSynth();
      setAudioActive(true);
      // Wait a fraction to ensure context starts before tuning parameters
      setTimeout(() => {
        if (synthRef.current) {
          synthRef.current.masterGain.gain.setValueAtTime(0.001, synthRef.current.ctx.currentTime);
          synthRef.current.masterGain.gain.linearRampToValueAtTime(0.08, synthRef.current.ctx.currentTime + 0.15);
          updateSynthParameters(progressRef.current);
        }
      }, 50);
    } else {
      const { ctx, masterGain } = synthRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.15);
        setAudioActive(true);
      } else if (audioActive) {
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        setAudioActive(false);
      } else {
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.15);
        setAudioActive(true);
        updateSynthParameters(progressRef.current);
      }
    }
  };

  // TTS Greeting triggers
  const triggerCommandCenterGreeting = () => {
    if (!('speechSynthesis' in window)) return;
    setIsWelcoming(true);
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(
      "Welcome to the Interview Command Center, Anand! I have initialized our training nodes. Select a preparation module to begin."
    );

    const voices = window.speechSynthesis.getVoices();
    const preferredVoiceName = localStorage.getItem('preferred_voice_name');
    let selectedVoice = null;
    if (preferredVoiceName) {
      selectedVoice = voices.find(v => v.name === preferredVoiceName);
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.name.includes('Google US English') && v.name.toLowerCase().includes('male'))
        || voices.find(v => v.name.includes('Google') && v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
        || voices.find(v => v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Daniel') || v.name.includes('Microsoft David'))
        || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
        || voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('zira') && !v.name.toLowerCase().includes('samantha') && !v.name.toLowerCase().includes('hazel'))
        || voices[0];
    }

    if (selectedVoice) utter.voice = selectedVoice;
    utter.pitch = 1.08; // high-quality boy voice tone tuning
    utter.rate = 1.05;

    utter.onstart = () => {
      setBubbleText(
        "Welcome to the Interview Command Center, Anand! I have initialized our training nodes. Select a preparation module to begin."
      );
    };
    utter.onend = () => {
      setIsWelcoming(false);
    };
    utter.onerror = () => {
      setIsWelcoming(false);
    };
    window.speechSynthesis.speak(utter);
  };

  // Manual Trigger speaking greeting
  const handleGreetingClick = () => {
    if (isWelcoming) return;
    setIsWelcoming(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(
        "Hi there! I am your AI Interview Buddy. Ready to crush your next interview? Select start interview or upload your resume, and let's work together!"
      );

      const voices = window.speechSynthesis.getVoices();
      const preferredVoiceName = localStorage.getItem('preferred_voice_name');
      let selectedVoice = null;
      if (preferredVoiceName) {
        selectedVoice = voices.find(v => v.name === preferredVoiceName);
      }
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name.includes('Google US English') && v.name.toLowerCase().includes('male'))
          || voices.find(v => v.name.includes('Google') && v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
          || voices.find(v => v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Daniel') || v.name.includes('Microsoft David'))
          || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
          || voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('zira') && !v.name.toLowerCase().includes('samantha') && !v.name.toLowerCase().includes('hazel'))
          || voices[0];
      }

      if (selectedVoice) utter.voice = selectedVoice;
      utter.pitch = 1.08;
      utter.rate = 1.05;

      utter.onstart = () => {
        setBubbleText(
          "Hi there! I am your AI Interview Buddy. Ready to crush your next interview? Select start interview or upload your resume, and let's work together!"
        );
      };
      utter.onend = () => {
        setIsWelcoming(false);
      };
      utter.onerror = () => {
        setIsWelcoming(false);
      };
      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(() => setIsWelcoming(false), 3000);
    }
  };

  // Canvas particle fields loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Seed particles
    interface TravelParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const particles: TravelParticle[] = [];
    const count = 110;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    // Animation loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = progressRef.current;

      // Draw background sky/grid/stars colors manually
      let baseGrad;
      if (progress < 0.25) {
        // Sky Kingdom: deep gold horizon
        baseGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
        baseGrad.addColorStop(0, '#1c1308');
        baseGrad.addColorStop(1, '#05060b');
      } else if (progress >= 0.24 && progress < 0.50) {
        // Cyber City: deep cyber blue
        baseGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
        baseGrad.addColorStop(0, '#040d1a');
        baseGrad.addColorStop(1, '#05060b');
      } else if (progress >= 0.50 && progress < 0.76) {
        // AI Universe: deep violet nebula
        baseGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
        baseGrad.addColorStop(0, '#0d061c');
        baseGrad.addColorStop(1, '#05060b');
      } else {
        // Command center: clean slate black
        baseGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
        baseGrad.addColorStop(0, '#06070c');
        baseGrad.addColorStop(1, '#05060b');
      }
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw digital grid overlay for Cyber City
      if (progress >= 0.18 && progress < 0.54) {
        const gridOpacity = progress < 0.24 
          ? (progress - 0.18) / 0.06 
          : progress > 0.48 
          ? (0.54 - progress) / 0.06 
          : 1;
        ctx.strokeStyle = `rgba(6, 182, 212, ${gridOpacity * 0.035})`;
        ctx.lineWidth = 0.5;
        const gridSize = 60;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Draw particle nodes
      particles.forEach((p, idx) => {
        let pColor = '';

        if (progress < 0.24) {
          // Realm 1 (Sky): golden drift up
          p.y += p.vy * 0.6 - 0.35;
          p.x += p.vx * 0.4;
          pColor = `rgba(245, 158, 11, ${p.alpha * 0.7})`; // Amber
        } else if (progress >= 0.24 && progress < 0.50) {
          // Realm 2 (Cyber): cyan/pink fast rain
          p.y += p.vy * 3.5 + 3.0; // falling speed
          p.x += p.vx * 0.15;
          pColor = idx % 2 === 0
            ? `rgba(6, 182, 212, ${p.alpha * 0.85})` // Cyan
            : `rgba(236, 72, 153, ${p.alpha * 0.85})`; // Pink
        } else if (progress >= 0.50 && progress < 0.76) {
          // Realm 3 (AI): purple constellation nodes
          p.x += p.vx * 0.9;
          p.y += p.vy * 0.9;
          pColor = `rgba(168, 85, 247, ${p.alpha * 0.95})`; // Violet
        } else {
          // Realm 4 (Command): slow ambient circles
          p.x += p.vx * 0.3;
          p.y += p.vy * 0.3;
          pColor = `rgba(139, 92, 246, ${p.alpha * 0.45})`; // Muted Indigo
        }

        // Boundary wraps
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = pColor;
        ctx.fill();

        // Draw connections if in AI Universe
        if (progress >= 0.50 && progress < 0.76) {
          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
              const opacity = (130 - dist) / 130 * 0.14;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        const { ctx, droneOsc, padOsc1, padOsc2, leadOsc, filterLFO } = synthRef.current;
        try {
          droneOsc.stop();
          padOsc1.stop();
          padOsc2.stop();
          leadOsc.stop();
          filterLFO.stop();
        } catch (e) {}
        ctx.close();
        synthRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Click handler to scroll to specific progress targets
  const scrollToPct = (pct: number) => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: pct * totalHeight,
      behavior: 'smooth'
    });
  };

  const hudStages = [
    { label: 'SKY KINGDOM', pct: 0.0, ringColor: 'border-amber-500', glowColor: 'bg-amber-500' },
    { label: 'CYBER METROPOLIS', pct: 0.33, ringColor: 'border-pink-500', glowColor: 'bg-pink-500' },
    { label: 'NEURAL COSMOS', pct: 0.66, ringColor: 'border-cyan-500', glowColor: 'bg-cyan-500' },
    { label: 'COMMAND BRIDGE', pct: 0.95, ringColor: 'border-purple-500', glowColor: 'bg-purple-500' }
  ];

  return (
    <div ref={containerRef} className="relative w-full h-[480vh] bg-[#05060b] text-[#f3f4f6] font-sans">
      
      {/* 1. STICKY INTERACTIVE VIEWPORT */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-10">
        
        {/* Canvas background field */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Ambient Aurora Glow layers blending with canvas */}
        <div className="aurora-bg" />
        <div className="aurora-glow-1 opacity-20" />
        <div className="aurora-glow-2 opacity-15" />

        {/* TOP HUD: Immersion audio control */}
        <div className="absolute top-20 right-6 md:right-8 z-30">
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-[10px] tracking-wider transition-all shadow-lg backdrop-blur-md ${
              audioActive
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-purple-500/10'
                : 'bg-black/60 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {audioActive ? <Volume2 size={13} className="animate-pulse" /> : <VolumeX size={13} />}
            <span>{audioActive ? 'IMMERSION AUDIO: ON' : 'IMMERSION AUDIO: MUTED'}</span>
          </button>
        </div>

        {/* SIDE HUD: Vertical Journey Timeline */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-9 z-30 items-end font-mono text-[9px] tracking-widest pointer-events-auto">
          <div className="absolute right-[5px] top-2 bottom-2 w-[1px] bg-white/5 -z-10" />
          {hudStages.map((stage, idx) => {
            const isActive = activeStage === idx;
            return (
              <button
                key={idx}
                onClick={() => scrollToPct(stage.pct)}
                className="group flex items-center gap-3 focus:outline-none"
              >
                <span className={`transition-all duration-300 opacity-0 group-hover:opacity-100 mr-1 translate-x-2 group-hover:translate-x-0 font-bold ${
                  isActive ? stage.ringColor.replace('border-', 'text-') : 'text-gray-500'
                }`}>
                  {stage.label}
                </span>
                
                <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all ${
                  isActive ? `${stage.ringColor} scale-125` : 'border-white/10 group-hover:border-white/40'
                }`}>
                  {isActive && (
                    <motion.div 
                      layoutId="hudActiveDot"
                      className={`w-1.5 h-1.5 rounded-full ${stage.glowColor} shadow-[0_0_8px_rgba(255,255,255,0.7)]`} 
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* SCROLL TRIGGERED LAYERS */}

        {/* REALM 1: FLOATING SKY KINGDOM (Stage 0) */}
        <motion.div
          style={{ opacity: skyOpacity, scale: skyScale, y: skyY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center select-none pointer-events-none"
        >
          <div className="max-w-2xl flex flex-col items-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] tracking-widest uppercase">
              <Compass size={12} className="animate-spin [animation-duration:8s]" /> THE SKY PORTALS
            </div>
            
            <h1 className="text-4xl sm:text-7xl font-black font-cyber tracking-wider leading-none uppercase bg-gradient-to-b from-amber-200 via-amber-100 to-amber-500/80 bg-clip-text text-transparent drop-shadow-lg">
              Ascend to <br/>Preparation
            </h1>
            
            <p className="text-amber-200/60 text-xs sm:text-sm max-w-lg font-sans leading-relaxed">
              Step onto the floating thresholds of wisdom. The journey to landing your dream technical role starts from the highest vistas of conceptual clarity.
            </p>

            <div className="pt-6 flex flex-col items-center gap-1.5 text-[10px] font-mono text-amber-500 animate-bounce">
              <span>SCROLL DOWN TO INITIATE DESCENT</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </motion.div>

        {/* REALM 2: CYBER CITY (Stage 1) */}
        <motion.div
          style={{ opacity: cyberOpacity, scale: cyberScale, y: cyberY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center select-none pointer-events-none"
        >
          <div className="max-w-2xl flex flex-col items-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono text-[10px] tracking-widest uppercase">
              <Terminal size={12} /> THE CODE NEIGHBORHOODS
            </div>
            
            <h1 className="text-4xl sm:text-7xl font-black font-cyber tracking-wider leading-none uppercase bg-gradient-to-b from-pink-300 via-purple-300 to-indigo-500 bg-clip-text text-transparent">
              CYBER <br/>METROPOLIS
            </h1>
            
            <p className="text-pink-300/60 text-xs sm:text-sm max-w-lg font-sans leading-relaxed">
              Walk the streets of compiled logic. Build clean system architectures, structural logic trees, and optimize memory allocations inside the metropolis of code.
            </p>

            <div className="pt-4 text-[10px] font-mono text-purple-400 animate-pulse">
              DESCENDING TO CORE SYNTHESIS...
            </div>
          </div>
        </motion.div>

        {/* REALM 3: AI UNIVERSE (Stage 2) */}
        <motion.div
          style={{ opacity: aiOpacity, scale: aiScale, y: aiY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center select-none pointer-events-none"
        >
          <div className="max-w-2xl flex flex-col items-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] tracking-widest uppercase">
              <Cpu size={12} className="animate-pulse" /> THE COGNITIVE WEB
            </div>
            
            <h1 className="text-4xl sm:text-7xl font-black font-cyber tracking-wider leading-none uppercase bg-gradient-to-b from-cyan-300 via-sky-100 to-blue-600 bg-clip-text text-transparent">
              NEURAL <br/>COSMOS
            </h1>
            
            <p className="text-cyan-300/60 text-xs sm:text-sm max-w-lg font-sans leading-relaxed">
              Pass through deep learning clusters. Our models analyze resume semantics, parse coding performance, and structure custom roadmaps based on FAANG evaluations.
            </p>

            <div className="pt-4 text-[10px] font-mono text-cyan-400 animate-pulse">
              APPROACHING FINAL DISPATCH BRIDGE...
            </div>
          </div>
        </motion.div>

        {/* REALM 4: INTERVIEW COMMAND CENTER HERO (Stage 3) */}
        <motion.div
          style={{ opacity: cmdOpacity, scale: cmdScale, y: cmdY }}
          className="absolute inset-0 w-full h-full flex items-center justify-center px-4 md:px-8 pointer-events-auto z-20"
        >
          {/* Main Hero grid container */}
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-8 md:mt-12">
            
            {/* Hero Left: Text & CTA */}
            <div className="lg:col-span-7 flex flex-col space-y-5 text-left relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] tracking-wider uppercase w-fit animate-pulse">
                <TrophyIcon size={13} className="text-yellow-400" /> Next-Generation AI Prep v2.5
              </div>
              
              <h1 className="text-3xl sm:text-6xl font-black font-cyber tracking-tight leading-tight uppercase">
                Master Interviews with Your Personal <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent text-neon-primary">AI Coach</span>
              </h1>
              
              <p className="text-gray-400 text-xs sm:text-sm max-w-xl font-sans leading-relaxed">
                An ultra-premium, interactive simulation platform. Talk directly with our live animated AI Anime avatar, write production code in the compiler sandbox, check your resume against ATS bots, and practice adaptive multiple-choice tests.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => onNavigate('interview')}
                  className="btn-neon inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold font-mono text-xs tracking-wider shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all"
                >
                  <Play size={16} fill="currentColor" /> START MOCK INTERVIEW
                </button>
                <button
                  onClick={() => onNavigate('resume')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 font-bold font-mono text-xs tracking-wider transition-all"
                >
                  <FileText size={16} /> UPLOAD RESUME
                </button>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-white/5 text-gray-400 font-mono text-[10px]">
                <div>
                  <span className="block text-xl font-bold font-cyber text-white">98%</span>
                  ATS Match Accuracy
                </div>
                <div>
                  <span className="block text-xl font-bold font-cyber text-white">10k+</span>
                  Mock Sessions Ran
                </div>
                <div>
                  <span className="block text-xl font-bold font-cyber text-white">FAANG+</span>
                  Company Checklists
                </div>
              </div>
            </div>

            {/* Hero Right: Avatar Panel */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* Talk Bubble */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[85%] bg-black/85 backdrop-blur-md border border-purple-500/30 px-4 py-2.5 rounded-2xl text-center text-xs font-sans shadow-2xl z-20 transition-all duration-300">
                <p className="text-purple-200 leading-relaxed font-semibold">{bubbleText}</p>
                {/* Bubble arrow */}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-r border-b border-purple-500/30 rotate-45" />
              </div>

              {/* Interactive Click Tip */}
              <div className="absolute top-2 right-4 z-20">
                <button 
                  onClick={handleGreetingClick}
                  className="text-[9px] font-mono px-2.5 py-1 bg-purple-500/20 border border-purple-500/40 rounded-md text-purple-300 hover:bg-purple-500/40 transition-all"
                >
                  🎤 CLICK TO SPEAK
                </button>
              </div>

              {/* Floating Holographic Decors */}
              <div 
                className="absolute -left-8 top-1/4 z-20 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[8px] tracking-wider animate-float pointer-events-none"
                style={{ animationDuration: '5s' }}
              >
                <span className="block font-bold">🎯 COGNITIVE_FLOW: ON</span>
                <span>FIDELITY: 99.8%</span>
              </div>

              <div 
                className="absolute -right-4 bottom-1/4 z-20 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[8px] tracking-wider animate-float pointer-events-none"
                style={{ animationDuration: '7s', animationDelay: '1.5s' }}
              >
                <span className="block font-bold">🎙️ VOICE: NEURAL_BOY</span>
                <span>LATENCY: 12ms</span>
              </div>

              <div className="w-full aspect-[4/5] max-w-[310px] md:max-w-none">
                <AvatarCanvas isSpeaking={isWelcoming} isListening={false} emotion={isWelcoming ? 'speaking' : 'idle'} />
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      {/* 2. SCROLLABLE FOOTER: PREPARATION MODULES SECTION */}
      {/* This section rises from below the fold as the user scrolls past the sticky viewport (last 100vh) */}
      <div className="relative z-20 w-full bg-[#05060b] border-t border-white/5 py-24 px-4 md:px-8 shadow-2xl">
        <div className="max-w-7xl w-full mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold font-cyber text-white tracking-wide uppercase">
            PREPARATION MODULE NODES
          </h2>
          <p className="text-gray-400 text-xs mt-2 max-w-lg mx-auto font-mono">
            Access our specialized nodes loaded directly into the cockpit.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            
            {/* Card 1: Mock Interviews */}
            <div 
              onClick={() => onNavigate('interview')}
              className="glass-panel glass-panel-hover p-6 rounded-2xl text-left cursor-pointer flex flex-col justify-between group h-[200px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all">
                  <Terminal size={20} />
                </div>
                <h3 className="text-base font-cyber font-semibold text-white mt-4 group-hover:text-purple-300 transition-colors">Mock Interview System</h3>
                <p className="text-gray-400 text-xs mt-2 line-clamp-2">Real-time voice simulated interview with live coding editor, system design whiteboards, and immediate report analytics.</p>
              </div>
              <div className="flex items-center gap-1 text-purple-400 text-xs font-mono mt-4">
                Access Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Resume Analyzer */}
            <div 
              onClick={() => onNavigate('resume')}
              className="glass-panel glass-panel-hover p-6 rounded-2xl text-left cursor-pointer flex flex-col justify-between group h-[200px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:bg-pink-500/20 group-hover:text-pink-300 transition-all">
                  <FileText size={20} />
                </div>
                <h3 className="text-base font-cyber font-semibold text-white mt-4 group-hover:text-pink-300 transition-colors">ATS Resume Analyzer</h3>
                <p className="text-gray-400 text-xs mt-2 line-clamp-2">Upload PDF resumes to extract structural score matches, keyword density breakdowns, and generative bullet rewrites.</p>
              </div>
              <div className="flex items-center gap-1 text-pink-400 text-xs font-mono mt-4">
                Access Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Mock Test Engine */}
            <div 
              onClick={() => onNavigate('tests')}
              className="glass-panel glass-panel-hover p-6 rounded-2xl text-left cursor-pointer flex flex-col justify-between group h-[200px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-all">
                  <Cpu size={20} />
                </div>
                <h3 className="text-base font-cyber font-semibold text-white mt-4 group-hover:text-cyan-300 transition-colors">Mock Test Engine</h3>
                <p className="text-gray-400 text-xs mt-2 line-clamp-2">Solve timed multiple choice questions and coding problems across Aptitude, DBMS, OS, Data Science, and Python.</p>
              </div>
              <div className="flex items-center gap-1 text-cyan-400 text-xs font-mono mt-4">
                Access Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Study Center */}
            <div 
              onClick={() => onNavigate('study')}
              className="glass-panel glass-panel-hover p-6 rounded-2xl text-left cursor-pointer flex flex-col justify-between group h-[200px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-all">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-base font-cyber font-semibold text-white mt-4 group-hover:text-emerald-300 transition-colors">CS & Language Syllabus</h3>
                <p className="text-gray-400 text-xs mt-2 line-clamp-2">Study Operating Systems, DBMS, Machine Learning, and programming languages. Review interactive flashcards and course paths.</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono mt-4">
                Access Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: AI Chat Mentor */}
            <div 
              onClick={() => onNavigate('mentor')}
              className="glass-panel glass-panel-hover p-6 rounded-2xl text-left cursor-pointer flex flex-col justify-between group h-[200px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500/20 group-hover:text-yellow-300 transition-all">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-base font-cyber font-semibold text-white mt-4 group-hover:text-yellow-300 transition-colors">AI Chat Mentor</h3>
                <p className="text-gray-400 text-xs mt-2 line-clamp-2">Ask coding questions, request roadmap ideas, upload code files to debug, or have simulated voice Q&A.</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-400 text-xs font-mono mt-4">
                Access Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: Dashboard */}
            <div 
              onClick={() => onNavigate('dashboard')}
              className="glass-panel glass-panel-hover p-6 rounded-2xl text-left cursor-pointer flex flex-col justify-between group h-[200px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-all">
                  <Compass size={20} />
                </div>
                <h3 className="text-base font-cyber font-semibold text-white mt-4 group-hover:text-amber-300 transition-colors">Analytics Dashboard</h3>
                <p className="text-gray-400 text-xs mt-2 line-clamp-2">Monitor your progress, review interview histories, track study streaks, unlock gamification badges, and see your readiness.</p>
              </div>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-mono mt-4">
                Access Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
