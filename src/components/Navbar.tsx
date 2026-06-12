import React from 'react';
import { Trophy, Key } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenSettings: () => void;
}

export function Navbar({ onNavigate, currentView, onOpenSettings }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#06070d]/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-8">
      {/* Logo */}
      <div 
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black font-cyber text-sm tracking-tighter shadow-md shadow-purple-500/20">
          IB
        </div>
        <span className="font-cyber font-black text-sm tracking-widest text-white group-hover:text-purple-300 transition-colors">
          INTERVIEW<span className="text-purple-400">BUDDY</span><span className="text-[10px] text-pink-500 ml-0.5">PRO</span>
        </span>
      </div>

      {/* Right side stats */}
      <div className="flex items-center gap-4">
        {/* XP stats pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[10px]">
          <Trophy size={12} className="text-yellow-400 animate-pulse" />
          <span>Level 4</span>
          <span className="w-1 h-1 rounded-full bg-purple-500" />
          <span>720 / 1000 XP</span>
        </div>

        {/* User Profile avatar simulator */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 cursor-pointer transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-[10px] font-mono font-bold">
            AN
          </div>
          <span className="hidden md:inline text-[11px] font-mono text-gray-300">Anand Kumar</span>
        </div>

        {/* API Settings */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          title="Gemini API Key Settings"
        >
          <Key size={14} />
        </button>
      </div>
    </header>
  );
}
