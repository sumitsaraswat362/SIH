import { motion } from "motion/react";
import { 
  Brain, Bot, Code, Database, LineChart, Camera, 
  Cloud, HardDrive, Cpu, Leaf, Wifi, Map, Activity, 
  Search, Workflow, Zap, Network, Scale,
  FileText, Languages, MessageSquare, LayoutGrid
} from "lucide-react";

const features = [
  {
    id: 1,
    title: "Annapurna Neural Engine",
    description: "Powers the autonomous multi-agent AI decision-making system. Used for real-time spoilage prediction, instant buyer matching, and conversational analytics.",
    icon: Brain,
    color: "bg-blue-500/10 text-blue-500",
    badge: "Neural Engine",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    id: 2,
    title: "Multi-Agent Orchestration",
    description: "Autonomous Monitor, Decision, Notification, and Market agents communicate and act without human intervention.",
    icon: Bot,
    color: "bg-purple-500/10 text-purple-500",
    badge: "Antigravity",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 3,
    title: "Function Calling",
    description: "AI agents use structured function calls like match_buyer() and alert_wholesaler() to take real autonomous actions.",
    icon: Code,
    color: "bg-green-500/10 text-green-500",
    badge: "AI Tools",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 4,
    title: "RAG Assistant",
    description: "Legal & Compliance AI retrieves from a vector database of FSSAI regulations to generate definitive legal liability reports.",
    icon: Search,
    color: "bg-orange-500/10 text-orange-500",
    badge: "Vector Search",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    id: 5,
    title: "Conversational Analytics",
    description: "Natural language querying of market telemetry data. Ask plain English questions and get SQL queries + visual charts.",
    icon: LineChart,
    color: "bg-cyan-500/10 text-cyan-500",
    badge: "DataQnA",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    id: 6,
    title: "Vision AI",
    description: "Camera-based cargo quality inspection. AI analyzes images for spoilage detection at delivery checkpoints.",
    icon: Camera,
    color: "bg-indigo-500/10 text-indigo-500",
    badge: "Multi-Modal AI",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 7,
    title: "Cloud Run",
    description: "Serverless container deployment for the entire backend API layer and autonomous agent execution.",
    icon: Cloud,
    color: "bg-blue-400/10 text-blue-400",
    badge: "Cloud Native",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 8,
    title: "BigQuery",
    description: "Historical telemetry data warehouse powering the analytics dashboard and predictive models.",
    icon: Database,
    color: "bg-blue-600/10 text-blue-600",
    badge: "Cloud Native",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    id: 9,
    title: "Firestore",
    description: "Real-time NoSQL database for live market state, bid management, and agent communication.",
    icon: HardDrive,
    color: "bg-yellow-500/10 text-yellow-500",
    badge: "Cloud Native",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 10,
    title: "Predictive Maintenance",
    description: "ML models that predict compressor failures and cooling anomalies before they happen.",
    icon: Activity,
    color: "bg-red-500/10 text-red-500",
    badge: "Neural Engine",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    id: 11,
    title: "Sustainability Dashboard",
    description: "Real-time carbon footprint tracking, food waste reduction metrics, and economic impact for farmers.",
    icon: Leaf,
    color: "bg-emerald-500/10 text-emerald-500",
    badge: "ESG Metrics",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 12,
    title: "IoT Telemetry Pipeline",
    description: "Real-time ingestion of temperature, humidity, GPS, and vibration data from farm and transit sensors.",
    icon: Cpu,
    color: "bg-teal-500/10 text-teal-500",
    badge: "Pub/Sub",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    id: 13,
    title: "Maps & Geolocation",
    description: "Live GPS tracking with route visualization, geofencing, and distance-optimized matching.",
    icon: Map,
    color: "bg-green-600/10 text-green-600",
    badge: "Maps Platform",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 14,
    title: "Offline 5G Dead Zone Sync",
    description: "LoRaWAN mesh network fallback ensures data continuity in zero-connectivity rural areas.",
    icon: Network,
    color: "bg-pink-500/10 text-pink-500",
    badge: "Edge Computing",
    colSpan: "col-span-1 md:col-span-3 lg:col-span-4",
  },
  {
    id: 15,
    title: "Document AI",
    description: "Automated processing of invoices, bills of lading, and compliance certificates using advanced OCR.",
    icon: FileText,
    color: "bg-blue-400/10 text-blue-400",
    badge: "Annapurna AI",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 16,
    title: "Translation API",
    description: "Real-time, multi-lingual support for regional drivers and farmers across diverse geographies.",
    icon: Languages,
    color: "bg-indigo-400/10 text-indigo-400",
    badge: "Annapurna AI",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 17,
    title: "Dialogflow CX",
    description: "Advanced conversational agent for managing farmer queries and autonomous trade coordination.",
    icon: MessageSquare,
    color: "bg-teal-400/10 text-teal-400",
    badge: "Conversational AI",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: 18,
    title: "Workspace API",
    description: "Seamless integration with Docs, Sheets, and Gmail for automated reporting and notifications.",
    icon: LayoutGrid,
    color: "bg-green-500/10 text-green-500",
    badge: "Workspace",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
];

export function FeaturesPage() {
  return (
    <div className="py-24 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-4"
          >
            Powered by Annapurna AI
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto"
          >
            A fully autonomous ecosystem leveraging industry-leading AI, data, and infrastructure to optimize the entire farmer-to-buyer marketplace.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.03, 
                y: -5,
                rotateX: 2,
                rotateY: -2,
                skewX: -1
              }}
              className={`relative overflow-hidden rounded-[2.5rem] border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/10 backdrop-blur-3xl p-8 flex flex-col group transition-all duration-500 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(31,38,135,0.15)] dark:hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] ${feature.colSpan}`}
              style={{ transformPerspective: 1000 }}
            >
              {/* Liquid Glass & Droplet effects */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl group-hover:opacity-100 opacity-50 transition-opacity duration-700 pointer-events-none mix-blend-overlay"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-gradient-to-tr from-[var(--text-primary)]/5 to-transparent rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity duration-700 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-white/5 dark:via-transparent dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2.5rem]" />
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={`p-4 rounded-3xl ${feature.color} bg-opacity-20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="w-8 h-8 drop-shadow-md" />
                </div>
                {feature.badge && (
                  <span className="px-3 py-1.5 text-xs font-bold tracking-wider rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 text-[var(--text-primary)] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                    {feature.badge}
                  </span>
                )}
              </div>
              
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-extrabold text-[var(--text-primary)] mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--text-primary)] group-hover:to-cyan-500 transition-all duration-300 drop-shadow-sm">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
