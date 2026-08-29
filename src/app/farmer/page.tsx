"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, IndianRupee, Truck, Send, Leaf, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function FarmerDashboard() {
  const [listed, setListed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans p-6 md:p-12 relative overflow-hidden aura-container">
      {/* Background Aura */}
      <div className="aura-orb aura-green w-[70vw] h-[70vh] top-[-10%] left-[-10%] opacity-40 blur-[100px]" />
      <div className="aura-orb aura-blue w-[50vw] h-[50vw] bottom-[-10%] right-[-10%] opacity-30 blur-[120px]" />
      
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-12 relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center shadow-lg backdrop-blur-md">
            <Leaf className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Farmer Dashboard
            </h1>
            <p className="text-xs text-[var(--text-secondary)] tracking-widest uppercase font-semibold mt-1">Direct Sales Portal</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm text-[var(--text-secondary)]">Total Earnings Increase</p>
            <p className="text-xl font-bold text-green-400">+ ₹12,450 vs Mandi</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] flex items-center justify-center text-green-500 shadow-inner">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        
        {/* Story Section */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              List Your Harvest. <br />
              <span className="text-green-400">Bypass the Middlemen.</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              Our AI automatically matches your fresh produce with direct buyers, negotiates the best price, and secures your delivery—increasing your earnings by up to 25%.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: 1, title: 'List Produce', desc: 'Snap a picture and tell us the quantity.', icon: Camera },
              { step: 2, title: 'AI Matches Buyer', desc: 'We instantly find verified buyers who need your specific crop.', icon: Send },
              { step: 3, title: 'Price Negotiated', desc: 'Our agents secure a premium over local mandi prices.', icon: IndianRupee },
              { step: 4, title: 'Earnings Increased', desc: 'Shipment is arranged, and money hits your account fast.', icon: Truck },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--fill-secondary)] border border-[var(--separator)] hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.step}. {item.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Listing Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
          
          {listed ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Harvest Listed!</h3>
              <p className="text-[var(--text-secondary)]">AI is currently negotiating with 3 active buyers.<br />You will be notified once a match is confirmed.</p>
              <button 
                onClick={() => setListed(false)}
                className="mt-6 px-6 py-2 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] hover:bg-white/10 transition-all font-bold"
              >
                List Another Item
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setListed(true); }} className="relative z-10 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">List Your Harvest</h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                  Live AI Matching
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Produce Type</label>
                  <select className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50">
                    <option>Tomatoes</option>
                    <option>Mangoes</option>
                    <option>Onions</option>
                    <option>Potatoes</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Quantity (Kg)</label>
                    <input type="number" placeholder="500" className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Min Price (₹/Kg)</label>
                    <input type="number" placeholder="25" className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Quality Proof</label>
                  <div className="border-2 border-dashed border-[var(--separator)] rounded-xl p-8 flex flex-col items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--fill-secondary)] transition-colors cursor-pointer group">
                    <Camera className="w-8 h-8 mb-2 group-hover:text-green-400 transition-colors" />
                    <span className="text-sm font-medium">Upload photo of harvest</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--separator)]">
                <div className="flex justify-between items-center mb-6 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MapPin className="w-4 h-4" />
                    Current Mandi Price: 
                  </div>
                  <div className="font-bold text-red-400">₹18/kg</div>
                </div>

                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Activate AI Matching
                </button>
              </div>
            </form>
          )}
        </motion.div>

      </main>
    </div>
  );
}
