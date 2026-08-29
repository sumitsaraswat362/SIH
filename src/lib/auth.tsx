"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type UserRole = "director" | "wholesaler" | null;

interface AuthUser {
  name: string;
  role: UserRole;
  password?: string;
  location?: string;
  city?: string;
  address?: string;
  coords?: { lat: number; lng: number };
}

interface AuthContextType {
  user: AuthUser | null;
  login: (name: string, role: UserRole, password?: string, location?: string, city?: string, address?: string, coords?: { lat: number; lng: number }) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch the current user session from the server (cookie-based)
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
        setMounted(true);
      })
      .catch(() => {
        setMounted(true);
      });
  }, []);

  const login = async (name: string, role: UserRole, password?: string, location?: string, city?: string, address?: string, coords?: { lat: number; lng: number }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, password, location, city, address, coords })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return data.error || "Login failed";
      }
      
      setUser(data.user);
      
      if (role === "director") router.push("/fleet");
      if (role === "wholesaler") router.push("/wholesaler");
      
      return null;
    } catch (e) {
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
