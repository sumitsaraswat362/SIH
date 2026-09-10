import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FooterCTA() {
  return (
    <footer className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Cinematic Blue Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <motion.div 
          className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#007AFF] rounded-full mix-blend-screen filter blur-[100px] opacity-[0.15] dark:opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#0A84FF] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.1] dark:opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        <motion.h2 
          className="text-5xl md:text-7xl font-semibold tracking-tighter text-[var(--text-primary)] mb-8 leading-tight drop-shadow-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Ready to revolutionize <br /> your agricultural trade?
        </motion.h2>

        <motion.p 
          className="text-xl text-[var(--text-secondary)] font-medium mb-12 max-w-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Join thousands of farmers in maximizing earnings and eliminating middlemen with Annapurna's AI marketplace.
        </motion.p>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link 
            href="/login"
            className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#0A84FF] to-[#005DEB] rounded-full text-white text-lg font-bold shadow-[inset_0px_1px_1px_rgba(255,255,255,0.4),0_10px_40px_rgba(0,122,255,0.3)] overflow-hidden"
          >
            <span className="relative z-10">Launch Dashboard</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            
            {/* Pulsing effect on hover inside button */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Link>
        </motion.div>
      </div>
      
      {/* Footer Links */}
      <div className="absolute bottom-8 w-full px-12 flex justify-between items-center text-xs font-bold text-[var(--text-tertiary)] z-10">
        <div>© 2026 Annapurna. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">System Status</a>
        </div>
      </div>
    </footer>
  );
}
