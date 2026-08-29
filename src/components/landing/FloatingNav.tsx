import { motion } from "motion/react";
import Link from "next/link";
import { Home, LayoutDashboard, Map, Gavel, Cloud } from "lucide-react";

interface FloatingNavProps {
  activeTab: "features" | "tracking" | "bidding" | "home" | "cloud-stack";
}

export function FloatingNav({ activeTab }: FloatingNavProps) {
  const tabs = [
    { id: "features", label: "Features", href: "/features", icon: LayoutDashboard },
    { id: "tracking", label: "Tracking", href: "/tracking", icon: Map },
    { id: "bidding", label: "Bidding", href: "/bidding", icon: Gavel },
    { id: "cloud-stack", label: "Cloud Stack", href: "/architecture", icon: Cloud },
  ] as const;

  return (
    <>
    <div className="fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-50 w-fit max-w-[95%] md:max-w-fit">
      <div className="flex items-center justify-between p-1 rounded-full glass border border-[var(--separator)] shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
        
        {/* Navigation Links */}
        <div className="flex items-center gap-0.5 md:gap-2">
          <Link
            href="/"
            className={`relative flex items-center justify-center px-2 py-1.5 md:px-4 md:py-2.5 text-[11px] md:text-sm font-medium transition-colors duration-300 z-10 ${
              activeTab === "home" ? "text-[#000000] dark:text-[#FFFFFF]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
          {activeTab === "home" && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-[#FFFFFF] dark:bg-[#3A3A3C] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-[#E5E5EA] dark:border-[#4A4A4C]"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10"><Home className="w-4 h-4" /></span>
        </Link>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              href={tab.href}
              key={tab.id}
              className={`relative flex items-center justify-center text-center px-2 py-1.5 md:px-4 md:py-2.5 text-[11px] md:text-sm font-bold transition-colors duration-300 z-10 ${
                isActive ? "text-[#000000] dark:text-[#FFFFFF]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#FFFFFF] dark:bg-[#3A3A3C] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-[#E5E5EA] dark:border-[#4A4A4C]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </Link>
          );
        })}
        </div>

        {/* Login Button */}
        <div className="pl-1 md:pl-2">
          <Link href="/login" className="flex items-center whitespace-nowrap px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-gradient-to-b from-[#0A84FF] to-[#005DEB] shadow-[inset_0px_1px_1px_rgba(255,255,255,0.4)] hover:opacity-90 transition-opacity text-white text-[10px] md:text-sm font-bold">
            Use App
          </Link>
        </div>

      </div>
    </div>
    
    {/* Page Logo Fixed Top Left */}
    <div className="fixed top-6 left-6 md:top-8 md:left-8 z-40 hidden sm:flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007AFF] to-[#34C759] flex items-center justify-center text-xs font-bold text-white shadow-sm">A</div>
      <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">Annapurna Logistics</span>
    </div>
    </>
  );
}
