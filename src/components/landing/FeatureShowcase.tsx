import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { TrendingUp, ShieldCheck, Camera, Mic, Network, LineChart } from "lucide-react";

export function FeatureShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const cards = [
    {
      title: "AI Demand Forecasting",
      desc: "ARIMA-powered price predictions help farmers know when to sell for maximum profit. 14-day crop demand forecasting by region.",
      icon: TrendingUp,
      color: "#007AFF"
    },
    {
      title: "Zero Middlemen, Fair Prices",
      desc: "Direct farmer-to-buyer transactions with MSP-protected pricing. Farmers earn 40% more than traditional mandi rates.",
      icon: ShieldCheck,
      color: "#34C759"
    },
    {
      title: "Vision AI Quality Grading",
      desc: "Upload a harvest photo — Gemini multimodal AI grades freshness, size, and defects automatically. Buyers get verified quality badges.",
      icon: Camera,
      color: "#AF52DE"
    },
    {
      title: "Multilingual Voice Interface",
      desc: "Farmers can list produce by speaking in Hindi, Marathi, Tamil, Telugu, or Kannada. No literacy required.",
      icon: Mic,
      color: "#FF9500"
    },
    {
      title: "Smart AI Matchmaking",
      desc: "5-agent AI system autonomously matches farmers with the best buyers based on price, distance, quantity, quality, and delivery preferences.",
      icon: Network,
      color: "#FF3B30"
    },
    {
      title: "Real-time Mandi Prices",
      desc: "Live prices from data.gov.in API. Compare your selling price vs APMC mandi rates and retail prices instantly.",
      icon: LineChart,
      color: "#5AC8FA"
    }
  ];

  return (
    <section ref={containerRef} className="relative h-[400vh] w-full" style={{ zIndex: 20 }}>
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Pinned Text */}
        <div className="flex-1 w-full flex flex-col justify-center h-full z-20 md:pr-12">
          <motion.h2 
            className="text-4xl md:text-6xl font-semibold tracking-tight text-[var(--text-primary)] leading-tight max-w-xl drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Empowering Farmers <br/>
            <span className="text-[var(--text-tertiary)]">with AI & Direct Access.</span>
          </motion.h2>
          <motion.p 
            className="mt-6 text-lg text-[var(--text-secondary)] font-medium max-w-md"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            A complete ecosystem designed to eliminate middlemen, guarantee fair pricing, and connect you directly with wholesale buyers.
          </motion.p>
        </div>

        {/* Sliding Cards */}
        <div className="flex-1 w-full h-full relative mt-12 md:mt-0 flex flex-col items-center justify-center" style={{ perspective: "1000px" }}>
          {cards.map((card, idx) => {
            // Distribute animations across the 400vh scroll
            // 6 cards total -> each gets a segment
            const start = idx * 0.12;
            const end = start + 0.25;
            
            const y = useTransform(scrollYProgress, [start, end], ["150%", "-100%"]);
            const opacity = useTransform(scrollYProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
            const rotateX = useTransform(scrollYProgress, [start, end], [10, -10]);

            return (
              <motion.div 
                key={idx}
                className="absolute top-1/2 left-1/2 w-full max-w-md glass rounded-[2rem] p-8 shadow-2xl bg-white/10 dark:bg-black/10 backdrop-blur-3xl border border-[var(--separator)]"
                style={{ 
                  x: "-50%", 
                  y, 
                  opacity, 
                  rotateX,
                  boxShadow: `0 20px 50px ${card.color}15` 
                }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner" 
                    style={{ backgroundColor: `${card.color}15`, borderColor: `${card.color}30` }}
                  >
                    <card.icon className="w-7 h-7" style={{ color: card.color }} />
                  </div>
                  <h3 className="text-xl text-[var(--text-primary)] font-bold">{card.title}</h3>
                </div>
                <p className="text-[var(--text-secondary)] font-medium leading-relaxed text-lg">
                  {card.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
