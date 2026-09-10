"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";

const QUICK_PROMPTS = [
  "📊 Today's mandi prices",
  "🌾 How to list produce?",
  "📦 Track my order",
  "💰 Government schemes",
];

export default function AIHelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hi! I'm your Annapurna Assistant 🌾\nAsk me about mandi prices, listing produce, or tracking orders!" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput("");
    const newHistory = [...messages, { role: "user", content: text.trim() }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/help-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history: messages }),
      });
      const data = await res.json();
      setMessages([...newHistory, { role: "assistant", content: data.response || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      let rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (rendered.startsWith("- ") || rendered.startsWith("• ")) {
        return <div key={i} className="flex gap-2 ml-1"><span>•</span><span dangerouslySetInnerHTML={{ __html: rendered.slice(2) }} /></div>;
      }
      if (rendered.trim() === "") return <div key={i} className="h-2" />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex flex-col w-[360px] h-[520px] rounded-[28px] overflow-hidden shadow-2xl transition-all duration-300 ease-in-out origin-bottom-right bg-[var(--bg-primary)] backdrop-blur-2xl border border-[var(--separator)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--separator)] bg-[var(--fill-secondary)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34C759] to-[#30D158] flex items-center justify-center shadow-md">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Annapurna AI</h3>
                <p className="text-[10px] text-[#34C759] font-semibold">● Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-[var(--fill-secondary)] transition-colors text-[var(--text-tertiary)]">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#007AFF] text-white rounded-br-md"
                      : "bg-[var(--fill-secondary)] text-[var(--text-primary)] rounded-bl-md border border-[var(--separator)]"
                  }`}
                >
                  {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[20px] rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#34C759]" />
                  <span className="text-xs text-[var(--text-tertiary)]">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-1.5 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] text-[10px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-[var(--separator)] bg-[var(--fill-secondary)] flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-[var(--bg-primary)] border border-[var(--separator)] rounded-full px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[#34C759]/50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-[#34C759] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2DB84E] transition-colors shadow-md"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#34C759] to-[#30D158] text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 relative group"
        >
          <div className="absolute inset-0 rounded-full bg-[#34C759] animate-ping opacity-20" />
          <MessageSquare size={22} />
        </button>
      )}
    </div>
  );
}
