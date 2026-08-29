"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NegotiationMessage {
  agent: string;
  message: string;
}

export default function NegotiationPit() {
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [finalPenalty, setFinalPenalty] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentIndex]);

  const startNegotiation = async () => {
    setIsNegotiating(true);
    setMessages([]);
    setFinalPenalty(null);
    setError(null);
    setCurrentIndex(-1);

    try {
      const res = await fetch('/api/negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: '15% rot detected in shipment TRK-007' })
      });
      
      if (!res.ok) throw new Error('Failed to fetch negotiation data');
      
      const data = await res.json();
      
      // Live typing animation
      const negotiation = data.negotiation;
      let i = 0;
      setMessages(negotiation);
      
      const interval = setInterval(() => {
        setCurrentIndex(i);
        i++;
        if (i >= negotiation.length) {
          clearInterval(interval);
          setTimeout(() => {
            setFinalPenalty(data.finalPenaltyPercentage);
            setIsNegotiating(false);
          }, 1000);
        }
      }, 2000); // 2 second delay between messages for readability
      
    } catch (err: any) {
      setError(err.message);
      setIsNegotiating(false);
    }
  };

  return (
    <div className="mt-8 rounded-xl glass shadow-[0_0_40px_rgba(217,70,239,0.15)] overflow-hidden flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--separator)] flex items-center justify-between bg-white/5">
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent flex items-center gap-2 uppercase tracking-wider">
            <div className={`w-2 h-2 rounded-full ${isNegotiating ? 'bg-fuchsia-500 animate-pulse shadow-[0_0_10px_rgba(217,70,239,0.8)]' : 'bg-slate-600'}`} />
            Autonomous Trading Pit
          </h2>
          <p className="text-[var(--text-tertiary)] text-xs tracking-widest mt-1">Multi-Agent Negotiation Protocol</p>
        </div>
        <button 
          onClick={startNegotiation}
          disabled={isNegotiating}
          className="px-4 py-2 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isNegotiating ? (
            <>
              <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              Negotiating...
            </>
          ) : (
            'Trigger Negotiation'
          )}
        </button>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20"
      >
        {messages.length === 0 && !isNegotiating && !error && (
          <div className="h-full flex items-center justify-center text-[var(--text-tertiary)] text-sm font-mono opacity-50">
            Awaiting negotiation trigger...
          </div>
        )}
        
        {error && (
          <div className="text-red-400 text-sm font-mono p-4 bg-red-500/10 rounded-md border border-red-500/20">
            Error: {error}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => {
            if (idx > currentIndex) return null;
            
            const isBuyer = msg.agent === 'BuyerAgent';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${isBuyer ? 'items-start' : 'items-end'}`}
              >
                <div className={`text-xs font-mono mb-1.5 flex items-center gap-2 ${isBuyer ? 'text-cyan-400' : 'text-amber-400'}`}>
                  {isBuyer ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      BuyerAgent (Wholesaler)
                    </>
                  ) : (
                    <>
                      SellerAgent (Fleet)
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    </>
                  )}
                </div>
                <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl backdrop-blur-md shadow-lg border leading-relaxed
                  ${isBuyer 
                    ? 'bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500/20 text-cyan-900 dark:text-cyan-50 rounded-tl-sm' 
                    : 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/20 text-amber-900 dark:text-amber-50 rounded-tr-sm'
                  }`}
                >
                  {msg.message}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Typing indicator */}
        {isNegotiating && currentIndex < messages.length - 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex flex-col ${currentIndex % 2 === 0 ? 'items-end' : 'items-start'}`}
          >
             <div className="flex gap-1.5 p-4 rounded-2xl bg-white/5 border border-[var(--separator)] w-fit backdrop-blur-md">
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
             </div>
          </motion.div>
        )}
      </div>

      {/* Footer / Resolution */}
      <AnimatePresence>
        {finalPenalty !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-[var(--separator)] bg-emerald-950/30 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-emerald-400 font-semibold text-sm">Consensus Reached</div>
                <div className="text-[var(--text-tertiary)] text-xs">Smart contract automatically updated.</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[var(--text-tertiary)] text-xs uppercase tracking-widest mb-1">Final Penalty</div>
              <div className="text-2xl font-bold text-emerald-400">{finalPenalty}%</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
