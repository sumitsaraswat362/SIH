"use client";

import { useState, useEffect } from "react";
import { fetchArimaForecast } from "./actions";
import { ForecastDataPoint } from "../../lib/bigquery-client";
import { Send, Bot, Database, BarChart3, AlertTriangle, Truck, Leaf, IndianRupee, CloudOff, Activity, Scale, Gavel, Mic, MicOff, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const forecastData = [
  { day: 'Mon', riskLevel: 20, trucksAtRisk: 1 },
  { day: 'Tue', riskLevel: 35, trucksAtRisk: 2 },
  { day: 'Wed', riskLevel: 55, trucksAtRisk: 4 },
  { day: 'Thu', riskLevel: 80, trucksAtRisk: 7 },
  { day: 'Fri', riskLevel: 45, trucksAtRisk: 3 },
  { day: 'Sat', riskLevel: 25, trucksAtRisk: 1 },
  { day: 'Sun', riskLevel: 15, trucksAtRisk: 0 },
];

const esgMetrics = [
  { title: "Total Food Saved (Kg)", value: "24,500", icon: <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />, trend: "+12%", desc: "vs last month" },
  { title: "Economic Value Recovered for Farmers (₹)", value: "1.24M", icon: <IndianRupee className="w-6 h-6 text-blue-600 dark:text-blue-400" />, trend: "+8%", desc: "in direct benefits" },
  { title: "CO2 Emissions Prevented", value: "4,200 Kg", icon: <CloudOff className="w-6 h-6 text-purple-600 dark:text-purple-400" />, trend: "+15%", desc: "carbon offset" },
];

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'legal'>('analytics');
  const [arimaData, setArimaData] = useState<ForecastDataPoint[]>([]);

  useEffect(() => {
    fetchArimaForecast().then(data => setArimaData(data)).catch(console.error);
  }, []);
  
  // Analytics State
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, data?: any, sql?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterCargoType, setFilterCargoType] = useState("all");


  // Legal State
  const [legalQuery, setLegalQuery] = useState("");
  const [legalReport, setLegalReport] = useState<{ query: string; report: string; context: string } | null>(null);
  const [isLegalLoading, setIsLegalLoading] = useState(false);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) return;
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        submitQuery(transcript);
      };
      recognition.onerror = (event: any) => {
        console.error("Speech error", event);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.error(e);
      setSpeechSupported(false);
    }
  };

  const downloadPDF = async () => {
    if (!legalReport) return;
    const element = document.getElementById('legal-report-content');
    if (element) {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt: any = {
        margin:       10,
        filename:     `FSSAI_Compliance_Report.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const submitQuery = async (q: string) => {
    if (!q.trim()) return;

    const userMessage = { role: 'user' as const, content: q };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/analytics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.summary,
        sql: data.sql,
        data: data.data
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error processing your query."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyticsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery(query);
  };

  const submitLegalQuery = async (q: string) => {
    if (!q.trim()) return;
    
    setLegalQuery(q);
    setIsLegalLoading(true);
    setLegalReport(null);
    try {
      const response = await fetch('/api/rag/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await response.json();
      setLegalReport({ query: q, report: data.report, context: data.context });
    } catch (error) {
      console.error(error);
      setLegalReport({ query: q, report: "Error processing the legal query.", context: "" });
    } finally {
      setIsLegalLoading(false);
    }
  };

  const handleLegalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitLegalQuery(legalQuery);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] aura-container relative overflow-hidden">
      {/* Background Aura */}
      <div className="aura-orb aura-blue w-[70vw] h-[70vh] top-[-10%] left-[-10%]"></div>
      <div className="aura-orb aura-green w-[50vw] h-[50vh] bottom-[-10%] right-[-10%]" style={{ animationDelay: '-5s' }}></div>
      {/* Header */}
      <header className="border-b border-[var(--separator)] bg-[var(--bg-primary)]/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-xl">
              <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              AI Command Center
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-[var(--separator)]">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-[var(--fill-secondary)] text-blue-400 shadow-sm border border-[var(--separator)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Data Analytics
            </button>
            <button 
              onClick={() => setActiveTab('legal')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'legal' ? 'bg-[var(--fill-secondary)] text-emerald-400 shadow-sm border border-[var(--separator)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Legal RAG Assistant
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            
            {/* Analytics Filters */}
            <div className="ios-card glass p-4 relative z-10 flex flex-wrap gap-4 items-center bg-white/5 border border-[var(--separator)] rounded-xl">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase">Date Range</label>
                <div className="flex gap-2 text-white">
                  <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="bg-white/5 border border-[var(--separator)] rounded-lg px-2 py-1.5 text-sm focus:outline-none" style={{ colorScheme: 'dark' }} />
                  <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="bg-white/5 border border-[var(--separator)] rounded-lg px-2 py-1.5 text-sm focus:outline-none" style={{ colorScheme: 'dark' }} />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase">Cargo Type</label>
                <select value={filterCargoType} onChange={(e) => setFilterCargoType(e.target.value)} className="bg-[var(--bg-primary)] border border-[var(--separator)] rounded-lg px-3 py-1.5 text-sm focus:outline-none">
                  <option value="all">All Cargos</option>
                  <option value="tomatoes">Tomatoes</option>
                  <option value="mangoes">Mangoes</option>
                  <option value="fish">Fish</option>
                  <option value="flowers">Flowers</option>
                  <option value="dairy">Dairy</option>
                </select>
              </div>
            </div>

            {/* Sustainability Impact Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {esgMetrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl relative overflow-hidden group hover:bg-white/10 transition-colors cursor-default"
                >
                  <div className="absolute -right-10 -top-10 bg-white/5 rounded-full p-16 blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-[var(--bg-primary)]/50 rounded-xl border border-[var(--separator)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] backdrop-blur-md">
                      {metric.icon}
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
                      {metric.trend}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">{metric.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{metric.value}</span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{metric.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-24rem)] min-h-[600px]">
              
              {/* Chat Section */}
              <div className="lg:col-span-1 flex flex-col h-full bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[var(--separator)] bg-white/5">
                  <h2 className="font-medium flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Conversational Analytics Agent
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-[var(--text-secondary)] mt-10">
                      <Database className="w-12 h-12 mx-auto mb-3 opacity-20 text-blue-400" />
                      <p>Ask a natural language question. The AI will generate SQL and query the data warehouse directly.</p>
                      <div className="mt-4 flex flex-col gap-2">
                        <button onClick={() => submitQuery("Which trucks spoiled this week?")} className="text-xs bg-[var(--fill-secondary)] hover:bg-[var(--fill-tertiary)] text-[var(--text-primary)] border border-[var(--separator)] px-3 py-2 rounded-lg text-left transition-colors">
                          "Which trucks spoiled this week?"
                        </button>
                        <button onClick={() => submitQuery("Show me the coldest trucks")} className="text-xs bg-[var(--fill-secondary)] hover:bg-[var(--fill-tertiary)] text-[var(--text-primary)] border border-[var(--separator)] px-3 py-2 rounded-lg text-left transition-colors">
                          "Show me the coldest trucks"
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((msg, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i} 
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-[var(--text-primary)] rounded-tr-sm' 
                          : 'bg-[var(--fill-tertiary)] text-[var(--text-primary)] border border-[var(--separator)] shadow-sm rounded-tl-sm'
                      }`}>
                        <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start">
                      <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[var(--bg-primary)]/40 border-t border-[var(--separator)] backdrop-blur-md">
                  <form onSubmit={handleAnalyticsSubmit} className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask Analytics (e.g. Show me all seafood shipments)"
                        className="w-full bg-white/5 border border-[var(--separator)] rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[var(--text-tertiary)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] backdrop-blur-xl"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-[var(--text-tertiary)] text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-3 rounded-2xl flex-shrink-0 transition-all shadow-lg backdrop-blur-xl border ${
                          isListening 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse shadow-red-500/20' 
                            : 'bg-white/5 hover:bg-white/10 border-[var(--separator)] text-[var(--text-secondary)] hover:text-white'
                        }`}
                        title="Voice Query"
                      >
                        {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {/* Dashboard/Results & AI Section */}
              <div className="lg:col-span-2 space-y-6 flex flex-col h-full overflow-y-auto pr-2 pb-8">
                {messages.filter(m => m.role === 'assistant' && m.data).length > 0 ? (() => {
                  const lastAssistantMessage = messages.filter(m => m.role === 'assistant' && m.data).pop()!;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6 shrink-0"
                    >
                      <div className="bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium flex items-center gap-2 text-[var(--text-primary)]">
                            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Generated SQL (Standard SQL)
                          </h3>
                        </div>
                        <div className="bg-[var(--fill-secondary)] rounded-xl p-4 border border-[var(--separator)] shadow-inner overflow-x-auto">
                          <code className="text-emerald-300 text-sm font-mono whitespace-pre">{lastAssistantMessage.sql}</code>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl flex flex-col min-h-[300px]">
                          <h3 className="text-lg font-medium flex items-center gap-2 mb-4 text-[var(--text-primary)]">
                            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            Data Visualization
                          </h3>
                          <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={lastAssistantMessage.data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-[var(--separator)]" />
                                <XAxis dataKey="truck_id" stroke="currentColor" className="text-[var(--text-tertiary)]" fontSize={12} />
                                <YAxis stroke="currentColor" className="text-[var(--text-tertiary)]" fontSize={12} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--separator)', borderRadius: '8px' }}
                                  itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Bar dataKey="max_temp_celsius" fill="#818cf8" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl flex flex-col min-h-[300px]">
                          <h3 className="text-lg font-medium flex items-center gap-2 mb-4 text-[var(--text-primary)]">
                            <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            Result Table
                          </h3>
                          <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3">
                            {lastAssistantMessage.data.map((row: any, i: number) => (
                              <div key={i} className="bg-white/5 border border-[var(--separator)] rounded-xl p-4 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-mono text-sm font-bold text-[var(--text-primary)]">{row.truck_id}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${row.status === 'Spoiled' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                                    {row.status}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                                  <span>Temp: <span className="text-[var(--text-primary)]">{row.max_temp_celsius}°C</span></span>
                                  <span>Loc: <span className="text-[var(--text-primary)]">{row.last_location}</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })() : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center opacity-40 bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl p-12 shrink-0 min-h-[250px] mb-6"
                  >
                    <Database className="w-16 h-16 mb-6 text-[var(--text-secondary)]" />
                    <h2 className="text-2xl font-bold tracking-tight">Analytics Agent Standby</h2>
                    <p className="mt-2 text-lg">Ask a question to generate an analytics report.</p>
                  </motion.div>
                )}

                {/* BigQuery ML Predictive AI Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-[#1a202c]/60 to-[#2d3748]/60 border border-[var(--separator)] rounded-2xl p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden shrink-0 mt-auto"
                >
                  <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
                  <div className="absolute bottom-0 left-0 p-32 bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
                        <Database className="w-6 h-6 text-blue-400" />
                        ML: Predictive Forecasting
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-mono text-blue-400 tracking-wider">ARIMA MODEL ACTIVE</span>
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl p-4 mb-6 flex items-start gap-4 backdrop-blur-md">
                      <Activity className="w-6 h-6 mt-0.5 shrink-0 text-blue-400" />
                      <div>
                        <p className="text-sm font-semibold mb-1">14-Day Spoilage Risk Projection</p>
                        <p className="text-xs opacity-80">
                          Forecasting generated via our ML forecasting engine. Data indicates a projected risk spike around Day 10. Recommend proactive rerouting of fleet assets to mitigate potential losses.
                        </p>
                      </div>
                    </div>
                    
                    <div className="h-[280px] w-full">
                      {arimaData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={arimaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorBqRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              stroke="#94a3b8" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(val) => {
                                const d = new Date(val);
                                return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                              }}
                            />
                            <YAxis 
                              stroke="#94a3b8" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={false} 
                              tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                              }}
                              itemStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                              labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="predicted_spoilage_risk" 
                              name="Predicted Risk"
                              stroke="#3b82f6" 
                              strokeWidth={3} 
                              fillOpacity={1} 
                              fill="url(#colorBqRisk)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center flex-col gap-3">
                          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                          <div className="text-xs font-mono text-blue-400">Executing Analytics Query...</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'legal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)] min-h-[600px]">
            {/* Chat Section */}
            <div className="lg:col-span-1 flex flex-col h-full bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-[var(--separator)] bg-white/5">
                <h2 className="font-medium flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Legal RAG Assistant
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center text-[var(--text-secondary)] mt-10">
                  <Gavel className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Ask a compliance or liability query.</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button onClick={() => submitLegalQuery("What are the FSSAI compliance rules?")} className="text-xs bg-[var(--fill-secondary)] hover:bg-[var(--fill-tertiary)] text-[var(--text-primary)] border border-[var(--separator)] px-3 py-2 rounded-lg text-left transition-colors">
                      "What are the FSSAI compliance rules?"
                    </button>
                    <button onClick={() => submitLegalQuery("TRK-007 spoiled, who pays?")} className="text-xs bg-[var(--fill-secondary)] hover:bg-[var(--fill-tertiary)] text-[var(--text-primary)] border border-[var(--separator)] px-3 py-2 rounded-lg text-left transition-colors">
                      "TRK-007 spoiled, who pays?"
                    </button>
                  </div>
                </div>

                {isLegalLoading && (
                  <div className="flex items-start mt-6 justify-center">
                    <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[var(--bg-primary)]/40 border-t border-[var(--separator)] backdrop-blur-md">
                <form onSubmit={handleLegalSubmit} className="relative">
                  <input
                    type="text"
                    value={legalQuery}
                    onChange={(e) => setLegalQuery(e.target.value)}
                    placeholder="Ask a legal query..."
                    className="w-full bg-white/5 border border-[var(--separator)] rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-[var(--text-tertiary)]"
                  />
                  <button
                    type="submit"
                    disabled={isLegalLoading || !legalQuery.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-[var(--text-tertiary)] text-[var(--text-primary)] rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Report Section */}
            <div className="lg:col-span-2 space-y-6 flex flex-col h-full overflow-y-auto pr-2 pb-8">
              {legalReport ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 shrink-0">
                  <div className="bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4 text-[var(--text-primary)]">
                      <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Retrieved Context from Vector DB
                    </h3>
                    <div className="bg-[var(--fill-secondary)] rounded-xl p-4 border border-[var(--separator)] shadow-inner overflow-x-auto text-sm text-[var(--text-secondary)] leading-relaxed">
                      {legalReport.context}
                    </div>
                  </div>

                  <div className="bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl relative group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium flex items-center gap-2 text-[var(--text-primary)]">
                        <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        Legal Liability Report (Generative AI)
                      </h3>
                      <button 
                        onClick={downloadPDF}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-[var(--separator)] rounded-lg text-emerald-400 transition-all shadow-sm backdrop-blur-md hover:shadow-emerald-500/20"
                      >
                        <Download className="w-3.5 h-3.5" /> Export PDF
                      </button>
                    </div>
                    <div id="legal-report-content" className="prose dark:prose-invert max-w-none text-sm leading-relaxed p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="mb-4 text-center border-b border-white/10 pb-4 hidden print:block">
                        <h1 className="text-2xl font-bold">Annapurna Legal Compliance Report</h1>
                        <p className="text-sm opacity-60">Grounded in FSSAI Food Safety Regulations</p>
                      </div>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{legalReport.report}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center opacity-40 bg-[var(--fill-secondary)]/70 border border-[var(--separator)] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl p-12 shrink-0 h-full"
                >
                  <Scale className="w-16 h-16 mb-6 text-[var(--text-secondary)]" />
                  <h2 className="text-2xl font-bold tracking-tight">Legal AI Standby</h2>
                  <p className="mt-2 text-lg">Submit a query to generate a definitive legal liability report.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
