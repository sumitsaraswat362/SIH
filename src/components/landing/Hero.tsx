import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Text fades out first
  const textY = useTransform(scrollYProgress, [0, 0.4], ["0%", "40%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // === DEVICE EXIT ANIMATIONS ===
  // Each device slides out in its own direction + fades out.
  // We want the fade to happen near the end of the scroll (0.6 - 0.9)
  const scale = useTransform(scrollYProgress, [0, 0.9], [1.2, 1.4]);

  // MacBook → slides OUT to the LEFT
  const macX = useTransform(scrollYProgress, [0.4, 0.9], ["0%", "-20%"]);
  const macOpacity = useTransform(scrollYProgress, [0.5, 0.9], [1, 0]);

  // iPad → slides OUT to the TOP
  const ipadY = useTransform(scrollYProgress, [0.4, 0.9], ["0%", "-20%"]);
  const ipadOpacity = useTransform(scrollYProgress, [0.5, 0.9], [1, 0]);

  // iPhone → slides OUT to the RIGHT
  const iphoneX = useTransform(scrollYProgress, [0.4, 0.9], ["0%", "20%"]);
  const iphoneOpacity = useTransform(scrollYProgress, [0.5, 0.9], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[150vh] w-full overflow-x-clip" style={{ zIndex: 10 }}>
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pt-32 px-6" style={{ overflow: "visible" }}>
        {/* Hero Text */}
        <motion.div 
          className="max-w-4xl mx-auto text-center mt-56 md:mt-64"
          style={{ y: textY, opacity: textOpacity, zIndex: 10 }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl md:text-8xl font-semibold tracking-tighter mb-4 md:mb-6 text-[var(--text-primary)] drop-shadow-sm pb-2 leading-tight">
            Autonomous <br /> Multi-Agent AI.
          </h1>
          <p className="text-xl text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">
            The ultimate Autonomous Agent Nerve Center for direct trade. 40% earnings increase, 3-4 middlemen eliminated, with &lt;90 second AI matching.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-10">
            <a href="/nerve-center" className="relative group rounded-full">
              <span className="absolute -inset-0.5 bg-gradient-to-r from-[#007AFF] to-[#34C759] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></span>
              <span className="relative flex items-center justify-center px-8 py-4 bg-[var(--bg-primary)] rounded-full text-[var(--text-primary)] font-bold tracking-wide border border-[var(--separator)] group-hover:bg-[var(--fill-secondary)] transition-colors shadow-xl">
                See How It Works (Nerve Center)
              </span>
            </a>
            <a href="/analytics" className="relative group rounded-full">
              <span className="absolute -inset-0.5 bg-gradient-to-r from-[#FF2D55] to-[#5E5CE6] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></span>
              <span className="relative flex items-center justify-center px-8 py-4 bg-[var(--bg-primary)] rounded-full text-[var(--text-primary)] font-bold tracking-wide border border-[var(--separator)] group-hover:bg-[var(--fill-secondary)] transition-colors shadow-xl">
                View Market Analytics
              </span>
            </a>
          </div>
        </motion.div>

        {/* Device Mockups — transparent PNGs, no blend modes */}
        <motion.div 
          className="mt-12 md:mt-24 w-full max-w-[1400px] max-md:h-[380px] md:aspect-[21/9] mx-auto flex justify-center relative" 
          style={{ zIndex: 20, scale, transformOrigin: "top center" }}
        >
          
          {/* MacBook — exits LEFT */}
          <motion.div 
            className="absolute left-0 md:left-0 top-[5%] md:top-[10%] w-[100%] md:w-[85%] aspect-[16/9]"
            style={{ x: macX, opacity: macOpacity }}
          >
            <img src="/images/macbook_hardware.png" alt="MacBook Marketplace Dashboard" className="w-full h-full object-contain drop-shadow-2xl" />
          </motion.div>

          {/* iPad — exits UP */}
          <motion.div 
            className="absolute right-[5%] md:right-[5%] bottom-[5%] md:bottom-[0%] w-[60%] md:w-[55%] aspect-[4/3]"
            style={{ y: ipadY, opacity: ipadOpacity }}
          >
            <img src="/images/ipad_hardware.png" alt="iPad Marketplace Dashboard" className="w-full h-full object-contain drop-shadow-2xl" />
          </motion.div>

          {/* iPhone — exits RIGHT */}
          <motion.div 
            className="absolute right-[0%] md:right-[0%] bottom-[10%] md:bottom-[0%] w-[35%] md:w-[25%] aspect-[9/16]"
            style={{ x: iphoneX, opacity: iphoneOpacity }}
          >
            <img src="/images/iphone_hardware.png" alt="iPhone Direct Trade App" className="w-full h-full object-contain drop-shadow-2xl" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
