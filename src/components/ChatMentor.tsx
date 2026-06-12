import React, { useState, useEffect, useRef } from 'react';
import { CHAT_MENTOR_PRESETS } from '../data/mockData';
import { useSpeech } from '../hooks/useSpeech';
import { MessageSquare, Send, Mic, MicOff, Play, Award, Sparkles, HelpCircle, CornerDownLeft, RefreshCw } from 'lucide-react';
import { getGeminiApiKey, askGemini, formatChatHistory } from '../utils/gemini';

export function ChatMentor() {
  const [messages, setMessages] = useState<{ sender: 'mentor' | 'user'; text: string; time: string }[]>([
    {
      sender: 'mentor',
      text: "Hello Candidate Anand! I am your AI Chat Mentor. Ask me any conceptual question, request custom study roadmaps, or paste some code to debug. How can I help you excel today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Speech API
  const { isListening, listen, stopListening, speak, cancelSpeech } = useSpeech();

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSendMessage = async (text: string) => {
    if (text.trim() === '') return;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...messages, { sender: 'user' as const, text, time: timestamp }];
    
    setMessages(newMessages);
    setInputValue('');
    setTyping(true);

    const apiKey = getGeminiApiKey();

    if (apiKey) {
      try {
        const geminiHistory = formatChatHistory(newMessages);
        const sysInstruction = "You are a professional, helpful computer science and programming interview mentor. Provide clear roadmaps, conceptual debugging advice, system design guides, and resume improvement tips. Feel free to use clean markdown blocks, bullet points, and code formatting where necessary.";
        
        const responseText = await askGemini(geminiHistory, apiKey, sysInstruction);
        setMessages(prev => [...prev, { sender: 'mentor', text: responseText, time: timestamp }]);
        speakMessage(responseText);
      } catch (err) {
        console.error("Gemini Chat failed, falling back to mock generator:", err);
        triggerMockResponse(text, timestamp);
      } finally {
        setTyping(false);
      }
    } else {
      triggerMockResponse(text, timestamp);
    }
  };

  const triggerMockResponse = (text: string, timestamp: string) => {
    setTimeout(() => {
      setTyping(false);
      let mentorResponse = "";

      if (text.toLowerCase().includes('dijkstra')) {
        mentorResponse = `Dijkstra's Algorithm finds the shortest path from a source node to all other nodes in a weighted graph.

### Core Steps:
1. Initialize distances to all vertices as infinite, and source as 0.
2. Insert source into a Min-Priority Queue.
3. While queue is not empty:
   - Extract vertex u with minimum distance.
   - For each neighbor v of u, if dist[u] + weight(u,v) < dist[v], update dist[v] and push to queue.

### Code Implementation (Python):
\`\`\`python
import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    
    while pq:
        current_dist, current_node = heapq.heappop(pq)
        
        if current_dist > distances[current_node]:
            continue
            
        for neighbor, weight in graph[current_node].items():
            distance = current_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
                
    return distances
\`\`\`

### Time Complexity:
**O((V + E) log V)** where V is vertices and E is edges.`;
      } else if (text.toLowerCase().includes('shortener') || text.toLowerCase().includes('design')) {
        mentorResponse = `Designing a highly scalable URL Shortener like Bitly requires addressing storage and redirect speeds:

### 1. Requirements & Scales:
- Read/Write ratio: 100:1 (Heavy reads).
- Redirects must be sub-50ms.

### 2. High-Level Architecture:
- Client sends long URL => API Gateway checks rate limits => Write Service base62 encodes unique ID => Database maps short-hash to long URL.
- Client hits short URL => Cache (Redis) lookup => if miss, Database (PostgreSQL/NoSQL) lookup => HTTP 301 Redirect.

### 3. Database Choice:
- SQL (PostgreSQL) is ideal for relational mapping, but NoSQL (MongoDB or Cassandra) handles write scales easily.

### 4. Cache Strategy:
- Cache 20% of daily active URLs (Pareto Principle) in memory (Redis) using Least Recently Used (LRU) eviction.`;
      } else if (text.toLowerCase().includes('ats') || text.toLowerCase().includes('resume')) {
        mentorResponse = `To optimize your resume for modern Applicant Tracking Systems (ATS), follow these rules:

### 1. Key Guidelines:
- **Format**: Use clean single-column layouts. Avoid complex floating tables, logos, or circular skill percentage graphs.
- **Keywords**: Match terminology from the target job description.
- **Action Verbs**: Start each bullet point with a strong action verb.
- **Metrics**: Quantify achievements (e.g. "Optimized API speed by 42%").`;
      } else {
        mentorResponse = `That is an interesting question! To succeed in this area:
        
1. Deep-dive into data structures and algorithm corner cases.
2. Frame your explanations using the STAR method (Situation, Task, Action, Result) during behavioural evaluations.
3. Do you want me to write code snippets or explain this in greater system-design depth?`;
      }

      setMessages(prev => [...prev, { sender: 'mentor', text: mentorResponse, time: timestamp }]);
      speakMessage(mentorResponse);
    }, 1200);
  };

  const handleSpeechInput = () => {
    if (isListening) {
      stopListening();
    } else {
      listen((text) => {
        setInputValue(prev => prev + text);
      });
    }
  };

  const speakMessage = (text: string) => {
    // strip markdown for speech synthesis
    const cleanText = text.replace(/[#*`_\[\]()]/g, '');
    speak(cleanText);
  };

  return (
    <div className="max-w-7xl w-full mx-auto pt-24 pb-16 px-4 md:px-8 z-10 relative flex flex-col text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-cyber text-white uppercase tracking-wider">
          AI CHAT MENTOR
        </h1>
        <p className="text-gray-400 text-xs font-mono mt-1">
          Node: MENTOR_ALPHABET_9 // Conceptual tutoring, codebase reviews, and career counseling
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-[550px] md:h-[600px]">
        {/* Left Column: Preset Questions */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-1">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">SUGGESTED QUERIES</span>
          {CHAT_MENTOR_PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(preset.text)}
              className="p-4 rounded-xl border text-left bg-black/20 border-white/5 text-gray-400 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all flex flex-col gap-1.5"
            >
              <span className="text-xs font-cyber font-semibold text-white group-hover:text-purple-300">{preset.label}</span>
              <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{preset.text}</p>
            </button>
          ))}
        </div>

        {/* Right Column: Chat Box */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border-white/5 flex flex-col h-full overflow-hidden justify-between">
          {/* Header */}
          <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-purple-400" />
              <span className="text-xs font-mono text-white">SECURE MENTOR STREAM</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          {/* Messages Display */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-black/20 relative">
            {!getGeminiApiKey() && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-20">
                <div className="max-w-xs flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <h3 className="text-sm font-cyber font-bold text-white uppercase tracking-wider">Gemini API Key Required</h3>
                  <p className="text-[10px] font-mono text-gray-400 leading-normal">
                    This AI bot works strictly with your Gemini API Key to run real technical tutoring sessions. Please configure your key in the API Configuration Panel (click the Key icon in the top navbar).
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed text-left whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-500/10'
                      : 'bg-[#10121c] border border-white/5 text-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  
                  {/* Speech synthesis speak icon for AI responses */}
                  {msg.sender === 'mentor' && (
                    <button
                      onClick={() => speakMessage(msg.text)}
                      className="mt-3.5 flex items-center gap-1 text-[9px] font-mono text-purple-400 hover:text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded bg-purple-500/5"
                    >
                      <Play size={10} fill="currentColor" /> SPEAK RESPONSE
                    </button>
                  )}
                </div>
                <span className="text-[9px] font-mono text-gray-600 mt-1">{msg.time}</span>
              </div>
            ))}
 
            {typing && (
              <div className="flex items-center gap-1.5 mr-auto bg-[#10121c] border border-white/5 p-3.5 rounded-2xl rounded-bl-none text-gray-400 text-xs">
                <RefreshCw size={12} className="animate-spin text-purple-400" />
                <span>Mentor is generating guidelines...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
 
          {/* Input Bar */}
          <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2 items-center">
            <button
              onClick={handleSpeechInput}
              disabled={!getGeminiApiKey()}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-pink-500/20 border-pink-500 text-pink-400 animate-pulse'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
              title="Speak message"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
 
            <input
              type="text"
              disabled={!getGeminiApiKey()}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              placeholder={getGeminiApiKey() ? "Ask anything... (e.g. 'Explain binary search trees')" : "API Key Required"}
              className="flex-1 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
            />
 
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!getGeminiApiKey() || inputValue.trim() === ''}
              className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
