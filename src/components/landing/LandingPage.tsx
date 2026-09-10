import { Hero } from "./Hero";
import { FloatingNav } from "./FloatingNav";
import { FeatureShowcase } from "./FeatureShowcase";
import { BentoGrid } from "./BentoGrid";
import { FooterCTA } from "./FooterCTA";
import { CloudArchitectureSection } from "./CloudArchitectureSection";

export function LandingPage() {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] font-sans font-['Inter'] aura-container relative overflow-x-hidden">
      {/* Background Mesh Gradients */}
      <div className="aura-orb aura-blue w-[50%] h-[50%] top-[-20%] left-[-10%] opacity-40 blur-[120px]" />
      <div className="aura-orb aura-green w-[40%] h-[40%] bottom-[-10%] right-[-10%] opacity-30 blur-[100px]" />
      
      <FloatingNav activeTab="home" />
      <main className="relative z-10">
        <Hero />
        {/* Buffer space so devices in Hero never get cut by next section */}
        <div className="h-[10vh] w-full" />
        <FeatureShowcase />
        <BentoGrid />
        <CloudArchitectureSection />
      </main>
      <FooterCTA />
    </div>
  );
}
