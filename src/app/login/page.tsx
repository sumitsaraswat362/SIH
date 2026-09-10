"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { motion } from "motion/react";
import ThemeToggle from "@/components/ThemeToggle";
import { INDIAN_STATES } from "@/data/mock-data";

const INDIAN_CITIES = [
  "Mumbai", "Pune", "Nashik", "Nagpur", "Thane", "Navi Mumbai", "Kolhapur", "Aurangabad", "Solapur", "Sangli", "Amravati", "Jalgaon",
  "New Delhi", "Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad",
  "Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum",
  "Chennai", "Coimbatore", "Madurai", "Salem", "Erode",
  "Hyderabad", "Vijayawada", "Visakhapatnam", "Guntur",
  "Ahmedabad", "Surat", "Vadodara", "Rajkot",
  "Jaipur", "Jodhpur", "Udaipur", "Kota",
  "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj",
  "Bhopal", "Indore", "Jabalpur", "Gwalior",
  "Kolkata", "Howrah", "Durgapur", "Siliguri",
  "Patna", "Gaya", "Ranchi", "Jamshedpur",
  "Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Karnal",
  "Kochi", "Thiruvananthapuram", "Kozhikode",
  "Bhubaneswar", "Cuttack", "Rourkela",
  "Guwahati", "Imphal", "Shillong",
  "Dehradun", "Shimla", "Raipur", "Goa",
];

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState<"farmer" | "buyer">("farmer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Farmer fields
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  // Buyer fields
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [buyerType, setBuyerType] = useState<"consumer" | "retailer" | "restaurant" | "bulk_buyer">("consumer");
  // Common
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const requestLocation = () => {
    setGeoStatus("loading");
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("success");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;
    
    // Map our new roles to the auth system's expected format
    const authRole = role === "farmer" ? "director" : "wholesaler";
    const loc = role === "farmer" 
      ? `${village}, ${district}, ${state}` 
      : `${address}, ${city}`;
    const loginCity = role === "farmer" ? district : city;
    const loginAddress = role === "farmer" ? `${village}, ${district}` : address;
    
    const err = await login(name, authRole, password, loc, loginCity, loginAddress, coords || undefined);
    if (err) setError(err);
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[var(--bg-primary)] aura-container">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aura-orb aura-green w-[50vw] h-[50vw] top-[-10%] left-[-10%] opacity-40 animate-[blob_10s_infinite_alternate]" />
        <div className="aura-orb w-[60vw] h-[60vw] bg-gradient-to-r from-[#34C759] to-[#007AFF] bottom-[-10%] right-[-10%] opacity-30 animate-[blob_12s_infinite_alternate-reverse]" />
        <div className="aura-orb w-[30vw] h-[30vw] bg-gradient-to-r from-[#FF9500] to-[#FFCC00] top-[20%] right-[20%] opacity-20 animate-[blob_14s_infinite]" style={{ filter: 'blur(90px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Logo */}
        <div className="text-center mb-8 relative">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1, type: "spring", bounce: 0.5 }}
            className="w-24 h-24 mx-auto mb-5 rounded-[28px] relative flex items-center justify-center group glass"
            style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.4)" }}
          >
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#34C759] to-[#FF9500] opacity-15 group-hover:opacity-30 transition-opacity duration-500 blur-xl" />
            {/* Wheat/Farm icon */}
            <svg className="w-12 h-12 text-[#34C759] dark:text-[#30D158] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-1.5 text-[#000000] dark:text-white">
            Annapurna
          </h1>
          <p className="text-[var(--text-secondary)] text-base font-semibold tracking-wide">
            Direct Farm-to-Fork Marketplace
          </p>
          <p className="text-[var(--text-tertiary)] text-xs mt-1">
            SIH 26033 • Ministry of Consumer Affairs
          </p>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleLogin} 
          className="p-7 relative rounded-[36px] glass shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
        >
          <div className="absolute inset-0 rounded-[36px] shadow-[inset_0_0_40px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_0_100px_rgba(255,255,255,0.03)] pointer-events-none" />

          {/* Role Selector */}
          <div className="mb-6 relative z-10">
            <div className="flex p-1.5 bg-[var(--fill-secondary)] rounded-[20px] relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)] border border-[var(--separator)]">
              <motion.div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[16px] bg-[var(--bg-primary)] shadow-sm border border-[var(--separator)]"
                animate={{ x: role === "farmer" ? "0%" : "100%" }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
              />
              <button type="button" onClick={() => setRole("farmer")} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-sm font-bold transition-all z-10 ${role === "farmer" ? "text-[#34C759]" : "text-[var(--text-secondary)]"}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
                🌾 Farmer
              </button>
              <button type="button" onClick={() => setRole("buyer")} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-sm font-bold transition-all z-10 ${role === "buyer" ? "text-[#007AFF]" : "text-[var(--text-secondary)]"}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                🛒 Buyer
              </button>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {/* Name */}
            <div>
              <label className="block mb-1.5 text-xs font-bold text-[var(--text-secondary)] ml-2 tracking-wide uppercase">
                {role === "farmer" ? "Farmer / FPO Name" : "Your Name / Business"}
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder={role === "farmer" ? "e.g. Ramesh Patil" : "e.g. Anita Sharma"}
                required
                className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[16px] px-5 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all text-sm font-semibold"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1.5 text-xs font-bold text-[var(--text-secondary)] ml-2 tracking-wide uppercase">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[16px] px-5 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all text-sm font-semibold"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1.5 text-xs font-bold text-[var(--text-secondary)] ml-2 tracking-wide uppercase">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[16px] px-5 py-3.5 pr-12 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all text-sm font-semibold"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* --- FARMER-SPECIFIC FIELDS --- */}
            {role === "farmer" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-[var(--text-secondary)] ml-2 tracking-wide uppercase">State</label>
                  <select value={state} onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[16px] px-5 py-3.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all text-sm font-semibold appearance-none"
                  >
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-[var(--text-secondary)] ml-2 tracking-wide uppercase">District</label>
                    <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Nashik"
                      className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[16px] px-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-[var(--text-secondary)] ml-2 tracking-wide uppercase">Village</label>
                    <input type="text" value={village} onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Vinchur"
                      className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[16px] px-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all text-sm font-semibold"
                    />
                  </div>
                </div>
                {/* GPS Location */}
                <button type="button" onClick={requestLocation}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-sm font-bold transition-all border ${
                    geoStatus === "success" 
                      ? "bg-[#34C75915] border-[#34C759] text-[#34C759]" 
                      : geoStatus === "error"
                      ? "bg-[#FF3B3015] border-[#FF3B30] text-[#FF3B30]"
                      : "bg-[var(--fill-secondary)] border-[var(--separator)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {geoStatus === "loading" && <span className="animate-spin">⏳</span>}
                  {geoStatus === "success" && "✅ Farm Location Detected"}
                  {geoStatus === "error" && "❌ Location Failed — Try Again"}
                  {geoStatus === "idle" && "📍 Detect Farm Location (GPS)"}
                </button>
              </motion.div>
            )}

            {/* --- BUYER-SPECIFIC FIELDS --- */}
            {role === "buyer" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-[var(--text-secondary)] ml-2 tracking-wide uppercase">I am a</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["consumer", "retailer", "restaurant", "bulk_buyer"] as const).map((bt) => (
                      <button key={bt} type="button" onClick={() => setBuyerType(bt)}
                        className={`py-2.5 px-3 rounded-[14px] text-xs font-bold transition-all border ${
                          buyerType === bt 
                            ? "bg-[#007AFF15] border-[#007AFF] text-[#007AFF]" 
                            : "bg-[var(--fill-secondary)] border-[var(--separator)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {bt === "consumer" && "🏠 Consumer"}
                        {bt === "retailer" && "🏪 Retailer"}
                        {bt === "restaurant" && "🍽️ Restaurant"}
                        {bt === "bulk_buyer" && "📦 Bulk Buyer"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-[var(--text-secondary)] ml-2 tracking-wide uppercase">City</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[16px] px-5 py-3.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all text-sm font-semibold appearance-none"
                  >
                    <option value="">Select your city</option>
                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-[var(--text-secondary)] ml-2 tracking-wide uppercase">Delivery Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. B-404 Riviera Towers, Kothrud"
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[16px] px-5 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all text-sm font-semibold"
                  />
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#FF3B30] text-sm text-center font-semibold bg-[#FF3B3010] rounded-[12px] p-3">
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-[20px] font-bold text-base text-white shadow-lg transition-all ${
                role === "farmer" 
                  ? "bg-gradient-to-r from-[#34C759] to-[#30D158] shadow-[#34C75940]" 
                  : "bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] shadow-[#007AFF40]"
              }`}
            >
              {role === "farmer" ? "🌾 Enter as Farmer" : "🛒 Enter as Buyer"}
            </motion.button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                🔒 Secure Login
              </span>
              <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                🇮🇳 Made in India
              </span>
              <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                🏛️ SIH 26033
              </span>
            </div>
          </div>
        </form>

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">
            Ministry of Consumer Affairs, Food & Public Distribution
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Department of Consumer Affairs (DoCA)
          </p>
        </div>
      </motion.div>

      <ThemeToggle />
    </main>
  );
}
