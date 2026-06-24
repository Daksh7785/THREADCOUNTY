import { API } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, Cpu, Sparkles } from 'lucide-react';



interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const AIChatbot: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your ThreadCounty AI Assistant. How can I help you with fabric analysis or account management today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [typing, setTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if chatbot is enabled via feature flags
  useEffect(() => {
    fetch(`${API}/api/admin/settings/public`)
      .then(res => res.json())
      .then(data => {
        if (data?.featureFlags?.aiChatbot) {
          setEnabled(true);
        }
      })
      .catch(() => {
        // Fallback to enabled in dev if server fails
        setEnabled(true);
      });
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI thinking and replying (take 1 second)
    setTimeout(() => {
      let replyText = "I'm not sure about that. As an AI textile assistant, I can help you with fabric density, thread counting (TPI), weave classifications, or upgrading your account. Could you please rephrase?";
      const lower = textToSend.toLowerCase();

      if (lower.includes('tpi') || lower.includes('density') || lower.includes('count')) {
        replyText = "ThreadCounty uses advanced Computer Vision to detect individual yarn crossings. The total density is calculated as Warp Threads/Inch plus Weft Threads/Inch. You can upload any JPEG or PNG to get started.";
      } else if (lower.includes('weave') || lower.includes('pattern') || lower.includes('twill') || lower.includes('plain')) {
        replyText = "Our models classify structures into major weave types: Plain Weave (1:1 interlacing), Twill/Denim Weave (diagonal pattern), Satin Weave (long floats), and Basket/Canvas Weave (2x2 structure). Check the Compare tab to contrast two swatches side-by-side!";
      } else if (lower.includes('price') || lower.includes('plan') || lower.includes('pricing') || lower.includes('upgrade') || lower.includes('subscribe')) {
        replyText = "We offer four subscription tiers: Free (3 uploads), Student ($15/mo), Professional ($49/mo), and Enterprise ($149/mo). Upgrades can be purchased on the 'Pricing Plans' page, featuring mock payment gateway integration.";
      } else if (lower.includes('download') || lower.includes('pdf') || lower.includes('export')) {
        replyText = "Once analysis finishes, you can download a full report in JSON or HTML/Print-friendly format by clicking the 'Download' action from either the History panel or the detailed report page.";
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        replyText = "Hello! Hope your textile engineering workspace is running smoothly today. What fabric are we analyzing?";
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: replyText,
        timestamp: new Date()
      }]);
      setTyping(false);
    }, 1000);
  };

  // Voice Search / Voice Input Integration
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all duration-300 group"
          aria-label="Open AI assistant"
        >
          <MessageSquare className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1.5 -right-1 bg-rose-500 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce">AI</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Cpu className="h-4 w-4 text-indigo-200" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm flex items-center gap-1">
                  ThreadCounty Bot
                  <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                </h4>
                <span className="text-[10px] text-indigo-200">Textile Expert System</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`text-[9px] block mt-1 text-right ${m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-2xl rounded-bl-none px-3.5 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input controls */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask about fabric structure, plan limits…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={startSpeechRecognition}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                  isListening
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 animate-pulse'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Voice Input"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
