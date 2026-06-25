import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, Cpu, Sparkles, RefreshCw } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  content: string;
}

export const AIChatbot: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I'm ThreadCounty AI — your textile analysis expert powered by Gemini. Ask me about fabric structure, thread counts, weave types, or your account! 🧵",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [geminiPowered, setGeminiPowered] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build conversation history for context (last 8 exchanges)
  const buildHistory = (msgs: Message[]): ChatHistoryItem[] => {
    return msgs
      .slice(-16) // last 8 exchanges = 16 messages
      .filter(m => m.sender !== 'ai' || msgs.indexOf(m) > 0) // skip initial greeting
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));
  };

  // Check if chatbot is enabled via feature flags
  useEffect(() => {
    fetch(`${API_URL.replace('/api', '')}/api/admin/settings/public`)
      .then(res => res.json())
      .then(data => {
        if (data?.featureFlags?.aiChatbot !== false) {
          setEnabled(true);
        }
      })
      .catch(() => {
        setEnabled(true); // default to enabled if server unreachable
      });
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || typing) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setTyping(true);

    try {
      const history = buildHistory(messages); // use pre-update messages for history

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history
        })
      });

      if (!res.ok) throw new Error('Chat service unavailable');

      const data = await res.json();
      const replyText = data.reply || "I'm sorry, I couldn't process that request. Please try again.";
      
      if (data.source === 'gemini') setGeminiPowered(true);

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: replyText,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please make sure the backend server is running, then try again.",
        timestamp: new Date()
      }]);
    } finally {
      setTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      sender: 'ai',
      text: "Conversation reset! How can I help you with fabric analysis today? 🧵",
      timestamp: new Date()
    }]);
    setGeminiPowered(false);
  };

  // Voice Input
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const speech = event.results[0][0].transcript;
      setInput(speech);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  if (!enabled) return null;

  const quickPrompts = [
    'How does thread density work?',
    'What weave types do you detect?',
    'How do I get the best image?',
  ];

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
        <div className="w-80 sm:w-96 h-[520px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950" style={{ animation: 'slideUp 0.25s ease-out' }}>
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-center shadow-md flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/15 rounded-lg">
                <Cpu className="h-4 w-4 text-indigo-200" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                  ThreadCounty AI
                  <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                </h4>
                <span className="text-[10px] text-indigo-200 flex items-center gap-1">
                  {geminiPowered ? (
                    <><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span> Gemini Powered</>
                  ) : (
                    'Textile Expert System'
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
                title="Reset conversation"
                aria-label="Reset chat"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <Cpu className="h-3 w-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className={`text-[9px] block mt-1 text-right ${m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Cpu className="h-3 w-3 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 rounded-2xl rounded-bl-none px-3.5 py-3 shadow-sm">
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

          {/* Quick Prompts — shown only when few messages */}
          {messages.length <= 2 && !typing && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-white dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 pt-2 flex-shrink-0">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200/50 dark:border-indigo-800/50 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 flex gap-2 flex-shrink-0"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask about fabric, threads, plans…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={typing}
                maxLength={400}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={startSpeechRecognition}
                disabled={typing}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors disabled:opacity-40 ${
                  isListening
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 animate-pulse'
                    : 'text-slate-400 hover:text-indigo-500'
                }`}
                title="Voice Input"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AIChatbot;
