"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "motion/react";
import ThemeToggle from "@/components/ThemeToggle";

const INDIAN_CITIES = [
  // Maharashtra
  "Mumbai", "Pune", "Nashik", "Nagpur", "Thane", "Navi Mumbai", "Kalyan", "Aurangabad", "Solapur", "Kolhapur", "Ratnagiri", "Sangli", "Satara", "Amravati", "Akola", "Latur", "Jalgaon", "Ahmednagar", "Bhiwandi", "Malegaon", "Panvel", "Vasai-Virar",
  // Delhi NCR
  "New Delhi", "Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad", "Greater Noida",
  // Karnataka
  "Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum", "Davangere", "Shimoga",
  // Tamil Nadu
  "Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Erode", "Vellore",
  // Telangana & Andhra Pradesh
  "Hyderabad", "Vijayawada", "Visakhapatnam", "Warangal", "Guntur", "Nellore", "Tirupati", "Kakinada",
  // Gujarat
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Junagadh", "Anand", "Vapi", "Morbi",
  // Rajasthan
  "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara",
  // Uttar Pradesh
  "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Mathura", "Jhansi",
  // Madhya Pradesh
  "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa",
  // West Bengal
  "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Kharagpur",
  // Bihar & Jharkhand
  "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro",
  // Punjab & Haryana
  "Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Karnal", "Panipat", "Hisar", "Ambala",
  // Kerala
  "Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kannur", "Kollam",
  // Odisha
  "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur",
  // Assam & NE
  "Guwahati", "Silchar", "Dibrugarh", "Imphal", "Shillong", "Agartala", "Aizawl", "Itanagar",
  // Others
  "Dehradun", "Haridwar", "Rishikesh", "Shimla", "Jammu", "Srinagar", "Raipur", "Bilaspur", "Goa", "Panaji", "Margao"
];

export default function Home() {
  const { login } = useAuth();
  const [role, setRole] = useState<"director" | "wholesaler">("director");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
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
    if (role === "wholesaler" && (!city.trim() || !address.trim())) {
      setError("City and delivery address are required.");
      return;
    }
    const loc = role === "wholesaler" ? `${address}, ${city}` : location;
    const err = await login(name, role, password, loc, city, address, coords || undefined);
    if (err) setError(err);
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[var(--bg-primary)] aura-container">
      
      {/* Dynamic Liquid Glass Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aura-orb aura-blue w-[50vw] h-[50vw] top-[-10%] left-[-10%] opacity-40 animate-[blob_10s_infinite_alternate]" />
        <div className="aura-orb aura-green w-[60vw] h-[60vw] bottom-[-10%] right-[-10%] opacity-30 animate-[blob_12s_infinite_alternate-reverse]" />
        <div className="aura-orb w-[30vw] h-[30vw] bg-gradient-to-r from-[#FF2D55] to-[#FF9500] top-[20%] right-[20%] opacity-20 animate-[blob_14s_infinite]" style={{ filter: 'blur(90px)' }} />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564')] bg-cover bg-center opacity-[0.03] dark:opacity-10 mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: "1000px" }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Premium 3D Logo */}
        <div className="text-center mb-10 relative">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1, type: "spring", bounce: 0.5 }}
            className="w-28 h-28 mx-auto mb-6 rounded-[32px] relative flex items-center justify-center group transform-gpu transition-all duration-700 hover:scale-105 hover:-translate-y-2 glass"
            style={{
              boxShadow: "0 20px 40px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.4)"
            }}
          >
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#007AFF] to-[#34C759] opacity-10 group-hover:opacity-30 transition-opacity duration-500 blur-xl" />
            <svg className="w-14 h-14 text-black dark:text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </motion.div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 text-[#000000] dark:text-white drop-shadow-md">
            Annapurna
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-sm mx-auto font-bold tracking-wide">Next-Gen Logistics</p>
        </div>

        {/* Liquid Glass Form */}
        <form 
          onSubmit={handleLogin} 
          className="p-8 relative rounded-[40px] transform-gpu transition-all duration-500 glass shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_0_40px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_0_100px_rgba(255,255,255,0.03)] pointer-events-none" />

          {/* Claymorphism Role Selector */}
          <div className="mb-8 relative z-10">
            <div className="flex p-2 bg-[var(--fill-secondary)] rounded-[24px] relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)] border border-[var(--separator)]">
              <motion.div
                className="absolute top-2 bottom-2 w-[calc(50%-8px)] rounded-[18px] bg-[var(--bg-primary)] shadow-sm border border-[var(--separator)] backdrop-blur-md"
                animate={{ x: role === "director" ? "0%" : "100%" }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
              />
              <button type="button" onClick={() => setRole("director")} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[18px] text-[15px] font-bold transition-all z-10 ${role === "director" ? "text-[var(--text-primary)] drop-shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" /></svg>
                Fleet
              </button>
              <button type="button" onClick={() => setRole("wholesaler")} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[18px] text-[15px] font-bold transition-all z-10 ${role === "wholesaler" ? "text-[var(--text-primary)] drop-shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349" /></svg>
                Wholesaler
              </button>
            </div>
          </div>

          <div className="space-y-5 relative z-10">
            {/* Liquid Input Fields */}
            <div>
              <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)] ml-2 tracking-wide">
                {role === "director" ? "Logistics Company" : "Business Name"}
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder={role === "director" ? "e.g. BlueDart Logistics" : "e.g. Fresh Foods Co."}
                required
                className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[20px] px-6 py-4.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg-primary)] focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all shadow-sm text-[16px] font-bold"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)] ml-2 tracking-wide">
                Secure Key
              </label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[20px] px-6 py-4.5 pr-12 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg-primary)] focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all shadow-sm text-[16px] font-bold tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* GPS Location Button */}
            <AnimatePresence>
              {role === "director" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)] ml-2 tracking-wide mt-1">Live Tracking</label>
                  <button type="button" onClick={requestLocation}
                    className={`w-full flex items-center justify-center gap-3 py-4.5 rounded-[20px] border-[1.5px] text-[15px] font-bold transition-all shadow-sm ${
                      geoStatus === "success"
                        ? "bg-[#34C759]/10 border-[#34C759]/50 text-[#34C759] shadow-[0_0_15px_rgba(52,199,89,0.2)]"
                        : geoStatus === "error"
                        ? "bg-[#FF3B30]/10 border-[#FF3B30]/50 text-[#FF3B30]"
                        : geoStatus === "loading"
                        ? "bg-[#007AFF]/10 border-[#007AFF]/50 text-[#007AFF] animate-pulse"
                        : "bg-[var(--fill-secondary)] border-[var(--separator)] text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {geoStatus === "success" && coords
                      ? `GPS Locked: ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`
                      : geoStatus === "loading"
                      ? "Acquiring Satellites..."
                      : geoStatus === "error"
                      ? "Signal Lost — Retry"
                      : "Engage GPS Module"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wholesaler Details */}
            <AnimatePresence>
              {role === "wholesaler" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-5">
                  <div className="pt-1">
                    <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)] ml-2 tracking-wide">Market Hub (City)</label>
                    <input type="text" list="city-list" value={city} onChange={(e) => setCity(e.target.value)}
                      placeholder="Select City..."
                      required autoComplete="off"
                      className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[20px] px-6 py-4.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg-primary)] focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all shadow-sm text-[16px] font-bold"
                    />
                    <datalist id="city-list">
                      {INDIAN_CITIES.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-bold text-[var(--text-secondary)] ml-2 tracking-wide">Delivery Node</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. APMC Hub, Sector 19"
                      required
                      className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-[20px] px-6 py-4.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg-primary)] focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all shadow-sm text-[16px] font-bold"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-[16px] backdrop-blur-md">
                  <p className="text-[15px] text-[#FF3B30] font-bold text-center flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>
                    {error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hyper-Premium 3D Button */}
          <button type="submit"
            className="w-full mt-10 relative group outline-none"
          >
            {/* Button Shadow/Glow */}
            <div className={`absolute -inset-1 rounded-[22px] blur-lg opacity-40 group-hover:opacity-100 transition-opacity duration-500 ${role === "director" ? "bg-[#007AFF]" : "bg-[#34C759]"}`} />
            
            <div 
              className={`relative flex items-center justify-center gap-3 w-full py-5 rounded-[20px] text-[18px] font-extrabold text-white transform-gpu transition-all duration-300 group-hover:-translate-y-1 group-active:translate-y-1 group-active:scale-[0.98] ${
                role === "director"
                  ? "bg-gradient-to-b from-[#47A1FF] via-[#007AFF] to-[#005bb5]"
                  : "bg-gradient-to-b from-[#5CE67B] via-[#34C759] to-[#248a3d]"
              }`}
              style={{
                boxShadow: `0 10px 20px rgba(0,0,0,0.2), inset 0 2px 2px rgba(255,255,255,0.3), inset 0 -4px 6px rgba(0,0,0,0.1)`
              }}
            >
              Initialize Session
              <svg className="w-5 h-5 text-white/90 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>
        </form>

        {/* Premium Bottom Info */}
        <div className="mt-12 flex items-center justify-center gap-10 text-center relative z-10">
          <div className="flex flex-col items-center group cursor-default">
            <div className="w-10 h-10 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] flex items-center justify-center mb-2 shadow-sm group-hover:bg-[var(--fill-tertiary)] transition-colors">
              <svg className="w-5 h-5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Live Sync</p>
          </div>
          <div className="flex flex-col items-center group cursor-default">
            <div className="w-10 h-10 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] flex items-center justify-center mb-2 shadow-sm group-hover:bg-[var(--fill-tertiary)] transition-colors">
              <svg className="w-5 h-5 text-[#AF52DE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09l2.846.813-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">AI Core</p>
          </div>
          <div className="flex flex-col items-center group cursor-default">
            <div className="w-10 h-10 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] flex items-center justify-center mb-2 shadow-sm group-hover:bg-[var(--fill-tertiary)] transition-colors">
              <svg className="w-5 h-5 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">AES-256</p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
