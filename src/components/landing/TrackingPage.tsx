import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { AlertTriangle, MapPin, Activity, ShieldCheck, Terminal, Cpu } from "lucide-react";

export function TrackingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const yParallax1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yParallax2 = useTransform(scrollYProgress, [0, 1], [100, -50]);
  const yParallax3 = useTransform(scrollYProgress, [0, 1], [200, -100]);

  // MonitorAgent real-time logs
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const messages = [
      "MonitorAgent initialized...",
      "Connecting to vehicle telemetry...",
      "Unit 04: Temp nominal at -18°C.",
      "Analyzing route efficiency...",
      "Traffic anomaly detected on NH-48.",
      "Rerouting suggestions generated."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev, messages[i]];
        if (newLogs.length > 3) newLogs.shift();
        return newLogs;
      });
      i = (i + 1) % messages.length;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative w-full h-[150vh] overflow-hidden bg-[#0a0a0a]"
      ref={containerRef}
    >
      {/* Hero Text */}
      <div className="absolute top-24 left-0 w-full text-center z-30 pointer-events-none px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        >
          <Cpu className="w-4 h-4" />
          <span>MonitorAgent Active</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-sm"
        >
          Unprecedented <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Visibility.</span>
        </motion.h1>
      </div>

      {/* Cinematic Map Background */}
      <div className="sticky top-0 left-0 w-full h-screen z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0a] z-0" />
        <img 
          src="https://images.unsplash.com/photo-1544411047-c491e34a24e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbWFwJTIwbmlnaHQlMjB2aWV3fGVufDF8fHx8MTc4MTE1NjM2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Dark Map"
          className="relative z-10 w-full h-full object-cover opacity-40 mix-blend-screen scale-110 [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none" />
        
        {/* Glowing Route Line (SVG) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <svg className="w-full h-full max-w-5xl" viewBox="0 0 800 600" fill="none" preserveAspectRatio="xMidYMid meet">
            {/* Base faded line */}
            <path 
              d="M100,500 Q300,450 400,300 T700,100" 
              stroke="rgba(56, 189, 248, 0.1)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              fill="none" 
            />
            {/* Animated glowing line */}
            <motion.path 
              d="M100,500 Q300,450 400,300 T700,100" 
              stroke="#38bdf8" 
              strokeWidth="6" 
              strokeLinecap="round" 
              fill="none" 
              style={{ pathLength }}
              className="drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]"
            />
            <circle cx="100" cy="500" r="8" fill="#38bdf8" className="drop-shadow-[0_0_15px_rgba(56,189,248,1)]" />
            <circle cx="700" cy="100" r="8" fill="#34d399" className="drop-shadow-[0_0_15px_rgba(52,211,153,1)]" />
          </svg>
        </div>

        {/* 3D Parallax UI Widgets */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center max-w-[1200px] mx-auto">
          
          {/* MonitorAgent Live Terminal */}
          <motion.div 
            style={{ y: yParallax3 }}
            className="absolute left-[50%] md:left-[55%] top-[20%] md:top-[25%] -translate-x-1/2 bg-black/60 border border-white/10 rounded-2xl p-4 w-[280px] md:w-[320px] pointer-events-auto backdrop-blur-xl shadow-[0_0_30px_rgba(56,189,248,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
            <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <Terminal className="text-blue-400 w-4 h-4" />
              <span className="text-white text-xs font-mono font-bold tracking-wider uppercase">MonitorAgent Stream</span>
              <span className="ml-auto flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            </div>
            <div className="space-y-2 h-[72px] overflow-hidden flex flex-col justify-end">
              {logs.map((log, index) => (
                <motion.div 
                  key={log + index} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="text-xs font-mono text-emerald-400/90"
                >
                  &gt; {log}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cargo Health Monitor */}
          <motion.div 
            style={{ y: yParallax1 }}
            className="absolute left-[5%] md:left-[15%] top-[30%] md:top-[40%] bg-black/50 border border-white/10 backdrop-blur-xl rounded-[32px] p-6 w-[240px] md:w-[280px] pointer-events-auto shadow-[0_20px_40px_rgba(0,0,0,0.5)] group hover:bg-white/5 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-[32px] pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="text-white font-bold text-base md:text-lg">Cargo Health</span>
              <ShieldCheck className="text-emerald-400 w-5 h-5" />
            </div>
            
            <div className="relative flex items-center justify-center py-4 z-10">
              {/* Ring Chart */}
              <svg className="w-28 h-28 md:w-32 md:h-32 transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                <motion.circle 
                  cx="50%" cy="50%" r="45%" 
                  stroke="#34d399" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="351.85" 
                  strokeDashoffset="351.85"
                  animate={{ strokeDashoffset: 351.85 * 0.02 }} // 98%
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  className="drop-shadow-[0_0_10px_rgba(52,211,153,0.6)] stroke-round"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-extrabold text-white">98%</span>
                <span className="text-[10px] md:text-xs font-bold uppercase text-emerald-400">Optimal</span>
              </div>
            </div>
          </motion.div>

          {/* Temperature Alert Card */}
          <motion.div 
            style={{ y: yParallax2 }}
            className="absolute right-[5%] md:right-[15%] top-[65%] md:top-[60%] bg-black/60 border border-red-500/30 backdrop-blur-xl rounded-[32px] p-5 md:p-6 w-[220px] md:w-[260px] pointer-events-auto shadow-[0_20px_40px_rgba(239,68,68,0.2)] group hover:bg-red-500/5 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-tl from-red-500/10 to-transparent rounded-[32px] pointer-events-none" />
            <div className="flex items-center space-x-3 mb-2 relative z-10">
              <div className="bg-red-500/20 p-2 rounded-full border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="text-red-400 w-5 h-5 animate-pulse" />
              </div>
              <span className="text-red-400 font-bold text-sm tracking-wide uppercase">AI Alert</span>
            </div>
            <h3 className="text-white text-xl font-bold mt-3 mb-1 relative z-10">Temp Anomaly</h3>
            <div className="flex items-baseline space-x-1 relative z-10">
              <span className="text-4xl font-extrabold text-white tracking-tight">18.5</span>
              <span className="text-red-400 font-bold text-lg">°C</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm relative z-10">
              <span className="text-gray-400 font-medium">Unit 04</span>
              <span className="text-red-400 font-bold font-mono bg-red-500/10 px-2 py-1 rounded">Rerouting</span>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
