"use client";

import { BiddingPage } from "@/components/landing/BiddingPage";
import { FloatingNav } from "@/components/landing/FloatingNav";
import { FooterCTA } from "@/components/landing/FooterCTA";

export default function Bidding() {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] font-sans font-['Inter'] overflow-x-hidden selection:bg-[#007AFF] selection:text-white pt-28 pb-12 aura-container">
      {/* Background Mesh Gradients */}
      <div className="aura-orb aura-blue w-[50%] h-[50%] top-[-20%] left-[-10%] opacity-40 blur-[120px]" />
      <div className="aura-orb aura-green w-[40%] h-[40%] bottom-[-10%] right-[-10%] opacity-30 blur-[100px]" />
      
      <FloatingNav activeTab="bidding" />
      <BiddingPage />
      <FooterCTA />
    </div>
  );
}
