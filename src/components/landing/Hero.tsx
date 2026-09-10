"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Mockups parallax
  const yMacBook = useTransform(scrollYProgress, [0, 1], [100, -50]);
  const yIPad = useTransform(scrollYProgress, [0, 1], [200, -100]);
  const yIPhone = useTransform(scrollYProgress, [0, 1], [300, -150]);

  const targetPath = user 
    ? (user.role === 'farmer' ? '/farmer/dashboard' : '/buyer')
    : '/login';

  return (
    <div ref={containerRef} className="relative min-h-[120vh] bg-[var(--bg-primary)] overflow-hidden font-sans pt-32 lg:pt-40">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#34C759]/20 to-[#007AFF]/20 blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-br from-[#FF9500]/20 to-[#FFCC00]/20 blur-[100px]" />
      </div>

      <motion.div 
        style={{ y: yText, opacity: opacityText }}
        className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] mb-6 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#FF9500]" />
          <span className="text-xs font-bold text-[var(--text-secondary)] tracking-wide uppercase">SIH 26033 Winner</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-[var(--text-primary)] leading-[1.1] mb-6"
        >
          Direct Farm Trade. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#34C759] to-[#007AFF]">
            AI Powered.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] font-medium max-w-2xl mb-10 leading-relaxed"
        >
          Connect directly with buyers, negotiate using AI, and protect your margins with real-time Mandi price intelligence. No middlemen. No hidden fees.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link 
            href={targetPath}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#34C759] hover:bg-[#2DB84E] text-white rounded-full font-bold text-lg transition-all shadow-[0_8px_30px_rgba(52,199,89,0.3)] hover:shadow-[0_12px_40px_rgba(52,199,89,0.4)] hover:-translate-y-1 w-full sm:w-auto"
          >
            {user ? "Go to Dashboard" : "Get Started Now"}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm font-semibold text-[var(--text-tertiary)] hidden sm:block">
            Free forever for Farmers
          </p>
        </motion.div>
      </motion.div>

      {/* Device Mockups (Abstracted UI) */}
      <div className="relative z-20 mt-20 md:mt-32 w-full max-w-6xl mx-auto px-4 h-[600px] pointer-events-none">
        
        {/* Main Dashboard (MacBook style) */}
        <motion.div 
          style={{ y: yMacBook }}
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[90%] md:w-[800px] h-[500px] rounded-[24px] bg-[var(--bg-primary)] border border-[var(--separator)] shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="h-10 bg-[var(--fill-secondary)] border-b border-[var(--separator)] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4 bg-[var(--bg-primary)]">
            <div className="w-1/3 h-8 rounded-lg bg-[var(--fill-secondary)] animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 rounded-xl bg-gradient-to-br from-[#34C759]/10 to-[#30D158]/5 border border-[#34C759]/20" />
              <div className="h-24 rounded-xl bg-gradient-to-br from-[#007AFF]/10 to-[#5AC8FA]/5 border border-[#007AFF]/20" />
              <div className="h-24 rounded-xl bg-[var(--fill-secondary)]" />
            </div>
            <div className="flex-1 rounded-xl bg-[var(--fill-secondary)]" />
          </div>
        </motion.div>

        {/* Mobile View (iPhone style) */}
        <motion.div 
          style={{ y: yIPhone }}
          className="absolute right-[5%] md:right-[15%] top-[150px] w-[280px] h-[560px] rounded-[40px] bg-[var(--bg-primary)] border-[8px] border-[var(--separator)] shadow-2xl overflow-hidden hidden sm:flex flex-col"
        >
          <div className="flex-1 p-4 flex flex-col gap-3 bg-[var(--bg-primary)]">
            <div className="h-10 rounded-full bg-[var(--fill-secondary)] flex items-center px-4 gap-2">
              <div className="w-4 h-4 rounded-full bg-[#34C759]" />
              <div className="w-2/3 h-2 rounded-full bg-[var(--text-tertiary)]" />
            </div>
            <div className="h-[200px] rounded-2xl bg-gradient-to-br from-[#FF9500]/20 to-transparent" />
            <div className="h-16 rounded-2xl bg-[var(--fill-secondary)]" />
            <div className="h-16 rounded-2xl bg-[var(--fill-secondary)]" />
            <div className="mt-auto h-12 rounded-full bg-[#34C759]" />
          </div>
        </motion.div>

      </div>
      
      {/* Bottom fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg-primary)] to-transparent z-30" />
    </div>
  );
}
