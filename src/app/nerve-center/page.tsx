"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NegotiationPit from './NegotiationPit';

const translateViaAPI = async (text: string, targetLanguage: string) => {
  if (targetLanguage === 'English') return text;
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage })
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch (err) {
    console.error(err);
    return text;
  }
};

const TranslatedText = ({ text, language }: { text: string, language: string }) => {
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const result = await translateViaAPI(text, language);
      if (isMounted) setTranslated(result);
    };
    translate();
    return () => { isMounted = false; };
  }, [text, language]);

  return <>{translated}</>;
};

const AgentControlCenter = () => {
  const [logs, setLogs] = useState<{ agent: string, message: string, type: string }[]>([]);
  const [liveLogs, setLiveLogs] = useState<{ agent: string, message: string, type: string }[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // New states for the requested features
  const [language, setLanguage] = useState('English');
  const [emails, setEmails] = useState<{ to: string, subject: string, body: string, time: string }[]>([]);

  const fetchScenario = async () => {
    setIsLoading(true);
    setLiveLogs([]);
    setLogIndex(0);
    setEmails([]);
    try {
      const res = await fetch('/api/nerve-center/feed');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScenario();
  }, []);

  useEffect(() => {
    if (logs.length > 0 && logIndex < logs.length) {
      const timer = setTimeout(() => {
        const newLog = logs[logIndex];
        setLiveLogs(prev => [...prev, newLog]);
        
        // Trigger Email if DecisionAgent or NotificationAgent takes action
        const messageLower = newLog.message.toLowerCase();
        if (
          newLog.agent === 'MatchmakingAgent' || newLog.agent === 'NotificationAgent' || newLog.type === 'action'
        ) {
          if (newLog.type === 'action' || messageLower.includes('reroute') || messageLower.includes('alert')) {
            const newEmail = {
              to: 'buyer.alerts@example.com',
              subject: `Automated Marketplace Alert: Action Required`,
              body: `Our autonomous marketplace monitoring system has detected an event: "${newLog.message}". A reroute or alternative action has been initiated to secure optimal farmer pricing.`,
              time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            setEmails(prev => [newEmail, ...prev]);
          }
        }

        setLogIndex(prev => prev + 1);
      }, Math.random() * 800 + 200);
      return () => clearTimeout(timer);
    }
  }, [logIndex, logs]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [liveLogs]);

  const getColor = (type: string, agent: string) => {
    if (type === 'warning') return 'text-yellow-600 dark:text-yellow-400';
    if (type === 'critical') return 'text-red-600 dark:text-red-500';
    if (type === 'success') return 'text-emerald-600 dark:text-emerald-400';
    if (type === 'action') return 'text-blue-600 dark:text-blue-400';
    if (type === 'system') return 'text-[var(--text-secondary)]';
    
    // Agent colors
    if (agent === 'MarketMonitorAgent') return 'text-cyan-600 dark:text-cyan-400';
    if (agent === 'MatchmakingAgent') return 'text-purple-600 dark:text-purple-400';
    if (agent === 'NotificationAgent') return 'text-amber-600 dark:text-amber-400';
    if (agent === 'MarketAgent') return 'text-fuchsia-600 dark:text-fuchsia-400';
    
    return 'text-[var(--text-primary)]';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono p-4 md:p-8 selection:bg-cyan-500/30 aura-container relative overflow-x-hidden pb-20">
      {/* Background Aura */}
      <div className="aura-orb aura-blue w-[70vw] h-[70vh] top-[-10%] left-[-10%]"></div>
      <div className="aura-orb aura-purple w-[50vw] h-[50vh] bottom-[-10%] right-[-10%]" style={{ animationDelay: '-5s' }}></div>
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--separator)] pb-6"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              Nerve Center
            </h1>
            <p className="text-[var(--text-tertiary)] mt-1 text-sm tracking-widest">Autonomous Marketplace Intelligence</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Language Toggle */}
            <div className="flex items-center gap-2 bg-white/5 border border-[var(--separator)] p-1 rounded-md backdrop-blur-md">
              {['English', 'Hindi', 'Japanese', 'Indonesian'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded transition-all duration-300 ${language === lang ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-[var(--text-tertiary)] hover:text-white'}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="px-4 py-2 rounded-md bg-white/5 border border-[var(--separator)] backdrop-blur-md">
              <span className="text-[var(--text-tertiary)]">SYSTEM STATUS</span>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2 mt-1">
                OPTIMAL <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse" />
              </div>
            </div>
            <div className="px-4 py-2 rounded-md bg-white/5 border border-[var(--separator)] backdrop-blur-md">
              <span className="text-[var(--text-tertiary)]">ACTIVE AGENTS</span>
              <div className="text-cyan-600 dark:text-cyan-400 font-semibold mt-1">1,024</div>
            </div>
          </div>
        </motion.header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Terminal View */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 relative h-[450px] rounded-xl glass shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col"
          >
            {/* Terminal Header */}
            <div className="h-10 bg-[var(--fill-secondary)]/90 border-b border-[var(--separator)] flex items-center px-4 justify-between backdrop-blur-md">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-red-500/80 transition-colors cursor-pointer" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-yellow-500/80 transition-colors cursor-pointer" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-green-500/80 transition-colors cursor-pointer" />
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={fetchScenario}
                  disabled={isLoading}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : '↻ Generate Scenario'}
                </button>
                <div className="text-xs text-cyan-600/50 dark:text-cyan-400/50 tracking-widest uppercase font-sans">Multi-Agent Feed</div>
              </div>
            </div>

            {/* Terminal Body */}
            <div 
              ref={scrollContainerRef}
              className="p-4 overflow-y-auto flex-1 font-mono text-sm space-y-3 custom-scrollbar"
            >
              <AnimatePresence initial={false}>
                {liveLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 leading-relaxed"
                  >
                    <span className="text-[var(--text-tertiary)] shrink-0 select-none">
                      {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[var(--text-primary)] select-none">{'>'}</span>
                    <span className={`${getColor('agent', log.agent)} font-semibold shrink-0`}>
                      [{log.agent}]
                    </span>
                    <span className={`${getColor(log.type, log.agent)}`}>
                      <TranslatedText text={log.message} language={language} />
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Blinking cursor */}
              <motion.div 
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-cyan-500 mt-2 ml-16"
              />
            </div>
            
            {/* Glowing bottom border effect */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </motion.div>

          {/* Right Sidebar - System Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-6 h-[450px]"
          >
            {/* Quick Metrics */}
            <div className="rounded-xl glass p-5 space-y-4">
              <h3 className="text-xs text-[var(--text-tertiary)] tracking-widest uppercase font-sans">Network Health</h3>
              
              <div className="space-y-4 font-sans">
                {[
                  { label: 'Neural Core Load', value: '34%', raw: 34, color: 'bg-cyan-400' },
                  { label: 'Memory Allocation', value: '18 GB', raw: 65, color: 'bg-purple-400' },
                  { label: 'Event Throughput', value: '1.2k /s', raw: 80, color: 'bg-emerald-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">{stat.label}</span>
                      <span className="text-[var(--text-primary)]">{stat.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--fill-tertiary)] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.raw}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + (i * 0.2), ease: "easeOut" }}
                        className={`h-full ${stat.color} shadow-[0_0_10px_currentColor]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Protocols */}
            <div className="rounded-xl glass p-5 flex-1 flex flex-col font-sans overflow-hidden">
              <h3 className="text-xs text-[var(--text-tertiary)] tracking-widest uppercase mb-4 shrink-0">Active Protocols</h3>
              
              <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse shrink-0" />
                  <span className="text-red-400 truncate">Emergency Reroute (LST-007)</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400/80 truncate">Standard Telemetry</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0" />
                  <span className="text-blue-600 dark:text-blue-400/80 truncate">Market Sync Protocol</span>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>

        {/* Gmail Outbox */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl glass shadow-[0_0_40px_rgba(16,185,129,0.1)] overflow-hidden flex flex-col min-h-[350px]"
        >
          <div className="h-12 bg-[var(--fill-secondary)]/90 border-b border-[var(--separator)] flex items-center px-6 justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <h3 className="text-sm font-semibold text-emerald-400 tracking-wider">Automated Email Logs (Workspace API)</h3>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/send-alert', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: 'buyer.alerts@example.com',
                        subject: 'Test Alert from Nerve Center',
                        body: 'This is a test alert verifying the email integration.'
                      })
                    });
                    alert('Test alert sent!');
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="text-xs px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              >
                Send Test Alert
              </button>
              <div className="text-xs text-[var(--text-tertiary)]">
                {emails.length} Sent
              </div>
            </div>
          </div>
          <div className="p-6 overflow-y-auto flex-1 bg-black/20 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            <AnimatePresence>
              {emails.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="col-span-full h-full min-h-[200px] flex flex-col items-center justify-center text-[var(--text-tertiary)] italic gap-3 pb-8"
                >
                  <svg className="w-12 h-12 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Waiting for autonomous agents to trigger external communications...
                </motion.div>
              ) : (
                emails.map((email, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative rounded-lg bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-5 shadow-lg backdrop-blur-md font-sans group hover:border-emerald-500/50 transition-colors h-fit"
                  >
                    <div className="absolute top-0 right-0 p-3">
                      <div className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        GMAIL API
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="border-b border-white/5 pb-3">
                        <div className="text-xs text-[var(--text-tertiary)]">To:</div>
                        <div className="text-sm text-blue-300 truncate">{email.to}</div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-1">Subject:</div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]"><TranslatedText text={email.subject} language={language} /></div>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                        "<TranslatedText text={email.body} language={language} />"
                      </div>
                      <div className="pt-2 text-[10px] text-[var(--text-tertiary)] text-right">
                        Sent autonomously at {email.time}
                      </div>
                    </div>
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Active Negotiation Pit */}
        <NegotiationPit />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.4);
        }
      `}} />
    </div>
  );
};

export default AgentControlCenter;
