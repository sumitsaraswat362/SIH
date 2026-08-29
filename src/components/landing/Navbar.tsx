import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";

export function Navbar() {
  const { scrollY } = useScroll();
  
  // Contracts on scroll
  const width = useTransform(scrollY, [0, 100], ["100%", "70%"]);
  const top = useTransform(scrollY, [0, 100], ["0px", "24px"]);
  const borderRadius = useTransform(scrollY, [0, 100], ["0px", "9999px"]);
  const paddingY = useTransform(scrollY, [0, 100], ["20px", "12px"]);
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.4]);

  return (
    <motion.div 
      className="fixed z-50 flex justify-center left-0 right-0 mx-auto max-w-7xl"
      style={{ top, width }}
    >
      <motion.nav 
        className="w-full flex items-center justify-between px-6 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden"
        style={{ 
          borderRadius, 
          paddingTop: paddingY,
          paddingBottom: paddingY,
          backgroundColor: useTransform(bgOpacity, v => `rgba(10, 10, 10, ${v})`)
        }}
      >
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007AFF] to-[#34C759] flex items-center justify-center text-xs font-bold text-black">A</div>
          <span className="text-xl font-semibold tracking-tight text-white/90">Annapurna</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/tracking" className="hover:text-white transition-colors">Tracking</Link>
          <Link href="/bidding" className="hover:text-white transition-colors">Bidding</Link>
        </div>

        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/login" className="px-5 py-2.5 rounded-full bg-gradient-to-b from-[#0A84FF] to-[#005DEB] shadow-[inset_0px_1px_1px_rgba(255,255,255,0.4)] hover:opacity-90 transition-opacity text-white">
            Login / Use App
          </Link>
        </div>
      </motion.nav>
    </motion.div>
  );
}
