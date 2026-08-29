"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

export default function AIHelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hi! I am the Annapurna AI Assistant. How can I help you navigate the cold-chain platform today?' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newHistory = [...messages, { role: "user", content: userMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/help-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });
      const data = await res.json();
      
      setMessages([...newHistory, { role: "assistant", content: data.response }]);
    } catch (error) {
      setMessages([...newHistory, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div 
          className="flex flex-col w-[300px] h-[450px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out origin-bottom-right bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50">
            <h3 className="font-semibold text-sm">Annapurna AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-sm' 
                      : 'bg-black/5 dark:bg-white/10 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black/5 dark:bg-white/10 rounded-2xl rounded-bl-sm px-4 py-2">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-black/5 dark:bg-white/10 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 hover:scale-105 transition-all duration-300 relative group"
        >
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
