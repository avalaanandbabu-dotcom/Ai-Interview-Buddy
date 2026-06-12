import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { InterviewWorkspace } from './components/InterviewWorkspace';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { MockTestEngine } from './components/MockTestEngine';
import { StudyCenter } from './components/StudyCenter';
import { ChatMentor } from './components/ChatMentor';
import { InteractiveParticles } from './components/InteractiveParticles';
import { getGeminiApiKey, setGeminiApiKey, askGemini } from './utils/gemini';

export default function App() {
  const [view, setView] = useState('landing');
  const [apiKeySettingsOpen, setApiKeySettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(getGeminiApiKey());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferredVoice, setPreferredVoice] = useState(localStorage.getItem('preferred_voice_name') || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  // Load available system voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Decide if we should render sidebar layout
  const isLanding = view === 'landing';

  const handleSaveKey = () => {
    setGeminiApiKey(tempApiKey);
    localStorage.setItem('preferred_voice_name', preferredVoice);
    alert("Settings saved successfully!");
  };

  const handleClearKey = () => {
    setTempApiKey('');
    setGeminiApiKey('');
    setPreferredVoice('');
    localStorage.removeItem('preferred_voice_name');
    alert("Settings cleared!");
  };

  const handleTestConnection = async () => {
    if (!tempApiKey.trim()) {
      setTestStatus('error');
      setTestError('API Key cannot be empty.');
      return;
    }
    setTestStatus('testing');
    setTestError('');
    try {
      const result = await askGemini([{ role: 'user', parts: [{ text: "Respond with only one word: OK" }] }], tempApiKey);
      if (result.toLowerCase().includes('ok')) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setTestError('Received unexpected response: ' + result);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err.message || 'Failed to connect to Gemini API.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05060b] text-[#f3f4f6] flex flex-col font-sans">
      {/* Interactive Particles Background */}
      <InteractiveParticles />

      {/* Top Navbar */}
      <Navbar 
        onNavigate={setView} 
        currentView={view} 
        onOpenSettings={() => {
          setTempApiKey(getGeminiApiKey());
          setApiKeySettingsOpen(true);
        }} 
      />

      <div className="flex flex-1 w-full relative">
        {/* Render Sidebar only if we are not on the landing page */}
        {!isLanding && <Sidebar onNavigate={setView} currentView={view} />}

        {/* Main Content viewport */}
        <main 
          className={`flex-1 w-full min-h-[calc(100vh-4rem)] relative transition-all duration-300 pb-20 lg:pb-6 ${
            isLanding ? 'pl-0' : 'pl-0 lg:pl-64'
          }`}
        >
          {view === 'landing' && <LandingPage onNavigate={setView} />}
          {view === 'dashboard' && <Dashboard onNavigate={setView} />}
          {view === 'interview' && <InterviewWorkspace onNavigate={setView} />}
          {view === 'resume' && <ResumeAnalyzer />}
          {view === 'tests' && <MockTestEngine onNavigate={setView} />}
          {view === 'study' && <StudyCenter />}
          {view === 'mentor' && <ChatMentor />}
        </main>
      </div>

      {/* API Key Configuration Modal Overlay */}
      {apiKeySettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border-white/10 text-left flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-cyber font-bold text-white uppercase tracking-wider">AI Configuration Panel</h3>
              <button 
                onClick={() => {
                  setApiKeySettingsOpen(false);
                  setTestStatus('idle');
                  setTestError('');
                }}
                className="text-gray-400 hover:text-white font-mono text-[10px]"
              >
                [CLOSE]
              </button>
            </div>

            {/* API Key Section */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono text-gray-400 uppercase">Gemini API Key</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-purple-500 transition-all font-mono"
              />
              <span className="text-[9px] font-mono text-gray-500 mt-1 leading-normal">
                Your key is stored strictly locally in your browser's local storage and is never uploaded anywhere except to the official Google Gemini endpoints.
              </span>
            </div>

            {/* Voice Settings Section */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono text-gray-400 uppercase">Select AI Voice</label>
              <div className="flex gap-2">
                <select
                  value={preferredVoice}
                  onChange={(e) => setPreferredVoice(e.target.value)}
                  className="flex-1 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
                >
                  <option value="">Default (Auto-Selected Male Voice)</option>
                  {voices.map((v, i) => (
                    <option key={i} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
                    window.speechSynthesis.cancel();
                    const utter = new SpeechSynthesisUtterance("Hello! I am your AI Interview Buddy. How does this sound?");
                    const selected = voices.find(v => v.name === preferredVoice);
                    if (selected) {
                      utter.voice = selected;
                      utter.pitch = 1.08;
                      utter.rate = 1.05;
                    } else {
                      utter.pitch = 1.08;
                      utter.rate = 1.05;
                    }
                    window.speechSynthesis.speak(utter);
                  }}
                  className="px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-mono text-xs transition-all"
                >
                  PLAY DEMO
                </button>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={handleSaveKey}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold transition-all"
              >
                SAVE SETTINGS
              </button>
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-mono text-xs transition-all disabled:opacity-50"
              >
                {testStatus === 'testing' ? 'TESTING...' : 'TEST KEY'}
              </button>
              <button
                onClick={handleClearKey}
                className="py-2.5 px-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-mono text-xs transition-all"
                title="Clear Settings"
              >
                CLEAR
              </button>
            </div>

            {/* Test Status Indicator */}
            {testStatus === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                ✓ Connection Successful! Gemini API is active.
              </div>
            )}
            {testStatus === 'error' && (
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-mono break-words leading-relaxed">
                ✗ Connection Failed: {testError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
