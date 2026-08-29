import { motion } from "motion/react";
import { MouseEvent, useState } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Globe, ShieldAlert, Cpu, Leaf, Sparkles, Scale, Eye, Terminal, BarChart3, Wrench, Cloud } from "lucide-react";
import Link from "next/link";

export function BentoGrid() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section className="relative py-24 md:py-32 px-6 w-full max-w-7xl mx-auto z-20" id="features">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)] mb-4">
          Everything you need. <br/> <span className="text-[var(--text-tertiary)]">Nothing you don't.</span>
        </h2>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        onMouseMove={handleMouseMove}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        style={
          {
            "--mouse-x": `${mousePos.x}px`,
            "--mouse-y": `${mousePos.y}px`,
          } as React.CSSProperties
        }
      >
        {/* Spotlight Effect overlay for the whole grid - simplified for React */}
        
        {/* Box 1: Wholesaler Bidding */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 md:col-span-2 row-span-2 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(100,100,100,0.1), transparent 40%)"
               }} 
          />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="max-w-sm">
              <div className="w-12 h-12 bg-[var(--fill-secondary)] rounded-xl flex items-center justify-center mb-6 border border-[var(--separator)] shadow-sm">
                <Globe className="text-[var(--text-primary)] w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Produce Listing & AI Matching</h3>
              <p className="text-[var(--text-secondary)] font-medium">List your produce in seconds. Our AI matches you with the best buyers in &lt;90 seconds for optimal prices.</p>
            </div>
            
            <div className="mt-8 flex gap-4">
              <div className="bg-[var(--fill-secondary)] p-4 rounded-2xl border border-[var(--separator)] backdrop-blur-sm flex-1 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Active Agents</div>
                <div className="text-xl font-bold text-[#34C759]">1,248</div>
              </div>
              <div className="bg-[var(--fill-secondary)] p-4 rounded-2xl border border-[var(--separator)] backdrop-blur-sm flex-1 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Decisions/sec</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">85.4</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Box 2: Emergency SOS */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(255,59,48,0.05)] dark:shadow-[0_20px_50px_rgba(255,59,48,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,59,48,0.08), transparent 40%)"
               }} 
          />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#FF3B30]/10 rounded-xl flex items-center justify-center mb-6 border border-[#FF3B30]/20 shadow-sm">
              <ShieldAlert className="text-[#FF3B30] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Direct Market Access</h3>
            <p className="text-[var(--text-secondary)] font-medium text-sm">Connect directly with buyers, bypassing 3-4 middlemen to increase earnings by 40%.</p>
          </div>
        </motion.div>

        {/* Box 3: AI Optimization */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(0,122,255,0.05)] dark:shadow-[0_20px_50px_rgba(0,122,255,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0,122,255,0.08), transparent 40%)"
               }} 
          />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#007AFF]/10 rounded-xl flex items-center justify-center mb-6 border border-[#007AFF]/20 shadow-sm">
              <Cpu className="text-[#007AFF] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">AI Routing</h3>
            <p className="text-[var(--text-secondary)] font-medium text-sm">Dynamic rerouting based on traffic, weather, and facility wait times.</p>
          </div>
        </motion.div>

        {/* Box 4: Eco Mode */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 md:col-span-3 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] relative overflow-hidden group flex flex-col md:flex-row items-center shadow-[0_20px_50px_rgba(52,199,89,0.05)] dark:shadow-[0_20px_50px_rgba(52,199,89,0.1)]"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(1000px circle at var(--mouse-x) var(--mouse-y), rgba(52,199,89,0.06), transparent 40%)"
               }} 
          />
          <div className="p-8 md:w-1/2 relative z-10">
            <div className="w-12 h-12 bg-[#34C759]/10 rounded-xl flex items-center justify-center mb-6 border border-[#34C759]/20 shadow-sm">
              <Leaf className="text-[#34C759] w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Sustainability Impact</h3>
            <p className="text-[var(--text-secondary)] font-medium">Reduce your carbon footprint. Our multi-agent AI optimizes routes and energy consumption for a greener future.</p>
          </div>
          <div className="md:w-1/2 h-full w-full min-h-[300px] relative">
             <ImageWithFallback 
                src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=800" 
                alt="Fresh Produce" 
                className="w-full h-full object-cover opacity-[0.15] dark:opacity-50 absolute inset-0 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] to-transparent" />
          </div>
        </motion.div>

        {/* Box 5: Annapurna Neural Engine */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(175,82,222,0.05)] dark:shadow-[0_20px_50px_rgba(175,82,222,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(175,82,222,0.08), transparent 40%)"
               }} 
          />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-[#AF52DE]/10 rounded-xl flex items-center justify-center border border-[#AF52DE]/20 shadow-sm">
                <Sparkles className="text-[#AF52DE] w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#AF52DE] bg-[#AF52DE]/10 px-3 py-1 rounded-full border border-[#AF52DE]/20">Neural Engine</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Annapurna Neural Engine</h3>
            <p className="text-[var(--text-secondary)] font-medium text-sm">Real-time AI decisions powered by our fastest AI model. Sub-second spoilage prediction and autonomous rerouting.</p>
          </div>
        </motion.div>

        {/* Box 6: Legal RAG Assistant */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(255,149,0,0.05)] dark:shadow-[0_20px_50px_rgba(255,149,0,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,149,0,0.08), transparent 40%)"
               }} 
          />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-[#FF9500]/10 rounded-xl flex items-center justify-center border border-[#FF9500]/20 shadow-sm">
                <Scale className="text-[#FF9500] w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF9500] bg-[#FF9500]/10 px-3 py-1 rounded-full border border-[#FF9500]/20">AI + RAG</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Legal RAG Assistant</h3>
            <p className="text-[var(--text-secondary)] font-medium text-sm">AI-powered legal compliance engine. Retrieves FSSAI regulations and generates definitive liability reports.</p>
          </div>
        </motion.div>

        {/* Box 7: Vision AI Quality Control */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(90,200,250,0.05)] dark:shadow-[0_20px_50px_rgba(90,200,250,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(90,200,250,0.08), transparent 40%)"
               }} 
          />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-[#5AC8FA]/10 rounded-xl flex items-center justify-center border border-[#5AC8FA]/20 shadow-sm">
                <Eye className="text-[#5AC8FA] w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5AC8FA] bg-[#5AC8FA]/10 px-3 py-1 rounded-full border border-[#5AC8FA]/20">Multi-Modal AI</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Vision AI Quality Control</h3>
            <p className="text-[var(--text-secondary)] font-medium text-sm">Multi-modal produce inspection at market checkpoints. Camera-based freshness monitoring using Annapurna Vision AI.</p>
          </div>
        </motion.div>

        {/* Box 8: Autonomous Nerve Center */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 md:col-span-2 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(0,122,255,0.05)] dark:shadow-[0_20px_50px_rgba(0,122,255,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(0,122,255,0.08), transparent 40%)"
               }} 
          />
          <Link href="/nerve-center" className="absolute inset-0 z-20" aria-label="Nerve Center" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-12 h-12 bg-[#007AFF]/10 rounded-xl flex items-center justify-center mb-6 border border-[#007AFF]/20 shadow-sm group-hover:scale-110 transition-transform">
                <Terminal className="text-[#007AFF] w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#007AFF] transition-colors">Autonomous Nerve Center &rarr;</h3>
              <p className="text-[var(--text-secondary)] font-medium max-w-lg">Watch AI agents communicate in real-time. MonitorAgent, DecisionAgent, and NotificationAgent orchestrate your direct trade.</p>
            </div>
          </div>
        </motion.div>

        {/* Box 9: BigQuery Analytics */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(52,199,89,0.05)] dark:shadow-[0_20px_50px_rgba(52,199,89,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(52,199,89,0.08), transparent 40%)"
               }} 
          />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-[#34C759]/10 rounded-xl flex items-center justify-center border border-[#34C759]/20 shadow-sm">
                <BarChart3 className="text-[#34C759] w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#34C759] bg-[#34C759]/10 px-3 py-1 rounded-full border border-[#34C759]/20">Data Analytics</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Data Analytics</h3>
            <p className="text-[var(--text-secondary)] font-medium text-sm">Natural language data queries. Ask about market prices in plain English and get instant SQL + visual charts.</p>
          </div>
        </motion.div>

        {/* Box 10: Function Calling (AI Tools) */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 md:col-span-2 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(255,59,48,0.05)] dark:shadow-[0_20px_50px_rgba(255,59,48,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,59,48,0.08), transparent 40%)"
               }} 
          />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#FF3B30]/10 rounded-xl flex items-center justify-center mb-6 border border-[#FF3B30]/20 shadow-sm">
              <Wrench className="text-[#FF3B30] w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Function Calling (AI Tools)</h3>
            <p className="text-[var(--text-secondary)] font-medium">AI agents execute real actions: match_buyer(), alert_wholesaler(), scan_produce(). True autonomous operations.</p>
          </div>
        </motion.div>

        {/* Box 11: Cloud Stack */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:-skew-y-1 hover:rotate-1 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(66,133,244,0.05)] dark:shadow-[0_20px_50px_rgba(66,133,244,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(66,133,244,0.08), transparent 40%)"
               }} 
          />
          <Link href="/architecture" className="absolute inset-0 z-20" aria-label="Cloud Stack" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-[#4285F4]/10 rounded-xl flex items-center justify-center border border-[#4285F4]/20 shadow-sm group-hover:scale-110 transition-transform">
                <Cloud className="text-[#4285F4] w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4285F4] bg-[#4285F4]/10 px-3 py-1 rounded-full border border-[#4285F4]/20">Cloud Native</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#4285F4] transition-colors">Cloud Architecture &rarr;</h3>
            <p className="text-[var(--text-secondary)] font-medium text-sm">Explore how our cloud infrastructure powers the Annapurna platform end-to-end.</p>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
