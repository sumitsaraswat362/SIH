import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, BrainCircuit, Database, Server } from 'lucide-react';
import Link from 'next/link';

export const CloudArchitectureSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium text-sm mb-6"
          >
            <Cloud className="w-4 h-4" />
            100% Cloud Native
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Powered by Enterprise Infrastructure
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg"
          >
            Annapurna leverages cutting-edge AI and data processing capabilities to match farmers directly with buyers in milliseconds.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <BrainCircuit className="w-8 h-8 text-purple-500" />,
              title: "AI Agents",
              desc: "Autonomous negotiation and legal risk analysis powered by Annapurna Neural Engine, executing real-time routing decisions."
            },
            {
              icon: <Database className="w-8 h-8 text-emerald-500" />,
              title: "ML Forecasting",
              desc: "ARIMA forecasting models predicting spoilage risk windows 14 days in advance using massive historical telematics data."
            },
            {
              icon: <Server className="w-8 h-8 text-blue-500" />,
              title: "Cloud Infrastructure",
              desc: "Massively scalable containerized architecture serving real-time geospatial intelligence and sub-second cross-device state synchronization."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (i + 1) }}
              className="p-8 rounded-3xl bg-[var(--fill-secondary)]/50 border border-[var(--separator)] backdrop-blur-xl hover:bg-[var(--fill-secondary)] transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-[var(--separator)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link href="/architecture">
            <button className="btn-primary-ios group">
              Explore the Cloud Stack
              <svg 
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
