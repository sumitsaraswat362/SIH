"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type UserRole = "farmer" | "buyer" | null;

interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  location?: string;
  city?: string;
  address?: string;
  state?: string;
  district?: string;
  village?: string;
  buyerType?: "consumer" | "retailer" | "restaurant" | "bulk_buyer";
  coords?: { lat: number; lng: number };
}

interface AuthContextType {
  user: AuthUser | null;
  login: (data: {
    name: string;
    role: UserRole;
    password?: string;
    phone?: string;
    location?: string;
    city?: string;
    address?: string;
    state?: string;
    district?: string;
    village?: string;
    buyerType?: string;
    coords?: { lat: number; lng: number };
  }) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          const u = data.user;
          // Normalize legacy roles
          if (u.role === "director") u.role = "farmer";
          if (u.role === "wholesaler") u.role = "buyer";
          setUser(u);
        }
        setMounted(true);
      })
      .catch(() => setMounted(true));
  }, []);

  const login = async (data: {
    name: string;
    role: UserRole;
    password?: string;
    phone?: string;
    location?: string;
    city?: string;
    address?: string;
    state?: string;
    district?: string;
    village?: string;
    buyerType?: string;
    coords?: { lat: number; lng: number };
  }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) return result.error || "Login failed";

      setUser(result.user);

      if (data.role === "farmer") router.push("/farmer/dashboard");
      if (data.role === "buyer") router.push("/buyer");

      return null;
    } catch {
      return "Network error during login";
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
