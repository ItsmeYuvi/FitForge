'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Cpu, Send, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-white bg-white/5 px-1.5 py-0.5 rounded border border-white/5 mx-0.5">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const italicParts = part.split(/(\*.*?\*)/g);
    if (italicParts.length > 1) {
      return (
        <span key={idx}>
          {italicParts.map((ip, iidx) => {
            if (ip.startsWith('*') && ip.endsWith('*')) {
              return <em key={iidx} className="text-gray-400 italic">{ip.slice(1, -1)}</em>;
            }
            return ip;
          })}
        </span>
      );
    }
    return part;
  });
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      const headerText = trimmed.replace(/^### /, '').trim().replace(/^\*\*|\*\*$/g, '');
      return (
        <h3 key={lineIdx} className="text-xs font-bold text-neon-green tracking-wide mt-4 mb-2 uppercase font-mono">
          {parseInlineMarkdown(headerText)}
        </h3>
      );
    }
    if (trimmed.startsWith('## ')) {
      const headerText = trimmed.replace(/^## /, '').trim().replace(/^\*\*|\*\*$/g, '');
      return (
        <h2 key={lineIdx} className="text-sm font-bold text-cyber-blue mt-5 mb-3 uppercase font-mono">
          {parseInlineMarkdown(headerText)}
        </h2>
      );
    }
    if (trimmed.startsWith('# ')) {
      const headerText = trimmed.replace(/^# /, '').trim().replace(/^\*\*|\*\*$/g, '');
      return (
        <h1 key={lineIdx} className="text-base font-black text-white mt-6 mb-3 uppercase font-display">
          {parseInlineMarkdown(headerText)}
        </h1>
      );
    }

    if (trimmed.startsWith('- ')) {
      const bulletText = trimmed.replace(/^-\s+/, '');
      const isNested = line.indexOf('-') > 2;
      return (
        <div key={lineIdx} className={`flex gap-2 items-start my-1 ${isNested ? 'ml-8' : 'ml-4'}`}>
          <span className="text-neon-green mt-1 text-[8px]">•</span>
          <span className="flex-1 text-gray-300">{parseInlineMarkdown(bulletText)}</span>
        </div>
      );
    }

    const numListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numListMatch) {
      const num = numListMatch[1];
      const listText = numListMatch[2];
      return (
        <div key={lineIdx} className="flex gap-2 items-start ml-2 my-1.5">
          <span className="font-mono text-cyber-blue text-[10px] font-bold">{num}.</span>
          <span className="flex-1 text-gray-300">{parseInlineMarkdown(listText)}</span>
        </div>
      );
    }

    if (trimmed === '') {
      return <div key={lineIdx} className="h-2" />;
    }

    return (
      <p key={lineIdx} className="my-1 leading-relaxed text-gray-300">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}

export default function CoachDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [computing, setComputing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`https://fitforge-production-0c79.up.railway.app/api/coach/history/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, computing]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || computing) return;

    const userMsg = input.trim();
    setInput('');
    setComputing(true);

    // Append user message immediately
    const tempUserMsg: ChatMessage = {
      role: 'user',
      content: userMsg,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('https://fitforge-production-0c79.up.railway.app/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          message: userMsg
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.history || []);
      }
    } catch (err) {
      console.error('Chat routing failure:', err);
    } finally {
      setComputing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] font-mono text-xs text-cyber-blue gap-3">
        <Cpu className="w-5 h-5 animate-spin" />
        <span>ESTABLISHING NEURAL SYNAPSE CONNECTION...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-[82vh] max-h-[82vh]">
      
      {/* 1. Chat Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-neon-green animate-pulse" />
          <div>
            <span className="text-[9px] font-mono text-cyber-blue tracking-widest block uppercase">
              SECTION 05 // AI COACH CHAT
            </span>
            <h2 className="text-xl font-display font-black text-white tracking-tight leading-none mt-1">
              Neural Coach OS
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-neon-green/10 border border-neon-green/20 px-3 py-1.5 rounded-lg font-mono text-[9px] text-neon-green">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CONNECTED TO CLERK INDEX</span>
        </div>
      </div>

      {/* 2. Messages Box */}
      <div className="flex-1 glass-panel rounded-2xl border border-white/5 p-6 overflow-y-auto flex flex-col gap-4 relative">
        <div className="absolute inset-0 cyber-grid opacity-[0.015] pointer-events-none z-0" />
        
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 z-10 max-w-sm mx-auto">
            <MessageSquare className="w-8 h-8 text-gray-500 animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">SECURE COACH CONVERSATION</h3>
            <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
              Ask me for exercise swaps, biomechanical safety guidelines, or target calorie adjustments. I have direct access to your profile parameters and historical workout metrics.
            </p>
          </div>
        )}

        {/* Message list mapping */}
        <div className="flex flex-col gap-4 z-10">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${
                  isUser ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                {/* Header label */}
                <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block mb-1">
                  {isUser ? 'USER PILOT' : 'FITFORGE AI'} // {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-xl border leading-relaxed text-xs font-light text-gray-100 ${
                    isUser 
                      ? 'bg-cyber-blue/10 border-cyber-blue/30 rounded-tr-none' 
                      : 'glass-panel border-white/5 rounded-tl-none'
                  }`}
                  style={isUser ? { whiteSpace: 'pre-wrap' } : undefined}
                >
                  {isUser ? msg.content : renderMarkdown(msg.content)}
                </div>
              </div>
            );
          })}

          {/* Computing Loading indicator */}
          {computing && (
            <div className="self-start flex flex-col items-start max-w-[80%]">
              <span className="font-mono text-[8px] text-neon-green uppercase tracking-widest block mb-1 animate-pulse">
                FITFORGE AI // SYNAPSE COMPUTING...
              </span>
              <div className="bg-neon-green/5 border border-neon-green/20 p-4 rounded-xl rounded-tl-none font-mono text-[9px] text-neon-green animate-pulse">
                [SYNAPSE COMPILING DIETARY AND KINETIC DATABASES...]
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-3 shrink-0 font-mono text-xs z-10 pointer-events-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={computing}
          placeholder="Ask AI Coach: Swap squats for knee issues, review my macros, or check my workout stats..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cyber-blue focus:outline-none placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={computing || !input.trim()}
          data-cursor-text="SEND"
          className="px-6 py-4 bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold uppercase rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>TRANSMIT</span>
        </button>
      </form>

    </div>
  );
}
