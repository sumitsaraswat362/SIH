"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wifi, 
  Container, 
  BrainCircuit, 
  Database, 
  Flame, 
  ArrowDown,
  Server,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  Globe,
  FileText,
  Languages,
  MessageSquare,
  LayoutGrid
} from "lucide-react";
import { FloatingNav } from "@/components/landing/FloatingNav";
import { FooterCTA } from "@/components/landing/FooterCTA";

type Node = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
  gradient: string;
  glowShadow: string;
  description: string;
  details: string[];
  stat: { label: string; value: string };
};

const nodes: Node[] = [
  {
    id: "iot",
    title: "IoT Sensors",
    subtitle: "IoT Core",
    icon: Wifi,
    accent: "#4285F4",
    gradient: "from-[#4285F4] to-[#1A73E8]",
    glowShadow: "shadow-[0_8px_40px_rgba(66,133,244,0.35)]",
    description: "Real-Time Telemetry Ingestion",
    details: [
      "Captures high-frequency temperature, humidity, GPS & vibration data from cold chain trucks.",
      "Streams data securely via MQTT/HTTP with edge-level anomaly filtering.",
      "Supports offline LoRaWAN mesh fallback for zero-connectivity rural areas."
    ],
    stat: { label: "Data Points/sec", value: "12,400" },
  },
  {
    id: "cloudrun",
    title: "Cloud Run",
    subtitle: "Serverless Containers",
    icon: Container,
    accent: "#34A853",
    gradient: "from-[#34A853] to-[#1E8E3E]",
    glowShadow: "shadow-[0_8px_40px_rgba(52,168,83,0.35)]",
    description: "Serverless Compute & API Layer",
    details: [
      "Auto-scaled serverless backend handling all API requests and agent orchestration.",
      "Deploys MonitorAgent, DecisionAgent, NotificationAgent as autonomous microservices.",
      "Zero infrastructure management — scales from 0 to 10,000 requests instantly."
    ],
    stat: { label: "Avg Latency", value: "42ms" },
  },
  {
    id: "neuralengine",
    title: "Annapurna Neural Engine",
    subtitle: "Neural Engine • Generative AI",
    icon: BrainCircuit,
    accent: "#AF52DE",
    gradient: "from-[#AF52DE] to-[#8E44AD]",
    glowShadow: "shadow-[0_8px_40px_rgba(175,82,222,0.35)]",
    description: "Multi-Agent AI Decision Engine",
    details: [
      "Sub-second spoilage prediction with autonomous rerouting via Function Calling.",
      "RAG pipeline retrieves FSSAI legal documents for compliance report generation.",
      "Vision AI analyzes cargo images for multi-modal quality inspection at checkpoints."
    ],
    stat: { label: "AI Decisions", value: "85/sec" },
  },
  {
    id: "bigquery",
    title: "Data Analytics",
    subtitle: "Data Warehouse & ML",
    icon: Database,
    accent: "#FBBC04",
    gradient: "from-[#FBBC04] to-[#F29900]",
    glowShadow: "shadow-[0_8px_40px_rgba(251,188,4,0.35)]",
    description: "Analytics & Predictive Modeling",
    details: [
      "Historical telemetry warehouse powering the conversational analytics dashboard.",
      "Users query fleet data in plain English — AI generates SQL and returns visual charts.",
      "ML engine runs ARIMA forecasts to predict future cold-chain failures."
    ],
    stat: { label: "Data Processed", value: "4.2TB" },
  },
  {
    id: "firestore",
    title: "Real-Time Database",
    subtitle: "Real-Time NoSQL Database",
    icon: Flame,
    accent: "#EA4335",
    gradient: "from-[#EA4335] to-[#D93025]",
    glowShadow: "shadow-[0_8px_40px_rgba(234,67,53,0.35)]",
    description: "Live State & Marketplace",
    details: [
      "Real-time NoSQL database syncing live fleet state across all connected clients.",
      "Powers the wholesaler bidding marketplace with sub-second transaction latency.",
      "Stores agent communication logs for the autonomous Nerve Center dashboard."
    ],
    stat: { label: "Sync Latency", value: "<50ms" },
  },
  {
    id: "documentai",
    title: "Document AI",
    subtitle: "Annapurna AI",
    icon: FileText,
    accent: "#4285F4",
    gradient: "from-[#4285F4] to-[#1A73E8]",
    glowShadow: "shadow-[0_8px_40px_rgba(66,133,244,0.35)]",
    description: "Automated Document Processing",
    details: [
      "Extracts structured data from bills of lading and invoices.",
      "Ensures regulatory compliance through automated verification.",
      "Reduces manual data entry time by over 90%."
    ],
    stat: { label: "Docs/sec", value: "450" },
  },
  {
    id: "translationapi",
    title: "Translation API",
    subtitle: "Annapurna AI",
    icon: Languages,
    accent: "#EA4335",
    gradient: "from-[#EA4335] to-[#D93025]",
    glowShadow: "shadow-[0_8px_40px_rgba(234,67,53,0.35)]",
    description: "Real-time Localization",
    details: [
      "Translates driver communications into local languages.",
      "Supports 100+ languages for seamless regional operations.",
      "Enables dynamic marketplace bidding across geographies."
    ],
    stat: { label: "Translations/min", value: "1,200" },
  },
  {
    id: "dialogflow",
    title: "Dialogflow CX",
    subtitle: "Conversational AI",
    icon: MessageSquare,
    accent: "#34A853",
    gradient: "from-[#34A853] to-[#1E8E3E]",
    glowShadow: "shadow-[0_8px_40px_rgba(52,168,83,0.35)]",
    description: "Virtual Dispatch Assistant",
    details: [
      "Handles tier-1 driver support and rerouting queries.",
      "Uses intent recognition for rapid issue resolution.",
      "Integrates with Annapurna Neural Engine for complex reasoning."
    ],
    stat: { label: "Queries/hr", value: "5,000" },
  },
  {
    id: "workspaceapi",
    title: "Workspace API",
    subtitle: "Workspace Integration",
    icon: LayoutGrid,
    accent: "#FBBC04",
    gradient: "from-[#FBBC04] to-[#F29900]",
    glowShadow: "shadow-[0_8px_40px_rgba(251,188,4,0.35)]",
    description: "Automated Reporting",
    details: [
      "Generates compliance reports in documents.",
      "Updates fleet metrics natively in spreadsheets.",
      "Triggers emergency alerts via automated Gmail workflows."
    ],
    stat: { label: "Reports/day", value: "12,000" },
  },
];

export default function CloudStackPage() {
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] font-sans font-['Inter'] overflow-x-hidden selection:bg-[#007AFF] selection:text-white aura-container">
      {/* Background Mesh Gradients */}
      <div className="aura-orb aura-blue w-[60%] h-[60%] top-[-25%] left-[-15%] opacity-40 blur-[120px]" />
      <div className="aura-orb aura-green w-[50%] h-[50%] bottom-[-15%] right-[-15%] opacity-30 blur-[100px]" />
      <div className="fixed top-[30%] right-[-10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(175,82,222,0.08),transparent_60%)] dark:bg-[radial-gradient(circle,rgba(175,82,222,0.15),transparent_60%)] pointer-events-none" />
      
      <FloatingNav activeTab="cloud-stack" />
      
      <main className="relative z-10 pt-28 pb-12">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--separator)] mb-6">
              <Globe className="w-4 h-4 text-[#4285F4]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Powered by Annapurna AI</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
              Cloud Stack <br />
              <span className="bg-gradient-to-r from-[#4285F4] via-[#AF52DE] to-[#EA4335] bg-clip-text text-transparent">Explorer</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto font-medium">
              Explore the cloud services powering Annapurna&apos;s autonomous cold-chain logistics platform.
            </p>
          </motion.div>
          
          {/* Stats Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { label: "Cloud Services", value: "5+", color: "#4285F4" },
              { label: "AI Models Active", value: "3", color: "#AF52DE" },
              { label: "Uptime SLA", value: "99.99%", color: "#34A853" },
              { label: "Regions", value: "Global", color: "#EA4335" },
            ].map((s, i) => (
              <div key={i} className="ios-card glass p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Main Content: Pipeline + Detail Panel */}
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left: Service Pipeline */}
          <div className="flex-[3] space-y-0">
            {nodes.map((node, index) => {
              const isActive = activeNode?.id === node.id;
              const isAnyActive = activeNode !== null;
              
              return (
                <div key={node.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5, type: "spring" }}
                    onMouseEnter={() => setActiveNode(node)}
                    onMouseLeave={() => setActiveNode(null)}
                    onClick={() => setActiveNode(isActive ? null : node)}
                    className={`
                      relative ios-card glass bg-white/10 dark:bg-black/10 backdrop-blur-3xl border border-white/20 dark:border-white/10 p-5 md:p-6 cursor-pointer transition-all duration-500 overflow-hidden group
                      ${isActive ? `ring-2 ring-white/50 dark:ring-white/20 shadow-[0_0_40px_rgba(255,255,255,0.2)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] ${node.glowShadow} scale-[1.02]` : 'hover:shadow-[0_20px_50px_rgba(0,122,255,0.15)] dark:hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] hover:-skew-y-1 hover:scale-[1.02] hover:rotate-1'}
                      ${isAnyActive && !isActive ? 'opacity-40 scale-[0.95] blur-[2px]' : 'opacity-100'}
                    `}
                    style={isActive ? { borderColor: `${node.accent}40` } : {}}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{ background: `radial-gradient(600px circle at 50% 50%, ${node.accent}15, transparent 70%)` }}
                    />
                    {/* Liquid Droplet overlay */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl group-hover:opacity-100 opacity-20 transition-opacity duration-700 pointer-events-none mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-white/5 dark:via-transparent dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center gap-5">
                      {/* Icon with gradient background */}
                      <motion.div
                        animate={isActive ? {
                          y: [0, -4, 0],
                          transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                        } : {}}
                        className={`
                          w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 
                          bg-gradient-to-br ${node.gradient} transition-all duration-300
                          ${isActive ? node.glowShadow + ' scale-110' : 'shadow-lg'}
                        `}
                      >
                        <node.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">{node.title}</h3>
                          <span 
                            className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                            style={{ 
                              color: node.accent,
                              backgroundColor: `${node.accent}10`,
                              borderColor: `${node.accent}25`,
                            }}
                          >
                            {node.subtitle}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">{node.description}</p>
                      </div>

                      {/* Stat */}
                      <div className="hidden md:flex flex-col items-end shrink-0">
                        <div className="text-xl font-bold" style={{ color: node.accent }}>{node.stat.value}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{node.stat.label}</div>
                      </div>

                      {/* Chevron */}
                      <ChevronRight 
                        className={`w-5 h-5 text-[var(--text-quaternary)] shrink-0 transition-transform duration-300 ${isActive ? 'rotate-90' : ''}`} 
                        style={isActive ? { color: node.accent } : {}}
                      />
                    </div>

                    {/* Expanded details (mobile / click) */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="lg:hidden overflow-hidden"
                        >
                          <div className="pt-5 mt-5 border-t border-[var(--separator)] space-y-3">
                            {node.details.map((detail, idx) => (
                              <div key={idx} className="flex gap-3 items-start">
                                <div 
                                  className="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${node.accent}15`, color: node.accent }}
                                >
                                  <Zap className="w-3 h-3" />
                                </div>
                                <span className="text-sm text-[var(--text-secondary)]">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  {/* Connector Arrow */}
                  {index < nodes.length - 1 && (
                    <div className="flex justify-center py-2">
                      <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowDown className="w-5 h-5 text-[var(--text-quaternary)]" />
                      </motion.div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Sticky Detail Panel (desktop) */}
          <div className="flex-[2] hidden lg:block sticky top-28">
            <div className="relative min-h-[500px]">
              <AnimatePresence mode="wait">
                {activeNode ? (
                  <motion.div
                    key={activeNode.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    className={`ios-card glass bg-white/10 dark:bg-black/10 backdrop-blur-3xl border border-white/20 dark:border-white/10 p-8 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${activeNode.glowShadow}`}
                    style={{ borderColor: `${activeNode.accent}40`, transformPerspective: 1000 }}
                  >
                    {/* Gradient header bar */}
                    <div 
                      className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${activeNode.gradient}`}
                    />
                    
                    <div className="flex items-center gap-3 mb-6 mt-2">
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeNode.gradient} shadow-lg`}
                      >
                        <activeNode.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">{activeNode.title}</h3>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: activeNode.accent }}>{activeNode.subtitle}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-5 text-[var(--text-primary)]">
                      {activeNode.description}
                    </h2>
                    
                    <div className="h-px w-full bg-[var(--separator)] mb-5" />
                    
                    <ul className="space-y-5">
                      {activeNode.details.map((detail, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.1 }}
                          className="flex gap-4 items-start"
                        >
                          <div 
                            className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ 
                              backgroundColor: `${activeNode.accent}12`,
                              color: activeNode.accent,
                            }}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm text-[var(--text-secondary)] leading-relaxed">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    {/* Stats footer */}
                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <div className="ios-card glass p-4 text-center">
                        <ShieldCheck className="w-5 h-5 mx-auto mb-2 text-[#34A853]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Cloud Native</span>
                      </div>
                      <div className="ios-card glass p-4 text-center">
                        <Server className="w-5 h-5 mx-auto mb-2 text-[#4285F4]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Enterprise SLA</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ios-card glass flex flex-col items-center justify-center text-center p-12 min-h-[500px]"
                  >
                    <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[#4285F4] to-[#AF52DE] flex items-center justify-center shadow-lg shadow-[#4285F4]/20">
                      <Activity className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Interactive Cloud Stack</h3>
                    <p className="text-[var(--text-tertiary)] max-w-[280px] text-sm leading-relaxed">
                      Hover over any service in the pipeline to explore how it powers the Annapurna platform.
                    </p>
                    <div className="mt-6 flex gap-2">
                      {nodes.map((n) => (
                        <div 
                          key={n.id} 
                          className="w-3 h-3 rounded-full transition-transform hover:scale-150 cursor-pointer"
                          style={{ backgroundColor: n.accent }}
                          onMouseEnter={() => setActiveNode(n)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <FooterCTA />
    </div>
  );
}
