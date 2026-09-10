"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppState } from "@/lib/store";
import { ProduceListing, CartItem } from "@/lib/types";
import { DEMO_LISTINGS } from "@/data/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Leaf, Clock, ShoppingCart, 
  TrendingDown, CheckCircle2, ChevronDown, Filter, 
  Sparkles, Plus, Minus
} from "lucide-react";

const CATEGORIES = ["All", "Vegetables", "Fruits", "Grains", "Pulses", "Spices", "Dairy", "Organic"];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "freshness", label: "Freshness (Harvest Time)" }
];

export default function BuyerMarketplace() {
  const { state, dispatch } = useAppState();
  
  // Use state.listings if available, otherwise fallback to DEMO_LISTINGS
  const activeListings = state.listings.length > 0 ? state.listings : DEMO_LISTINGS;

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [smartQuery, setSmartQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [aiFilterSummary, setAiFilterSummary] = useState<string | null>(null);

  // Cart Modal State
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Smart AI Search Handler
  const handleSmartSearch = async () => {
    if (!smartQuery.trim()) return;
    setIsAiSearching(true);
    
    try {
      // Simulate API call to /api/filter-ai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic mock parsing for demo purposes
      const q = smartQuery.toLowerCase();
      if (q.includes("organic")) setActiveCategory("Organic");
      else if (q.includes("tomato")) { setActiveCategory("Vegetables"); setSearchQuery("tomato"); }
      else if (q.includes("fruit")) setActiveCategory("Fruits");
      else if (q.includes("grain")) setActiveCategory("Grains");
      
      setAiFilterSummary(`Smart filtered for: "${smartQuery}"`);
      setSmartQuery("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Filtering and Sorting Logic
  const filteredListings = useMemo(() => {
    let result = activeListings.filter(l => l.status === "listed" || l.status === "matched");

    if (activeCategory !== "All") {
      if (activeCategory === "Organic") {
        result = result.filter(l => l.organicCertified);
      } else {
        result = result.filter(l => l.cropCategory.toLowerCase() === activeCategory.toLowerCase());
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.cropType.toLowerCase().includes(q) || 
        (l.variety && l.variety.toLowerCase().includes(q)) ||
        l.farmerName.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.askingPricePerKg - b.askingPricePerKg);
        break;
      case "price_high":
        result.sort((a, b) => b.askingPricePerKg - a.askingPricePerKg);
        break;
      case "freshness":
        result.sort((a, b) => b.harvestDate - a.harvestDate); // Newest first
        break;
      default:
        // recommended could just be freshness or rating (using mock sorting here)
        result.sort((a, b) => (b.freshnessScore || 0) - (a.freshnessScore || 0));
        break;
    }

    return result;
  }, [activeListings, activeCategory, searchQuery, sortBy]);

  const totalCartItems = state.cart.reduce((acc, item) => acc + 1, 0);
  const totalCartValue = state.cart.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] aura-container relative pb-20">
      {/* Background Aura */}
      <div className="aura-orb aura-green w-[70vw] h-[70vh] top-[-10%] left-[-10%]" />
      <div className="aura-orb aura-blue w-[50vw] h-[50vh] bottom-[10%] right-[-10%]" style={{ animationDelay: '-3s' }} />

      {/* ===== HEADER ===== */}
      <header className="ios-navbar liquid-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between w-full">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-[#34C759] to-[#007AFF] bg-clip-text text-transparent drop-shadow-sm">
              Annapurna Marketplace
            </h1>
            <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)]">Fresh from Farm, Direct to You</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative w-11 h-11 rounded-xl bg-white/50 dark:bg-black/50 border border-[var(--separator)] flex items-center justify-center hover:bg-[var(--fill-secondary)] transition-colors backdrop-blur-md"
            >
              <ShoppingCart className="w-5 h-5 text-[var(--text-primary)]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 badge-count shadow-sm bg-[#34C759]">
                  {totalCartItems}
                </span>
              )}
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34C759]/20 to-[#5AC8FA]/20 border border-[var(--separator)] flex items-center justify-center shadow-sm">
              <span className="font-bold text-[#248A3D]">Me</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
        
        {/* Banner */}
        <div className="glass liquid-glass bg-gradient-to-r from-[#34C759]/10 to-[#007AFF]/10 border border-[#34C759]/30 rounded-2xl p-4 mb-8 flex items-center justify-between overflow-hidden relative group">
          <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] z-0"></div>
          <div className="relative z-10 flex-1">
            <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-[#34C759]" />
              On average, you save 45% vs retail by buying direct from farmers
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Get the freshest produce while ensuring farmers get their fair share.</p>
          </div>
          <div className="relative z-10 hidden md:flex h-full items-center justify-center pl-4 border-l border-[var(--separator)]">
            <div className="text-center">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase">Platform Fee</p>
              <p className="text-2xl font-extrabold text-[#34C759]">Only 2%</p>
            </div>
          </div>
        </div>

        {/* Search & Smart Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Standard Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search crops, varieties, or farmers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#34C759]/50 transition-all shadow-sm"
            />
          </div>

          {/* AI Search */}
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#007AFF]" />
            <input
              type="text"
              placeholder='Try "Organic tomatoes under ₹40/kg near Pune"'
              value={smartQuery}
              onChange={(e) => setSmartQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSmartSearch(); }}
              className="w-full bg-[#007AFF]/5 border border-[#007AFF]/20 rounded-xl py-3 pl-10 pr-24 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all shadow-sm"
            />
            <button
              onClick={handleSmartSearch}
              disabled={isAiSearching || !smartQuery.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#007AFF] text-white px-3 rounded-lg text-xs font-bold flex items-center justify-center disabled:opacity-50 transition-opacity"
            >
              {isAiSearching ? "Thinking..." : "AI Search"}
            </button>
          </div>
        </div>

        {aiFilterSummary && (
          <div className="flex items-center justify-between bg-[#007AFF]/10 border border-[#007AFF]/30 px-4 py-2.5 rounded-xl text-xs font-medium text-[#007AFF] mb-6">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> <strong>AI Filter:</strong> {aiFilterSummary}
            </span>
            <button 
              onClick={() => { setAiFilterSummary(null); setActiveCategory("All"); setSearchQuery(""); }}
              className="text-xs font-bold opacity-70 hover:opacity-100 ml-2 px-2 py-0.5 rounded hover:bg-black/5"
            >
              Clear
            </button>
          </div>
        )}

        {/* Categories & Sorting */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto pb-2 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-[#34C759] text-white shadow-md"
                    : "bg-[var(--fill-secondary)] text-[var(--text-secondary)] border border-[var(--separator)] hover:bg-[var(--fill-tertiary)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto min-w-[200px]">
            <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-2 px-3 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#34C759]/50 transition-all shadow-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-20 bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-2xl">
            <p className="text-xl font-bold text-[var(--text-secondary)]">No produce found.</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredListings.map((listing) => (
                <ProduceCard key={listing.id} listing={listing} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Cart Drawer (Simplified for demo) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[400px] glass liquid-glass z-[101] shadow-2xl border-l border-[var(--separator)] flex flex-col"
            >
              <div className="p-4 border-b border-[var(--separator)] flex items-center justify-between bg-white/50 dark:bg-black/50">
                <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Your Cart
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-[var(--fill-secondary)]">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {state.cart.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-tertiary)]">
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  state.cart.map((item) => (
                    <div key={item.listingId} className="bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[var(--text-primary)] capitalize">{item.listing.cropType}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{item.quantityKg} kg @ ₹{item.pricePerKg}/kg</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#34C759]">₹{item.subtotal}</p>
                        <button 
                          onClick={() => dispatch({ type: "REMOVE_FROM_CART", listingId: item.listingId })}
                          className="text-[10px] font-bold text-[#FF3B30] hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {state.cart.length > 0 && (
                <div className="p-4 border-t border-[var(--separator)] bg-white/50 dark:bg-black/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[var(--text-secondary)]">Total:</span>
                    <span className="text-2xl font-extrabold text-[#34C759]">₹{totalCartValue}</span>
                  </div>
                  <button 
                    onClick={() => {
                      alert("Checkout flow would initiate here.");
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-[#34C759] text-white font-bold py-3 rounded-xl hover:bg-[#2eaf4e] transition-colors shadow-lg"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for Produce Card
function ProduceCard({ listing }: { listing: ProduceListing }) {
  const { dispatch } = useAppState();
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  // Derive mock comparison prices
  const askingPrice = listing.askingPricePerKg;
  const mandiPrice = listing.currentMandiPrice;
  const retailPrice = Math.round(mandiPrice * 2.2); // Typical retail markup
  const savings = retailPrice - askingPrice;

  // Freshness calculation
  const hoursSinceHarvest = Math.max(1, Math.floor((Date.now() - listing.harvestDate) / (1000 * 60 * 60)));

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_TO_CART",
      item: {
        listingId: listing.id,
        listing: listing,
        quantityKg: selectedQty,
        pricePerKg: askingPrice,
        subtotal: askingPrice * selectedQty,
      }
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const qtyOptions = [1, 2, 5, 10];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="glass liquid-glass rounded-2xl overflow-hidden border border-[var(--separator)] hover:border-[#34C759]/50 transition-all group shadow-sm flex flex-col h-full relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md shadow-sm border ${
          listing.qualityGrade === "A+" || listing.qualityGrade === "A" 
            ? "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/30" 
            : "bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/30"
        }`}>
          Grade {listing.qualityGrade}
        </span>
        {listing.organicCertified && (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-[#248A3D]/10 text-[#248A3D] border border-[#248A3D]/30 shadow-sm flex items-center gap-1">
            <Leaf className="w-3 h-3" /> Organic
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10">
        <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-white/80 dark:bg-black/80 text-[var(--text-secondary)] border border-[var(--separator)] shadow-sm flex items-center gap-1 backdrop-blur-md">
          <Clock className="w-3 h-3" /> {hoursSinceHarvest}h ago
        </span>
      </div>

      {/* Image Placeholder / Gradient */}
      <div className="h-40 w-full bg-gradient-to-br from-[var(--fill-secondary)] to-[var(--fill-tertiary)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 dark:bg-black/5" />
        <span className="text-6xl drop-shadow-md">
          {listing.cropType === "tomatoes" ? "🍅" : 
           listing.cropType === "onions" ? "🧅" : 
           listing.cropType === "wheat" ? "🌾" : 
           listing.cropType === "grapes" ? "🍇" : 
           listing.cropType === "bananas" ? "🍌" : 
           listing.cropType === "oranges" ? "🍊" : 
           listing.cropType === "capsicum" ? "🫑" :
           listing.cropType === "turmeric" ? "🟡" : "🌿"}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Title & Farmer */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)] capitalize line-clamp-1">
            {listing.cropType} <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">({listing.variety || "Local"})</span>
          </h3>
          <p className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1 mt-1">
            <span>🌾</span> {listing.farmerName} • {listing.village}, {listing.district}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="bg-[var(--fill-secondary)] rounded-xl p-3 mb-4 border border-[var(--separator)]">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Direct Price</p>
              <p className="text-2xl font-extrabold text-[var(--text-primary)] leading-none mt-1">
                ₹{askingPrice}<span className="text-sm font-medium text-[var(--text-secondary)]">/kg</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Available</p>
              <p className="text-sm font-bold text-[var(--text-secondary)] mt-1">{listing.availableQuantityKg} kg</p>
            </div>
          </div>
          
          <div className="h-[1px] w-full bg-[var(--separator)] my-2"></div>
          
          <div className="flex justify-between text-[10px] font-medium text-[var(--text-tertiary)] mt-1">
            <span>Mandi: ₹{mandiPrice}</span>
            <span>Retail: ₹{retailPrice}</span>
          </div>
          <div className="mt-2 text-xs font-bold text-[#34C759] bg-[#34C759]/10 py-1 px-2 rounded-md inline-block">
            You save ₹{savings}/kg!
          </div>
        </div>

        <div className="mt-auto">
          {/* Quantity Selector */}
          <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar pb-1">
            {qtyOptions.map(qty => (
              <button 
                key={qty}
                onClick={() => setSelectedQty(qty)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors min-w-[36px] ${
                  selectedQty === qty 
                    ? "bg-[#34C759] border-[#34C759] text-white" 
                    : "bg-[var(--fill-secondary)] border-[var(--separator)] text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)]"
                }`}
              >
                {qty}k
              </button>
            ))}
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isAdded 
                ? "bg-[#34C759] text-white shadow-md shadow-[#34C759]/20" 
                : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-[0.98] shadow-sm"
            }`}
          >
            {isAdded ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Added to Cart
              </>
            ) : (
              <>
                Add {selectedQty} kg for ₹{selectedQty * askingPrice}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
