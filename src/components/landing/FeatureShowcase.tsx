import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ShieldAlert, Navigation2, ThermometerSnowflake, Activity } from "lucide-react";

export function FeatureShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Slide up for the cards
  const card1Y = useTransform(scrollYProgress, [0, 0.5], ["150%", "-50%"]);
  const card2Y = useTransform(scrollYProgress, [0.2, 0.7], ["150%", "-50%"]);
  
  const card1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);
  const card2Opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative h-[200vh] w-full" style={{ zIndex: 20 }}>
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Pinned Text */}
        <div className="flex-1 w-full flex flex-col justify-center h-full z-20">
          <motion.h2 
            className="text-4xl md:text-6xl font-semibold tracking-tight text-[var(--text-primary)] leading-tight max-w-xl drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Real-Time Market Tracking <br/>
            <span className="text-[var(--text-tertiary)]">& Produce Quality Control.</span>
          </motion.h2>
          <motion.p 
            className="mt-6 text-lg text-[var(--text-secondary)] font-medium max-w-md"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Monitor thousands of agricultural trades with pinpoint accuracy. Powered by real-time database sync, AI instantly matches produce with buyers, increasing earnings before crops spoil.
          </motion.p>
        </div>

        {/* Sliding Cards */}
        <div className="flex-1 w-full h-full relative mt-12 md:mt-0" style={{ perspective: "1000px" }}>
          
          {/* Card 1: Map & Truck */}
          <motion.div 
            className="absolute top-1/2 left-1/2 w-full max-w-md glass rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,122,255,0.15)] dark:shadow-[0_0_50px_rgba(0,122,255,0.1)]"
            style={{ x: "-50%", y: card1Y, opacity: card1Opacity, rotateX: 5, rotateY: -10 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 dark:bg-[#007AFF]/20 flex items-center justify-center border border-[#007AFF]/20">
                <Navigation2 className="text-[#007AFF] w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] font-bold">Live Match Optimization</h3>
                <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Active • Updating every 2s</p>
              </div>
            </div>
            
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--separator)] shadow-sm">
              <ImageWithFallback src="https://images.unsplash.com/photo-1744726665148-3bee1ee86cbd?q=80&w=800" alt="Map Route" className="w-full h-full object-cover opacity-80" />
              
              {/* Overlay Truck icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-[var(--separator)]">
                  TRK-442
                </div>
                <div className="w-4 h-4 bg-[#007AFF] rounded-full shadow-[0_0_15px_rgba(0,122,255,0.8)] border-2 border-white dark:border-[#1c1c1e]" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Temperature & AI Alert */}
          <motion.div 
            className="absolute top-1/2 left-1/2 w-full max-w-md glass rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(255,59,48,0.15)] dark:shadow-[0_0_50px_rgba(255,59,48,0.1)]"
            style={{ x: "-50%", y: card2Y, opacity: card2Opacity, rotateX: -5, rotateY: 10, zIndex: 10 }}
          >
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 flex items-center justify-center border border-[#FF3B30]/20">
                  <ThermometerSnowflake className="text-[#FF3B30] w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[var(--text-primary)] font-bold">Produce Quality Integrity</h3>
                  <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Zone 4 • Seafood</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldAlert className="w-3 h-3 text-[#FF3B30]" />
                <span className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-wider">Warning</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-end justify-between px-2">
                <div>
                  <div className="text-4xl font-bold text-[var(--text-primary)]">-2<span className="text-2xl text-[var(--text-tertiary)]">°C</span></div>
                  <div className="text-xs font-bold text-[#FF3B30] mt-1">+4°C deviation predicted</div>
                </div>
                <Activity className="w-12 h-12 text-[#FF3B30]/30 dark:text-[#FF3B30]/50" />
              </div>
              
              <div className="w-full h-2.5 bg-[var(--fill-secondary)] rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-[#34C759] w-1/3" />
                <div className="h-full bg-[#FFCC00] w-1/3" />
                <div className="h-full bg-[#FF3B30] w-[10%]" />
              </div>
              
              <div className="bg-[#FF3B30]/5 rounded-xl p-3 flex gap-3 items-center border border-[#FF3B30]/20 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
                <p className="text-xs font-semibold text-[var(--text-secondary)]">AI suggests immediate selling to nearest buyer. ETA: 12 mins.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
