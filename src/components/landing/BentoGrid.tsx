import { motion } from "motion/react";
import { MouseEvent, useState } from "react";
import { TrendingDown, TrendingUp, Cpu, Users, Clock, Languages } from "lucide-react";

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
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section className="relative py-24 md:py-32 px-6 w-full max-w-7xl mx-auto z-20" id="impact">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)] mb-4">
          Transforming Indian Agriculture. <br/> <span className="text-[var(--text-tertiary)]">By the numbers.</span>
        </h2>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        onMouseMove={handleMouseMove}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        style={{ "--mouse-x": `${mousePos.x}px`, "--mouse-y": `${mousePos.y}px` } as React.CSSProperties}
      >
        
        {/* Box 1: 92,000 Cr */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 row-span-2 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] p-8 relative overflow-hidden group min-h-[400px]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,59,48,0.1), transparent 40%)" }} />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-12 h-12 bg-[#FF3B30]/10 rounded-xl flex items-center justify-center mb-6 border border-[#FF3B30]/20">
                <TrendingDown className="text-[#FF3B30] w-6 h-6" />
              </div>
              <h3 className="text-6xl md:text-8xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tighter">₹92,000<span className="text-4xl text-[var(--text-tertiary)]">Cr</span></h3>
              <p className="text-xl text-[var(--text-secondary)] font-medium max-w-md">Annual farmer loss to intermediaries and broken supply chains (Shanta Kumar Committee).</p>
            </div>
          </div>
        </motion.div>

        {/* Box 2: 40% */}
        <motion.div variants={itemVariants} className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] p-8 relative overflow-hidden group min-h-[300px]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(52,199,89,0.1), transparent 40%)" }} />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#34C759]/10 rounded-xl flex items-center justify-center mb-6 border border-[#34C759]/20">
              <TrendingUp className="text-[#34C759] w-6 h-6" />
            </div>
            <h3 className="text-5xl font-extrabold text-[#34C759] mb-2">+40%</h3>
            <p className="text-[var(--text-secondary)] font-medium">Average farmer earnings increase on Annapurna vs traditional mandi.</p>
          </div>
        </motion.div>

        {/* Box 3: 5 AI Agents */}
        <motion.div variants={itemVariants} className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] p-8 relative overflow-hidden group min-h-[300px]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0,122,255,0.1), transparent 40%)" }} />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#007AFF]/10 rounded-xl flex items-center justify-center mb-6 border border-[#007AFF]/20">
              <Cpu className="text-[#007AFF] w-6 h-6" />
            </div>
            <h3 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2">5 AI Agents</h3>
            <p className="text-[var(--text-secondary)] font-medium">Autonomous multi-agent system for matching, negotiation, and forecasting.</p>
          </div>
        </motion.div>

        {/* Box 4: 14 Crore */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] p-8 relative overflow-hidden group min-h-[300px]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(175,82,222,0.1), transparent 40%)" }} />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#AF52DE]/10 rounded-xl flex items-center justify-center mb-6 border border-[#AF52DE]/20">
              <Users className="text-[#AF52DE] w-6 h-6" />
            </div>
            <h3 className="text-5xl md:text-6xl font-extrabold text-[var(--text-primary)] mb-2 tracking-tight">14 Crore</h3>
            <p className="text-xl text-[var(--text-secondary)] font-medium">Farmers in India who can benefit from direct market access and MSP protection.</p>
          </div>
        </motion.div>

        {/* Box 5: < 90 sec */}
        <motion.div variants={itemVariants} className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] p-8 relative overflow-hidden group min-h-[300px]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,149,0,0.1), transparent 40%)" }} />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#FF9500]/10 rounded-xl flex items-center justify-center mb-6 border border-[#FF9500]/20">
              <Clock className="text-[#FF9500] w-6 h-6" />
            </div>
            <h3 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2">&lt; 90 sec</h3>
            <p className="text-[var(--text-secondary)] font-medium">Average time from produce listing to first wholesale buyer match.</p>
          </div>
        </motion.div>

        {/* Box 6: 9 Languages */}
        <motion.div variants={itemVariants} className="col-span-1 glass bg-white/10 dark:bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] p-8 relative overflow-hidden group min-h-[300px]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(90,200,250,0.1), transparent 40%)" }} />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#5AC8FA]/10 rounded-xl flex items-center justify-center mb-6 border border-[#5AC8FA]/20">
              <Languages className="text-[#5AC8FA] w-6 h-6" />
            </div>
            <h3 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2">9 Languages</h3>
            <p className="text-[var(--text-secondary)] font-medium">Hindi, Marathi, Tamil, Telugu, Kannada, Punjabi, Gujarati, Bengali, English.</p>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
