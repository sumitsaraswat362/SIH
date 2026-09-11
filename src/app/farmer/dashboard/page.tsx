"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useAppState } from "@/lib/store";
import {
  CROP_DISPLAY_NAMES,
  DEMO_FORECASTS,
  DEMO_MANDI_PRICES,
  GOVERNMENT_SCHEMES,
} from "@/data/mock-data";
import { ProduceListing, Order, CropType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  List,
  Package,
  TrendingUp,
  IndianRupee,
  Landmark,
  Settings,
  LogOut,
  Plus,
  X,
  Upload,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ChevronRight,
  TrendingDown,
  LineChart,
  Wallet,
  Menu,
  Leaf,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

type TabId = "overview" | "listings" | "orders" | "forecasts" | "mandi" | "schemes" | "settings";

// --- HELPERS ---
const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
const getCropName = (key: string) => CROP_DISPLAY_NAMES[key] || key;

// --- TOAST COMPONENT ---
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-4 rounded-2xl shadow-2xl"
    >
      <CheckCircle2 className="w-6 h-6 text-[var(--tint-green)]" />
      <span className="font-semibold">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-[var(--fill-secondary)] rounded-full">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// --- OVERVIEW SECTION ---
function OverviewSection({ onList, orders, listings }: { onList: () => void; orders: Order[]; listings: ProduceListing[] }) {
  const totalEarnings = orders.filter(o => o.status === "delivered" || o.status === "in_transit").reduce((sum, o) => sum + (o.farmerPayout || 0), 0);
  const activeListingCount = listings.filter(l => l.status === "listed").length;
  const middlemanSavings = orders.reduce((sum, o) => sum + (o.middlemanSavings || 0), 0);
  const mandiPremium = orders.length ? (orders.reduce((sum, o) => sum + (o.mandiPriceComparison || 0), 0) / orders.length) : 0;

  // Build chart from the last 7 calendar days (bucketing by weekday name alone
  // would merge orders from different weeks into the same bar once history
  // grows past 7 days).
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const earningsByDate: Record<string, number> = {};
  last7Dates.forEach(d => { earningsByDate[d.toDateString()] = 0; });
  orders.forEach(o => {
    if (o.createdAt) {
      const key = new Date(o.createdAt).toDateString();
      if (key in earningsByDate) earningsByDate[key] += (o.farmerPayout || 0);
    }
  });
  const chartData = last7Dates.map(d => ({
    name: dayNames[d.getDay()],
    earnings: earningsByDate[d.toDateString()],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Earnings", value: formatCurrency(totalEarnings), icon: Wallet, color: "text-[var(--tint-blue)]", bg: "bg-blue-500/10" },
          { label: "Avg. Mandi Premium", value: `+${mandiPremium.toFixed(1)}%`, icon: TrendingUp, color: "text-[var(--tint-green)]", bg: "bg-green-500/10" },
          { label: "Middleman Savings", value: formatCurrency(middlemanSavings), icon: IndianRupee, color: "text-[var(--tint-orange)]", bg: "bg-orange-500/10" },
          { label: "Active Listings", value: activeListingCount, icon: List, color: "text-[var(--tint-purple)]", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-[var(--fill-secondary)] backdrop-blur-xl border border-[var(--separator)] rounded-[24px] p-6 shadow-lg flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[var(--fill-secondary)] backdrop-blur-xl border border-[var(--separator)] rounded-[32px] p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Revenue Trend</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--tint-green)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--tint-green)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--separator)', backdropFilter: 'blur(16px)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="var(--tint-green)" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[var(--tint-green)] to-emerald-700 rounded-[32px] p-8 shadow-xl text-white flex flex-col justify-between"
        >
          <div>
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Ready to sell?</h3>
            <p className="text-green-50 text-sm leading-relaxed">
              List your fresh produce directly to buyers. AI will optimize your pricing and find the best matches.
            </p>
          </div>
          <button
            onClick={onList}
            className="w-full py-4 mt-8 bg-white text-emerald-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg"
          >
            <Plus className="w-5 h-5" />
            List New Produce
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// --- LISTING MODAL ---
function ListingModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { dispatch } = useAppState();
  
  const [cropSearch, setCropSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [variety, setVariety] = useState("");
  const [quantity, setQuantity] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [quality, setQuality] = useState("A");
  const [organic, setOrganic] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [mandiPrice, setMandiPrice] = useState<number | null>(null);
  
  const [showToast, setShowToast] = useState(false);

  // Search filter
  const filteredCrops = useMemo(() => {
    if (!cropSearch) return [];
    return Object.entries(CROP_DISPLAY_NAMES)
      .filter(([key, val]) => val.toLowerCase().includes(cropSearch.toLowerCase()))
      .slice(0, 5);
  }, [cropSearch]);

  // Fetch mandi price effect
  useEffect(() => {
    if (selectedCrop) {
      const p = DEMO_MANDI_PRICES.find(m => m.commodity.toLowerCase() === CROP_DISPLAY_NAMES[selectedCrop]?.toLowerCase());
      if (p) setMandiPrice(p.pricePerKg);
      else setMandiPrice(Math.floor(Math.random() * 50) + 10); // Mock fallback
    } else {
      setMandiPrice(null);
    }
  }, [selectedCrop]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop || !quantity || !askingPrice) return;

    const newListing: ProduceListing = {
      id: `listing-${Date.now()}`,
      farmerId: user?.id || "farmer-001",
      farmerName: user?.name || "Demo Farmer",
      farmerPhone: user?.phone || "9999999999",
      cropType: selectedCrop as CropType,
      cropCategory: "vegetables",
      variety,
      quantityKg: Number(quantity),
      availableQuantityKg: Number(quantity),
      unitOfMeasure: "kg",
      askingPricePerKg: Number(askingPrice),
      minimumPricePerKg: Number(minPrice) || Number(askingPrice) * 0.9,
      currentMandiPrice: mandiPrice || 0,
      minimumSupportPrice: (mandiPrice || 0) * 0.8,
      platformRecommendedPrice: mandiPrice ? mandiPrice * 1.15 : Number(askingPrice),
      harvestDate: Date.now(),
      freshnessScore: 98,
      qualityGrade: quality as any,
      qualityPhotoUrl: photoPreview || undefined,
      organicCertified: organic,
      fssaiCompliant: true,
      farmLocation: { lat: 0, lng: 0 },
      farmAddress: user?.address || "Demo Farm",
      district: user?.district || "Nashik",
      state: user?.state || "Maharashtra",
      pincode: "422001",
      deliveryModes: ["farm_pickup"],
      maxDeliveryRadiusKm: 50,
      status: "listed",
      totalBuyerInterests: 0,
      viewCount: 0,
      createdAt: Date.now(),
    };

    try {
      const res = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newListing) }).catch(() => null);
      if (res && !res.ok) console.error('Failed to create listing in Firestore');
      dispatch({ type: "ADD_LISTING", listing: newListing });
      setShowToast(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-3xl overflow-y-auto"
    >
      <motion.div
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        className="bg-[var(--bg-elevated)] backdrop-blur-xl border border-[var(--separator)] rounded-[32px] w-full max-w-3xl shadow-2xl relative my-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-[var(--fill-secondary)] hover:bg-[var(--fill-primary)] rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[var(--text-primary)]" />
        </button>

        <div className="p-8 border-b border-[var(--separator)]">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">List New Produce</h2>
          <p className="text-[var(--text-secondary)] mt-2">Fill in the details to list your harvest on the marketplace.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Col */}
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Crop Type</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    placeholder="Type to search crop..."
                    value={selectedCrop ? getCropName(selectedCrop) : cropSearch}
                    onChange={(e) => {
                      setCropSearch(e.target.value);
                      setSelectedCrop("");
                    }}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--tint-green)] transition-shadow text-[var(--text-primary)]"
                  />
                </div>
                {filteredCrops.length > 0 && !selectedCrop && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-elevated)] backdrop-blur-3xl border border-[var(--separator)] rounded-2xl shadow-xl overflow-hidden z-20">
                    {filteredCrops.map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setSelectedCrop(key); setCropSearch(""); }}
                        className="w-full text-left px-4 py-3 hover:bg-[var(--fill-secondary)] text-[var(--text-primary)] transition-colors border-b border-[var(--separator)] last:border-0"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Variety (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Nashik Red Hybrid"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--tint-green)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--tint-green)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--tint-green)] text-[var(--text-primary)] appearance-none"
                  >
                    <option value="A+">Grade A+ (Export)</option>
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Asking Price (₹/kg)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--tint-green)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Min Price (₹/kg)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--tint-green)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {mandiPrice !== null && askingPrice && (
                <div className="bg-[var(--tint-blue)]/10 text-[var(--tint-blue)] p-4 rounded-2xl flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Price Comparison</p>
                    <p>Mandi: ₹{mandiPrice} | Your price: ₹{askingPrice}</p>
                    <p className="mt-1 font-medium">
                      {Number(askingPrice) > mandiPrice 
                        ? `+${(((Number(askingPrice) - mandiPrice) / mandiPrice) * 100).toFixed(1)}% premium`
                        : `${(((mandiPrice - Number(askingPrice)) / mandiPrice) * 100).toFixed(1)}% below mandi`}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-[var(--fill-secondary)] rounded-2xl border border-[var(--separator)]">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Organic Produce</p>
                  <p className="text-xs text-[var(--text-secondary)]">Has organic certification</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOrganic(!organic)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${organic ? 'bg-[var(--tint-green)]' : 'bg-[var(--separator)]'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${organic ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Photo Upload</label>
                <div className="relative w-full h-32 border-2 border-dashed border-[var(--separator)] rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-[var(--tint-green)] transition-colors bg-[var(--fill-secondary)] cursor-pointer">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
                      <p className="text-sm text-[var(--text-secondary)]">Drag & drop or click</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--separator)] flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-semibold text-[var(--text-primary)] bg-[var(--fill-secondary)] hover:bg-[var(--fill-primary)] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!selectedCrop || !quantity || !askingPrice} className="px-8 py-3 rounded-2xl font-bold text-white bg-[var(--tint-green)] hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Publish Listing
            </button>
          </div>
        </form>
      </motion.div>

      {showToast && <Toast message="Produce listed successfully!" onClose={() => setShowToast(false)} />}
    </motion.div>
  );
}

// --- MY LISTINGS SECTION ---
function ListingsSection({ listings }: { listings: ProduceListing[] }) {
  if (!listings.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)]">
        <Package className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium">No active listings</h3>
        <p className="text-sm mt-2">Create a new listing to start selling.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">My Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {listings.map((listing, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={listing.id}
            className="bg-[var(--fill-secondary)] backdrop-blur-xl border border-[var(--separator)] rounded-[24px] overflow-hidden shadow-lg hover:shadow-xl transition-all"
          >
            <div className="h-40 bg-[var(--separator)] relative">
              {listing.qualityPhotoUrl ? (
                <img src={listing.qualityPhotoUrl} alt={listing.cropType} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 text-emerald-800 text-5xl">
                  🌾
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                  listing.status === 'listed' ? 'bg-green-500/90 text-white' : 
                  listing.status === 'negotiating' ? 'bg-yellow-500/90 text-white' : 
                  'bg-blue-500/90 text-white'
                }`}>
                  {listing.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {getCropName(listing.cropType)} <span className="text-[var(--text-tertiary)] text-sm font-normal">{listing.variety}</span>
                </h3>
                <p className="text-lg font-bold text-[var(--tint-green)]">₹{listing.askingPricePerKg}/kg</p>
              </div>
              <div className="flex gap-4 text-sm text-[var(--text-secondary)] mb-6">
                <span className="flex items-center gap-1"><Package className="w-4 h-4"/> {listing.quantityKg} kg</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Grade {listing.qualityGrade}</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-[var(--separator)]">
                <div className="text-xs text-[var(--text-tertiary)] flex gap-4">
                  <span className="flex items-center gap-1"><Search className="w-3.5 h-3.5"/> {listing.viewCount} views</span>
                  <span className="flex items-center gap-1 text-[var(--tint-blue)]"><Wallet className="w-3.5 h-3.5"/> {listing.totalBuyerInterests} interests</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-[var(--fill-secondary)] hover:bg-[var(--fill-primary)] rounded-xl transition-colors">
                    <Settings className="w-4 h-4 text-[var(--text-primary)]" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- MY ORDERS SECTION ---
function OrdersSection({ orders, dispatch }: { orders: Order[]; dispatch: React.Dispatch<any> }) {
  const handleOrderAction = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      if (res.ok) {
        dispatch({ type: 'UPDATE_ORDER_STATUS', orderId, status });
      }
    } catch (e) {
      console.error('Failed to update order:', e);
    }
  };

  if (!orders.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)]">
        <Truck className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium">No orders yet</h3>
        <p className="text-sm mt-2">Orders from buyers will appear here</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'confirmed': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'in_transit': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'delivered': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      <div className="grid gap-6">
        {orders.map((order, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={order.id}
            className="bg-[var(--fill-secondary)] backdrop-blur-xl border border-[var(--separator)] rounded-[24px] p-6 shadow-md flex flex-col md:flex-row gap-6 items-center"
          >
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{getCropName(order.cropType)} <span className="font-normal text-[var(--text-secondary)]">({order.quantityKg} kg)</span></h3>
                  <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> Buyer: {order.buyerName}
                  </p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.status as string)}`}>
                  {(order.status as string).toUpperCase().replace('_', ' ')}
                </div>
              </div>
              
              <div className="flex gap-8 text-sm mt-6">
                <div>
                  <p className="text-[var(--text-tertiary)] mb-1">Agreed Price</p>
                  <p className="font-semibold text-[var(--text-primary)]">₹{order.agreedPricePerKg}/kg</p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)] mb-1">Total Payout</p>
                  <p className="font-bold text-[var(--tint-green)] text-lg">₹{order.farmerPayout}</p>
                </div>
              </div>
            </div>

            {order.status === 'pending' && (
              <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                <button 
                  onClick={() => handleOrderAction(order.id, 'confirmed')}
                  className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-[var(--tint-green)] text-white font-semibold hover:bg-green-600 transition-colors shadow-lg"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleOrderAction(order.id, 'cancelled')}
                  className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
            {order.status !== 'pending' && (
              <div className="w-full md:w-64 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[var(--separator)] md:pl-6 flex flex-col justify-center">
                <div className="relative">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[var(--separator)] z-0"></div>
                  {['confirmed', 'picked_up', 'in_transit', 'delivered'].map((step, idx) => {
                    const statusOrder = ['pending', 'confirmed', 'picked_up', 'in_transit', 'delivered'];
                    const currentIdx = statusOrder.indexOf(order.status as string);
                    const stepIdx = statusOrder.indexOf(step);
                    const isCompleted = currentIdx >= stepIdx;
                    
                    return (
                      <div key={step} className="flex items-center gap-4 mb-4 relative z-10">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-[var(--tint-green)] border-[var(--tint-green)]' : 'bg-[var(--bg-elevated)] border-[var(--separator)]'}`}>
                          {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs font-medium ${isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                          {step.charAt(0).toUpperCase() + step.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- DEMAND FORECAST SECTION ---
function ForecastsSection({ region }: { region?: string }) {
  const [forecasts, setForecasts] = useState(DEMO_FORECASTS);
  const [isAI, setIsAI] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const crops = ['onions', 'tomatoes', 'wheat', 'potatoes', 'grapes'];
    Promise.all(crops.map(crop =>
      fetch(`/api/demand-forecast?crop=${crop}&region=${encodeURIComponent(region || 'Maharashtra')}`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)
    )).then(results => {
      const valid = results.filter(r => r && r.forecast).map(r => r.forecast);
      if (valid.length > 0) {
        setForecasts(valid);
        setIsAI(true);
      }
    }).finally(() => setLoading(false));
  }, [region]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">AI Demand Forecasts</h2>
          {loading ? (
            <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-lg font-bold animate-pulse">Analyzing...</span>
          ) : isAI ? (
            <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded-lg font-bold">🤖 AI Powered</span>
          ) : (
            <span className="text-xs bg-[var(--fill-secondary)] text-[var(--text-tertiary)] px-2 py-1 rounded-lg font-bold">📊 Historical</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {forecasts.map((forecast, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={`${forecast.cropType}-${i}`}
            className="bg-[var(--fill-secondary)] backdrop-blur-xl border border-[var(--separator)] rounded-[24px] p-6 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[var(--text-primary)] capitalize">{forecast.cropType}</h3>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  forecast.trend === 'rising' ? 'bg-green-500/20 text-green-600' :
                  forecast.trend === 'falling' ? 'bg-red-500/20 text-red-600' :
                  'bg-yellow-500/20 text-yellow-600'
                }`}>
                  {forecast.trend === 'rising' && <TrendingUp className="w-3 h-3" />}
                  {forecast.trend === 'falling' && <TrendingDown className="w-3 h-3" />}
                  {forecast.trend === 'stable' && <span className="w-3 h-3 flex items-center justify-center">-</span>}
                  {forecast.trend.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--separator)]">
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">Current Price</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">₹{forecast.currentPricePerKg}/kg</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">Predicted (7d)</p>
                  <p className={`text-lg font-bold ${forecast.predictedPricePerKg > forecast.currentPricePerKg ? 'text-[var(--tint-green)]' : 'text-[var(--text-primary)]'}`}>
                    ₹{forecast.predictedPricePerKg}/kg
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[var(--fill-primary)] p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 text-[var(--tint-blue)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{forecast.recommendation}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[var(--separator)] flex justify-between items-center text-xs text-[var(--text-tertiary)]">
              <span>Confidence: {(forecast.confidence * 100).toFixed(0)}%</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Valid for 7 days</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- MANDI PRICES SECTION ---
function MandiPricesSection() {
  const [filterState, setFilterState] = useState("");
  const [prices, setPrices] = useState(DEMO_MANDI_PRICES);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mandi-prices')
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setPrices(data.data);
          setIsLive(data.source === 'gov');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  
  const filteredPrices = prices.filter(p => !filterState || p.state === filterState);
  const states = Array.from(new Set(prices.map(p => p.state)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Mandi Prices</h2>
          {loading ? (
            <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-lg font-bold animate-pulse">Loading...</span>
          ) : isLive ? (
            <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-lg font-bold">🟢 Live from data.gov.in</span>
          ) : (
            <span className="text-xs bg-[var(--fill-secondary)] text-[var(--text-tertiary)] px-2 py-1 rounded-lg font-bold">📊 Demo Data</span>
          )}
        </div>
        <select 
          value={filterState} 
          onChange={(e) => setFilterState(e.target.value)}
          className="bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tint-green)] text-[var(--text-primary)]"
        >
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-[var(--bg-elevated)] backdrop-blur-xl border border-[var(--separator)] rounded-[24px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--fill-secondary)] border-b border-[var(--separator)]">
                <th className="p-4 font-semibold text-sm text-[var(--text-secondary)]">Commodity</th>
                <th className="p-4 font-semibold text-sm text-[var(--text-secondary)]">Market</th>
                <th className="p-4 font-semibold text-sm text-[var(--text-secondary)]">Min Price (₹/q)</th>
                <th className="p-4 font-semibold text-sm text-[var(--text-secondary)]">Max Price (₹/q)</th>
                <th className="p-4 font-semibold text-sm text-[var(--text-secondary)] bg-[var(--tint-green)]/10 text-green-800">Modal Price (₹/q)</th>
                <th className="p-4 font-semibold text-sm text-[var(--text-secondary)]">Price/Kg</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.map((row, i) => (
                <tr key={i} className="border-b border-[var(--separator)] hover:bg-[var(--fill-tertiary)] transition-colors">
                  <td className="p-4 text-[var(--text-primary)] font-medium">
                    {row.commodity} <span className="text-xs text-[var(--text-tertiary)] block">{row.variety}</span>
                  </td>
                  <td className="p-4 text-[var(--text-primary)]">
                    {row.market} <span className="text-xs text-[var(--text-tertiary)] block">{row.district}, {row.state}</span>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">₹{row.minPrice}</td>
                  <td className="p-4 text-[var(--text-secondary)]">₹{row.maxPrice}</td>
                  <td className="p-4 font-bold text-[var(--tint-green)] bg-[var(--tint-green)]/5">₹{row.modalPrice}</td>
                  <td className="p-4 text-[var(--text-primary)] font-semibold">₹{row.pricePerKg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- GOVT SCHEMES SECTION ---
function SchemesSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Government Schemes & Subsidies</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {GOVERNMENT_SCHEMES.map((scheme, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={scheme.id}
            className="bg-[var(--fill-secondary)] backdrop-blur-xl border border-[var(--separator)] rounded-[24px] p-6 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                  <Landmark className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-[var(--bg-primary)] border border-[var(--separator)] rounded-full text-xs font-bold text-[var(--text-secondary)] uppercase">
                  {scheme.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{scheme.name}</h3>
              {scheme.nameHindi && <p className="text-sm font-medium text-[var(--tint-orange)] mb-3">{scheme.nameHindi}</p>}
              <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">{scheme.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--separator)]">
                  <span className="text-xs text-[var(--text-tertiary)] block mb-1">Benefit</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{scheme.benefit}</span>
                </div>
                <div className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--separator)]">
                  <span className="text-xs text-[var(--text-tertiary)] block mb-1">Eligibility</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{scheme.eligibility}</span>
                </div>
              </div>
            </div>
            
            <a 
              href={scheme.applicationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Apply Now <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- SETTINGS SECTION ---
function SettingsSection({ user }: { user: any }) {
  return (
    <div className="max-w-3xl space-y-8">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      
      <div className="bg-[var(--fill-secondary)] backdrop-blur-xl border border-[var(--separator)] rounded-[24px] p-8 shadow-md">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg text-white text-4xl font-bold">
            {user?.name?.charAt(0) || "F"}
          </div>
          <div>
            <h3 className="text-2xl font-bold">{user?.name || "Farmer"}</h3>
            <p className="text-[var(--text-secondary)]">{user?.phone || "+91 99999 99999"}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-[var(--tint-green)]/10 text-[var(--tint-green)] font-bold text-xs rounded-full">
              VERIFIED FARMER
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">State</label>
            <input type="text" disabled value={user?.state || "Maharashtra"} className="w-full bg-[var(--bg-primary)] border border-[var(--separator)] rounded-xl py-3 px-4 text-[var(--text-primary)] opacity-70" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">District</label>
            <input type="text" disabled value={user?.district || "Nashik"} className="w-full bg-[var(--bg-primary)] border border-[var(--separator)] rounded-xl py-3 px-4 text-[var(--text-primary)] opacity-70" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Farm Address / Village</label>
            <input type="text" disabled value={user?.village || "Pimpalgaon Baswant"} className="w-full bg-[var(--bg-primary)] border border-[var(--separator)] rounded-xl py-3 px-4 text-[var(--text-primary)] opacity-70" />
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[var(--separator)]">
          <button className="px-6 py-3 bg-[var(--tint-blue)] text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-md">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD COMPONENT ---
export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const { state, dispatch } = useAppState();
  const { listings, orders } = state;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showListingModal, setShowListingModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const farmerId = user?.id || "farmer-001";
  const myOrders = orders.filter((o) => o.farmerId === farmerId);
  const myListings = listings.filter((l) => l.farmerId === farmerId);

  const TABS: { id: TabId; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "listings", label: "My Listings", icon: List },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "forecasts", label: "Demand Forecast", icon: TrendingUp },
    { id: "mandi", label: "Mandi Prices", icon: LineChart },
    { id: "schemes", label: "Govt Schemes", icon: Landmark },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[var(--bg-elevated)] backdrop-blur-2xl border-r border-[var(--separator)] p-4 shadow-[var(--shadow-drawer)] z-20">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">Annapurna</h1>
            <p className="text-[var(--text-tertiary)] text-xs">Farmer Portal</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-[var(--tint-green)] text-white shadow-md shadow-green-500/20"
                  : "text-[var(--text-secondary)] hover:bg-[var(--fill-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-6 bg-[var(--bg-elevated)] backdrop-blur-xl border-b border-[var(--separator)] z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 rounded-xl bg-[var(--fill-secondary)]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">
                Welcome, {user?.name?.split(" ")[0] || "Farmer"} 🌾
              </h2>
              <p className="text-[var(--text-secondary)] text-sm flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {user?.village || "Demo Village"}, {user?.district || "Nashik"}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowListingModal(true)}
            className="hidden md:flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-5 py-2.5 rounded-full font-medium text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            List New Produce
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "overview" && <OverviewSection onList={() => setShowListingModal(true)} orders={myOrders} listings={myListings} />}
              {activeTab === "listings" && <ListingsSection listings={myListings} />}
              {activeTab === "orders" && <OrdersSection orders={myOrders} dispatch={dispatch} />}
              {activeTab === "forecasts" && <ForecastsSection region={user?.state} />}
              {activeTab === "mandi" && <MandiPricesSection />}
              {activeTab === "schemes" && <SchemesSection />}
              {activeTab === "settings" && <SettingsSection user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <button
        onClick={() => setShowListingModal(true)}
        className="md:hidden absolute bottom-24 right-6 w-14 h-14 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full flex items-center justify-center shadow-[var(--shadow-elevated)] z-20 active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-elevated)] backdrop-blur-2xl border-t border-[var(--separator)] flex justify-around items-center px-2 z-20 pb-safe">
        {TABS.slice(0, 5).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 ${
              activeTab === tab.id ? "text-[var(--tint-green)]" : "text-[var(--text-tertiary)]"
            }`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? "fill-[var(--tint-green)]/20" : ""}`} />
            <span className="text-[10px] font-medium">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {showListingModal && <ListingModal onClose={() => setShowListingModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
