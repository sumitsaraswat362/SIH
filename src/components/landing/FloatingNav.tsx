"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NAV_ITEMS = [
    { name: "Farmer Portal", href: "/farmer/dashboard" },
    { name: "Marketplace", href: "/buyer" },
    { name: "Analytics", href: "/analytics" },
  ];

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300 ${
        scrolled ? "pointer-events-auto" : ""
      }`}
    >
      <div 
        className={`flex items-center justify-between px-4 py-2.5 rounded-full transition-all duration-500 ease-in-out border
          ${scrolled 
            ? "w-full max-w-3xl bg-[var(--bg-primary)]/80 backdrop-blur-xl shadow-lg border-[var(--separator)]" 
            : "w-full max-w-5xl bg-transparent border-transparent"
          }
        `}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group mr-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34C759] to-[#007AFF] flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[var(--text-primary)] hidden sm:block">
            Annapurna
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-[var(--fill-secondary)]/50 backdrop-blur-md border border-[var(--separator)] rounded-full p-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* CTA / User Profile */}
        <div className="flex items-center">
          {user ? (
            <Link 
              href={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer'}
              className="flex items-center gap-2 bg-[var(--fill-secondary)] border border-[var(--separator)] px-3 py-1.5 rounded-full hover:bg-[var(--fill-tertiary)] transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#34C759] to-[#007AFF] flex items-center justify-center text-[10px] text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)] hidden sm:block">
                {user.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-[#34C759] hover:bg-[#2DB84E] text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-[0_4px_14px_0_rgba(52,199,89,0.39)] hover:shadow-[0_6px_20px_rgba(52,199,89,0.23)] hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
