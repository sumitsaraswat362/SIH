"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Leaf, Shield, Zap, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function FooterCTA() {
  const { user } = useAuth();
  const targetPath = user 
    ? (user.role === 'farmer' ? '/farmer/dashboard' : '/buyer')
    : '/login';

  return (
    <footer className="relative bg-[var(--bg-primary)] overflow-hidden">
      {/* CTA Section */}
      <div className="relative py-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#34C759]/15 to-[#007AFF]/15 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-5"
          >
            Ready to trade directly?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl mx-auto"
          >
            Join thousands of farmers and buyers trading directly. Fair prices. No middlemen. AI-powered negotiation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              href={targetPath}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#34C759] hover:bg-[#2DB84E] text-white rounded-full font-bold text-lg transition-all shadow-[0_8px_30px_rgba(52,199,89,0.3)] hover:shadow-[0_12px_40px_rgba(52,199,89,0.4)] hover:-translate-y-1"
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="border-t border-[var(--separator)] bg-[var(--fill-secondary)]">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Leaf, label: "Farmers Onboarded", value: "2,450+" },
            { icon: Shield, label: "MSP Protected", value: "100%" },
            { icon: Zap, label: "Avg. Price Gain", value: "+38%" },
            { icon: Globe, label: "States Covered", value: "12" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 mx-auto mb-2 text-[#34C759]" />
              <p className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-xs font-semibold text-[var(--text-tertiary)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--separator)] bg-[var(--bg-primary)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#34C759]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">Annapurna</span>
            <span className="text-xs text-[var(--text-tertiary)]">© 2026</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)] font-medium">
            <span>SIH Problem Statement 26033</span>
            <span>•</span>
            <span>Ministry of Consumer Affairs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
