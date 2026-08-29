import { motion } from "motion/react";
import { Check, Cpu, X, Zap, Network } from "lucide-react";

export function BiddingPage() {
  const bids = [
    { id: 1, origin: "Mumbai, MH", dest: "Delhi, DL", weight: "4,800 kg", price: "₹45", total: "₹220K" },
    { id: 2, origin: "Bengaluru, KA", dest: "Chennai, TN", weight: "2,200 kg", price: "₹62", total: "₹136K" },
    { id: 3, origin: "Pune, MH", dest: "Ahmedabad, GJ", weight: "6,500 kg", price: "₹38", total: "₹247K" },
  ];

  return (
    <div className="w-full px-4 md:px-8 max-w-[1400px] mx-auto pb-32">
      {/* Hero Section */}
      <div className="text-center mt-20 mb-20 md:mb-32 relative flex flex-col items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]"
        >
          <Network className="w-4 h-4" />
          <span>DecisionAgent Active</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white mb-6 drop-shadow-sm relative z-10"
        >
          The Market,<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Automated.
          </span>
        </motion.h1>
      </div>

      {/* Split Layout Section */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start">
        
        {/* Left Pinned Column */}
        <div className="w-full md:w-1/3 sticky top-28 md:top-40 z-20 py-4 md:py-0">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="pr-4"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 md:mb-6 text-white">
              Swipe to <span className="text-emerald-400">Accept.</span> <br />
              Counter with <span className="text-indigo-400">AI.</span>
            </h2>
            <p className="text-gray-400 font-medium text-base md:text-xl hidden md:block">
              Let the <strong className="text-white">DecisionAgent</strong> build instant, data-driven pricing models. 
              Drag cards to reject, or hit accept to lock in the contract instantly.
            </p>
            
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hidden md:block shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Live Agent Status</span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                &gt; Analyzing 420 active spot markets...<br />
                &gt; Calculating optimal yield margins...<br />
                &gt; DecisionAgent ready for counters.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Scrollable Column - Bids Stack */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          {bids.map((bid, index) => (
            <div key={bid.id} className="relative w-full rounded-[32px] bg-red-500 overflow-hidden">
              
              {/* Background Layer (Reject Button) */}
              <div className="absolute inset-0 flex items-center justify-end px-8 z-0">
                <div className="flex flex-col items-center justify-center text-white">
                  <div className="bg-white/20 p-3 rounded-full mb-2">
                    <X className="w-6 h-6" />
                  </div>
                  <span className="font-bold tracking-wide uppercase text-sm">Reject</span>
                </div>
              </div>

              {/* Foreground Layer (Draggable Card) */}
              <motion.div 
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                dragElastic={0.1}
                whileTap={{ cursor: "grabbing" }}
                className="relative z-10 bg-[#0a0a0a] md:bg-black/80 backdrop-blur-3xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-[32px] p-6 md:p-8 cursor-grab hover:bg-white/5 transition-colors group"
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
                  
                  {/* Left Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Spot Load
                      </span>
                      <span className="text-gray-400 font-medium text-sm">{bid.weight}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-lg">{bid.origin}</span>
                      </div>
                      <div className="h-[3px] flex-1 bg-gradient-to-r from-white/10 via-indigo-500 to-white/10 mx-2 relative rounded-full">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-white font-bold text-lg">{bid.dest}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Info (Pricing & Actions) */}
                  <div className="flex flex-col items-start md:items-end gap-4 md:pl-8 md:border-l border-white/10">
                    <div className="flex flex-col items-start md:items-end font-mono">
                      <span className="text-gray-400 font-medium text-sm mb-1">Price/kg: <span className="text-white font-bold">{bid.price}</span></span>
                      <span className="text-emerald-400 text-3xl font-extrabold tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                        {bid.total}
                      </span>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-full px-5 py-2.5 text-sm font-bold text-indigo-300 transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        <Cpu className="w-4 h-4" />
                        AI Counter
                      </button>
                      <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 rounded-full px-5 py-2.5 text-sm font-bold text-black transition-colors shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
