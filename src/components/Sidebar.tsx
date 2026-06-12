import React from 'react';
import { Home, Compass, Play, FileText, Cpu, BookOpen, MessageSquare } from 'lucide-react';

interface SidebarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Sidebar({ onNavigate, currentView }: SidebarProps) {
  const menuItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'interview', label: 'Interviews', icon: Play },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText },
    { id: 'tests', label: 'Mock Tests', icon: Cpu },
    { id: 'study', label: 'Study Center', icon: BookOpen },
    { id: 'mentor', label: 'Chat Mentor', icon: MessageSquare }
  ];

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 bg-[#06070d]/40 backdrop-blur-md border-r border-white/5 p-4 flex-col gap-2 z-40 text-left">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-3.5 mb-2 block mt-2">PREPARATION NODES</span>
        <nav className="flex flex-col gap-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-mono text-xs transition-all relative ${
                  isActive
                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-md shadow-purple-500/5'
                    : 'bg-transparent border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-purple-400' : 'text-gray-400'} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#06070d]/90 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-40 px-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${
                isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={18} />
              <span className="text-[8px] font-mono mt-1 font-semibold">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
