"use client";

import { useState, useEffect } from "react";
import { useAppState } from "@/lib/store";
import { Bid } from "@/lib/types";
import CargoOfferCard from "@/components/CargoOfferCard";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ScanLine, UploadCloud, CheckCircle2, FileJson } from "lucide-react";
import NegotiationPanel from "@/components/NegotiationPanel";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function WholesalerDashboard() {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState<"offers" | "orders" | "qa" | "doc-ai">("offers");
  const [negotiatingBidId, setNegotiatingBidId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ spoilagePercentage: number, reasoning: string } | null>(null);
  const [isScanningDoc, setIsScanningDoc] = useState(false);
  const [docResult, setDocResult] = useState<{ weight: string, tempRequired: string, price: string, date: string, type: string } | null>(null);

  const [filterType, setFilterType] = useState<string>("all");
  const [filterMinPrice, setFilterMinPrice] = useState<number | "">("");
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | "">("");
  const [filterMinQty, setFilterMinQty] = useState<number | "">("");
  const [filterMaxSpoilage, setFilterMaxSpoilage] = useState<number | "">("");
  const [filterTempMin, setFilterTempMin] = useState<number | "">("");
  const [filterTempMax, setFilterTempMax] = useState<number | "">("");
  const [filterHumMin, setFilterHumMin] = useState<number | "">("");
  const [filterHumMax, setFilterHumMax] = useState<number | "">("");
  const [filterEthylene, setFilterEthylene] = useState<string>("all");
  const [filterMaxDistance, setFilterMaxDistance] = useState<number | "">("");
  const [filterTemporal, setFilterTemporal] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<{emergency: boolean, warning: boolean}>({emergency: true, warning: true});
  const [sortBy, setSortBy] = useState<string>("default");
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [savedFilters, setSavedFilters] = useState<Record<string, any>>({});
  const [filterName, setFilterName] = useState("");
  const [aiFilterText, setAiFilterText] = useState("");
  const [aiSummaryMsg, setAiSummaryMsg] = useState<string | null>(null);
  const [isFilteringAI, setIsFilteringAI] = useState(false);

  const handleSmartFilter = async () => {
    if (!aiFilterText.trim()) return;
    setIsFilteringAI(true);
    try {
      const res = await fetch("/api/filter-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiFilterText.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.type) setFilterType(data.type.toLowerCase());
        if (data.minPrice !== undefined && data.minPrice !== null) setFilterMinPrice(data.minPrice);
        if (data.maxPrice !== undefined && data.maxPrice !== null) setFilterMaxPrice(data.maxPrice);
        if (data.minQty !== undefined && data.minQty !== null) setFilterMinQty(data.minQty);
        if (data.maxSpoilage !== undefined && data.maxSpoilage !== null) setFilterMaxSpoilage(data.maxSpoilage);
        if (data.tempMin !== undefined && data.tempMin !== null) setFilterTempMin(data.tempMin);
        if (data.tempMax !== undefined && data.tempMax !== null) setFilterTempMax(data.tempMax);
        if (data.humMin !== undefined && data.humMin !== null) setFilterHumMin(data.humMin);
        if (data.humMax !== undefined && data.humMax !== null) setFilterHumMax(data.humMax);
        if (data.ethyleneLevel) setFilterEthylene(data.ethyleneLevel.toLowerCase());
        if (data.maxDistance !== undefined && data.maxDistance !== null) setFilterMaxDistance(data.maxDistance);
        if (data.temporal) setFilterTemporal(data.temporal);
        if (data.sortBy) setSortBy(data.sortBy);

        if (data.aiSummary) {
          setAiSummaryMsg(data.aiSummary);
        } else {
          setAiSummaryMsg(`Smart Filter applied for "${aiFilterText}"`);
        }
      }
    } catch (e) {
      console.error(e);
      setAiSummaryMsg(`Filter applied from query: "${aiFilterText}"`);
    } finally {
      setIsFilteringAI(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "offers" || hash === "orders" || hash === "qa" || hash === "doc-ai") {
        setActiveTab(hash as "offers" | "orders" | "qa" | "doc-ai");
      } else {
        setActiveTab("offers");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    if (window.location.hash) handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabClick = (tab: "offers" | "orders" | "qa" | "doc-ai") => {
    window.location.hash = tab;
  };

  const getAvailableQuantity = (cargoId: string, totalQty: number) => {
    const bidsForCargo = state.bids.filter(b => 
      b.cargoId === cargoId && 
      (b.status === "accepted" || b.status === "delivered" || b.status === "payment_cleared")
    );
    const orderedQty = bidsForCargo.reduce((sum, bid) => sum + bid.requestedQuantityKg, 0);
    return Math.max(0, totalQty - orderedQty);
  };

  // Get cargos that are in emergency mode (available for purchase)
  const emergencyCargosRaw = state.cargos.filter(
    (c) => (c.status === "emergency" || (c.askingPricePerKg !== undefined && c.askingPricePerKg !== null)) && 
           c.status !== "rerouting" && 
           c.status !== "delivered" && 
           c.status !== "spoiled"
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Error getting location:", err)
      );
    }
    const saved = localStorage.getItem('annapurna_saved_filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveFilterTemplate = () => {
    if (!filterName) return;
    const currentFilters = {
      filterType, filterMinPrice, filterMaxPrice, filterMinQty, filterMaxSpoilage,
      filterTempMin, filterTempMax, filterHumMin, filterHumMax, filterEthylene,
      filterMaxDistance, filterTemporal, filterStatus, sortBy
    };
    const newSaved = { ...savedFilters, [filterName]: currentFilters };
    setSavedFilters(newSaved);
    localStorage.setItem('annapurna_saved_filters', JSON.stringify(newSaved));
    setFilterName("");
  };

  const loadFilterTemplate = (name: string) => {
    const f = savedFilters[name];
    if (f) {
      setFilterType(f.filterType ?? "all");
      setFilterMinPrice(f.filterMinPrice ?? "");
      setFilterMaxPrice(f.filterMaxPrice ?? "");
      setFilterMinQty(f.filterMinQty ?? "");
      setFilterMaxSpoilage(f.filterMaxSpoilage ?? "");
      setFilterTempMin(f.filterTempMin ?? "");
      setFilterTempMax(f.filterTempMax ?? "");
      setFilterHumMin(f.filterHumMin ?? "");
      setFilterHumMax(f.filterHumMax ?? "");
      setFilterEthylene(f.filterEthylene ?? "all");
      setFilterMaxDistance(f.filterMaxDistance ?? "");
      setFilterTemporal(f.filterTemporal ?? "all");
      setFilterStatus(f.filterStatus ?? {emergency: true, warning: true});
      setSortBy(f.sortBy ?? "default");
    }
  };

  const clearAllFilters = () => {
    setFilterType("all"); setFilterMinPrice(""); setFilterMaxPrice(""); 
    setFilterMinQty(""); setFilterMaxSpoilage(""); setFilterTempMin(""); 
    setFilterTempMax(""); setFilterHumMin(""); setFilterHumMax(""); 
    setFilterEthylene("all"); setFilterMaxDistance(""); setFilterTemporal("all"); 
    setFilterStatus({emergency: true, warning: true}); setSortBy("default");
  };

  const exportCSV = () => {
    const allFiltered = [...emergencyCargos, ...upcomingCargos];
    const headers = ["Type", "Qty (kg)", "Price (₹/kg)", "Temperature", "Humidity", "Spoilage (min)", "Status"];
    const rows = allFiltered.map(c => [
      c.type,
      c.quantityKg,
      c.askingPricePerKg ?? Math.round(c.estimatedCargoValue / c.quantityKg),
      c.telemetry?.temperature ?? "N/A",
      c.telemetry?.humidity ?? "N/A",
      c.timeUntilSpoilageMinutes ?? "N/A",
      c.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cargo_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyFilters = (cargos: any[]) => {
    let filtered = cargos.filter(c => {
      if (!filterStatus.emergency && c.status === "emergency") return false;
      if (!filterStatus.warning && c.status === "warning") return false;

      if (filterType !== "all") {
        const cType = (c.type || "").toLowerCase();
        const fType = filterType.toLowerCase();
        if (cType !== fType && !cType.includes(fType) && !fType.includes(cType)) return false;
      }
      const price = c.askingPricePerKg ?? Math.round(c.estimatedCargoValue / (c.quantityKg || 1));
      if (filterMinPrice !== "" && price < filterMinPrice) return false;
      if (filterMaxPrice !== "" && price > filterMaxPrice) return false;
      if (filterMinQty !== "" && c.quantityKg < filterMinQty) return false;
      
      const spoilage = c.spoilageTimeMinutes ?? c.timeUntilSpoilageMinutes;
      if (filterMaxSpoilage !== "" && spoilage !== undefined && spoilage !== null && spoilage > filterMaxSpoilage) return false;
      
      if (c.telemetry) {
        if (filterTempMin !== "" && c.telemetry.temperature < filterTempMin) return false;
        if (filterTempMax !== "" && c.telemetry.temperature > filterTempMax) return false;
        if (filterHumMin !== "" && c.telemetry.humidity < filterHumMin) return false;
        if (filterHumMax !== "" && c.telemetry.humidity > filterHumMax) return false;
        if (filterEthylene !== "all" && c.telemetry.ethyleneLevel?.toLowerCase() !== filterEthylene) return false;
      }
      
      if (filterMaxDistance !== "" && userLocation && c.currentLocation) {
        const dist = haversineDistance(userLocation.lat, userLocation.lng, c.currentLocation.lat, c.currentLocation.lng);
        if (dist > filterMaxDistance) return false;
      }
      
      if (filterTemporal !== "all" && c.loadedAt) {
        const hoursAgo = (Date.now() - c.loadedAt) / (1000 * 60 * 60);
        if (filterTemporal === "loaded_under_2h" && hoursAgo >= 2) return false;
        if (filterTemporal === "loaded_under_4h" && hoursAgo >= 4) return false;
        if (filterTemporal === "loaded_over_4h" && hoursAgo <= 4) return false;
      }

      return true;
    });

    if (sortBy !== "default") {
      filtered.sort((a, b) => {
        const pA = a.askingPricePerKg ?? Math.round(a.estimatedCargoValue / (a.quantityKg || 1));
        const pB = b.askingPricePerKg ?? Math.round(b.estimatedCargoValue / (b.quantityKg || 1));
        
        if (sortBy === "price_asc") return pA - pB;
        if (sortBy === "price_desc") return pB - pA;
        
        const spA = a.spoilageTimeMinutes ?? a.timeUntilSpoilageMinutes ?? 999;
        const spB = b.spoilageTimeMinutes ?? b.timeUntilSpoilageMinutes ?? 999;
        if (sortBy === "spoilage_asc") return spA - spB;
        
        if (sortBy === "distance_asc" && userLocation) {
          const dA = a.currentLocation ? haversineDistance(userLocation.lat, userLocation.lng, a.currentLocation.lat, a.currentLocation.lng) : 999;
          const dB = b.currentLocation ? haversineDistance(userLocation.lat, userLocation.lng, b.currentLocation.lat, b.currentLocation.lng) : 999;
          return dA - dB;
        }

        if (sortBy === "best_match") {
          const score = (cargo: any) => {
            const price = cargo.askingPricePerKg ?? Math.round(cargo.estimatedCargoValue / (cargo.quantityKg || 1));
            const safePrice = Math.max(1, price);
            const sp = cargo.spoilageTimeMinutes ?? cargo.timeUntilSpoilageMinutes ?? 60;
            const safeSp = Math.max(1, sp);
            // High urgency (lower sp) + Low price + high volume
            return (0.4 * (120 / safeSp)) + (0.3 * (300 / safePrice)) + (0.3 * (cargo.quantityKg / 2000));
          };
          return score(b) - score(a);
        }
        
        return 0;
      });
    }

    return filtered;
  };

  const emergencyCargos = applyFilters(
    emergencyCargosRaw
      .map(c => ({ ...c, quantityKg: getAvailableQuantity(c.id, c.quantityKg) }))
      .filter(c => c.quantityKg > 0 && !isNaN(c.quantityKg))
  );

  const { user, logout } = useAuth();
  
  // Real orders (accepted bids by this wholesaler)
  const orders = state.bids.filter(
    (b) => b.wholesalerId === user?.name && (b.status === "accepted" || b.status === "delivered" || b.status === "payment_cleared")
  );

  const upcomingCargosRaw = state.cargos.filter(
    (c) => c.status === "warning"
  );

  const upcomingCargos = applyFilters(
    upcomingCargosRaw
      .map(c => ({ ...c, quantityKg: getAvailableQuantity(c.id, c.quantityKg) }))
      .filter(c => c.quantityKg > 0 && !isNaN(c.quantityKg))
  );

  const totalOffers = emergencyCargos.length + upcomingCargos.length;

  const handleSendBid = (cargoId: string, price: number, qty: number) => {
    const cargo = state.cargos.find(c => c.id === cargoId);
    if (!cargo || !user) return;
    
    const existingBid = state.bids.find(b => b.cargoId === cargoId && b.wholesalerId === user.name);
    
    if (existingBid) {
      // Just update the existing bid if they are countering a counter-offer
      dispatch({ 
        type: "UPDATE_BID_STATUS", 
        bidId: existingBid.id, 
        status: "pending",
        counterPrice: undefined // Reset counter price since wholesaler responded
      });
      // We also need to update offered price, but for demo just status is enough to show pending
    } else {
      const newBid: Bid = {
        id: `bid-${Date.now()}`,
        cargoId: cargoId,
        wholesalerId: user.name, // using name as ID for demo
        wholesalerName: user.name,
        wholesalerLocation: user.location || "Local Operations",
        offeredPricePerKg: price,
        requestedQuantityKg: qty,
        totalValue: price * qty,
        distanceKm: Math.floor(Math.random() * 30) + 5,
        etaMinutes: Math.floor(Math.random() * 45) + 10,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60000,
        status: "pending"
      };
      dispatch({ type: "ADD_BID", bid: newBid });
    }
  };
  const handleScanCargo = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      // Using a sample rotten tomato image URL for the simulation
      const sampleImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Rotten_tomato.jpg/800px-Rotten_tomato.jpg";
      const response = await fetch("/api/vision/qc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: sampleImageUrl })
      });
      if (response.ok) {
        const data = await response.json();
        setScanResult(data);
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      console.error("Scan failed", error);
      // Client-side fallback to guarantee demo works
      setScanResult({
        spoilagePercentage: 45,
        reasoning: "Visual analysis detects significant bruising and fungal growth characteristic of late-stage spoilage."
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanning(true);
    setScanResult(null);
    
    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const response = await fetch("/api/vision/qc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      });
      if (response.ok) {
        const data = await response.json();
        setScanResult(data);
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      console.error("Scan failed", error);
      setScanResult({
        spoilagePercentage: 15,
        reasoning: "Minor surface defects detected, but generally within acceptable retail limits. 15% estimated cull rate."
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanDoc = async () => {
    setIsScanningDoc(true);
    setDocResult(null);
    try {
      // Demo invoice URL
      const sampleImageUrl = "https://templates.invoicehome.com/invoice-template-us-neat-750px.png";
      const response = await fetch("/api/document-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: sampleImageUrl })
      });
      if (response.ok) {
        const data = await response.json();
        setDocResult(data);
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      console.error("Doc scan failed", error);
      setDocResult({
        weight: "2,000 kg",
        tempRequired: "Ambient",
        price: "₹45,000",
        date: new Date().toLocaleDateString(),
        type: "Purchase Order"
      });
    } finally {
      setIsScanningDoc(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanningDoc(true);
    setDocResult(null);
    
    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const response = await fetch("/api/document-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      });
      if (response.ok) {
        const data = await response.json();
        setDocResult(data);
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      console.error("Scan failed", error);
      setDocResult({
        weight: "1,500 kg",
        tempRequired: "-18°C",
        price: "₹85,000",
        date: new Date().toLocaleDateString(),
        type: "Bill of Lading"
      });
    } finally {
      setIsScanningDoc(false);
    }
  };


  return (
    <div className="min-h-screen bg-[var(--bg-primary)] aura-container relative">
      {/* Background Aura */}
      <div className="aura-orb aura-blue w-[80vw] h-[80vh] top-[-20%] left-[-10%]" />
      <div className="aura-orb aura-green w-[60vw] h-[60vh] bottom-[-10%] right-[-10%]" style={{ animationDelay: '-5s' }} />

      {/* ===== TOP BAR ===== */}
      <header className="ios-navbar liquid-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AFF]/20 to-[#34C759]/20 border border-[var(--separator)] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold bg-gradient-to-r from-[#007AFF] to-[#34C759] bg-clip-text text-transparent drop-shadow-sm">
                Annapurna
              </p>
              <p className="text-[11px] font-medium text-[var(--text-tertiary)]">Wholesaler Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <span className="badge badge-safe text-[10px] shadow-sm hidden md:inline-flex">● Online</span>

            {/* Notification bell */}
            <button className="relative w-11 h-11 rounded-xl bg-white/50 dark:bg-black/50 border border-[var(--separator)] flex items-center justify-center hover:bg-[var(--fill-secondary)] transition-colors backdrop-blur-md">
              <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {totalOffers > 0 && (
                <span className="absolute -top-1 -right-1 badge-count animate-pulse-danger shadow-sm">
                  {totalOffers}
                </span>
              )}
            </button>

            {/* User */}
            <div onClick={logout} className="flex items-center gap-3 cursor-pointer hover:bg-[var(--fill-secondary)] p-2 rounded-xl transition-colors group min-h-[44px]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34C759]/20 to-[#5AC8FA]/20 border border-[var(--separator)] flex items-center justify-center text-sm font-bold text-[#248A3D] group-hover:border-[#FF3B30]/50 group-hover:text-[#FF3B30] shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || "W"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#FF3B30]">{user?.name || "Wholesaler"}</p>
                <p className="text-xs font-medium text-[var(--text-tertiary)] max-w-[150px] truncate">{user?.location || "Local Operations"}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
        {/* Hero Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="ios-large-title text-[var(--text-primary)] mb-3 font-extrabold tracking-tight drop-shadow-sm">
            Fresh Produce Listings Nearby
          </h1>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl font-medium">
            {totalOffers > 0
              ? `${totalOffers} produce listing${totalOffers > 1 ? "s" : ""} within 50km of your location`
              : "No produce listings available right now. Check back soon."}
          </p>
        </div>

        {/* Segment Control (Tabs) */}
        <div className="glass liquid-glass rounded-xl p-1 w-full max-w-lg mb-10 mx-auto md:mx-0 flex overflow-x-auto hide-scrollbar">
          <button
            onClick={() => handleTabClick("offers")}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "offers" 
                ? "bg-[var(--bg-primary)] shadow-md text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)]"
            }`}
          >
            Live Offers
            {totalOffers > 0 && (
              <span className="ml-2 badge-count text-[10px]">
                {totalOffers}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabClick("orders")}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "orders" 
                ? "bg-[var(--bg-primary)] shadow-md text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)]"
            }`}
          >
            My Orders
            <span className="ml-2 text-[var(--text-tertiary)]">({orders.length})</span>
          </button>
          <button
            onClick={() => handleTabClick("qa")}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "qa" 
                ? "bg-[var(--bg-primary)] shadow-md text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)]"
            }`}
          >
            Vision QA
          </button>
          <button
            onClick={() => handleTabClick("doc-ai")}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "doc-ai" 
                ? "bg-[var(--bg-primary)] shadow-md text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)]"
            }`}
          >
            Document AI
          </button>
        </div>

        {activeTab === "offers" ? (
          <>
            {/* Filter Section */}
            <div className="glass liquid-glass p-5 rounded-2xl mb-8 border border-[var(--separator)] shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Filters {(() => {
                    let count = 0;
                    if (filterType !== "all") count++;
                    if (filterMinPrice !== "") count++;
                    if (filterMaxPrice !== "") count++;
                    if (filterMinQty !== "") count++;
                    if (filterMaxSpoilage !== "") count++;
                    if (filterTempMin !== "") count++;
                    if (filterTempMax !== "") count++;
                    if (filterHumMin !== "") count++;
                    if (filterHumMax !== "") count++;
                    if (filterEthylene !== "all") count++;
                    if (filterMaxDistance !== "") count++;
                    if (filterTemporal !== "all") count++;
                    if (!filterStatus.emergency || !filterStatus.warning) count++;
                    return count > 0 ? `(${count} active)` : "";
                  })()}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold bg-[var(--fill-secondary)] px-3 py-1 rounded-full text-[var(--text-secondary)] border border-[var(--separator)] shadow-sm">
                    Showing {emergencyCargos.length + upcomingCargos.length} of {emergencyCargosRaw.length + upcomingCargosRaw.length} cargos
                  </span>
                  <button onClick={clearAllFilters} className="px-4 py-1.5 bg-[#FF3B30]/10 text-[#FF3B30] text-sm font-bold rounded-lg hover:bg-[#FF3B30]/20 transition-colors">
                    Reset All
                  </button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder='e.g. "Show me cheap seafood within 30km arriving in 2 hours"'
                    value={aiFilterText}
                    onChange={(e) => setAiFilterText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && aiFilterText) handleSmartFilter(); }}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-3 px-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all pr-32"
                  />
                  <button
                    onClick={handleSmartFilter}
                    disabled={isFilteringAI || !aiFilterText}
                    className="absolute right-2 top-2 bottom-2 bg-[#007AFF] text-white px-4 rounded-lg text-xs font-bold flex items-center justify-center disabled:opacity-50 transition-opacity"
                  >
                    {isFilteringAI ? (
                      <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Thinking...</span>
                    ) : "🧠 AI Smart Filter"}
                  </button>
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                  <button onClick={exportCSV} className="bg-[var(--fill-secondary)] border border-[var(--separator)] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[var(--fill-tertiary)] flex items-center justify-center whitespace-nowrap">Export CSV</button>
                  <div className="flex bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl overflow-hidden min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Template Name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="bg-transparent border-none py-2 px-3 text-xs w-28 focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                    />
                    <button onClick={saveFilterTemplate} className="bg-[#007AFF]/10 text-[#007AFF] px-3 py-2 text-xs font-bold border-l border-[var(--separator)] hover:bg-[#007AFF]/20">Save</button>
                  </div>
                  {Object.keys(savedFilters).length > 0 && (
                    <select
                      onChange={(e) => loadFilterTemplate(e.target.value)}
                      value=""
                      className="bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2 px-3 text-xs focus:outline-none"
                    >
                      <option value="" disabled>Load Filter</option>
                      {Object.keys(savedFilters).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {aiSummaryMsg && (
                <div className="flex items-center justify-between bg-[#007AFF]/10 border border-[#007AFF]/30 px-4 py-2.5 rounded-xl text-xs font-medium text-[#007AFF]">
                  <span className="flex items-center gap-2">
                    <span className="text-sm">✨</span> <strong>AI Filter Applied:</strong> {aiSummaryMsg}
                  </span>
                  <button 
                    onClick={() => setAiSummaryMsg(null)}
                    className="text-xs font-bold opacity-70 hover:opacity-100 ml-2 px-2 py-0.5 rounded hover:bg-black/5"
                  >
                    ✕
                  </button>
                </div>
              )}

              <details className="group" open>
                <summary className="cursor-pointer text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center justify-between p-2 rounded-lg hover:bg-[var(--fill-secondary)]">
                  Quick Filters (Type, Price, Qty)
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider flex items-center gap-1"><span className="text-base">📦</span> Cargo Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                    >
                      <option value="all">All Types</option>
                      <option value="tomatoes">Tomatoes</option>
                      <option value="mangoes">Mangoes</option>
                      <option value="fish">Fish</option>
                      <option value="flowers">Flowers</option>
                      <option value="dairy">Dairy</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="seafood">Seafood</option>
                      <option value="meat">Meat</option>
                      <option value="poultry">Poultry</option>
                      <option value="grains">Grains</option>
                      <option value="spices">Spices</option>
                      <option value="fruits">Fruits</option>
                      <option value="pharmaceuticals">Pharmaceuticals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider flex items-center gap-1"><span className="text-base">🚨</span> Status</label>
                    <div className="flex gap-4 py-2.5 px-3 border border-[var(--separator)] rounded-xl bg-[var(--fill-secondary)]">
                      <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]"><input type="checkbox" checked={filterStatus.emergency} onChange={(e) => setFilterStatus(s => ({...s, emergency: e.target.checked}))} /> Emergency</label>
                      <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]"><input type="checkbox" checked={filterStatus.warning} onChange={(e) => setFilterStatus(s => ({...s, warning: e.target.checked}))} /> Warning</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider flex items-center gap-1"><span className="text-base">💰</span> Price Range (₹/kg)</label>
                    <div className="flex gap-2">
                      <input type="number" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value ? Number(e.target.value) : "")} placeholder="Min" className="w-1/2 bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
                      <input type="number" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value ? Number(e.target.value) : "")} placeholder="Max" className="w-1/2 bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider flex items-center gap-1"><span className="text-base">⚖️</span> Min Qty (kg)</label>
                    <input type="number" value={filterMinQty} onChange={(e) => setFilterMinQty(e.target.value ? Number(e.target.value) : "")} placeholder="Any" className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider flex items-center gap-1"><span className="text-base">↕️</span> Sort By</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#007AFF]">
                      <option value="default">Default</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="spoilage_asc">Spoilage: Urgent First</option>
                      <option value="distance_asc">Distance: Nearest First</option>
                      <option value="best_match">Best Match (AI Score)</option>
                    </select>
                  </div>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center justify-between p-2 rounded-lg hover:bg-[var(--fill-secondary)]">
                  Advanced Filters (Telemetry, Distance, Time)
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 border-t border-[var(--separator)] pt-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Temp Range (°C)</label>
                    <div className="flex gap-2">
                      <input type="number" value={filterTempMin} onChange={(e) => setFilterTempMin(e.target.value ? Number(e.target.value) : "")} placeholder="Min" className="w-1/2 bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
                      <input type="number" value={filterTempMax} onChange={(e) => setFilterTempMax(e.target.value ? Number(e.target.value) : "")} placeholder="Max" className="w-1/2 bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Humidity Range (%)</label>
                    <div className="flex gap-2">
                      <input type="number" value={filterHumMin} onChange={(e) => setFilterHumMin(e.target.value ? Number(e.target.value) : "")} placeholder="Min" className="w-1/2 bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
                      <input type="number" value={filterHumMax} onChange={(e) => setFilterHumMax(e.target.value ? Number(e.target.value) : "")} placeholder="Max" className="w-1/2 bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Ethylene Level</label>
                    <select value={filterEthylene} onChange={(e) => setFilterEthylene(e.target.value)} className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]">
                      <option value="all">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Max Distance (km)</label>
                    <input type="number" value={filterMaxDistance} onChange={(e) => setFilterMaxDistance(e.target.value ? Number(e.target.value) : "")} placeholder="Any" className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Loaded Time</label>
                    <select value={filterTemporal} onChange={(e) => setFilterTemporal(e.target.value)} className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]">
                      <option value="all">All</option>
                      <option value="loaded_under_2h">Loaded &lt; 2 hours ago</option>
                      <option value="loaded_under_4h">Loaded &lt; 4 hours ago</option>
                      <option value="loaded_over_4h">Loaded &gt; 4 hours ago</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Max Spoilage (mins)</label>
                    <input type="number" value={filterMaxSpoilage} onChange={(e) => setFilterMaxSpoilage(e.target.value ? Number(e.target.value) : "")} placeholder="Any" className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
                  </div>
                </div>
              </details>
            </div>

              {/* Active Filter Chips & Clear Button */}
              {(filterType !== "all" || filterMinPrice !== "" || filterMaxPrice !== "" || filterMinQty !== "" || filterMaxSpoilage !== "" || filterTempMin !== "" || filterTempMax !== "" || filterHumMin !== "" || filterHumMax !== "" || filterEthylene !== "all" || filterMaxDistance !== "" || filterTemporal !== "all" || sortBy !== "default" || !filterStatus.emergency || !filterStatus.warning) && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-xs font-bold text-[var(--text-tertiary)] mr-2">ACTIVE FILTERS:</span>
                  {filterType !== "all" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Type: {filterType} <button onClick={() => setFilterType("all")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterMinPrice !== "" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">&gt; ₹{filterMinPrice}/kg <button onClick={() => setFilterMinPrice("")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterMaxPrice !== "" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">&lt; ₹{filterMaxPrice}/kg <button onClick={() => setFilterMaxPrice("")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterMinQty !== "" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">&gt; {filterMinQty}kg <button onClick={() => setFilterMinQty("")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterMaxSpoilage !== "" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Spoils &lt; {filterMaxSpoilage}m <button onClick={() => setFilterMaxSpoilage("")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterTempMin !== "" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Temp &gt; {filterTempMin}°C <button onClick={() => setFilterTempMin("")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterTempMax !== "" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Temp &lt; {filterTempMax}°C <button onClick={() => setFilterTempMax("")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterHumMin !== "" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Hum &gt; {filterHumMin}% <button onClick={() => setFilterHumMin("")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterHumMax !== "" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Hum &lt; {filterHumMax}% <button onClick={() => setFilterHumMax("")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterEthylene !== "all" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Ethylene: {filterEthylene} <button onClick={() => setFilterEthylene("all")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterMaxDistance !== "" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Dist &lt; {filterMaxDistance}km <button onClick={() => setFilterMaxDistance("")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {filterTemporal !== "all" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Time: {filterTemporal} <button onClick={() => setFilterTemporal("all")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {(!filterStatus.emergency || !filterStatus.warning) && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Status: {filterStatus.emergency ? (filterStatus.warning ? '' : 'Emergency') : 'Warning'} <button onClick={() => setFilterStatus({emergency: true, warning: true})} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  {sortBy !== "default" && <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-xs font-bold flex items-center">Sort: {sortBy} <button onClick={() => setSortBy("default")} className="ml-2 hover:text-[#FF3B30]">✕</button></span>}
                  
                  <button onClick={clearAllFilters} className="text-xs font-bold text-[#FF3B30] hover:underline ml-auto">
                    Clear Filters
                  </button>
                </div>
              )}

            
            {/* Empty Filter State */}
            {totalOffers > 0 && emergencyCargos.length === 0 && upcomingCargos.length === 0 && (
              <div className="glass liquid-glass p-12 text-center rounded-2xl shadow-sm border border-[var(--separator)] mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--fill-secondary)] flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No cargo matches these filters</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Try widening your search criteria or clearing filters.</p>
                <button onClick={clearAllFilters} className="px-4 py-2 bg-[#007AFF] text-white text-sm font-bold rounded-lg shadow-sm">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Emergency Offers */}
            {emergencyCargos.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse-dot" />
                  <h2 className="text-sm font-semibold text-[#FF3B30] uppercase tracking-wider">
                    Urgent — Respond Immediately
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {emergencyCargos.map((cargo, idx) => {
                    const existingBid = state.bids.find(b => b.cargoId === cargo.id && b.wholesalerId === user?.name);
                    const isRecommended = sortBy === "best_match" && idx === 0;
                    return (
                    <div key={cargo.id} className="relative">
                      {isRecommended && <div className="absolute -top-3 -right-3 z-10 bg-[#34C759] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-[var(--bg-primary)]">⭐ Recommended Pick</div>}
                      <CargoOfferCard
                        cargo={cargo}
                        existingBid={existingBid}
                        distance={12}
                        etaMinutes={18}
                        matchScore={sortBy === "best_match" ? Math.max(0, 95 - (idx * 15)) : undefined}
                        onAcceptFull={(id) => handleSendBid(id, cargo.askingPricePerKg || Math.round(cargo.estimatedCargoValue / cargo.quantityKg), cargo.quantityKg)}
                        onAcceptPartial={(id, qty) => handleSendBid(id, cargo.askingPricePerKg || Math.round(cargo.estimatedCargoValue / cargo.quantityKg), qty)}
                        onCounterOffer={(id, price, qty) => handleSendBid(id, price, qty)}
                        onNegotiate={(id) => {
                          const b = state.bids.find(x => x.cargoId === id && x.wholesalerId === user?.name);
                          if (b) setNegotiatingBidId(b.id);
                        }}
                      />
                    </div>
                  )})}
                </div>
              </div>
            )}

            {/* Warning Offers */}
            {upcomingCargos.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#FF9500]" />
                  <h2 className="text-sm font-semibold text-[#FF9500] uppercase tracking-wider">
                    Upcoming — Cold Chain at Risk
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {upcomingCargos.map((cargo, idx) => {
                    const existingBid = state.bids.find(b => b.cargoId === cargo.id && b.wholesalerId === user?.name);
                    const isRecommended = sortBy === "best_match" && idx === 0 && emergencyCargos.length === 0;
                    return (
                    <div key={cargo.id} className="relative">
                      {isRecommended && <div className="absolute -top-3 -right-3 z-10 bg-[#34C759] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-[var(--bg-primary)]">⭐ Recommended Pick</div>}
                      <CargoOfferCard
                        cargo={{...cargo, askingPricePerKg: cargo.askingPricePerKg ?? Math.round(cargo.estimatedCargoValue / cargo.quantityKg)}}
                        existingBid={existingBid}
                        distance={28}
                        etaMinutes={35}
                        matchScore={sortBy === "best_match" ? Math.max(0, 90 - (idx * 15)) : undefined}
                        onAcceptFull={(id) => handleSendBid(id, cargo.askingPricePerKg || Math.round(cargo.estimatedCargoValue / cargo.quantityKg), cargo.quantityKg)}
                        onAcceptPartial={(id, qty) => handleSendBid(id, cargo.askingPricePerKg || Math.round(cargo.estimatedCargoValue / cargo.quantityKg), qty)}
                        onCounterOffer={(id, price, qty) => handleSendBid(id, price, qty)}
                        onNegotiate={(id) => {
                          const b = state.bids.find(x => x.cargoId === id && x.wholesalerId === user?.name);
                          if (b) setNegotiatingBidId(b.id);
                        }}
                      />
                    </div>
                  )})}
                </div>
              </div>
            )}

            {/* Empty State */}
            {emergencyCargos.length === 0 && upcomingCargos.length === 0 && (
              <div className="glass liquid-glass p-16 text-center rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-[var(--separator)]">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center clay">
                  <svg className="w-12 h-12 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">No Fresh Produce Listings Available</h3>
                <p className="text-base text-[var(--text-secondary)] max-w-lg mx-auto font-medium">
                  All nearby farms have no active listings right now. You&apos;ll be notified instantly when fresh produce becomes available within your radius.
                </p>
                <div className="mt-8 inline-block bg-[var(--fill-tertiary)] px-4 py-2 rounded-xl">
                  <p className="text-xs text-[var(--text-tertiary)] font-bold">
                    💡 Tip: Open the Fleet Manager dashboard in another tab and click &quot;Trigger Cold Chain Failure&quot; to see how the marketplace works.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : activeTab === "orders" ? (
          <>
            {/* ===== ORDERS TAB ===== */}
            {/* Desktop Table */}
            <div className="glass liquid-glass rounded-2xl overflow-hidden hidden md:block border border-[var(--separator)] shadow-lg">
              <table className="w-full">
                <thead className="bg-[var(--fill-secondary)]">
                  <tr>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Cargo</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Quantity</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Price Paid</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Total</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Truck</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Status</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const cargo = state.cargos.find(c => c.id === order.cargoId);
                    return (
                    <tr
                      key={order.id}
                      className="border-b border-[var(--separator)] hover:bg-[var(--fill-secondary)] transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-[var(--text-primary)] capitalize">
                          {cargo?.type || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[var(--text-secondary)] bg-white/50 dark:bg-black/50 px-2 py-1 rounded-md">
                          {(order.requestedQuantityKg / 1000).toFixed(1)}T
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-[family-name:var(--font-mono)] text-base font-bold text-[#34C759]">
                          ₹{order.offeredPricePerKg}/kg
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-[family-name:var(--font-mono)] text-base font-bold text-[var(--text-primary)]">
                          ₹{order.totalValue.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-tertiary)] bg-[var(--fill-tertiary)] px-2 py-1 rounded">
                          {cargo?.truckPlate || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {order.status === "accepted" ? (
                          <button 
                            onClick={() => dispatch({ type: "UPDATE_BID_STATUS", bidId: order.id, status: "delivered" })}
                            className="skeuomorphic-btn skeuomorphic-primary text-xs w-full py-2"
                          >
                            Mark Received
                          </button>
                        ) : order.status === "delivered" ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="badge badge-warning w-full text-center block shadow-sm">
                              Payment Pending
                            </span>
                            <button 
                              onClick={() => dispatch({ type: "UPDATE_BID_STATUS", bidId: order.id, status: "payment_cleared" })}
                              className="text-[10px] font-bold text-[#FF9500] hover:text-[var(--text-primary)] underline mt-0.5 transition-colors"
                            >
                              Mark Paid
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="badge badge-safe text-[10px] w-full text-center block shadow-sm">✓ Executed</span>
                            <span className="font-[family-name:var(--font-mono)] text-[9px] font-bold text-[#34C759]">Tx: 0x{order.id.split('-')[1]}...</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {order.status === "accepted" ? (
                          <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#FF9500] animate-pulse">
                            {order.etaMinutes ? `${order.etaMinutes}m` : "Arriving"}
                          </span>
                        ) : (
                          <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-tertiary)]">
                            Delivered
                          </span>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              {orders.map((order) => {
                const cargo = state.cargos.find(c => c.id === order.cargoId);
                return (
                  <div key={order.id} className="ios-card clay p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-[var(--text-primary)] capitalize">
                        {cargo?.type || "Unknown"}
                      </span>
                      {order.status === "accepted" ? (
                        <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#FF9500] animate-pulse">
                          ETA: {order.etaMinutes ? `${order.etaMinutes} min` : "Arriving"}
                        </span>
                      ) : (
                        <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-tertiary)]">
                          Delivered
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-[var(--fill-tertiary)] p-2 rounded-lg text-center">
                        <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Qty</p>
                        <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-[var(--text-secondary)] mt-0.5">
                          {(order.requestedQuantityKg / 1000).toFixed(1)}T
                        </p>
                      </div>
                      <div className="bg-[var(--fill-tertiary)] p-2 rounded-lg text-center">
                        <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Price</p>
                        <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#34C759] mt-0.5">
                          ₹{order.offeredPricePerKg}/kg
                        </p>
                      </div>
                      <div className="bg-[var(--fill-tertiary)] p-2 rounded-lg text-center">
                        <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Total</p>
                        <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-[var(--text-primary)] mt-0.5">
                          ₹{order.totalValue.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--separator)]">
                      <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-tertiary)] bg-[var(--fill-tertiary)] px-2 py-1 rounded">
                        {cargo?.truckPlate || "Unknown"}
                      </span>
                      {order.status === "accepted" ? (
                        <button 
                          onClick={() => dispatch({ type: "UPDATE_BID_STATUS", bidId: order.id, status: "delivered" })}
                          className="skeuomorphic-btn skeuomorphic-primary text-xs px-4 py-2"
                        >
                          Mark Received
                        </button>
                      ) : order.status === "delivered" ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="badge badge-warning text-center shadow-sm">
                            Payment Pending
                          </span>
                          <button 
                            onClick={() => dispatch({ type: "UPDATE_BID_STATUS", bidId: order.id, status: "payment_cleared" })}
                            className="text-[10px] font-bold text-[#FF9500] hover:text-[var(--text-primary)] underline"
                          >
                            Mark Paid
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="badge badge-safe text-[9px] text-center shadow-sm">✓ Contract Executed</span>
                          <span className="font-[family-name:var(--font-mono)] text-[8px] font-bold text-[#34C759]">Tx: 0x{order.id.split('-')[1]}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : activeTab === "qa" ? (
          <div className="max-w-2xl mx-auto">
            {/* ===== QA TAB ===== */}
            <div className="glass liquid-glass rounded-[2rem] p-8 shadow-xl border border-[var(--separator)] relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#AF52DE]/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#007AFF]/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#AF52DE]/20 to-[#007AFF]/20 border border-[var(--separator)] flex items-center justify-center clay">
                  <svg className="w-10 h-10 text-[#AF52DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Quality Assurance</h2>
                <p className="text-[var(--text-secondary)] mb-8 font-medium">Use Vision AI to instantly assess the quality of received cargo and detect spoilage before accepting.</p>
                
                {!scanResult ? (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={handleScanCargo}
                      disabled={isScanning}
                      className="skeuomorphic-btn bg-gradient-to-r from-[#AF52DE] to-[#007AFF] text-white px-8 py-4 text-lg w-full md:w-auto relative overflow-hidden group"
                    >
                      {isScanning ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Scanning Cargo...
                        </span>
                      ) : (
                        "Simulate Demo Scan"
                      )}
                    </button>
                    <label
                      className={`cursor-pointer skeuomorphic-btn border border-[#007AFF] text-[#007AFF] px-8 py-4 text-lg w-full md:w-auto text-center ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      Upload Cargo Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                ) : (
                  <div className="bg-[var(--fill-secondary)] rounded-2xl p-6 text-left border border-[var(--separator)] animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">Scan Results</h3>
                      <span className={`badge ${scanResult.spoilagePercentage > 20 ? 'badge-danger' : 'badge-safe'} shadow-sm`}>
                        {scanResult.spoilagePercentage}% Spoilage
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-2 w-full bg-[var(--fill-tertiary)] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${scanResult.spoilagePercentage > 20 ? 'bg-[#FF3B30]' : 'bg-[#34C759]'}`}
                          style={{ width: `${scanResult.spoilagePercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--separator)] mb-6">
                      <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                        <span className="font-bold text-[var(--text-primary)] mr-2">AI Reasoning:</span>
                        {scanResult.reasoning}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setScanResult(null)}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-[var(--text-primary)] bg-[var(--fill-tertiary)] hover:bg-[var(--fill-secondary)] transition-colors border border-[var(--separator)]"
                      >
                        Scan Another
                      </button>
                      <button 
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                          scanResult.spoilagePercentage > 20 
                            ? 'bg-[#FF3B30] hover:bg-[#FF3B30]/90 shadow-[#FF3B30]/20' 
                            : 'bg-[#34C759] hover:bg-[#34C759]/90 shadow-[#34C759]/20'
                        }`}
                      >
                        {scanResult.spoilagePercentage > 20 ? 'Reject Cargo' : 'Accept Cargo'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* ===== DOCUMENT AI TAB ===== */}
            <div className="glass liquid-glass rounded-[2rem] p-8 shadow-2xl border border-[var(--separator)] relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#34C759]/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#007AFF]/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#34C759]/20 to-[#007AFF]/20 border border-[var(--separator)] flex items-center justify-center shadow-inner">
                    <FileText className="w-10 h-10 text-[#34C759]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#007AFF] to-[#34C759]">
                    Document AI Extraction
                  </h2>
                  <p className="text-[var(--text-secondary)] text-lg font-medium max-w-xl mx-auto">
                    Instantly parse Invoices, Bills of Lading, and Manifests using advanced Vision OCR.
                  </p>
                </div>

                <div className="flex flex-col items-center min-h-[400px] justify-center">
                  <AnimatePresence mode="wait">
                    {!docResult && !isScanningDoc ? (
                      <motion.div 
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full"
                      >
                        <div 
                          className="border-2 border-dashed border-[var(--separator)] rounded-3xl p-12 flex flex-col items-center justify-center group backdrop-blur-sm bg-black/5 dark:bg-black/20"
                        >
                          <UploadCloud className="w-16 h-16 text-[var(--text-tertiary)] group-hover:text-[#007AFF] transition-colors mb-6" strokeWidth={1.5} />
                          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Upload Document</h3>
                          <p className="text-sm text-[var(--text-secondary)] mb-6 text-center max-w-sm">
                            Drag and drop your PDF or image here, or click to browse.
                          </p>
                          <div className="flex gap-4">
                            <button onClick={handleScanDoc} className="skeuomorphic-btn border border-[#007AFF] text-[#007AFF] px-8 py-4 text-base font-bold shadow-lg shadow-[#007AFF]/20 rounded-xl">
                              Simulate Demo Extract
                            </button>
                            <label className="cursor-pointer skeuomorphic-btn bg-gradient-to-r from-[#007AFF] to-[#34C759] text-white px-8 py-4 text-base font-bold shadow-lg shadow-[#007AFF]/20 rounded-xl">
                              Upload Document
                              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleDocUpload} />
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    ) : isScanningDoc ? (
                      <motion.div
                        key="scanning"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="w-full h-80 border border-[var(--separator)] rounded-3xl overflow-hidden relative flex flex-col items-center justify-center bg-black/5 dark:bg-black/40 backdrop-blur-md shadow-2xl"
                      >
                        <ScanLine className="w-20 h-20 text-[#34C759] mb-8" strokeWidth={1} />
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 animate-pulse">Extracting Data...</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Running OCR & Semantic Analysis</p>
                        
                        {/* Scanning Line Animation */}
                        <motion.div 
                          className="absolute left-0 right-0 h-1 bg-[#34C759] shadow-[0_0_20px_#34C759]"
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#34C759]/10 to-transparent pointer-events-none" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                      >
                        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-[var(--separator)] rounded-3xl p-8 shadow-2xl">
                          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--separator)]">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#34C759]/20 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-[#34C759]" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Extraction Complete</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Confidence Score: 99.2%</p>
                              </div>
                            </div>
                            <span className="badge badge-safe text-sm px-3 py-1 shadow-sm">
                              {docResult?.type}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-black/5 dark:bg-white/5 border border-[var(--separator)] p-5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 font-semibold">Total Weight</p>
                              <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">{docResult?.weight}</p>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 border border-[var(--separator)] p-5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 font-semibold">Temp Required</p>
                              <p className="font-mono text-2xl font-bold text-[#5AC8FA]">{docResult?.tempRequired}</p>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 border border-[var(--separator)] p-5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 font-semibold">Total Value</p>
                              <p className="font-mono text-2xl font-bold text-[#34C759]">{docResult?.price}</p>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 border border-[var(--separator)] p-5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 font-semibold">Processed Date</p>
                              <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">{docResult?.date}</p>
                            </div>
                          </div>
                          
                          <div className="bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-2xl p-5 mb-8 flex items-start gap-4">
                            <FileJson className="w-6 h-6 text-[#FF9500] shrink-0 mt-1" />
                            <div className="overflow-x-auto w-full">
                              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-3 font-semibold">Raw JSON Payload</p>
                              <pre className="text-xs font-mono text-[#007AFF] whitespace-pre-wrap">
                                {JSON.stringify(docResult, null, 2)}
                              </pre>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <button 
                              onClick={() => setDocResult(null)}
                              className="flex-1 py-3 px-4 rounded-xl font-bold text-[var(--text-primary)] bg-[var(--fill-tertiary)] hover:bg-[var(--fill-secondary)] transition-colors border border-[var(--separator)]"
                            >
                              Scan Another
                            </button>
                            <button 
                              className="flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg shadow-[#007AFF]/20 bg-[#007AFF] hover:bg-[#007AFF]/90 transition-all"
                            >
                              Import to ERP
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="clay text-center p-6">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-extrabold text-[#34C759] drop-shadow-sm">{orders.length}</p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2">Orders This Month</p>
          </div>
          <div className="clay text-center p-6">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-extrabold text-[#007AFF] drop-shadow-sm">
              ₹{orders.reduce((acc, o) => acc + (o.totalValue * 0.15), 0).toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2">Est. Savings</p>
          </div>
          <div className="clay text-center p-6">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-extrabold text-[#FF9500] drop-shadow-sm">
              {(orders.reduce((acc, o) => acc + o.requestedQuantityKg, 0) / 1000).toFixed(1)}T
            </p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2">Food Saved</p>
          </div>
          <div className="clay text-center p-6">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-extrabold text-[#AF52DE] drop-shadow-sm">100%</p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2">Acceptance Rate</p>
          </div>
        </div>
      </main>

      {/* Military-Grade Security Badge */}
      <div className="glass rounded-2xl p-4 mx-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--text-primary)]">Military-Grade Security</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">AES-256 End-to-End Encryption for all manifest & telemetry data</p>
        </div>
        <svg className="w-4 h-4 text-[#34C759] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
      </div>

      {/* NEGOTIATION PANEL */}
      <AnimatePresence>
        {negotiatingBidId && (() => {
          const foundBid = state.bids.find(b => b.id === negotiatingBidId);
          const foundCargo = foundBid ? state.cargos.find(c => c.id === foundBid.cargoId) : null;
          if (!foundBid || !foundCargo) return null;
          return (
            <NegotiationPanel
              bid={foundBid}
              cargo={foundCargo}
              onClose={() => setNegotiatingBidId(null)}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
