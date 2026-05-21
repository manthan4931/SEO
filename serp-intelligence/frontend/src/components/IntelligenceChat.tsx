import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Zap,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { askRAG } from '../lib/api';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function IntelligenceChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **SERP Intelligence Agent**. I have access to all your scraped competitor data and keyword analysis. How can I help you optimize your strategy today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await askRAG(input);
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: result.response || "I'm sorry, I couldn't find a relevant answer in the data.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Error: Failed to connect to the intelligence engine.", 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-5xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-lg shadow-inner">
            <Bot className="w-5 h-5 text-on-secondary" />
          </div>
          <div>
            <h3 className="font-bold text-on-surface">Intelligence Chat</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">RAG Engine Connected</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_top_right,var(--color-surface-container-low),transparent)]"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
              msg.role === 'assistant' 
                ? "bg-secondary-container border-secondary text-on-secondary-container" 
                : "bg-surface-container-highest border-outline-variant text-on-surface-variant"
            )}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              msg.role === 'assistant' 
                ? "bg-white border border-outline-variant text-on-surface" 
                : "bg-primary text-on-primary rounded-tr-none"
            )}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <p className={cn(
                "text-[10px] mt-2 opacity-40 font-bold uppercase tracking-widest",
                msg.role === 'user' ? "text-right" : ""
              )}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-secondary-container border border-secondary text-on-secondary-container flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-outline-variant p-4 rounded-2xl flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant animate-pulse">Agent is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant">
        <div className="relative group">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about competitor gaps, content strategy, or keyword difficulty..."
            className="w-full bg-white border border-outline-variant rounded-xl pl-4 pr-14 py-4 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all resize-none shadow-inner min-h-[60px]"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-on-primary rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-help">
              <Zap className="w-3.5 h-3.5 text-secondary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Ultra Fast</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-help">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Data Secure</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
            Powered by RAG + Groq Llama 3
          </p>
        </div>
      </div>
    </div>
  );
}
