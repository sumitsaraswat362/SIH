"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppState } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { ProduceListing, CartItem, Order } from "@/lib/types";
import { DEMO_LISTINGS } from "@/data/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Leaf, Clock, ShoppingCart, 
  TrendingDown, CheckCircle2, ChevronDown, Filter, 
  Sparkles, Plus, Minus, Handshake, CreditCard,
  MessageSquare, X, ArrowRight, LogOut, ClipboardList, Package, Truck
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
  const { user, logout } = useAuth();
  
  // Use state.listings if available, otherwise fallback to DEMO_LISTINGS
  const activeListings = state.listings.length > 0 ? state.listings : DEMO_LISTINGS;

  const [viewMode, setViewMode] = useState<"marketplace" | "orders">("marketplace");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [smartQuery, setSmartQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [aiFilterSummary, setAiFilterSummary] = useState<string | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  // Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [negotiateListing, setNegotiateListing] = useState<{ listing: ProduceListing, qty: number } | null>(null);

  // Smart AI Search Handler
  const handleSmartSearch = async () => {
    if (!smartQuery.trim()) return;
    setIsAiSearching(true);
    try {
      const res = await fetch('/api/filter-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: smartQuery }),
      });
      
      if (res.ok) {
        const filters = await res.json();
        if (filters.cropType) setSearchQuery(filters.cropType);
        if (filters.organic) setActiveCategory('Organic');
        if (filters.cropCategory) setActiveCategory(filters.cropCategory);
        if (filters.sortBy) setSortBy(filters.sortBy);
        if (filters.maxPricePerKg) setMaxPriceFilter(filters.maxPricePerKg);
        setAiFilterSummary(`Filtered: "${smartQuery}"`);
      } else {
        // Fallback for demo if API fails
        const q = smartQuery.toLowerCase();
        if (q.includes("organic")) setActiveCategory("Organic");
        else if (q.includes("tomato")) { setActiveCategory("Vegetables"); setSearchQuery("tomato"); }
        else if (q.includes("fruit")) setActiveCategory("Fruits");
        else if (q.includes("grain")) setActiveCategory("Grains");
        setAiFilterSummary(`Smart filtered for: "${smartQuery}"`);
      }
    } catch (e) { 
      console.error(e);
      // Fallback
      setAiFilterSummary(`Could not apply AI filter.`);
    } finally { 
      setIsAiSearching(false); 
      setSmartQuery(''); 
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

    if (maxPriceFilter) {
      result = result.filter(l => l.askingPricePerKg <= maxPriceFilter);
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
        result.sort((a, b) => (b.freshnessScore || 0) - (a.freshnessScore || 0));
        break;
    }

    return result;
  }, [activeListings, activeCategory, searchQuery, sortBy, maxPriceFilter]);

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

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setViewMode(viewMode === "orders" ? "marketplace" : "orders")}
              className={`relative h-11 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors backdrop-blur-md text-sm font-bold ${
                viewMode === "orders" 
                  ? "bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]"
                  : "bg-[var(--fill-secondary)] border-[var(--separator)] text-[var(--text-primary)] hover:bg-[var(--fill-tertiary)]"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden md:inline">{viewMode === "orders" ? "Back to Shop" : "My Orders"}</span>
              {state.orders.filter(o => o.buyerId === (user?.id || "")).length > 0 && viewMode !== "orders" && (
                <span className="absolute -top-1 -right-1 badge-count shadow-sm bg-[#007AFF]">
                  {state.orders.filter(o => o.buyerId === (user?.id || "")).length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative w-11 h-11 rounded-xl bg-[var(--fill-secondary)] border border-[var(--separator)] flex items-center justify-center hover:bg-[var(--fill-tertiary)] transition-colors backdrop-blur-md"
            >
              <ShoppingCart className="w-5 h-5 text-[var(--text-primary)]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 badge-count shadow-sm bg-[#34C759]">
                  {totalCartItems}
                </span>
              )}
            </button>
            <div className="h-11 px-3 rounded-xl bg-gradient-to-br from-[#34C759]/20 to-[#5AC8FA]/20 border border-[var(--separator)] flex items-center justify-center shadow-sm gap-2">
              <span className="font-bold text-[#248A3D]">{user?.name || "Buyer"}</span>
            </div>
            <button
              onClick={logout}
              className="h-11 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      {viewMode === "orders" ? (
        <BuyerOrdersView orders={state.orders.filter(o => o.buyerId === (user?.id || ""))} user={user} />
      ) : (
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 relative z-10">
        {/* Banner */}
        <div className="glass liquid-glass rounded-2xl p-4 md:p-6 mb-6 flex flex-col md:flex-row items-center justify-between border border-[var(--separator)] shadow-md overflow-hidden relative">
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
              <p className="text-2xl font-extrabold text-[#34C759]">₹0 Free</p>
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
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#007AFF] text-white px-3 rounded-lg text-xs font-bold flex items-center justify-center disabled:opacity-50 transition-opacity hover:bg-[#005bb5]"
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
              onClick={() => { setAiFilterSummary(null); setActiveCategory("All"); setSearchQuery(""); setMaxPriceFilter(null); }}
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
                <ProduceCard 
                  key={listing.id} 
                  listing={listing} 
                  onNegotiate={(qty) => setNegotiateListing({ listing, qty })}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      )}

      {/* Cart Drawer */}
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
                <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-[var(--fill-secondary)] text-[var(--text-primary)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {state.cart.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-tertiary)] flex flex-col items-center gap-2">
                    <ShoppingCart className="w-10 h-10 opacity-20" />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  state.cart.map((item) => (
                    <div key={item.listingId} className="bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl p-3 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-bold text-[var(--text-primary)] capitalize">{item.listing.cropType}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{item.quantityKg} kg @ ₹{item.pricePerKg}/kg</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className="font-bold text-[var(--text-primary)]">₹{item.subtotal}</span>
                        <button 
                          onClick={() => dispatch({ type: "REMOVE_FROM_CART", listingId: item.listingId })}
                          className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {state.cart.length > 0 && (
                <div className="p-4 border-t border-[var(--separator)] bg-[var(--bg-primary)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[var(--text-secondary)]">Total:</span>
                    <span className="text-2xl font-extrabold text-[#34C759]">₹{totalCartValue}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-[#34C759] text-white font-bold py-3.5 rounded-xl hover:bg-[#2eaf4e] transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal 
            onClose={() => setIsCheckoutOpen(false)} 
            cart={state.cart} 
            user={user}
            dispatch={dispatch} 
          />
        )}
      </AnimatePresence>

      {/* Negotiation Modal */}
      <AnimatePresence>
        {negotiateListing && (
          <NegotiationModal 
            listing={negotiateListing.listing} 
            qty={negotiateListing.qty}
            onClose={() => setNegotiateListing(null)}
            onAddToCart={(item) => {
              dispatch({ type: "ADD_TO_CART", item });
              setNegotiateListing(null);
              setIsCartOpen(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for Produce Card
function ProduceCard({ listing, onNegotiate }: { listing: ProduceListing, onNegotiate: (qty: number) => void }) {
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

      {/* Image */}
      <div className="h-40 w-full bg-gradient-to-br from-[var(--fill-secondary)] to-[var(--fill-tertiary)] flex items-center justify-center relative overflow-hidden">
        {listing.qualityPhotoUrl ? (
          <img src={listing.qualityPhotoUrl} alt={listing.cropType} className="w-full h-full object-cover" />
        ) : (
          <>
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
          </>
        )}
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
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors min-w-[36px] whitespace-nowrap ${
                  selectedQty === qty 
                    ? "bg-[#34C759] border-[#34C759] text-white" 
                    : "bg-[var(--fill-secondary)] border-[var(--separator)] text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)]"
                }`}
              >
                {qty} kg
              </button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => onNegotiate(selectedQty)}
              className="flex-[0.4] py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 bg-[var(--fill-secondary)] border border-[var(--separator)] text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
            >
              <Handshake className="w-4 h-4" /> 
              <span>Negotiate</span>
            </button>

            <button 
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                isAdded 
                  ? "bg-[#34C759] text-white shadow-md shadow-[#34C759]/20" 
                  : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-[0.98] shadow-sm"
              }`}
            >
              {isAdded ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Added
                </>
              ) : (
                <>
                  Add ₹{selectedQty * askingPrice}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ----- CHECKOUT MODAL -----
function CheckoutModal({ onClose, cart, user, dispatch }: { onClose: () => void, cart: CartItem[], user: any, dispatch: any }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const platformFee = 0;
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  const address = user?.address || user?.location || "123 Smart Farm Road, Pune, Maharashtra";

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const results = await Promise.all(cart.map(async (item) => {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: item.listingId,
            farmerId: item.listing.farmerId,
            farmerName: item.listing.farmerName,
            buyerId: user?.id || 'guest',
            buyerName: user?.name || 'Guest Buyer',
            cropType: item.listing.cropType,
            variety: item.listing.variety,
            quantityKg: item.quantityKg,
            agreedPricePerKg: item.pricePerKg,
            totalAmount: item.subtotal,
            deliveryMode: 'platform_logistics',
            deliveryAddress: user?.address || user?.city || 'Address pending',
          })
        });
        if (!res.ok) throw new Error('Order creation failed');
        return res.json();
      }));

      results.forEach(order => {
        dispatch({ type: 'ADD_ORDER', order });
      });

      dispatch({ type: 'CLEAR_CART' });
      setSuccess(true);
      setIsProcessing(false);
    } catch(e) {
      console.error(e);
      alert('Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative glass liquid-glass w-full max-w-md rounded-2xl p-8 text-center shadow-2xl border border-[var(--separator)]"
        >
          <div className="w-20 h-20 bg-[#34C759]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-[#34C759]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Order Confirmed!</h2>
          <p className="text-[var(--text-secondary)] mb-6">Your order #{Math.floor(Math.random()*100000)} has been placed successfully. Fresh produce is on its way!</p>
          <button 
            onClick={onClose}
            className="w-full bg-[#34C759] text-white font-bold py-3.5 rounded-xl hover:bg-[#2eaf4e] transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative glass liquid-glass w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh] shadow-2xl border border-[var(--separator)] overflow-hidden"
      >
        <div className="p-4 border-b border-[var(--separator)] flex items-center justify-between bg-white/50 dark:bg-black/50">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Checkout
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--fill-secondary)] text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Items Summary */}
          <div>
            <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Order Summary</h3>
            <div className="space-y-3 bg-[var(--fill-secondary)] p-4 rounded-xl border border-[var(--separator)]">
              {cart.map((item) => (
                <div key={item.listingId} className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-primary)] font-medium capitalize">
                    {item.quantityKg}kg {item.listing.cropType}
                  </span>
                  <span className="text-[var(--text-secondary)]">₹{item.subtotal}</span>
                </div>
              ))}
              <div className="h-[1px] bg-[var(--separator)] my-2"></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary)]">Subtotal</span>
                <span className="text-[var(--text-primary)] font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary)]">Platform Fee</span>
                <span className="text-[#34C759] font-bold">FREE ✓</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary)]">Delivery Fee</span>
                <span className="text-[var(--text-primary)] font-medium">₹{deliveryFee}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Delivery Address</h3>
            <div className="bg-[var(--fill-secondary)] p-4 rounded-xl border border-[var(--separator)] flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#007AFF] mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">{user?.name || "Buyer"}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{address}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPaymentMethod("upi")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === "upi" 
                    ? "bg-[#007AFF]/10 border-[#007AFF] text-[#007AFF]" 
                    : "bg-[var(--fill-secondary)] border-[var(--separator)] text-[var(--text-secondary)]"
                }`}
              >
                UPI / Net Banking
              </button>
              <button 
                onClick={() => setPaymentMethod("cod")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === "cod" 
                    ? "bg-[#007AFF]/10 border-[#007AFF] text-[#007AFF]" 
                    : "bg-[var(--fill-secondary)] border-[var(--separator)] text-[var(--text-secondary)]"
                }`}
              >
                Cash on Delivery
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--separator)] bg-[var(--bg-primary)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[var(--text-secondary)] font-medium">Total to Pay</span>
            <span className="text-3xl font-extrabold text-[var(--text-primary)] leading-none">₹{total}</span>
          </div>
          <button 
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full bg-[#34C759] text-white font-bold py-3.5 rounded-xl hover:bg-[#2eaf4e] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isProcessing ? "Processing..." : `Place Order • ₹${total}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}


// ----- NEGOTIATION MODAL -----
type NegotiationRoundMsg = { role: "buyer" | "ai" | "system", message: string, price?: number };

function NegotiationModal({ listing, qty, onClose, onAddToCart }: { listing: ProduceListing, qty: number, onClose: () => void, onAddToCart: (item: CartItem) => void }) {
  const [offerPrice, setOfferPrice] = useState<string>("");
  const [rounds, setRounds] = useState<NegotiationRoundMsg[]>([
    { role: "system", message: `Farmer's asking price is ₹${listing.askingPricePerKg}/kg. Minimum acceptable price (MSP/Mandi derived) is strictly protected by AI.` }
  ]);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);

  const handleOffer = async () => {
    const numOffer = parseInt(offerPrice);
    if (isNaN(numOffer) || numOffer <= 0) return;

    const newRounds: NegotiationRoundMsg[] = [...rounds, { role: "buyer", message: `I offer ₹${numOffer}/kg.`, price: numOffer }];
    setRounds(newRounds);
    setOfferPrice("");
    setIsNegotiating(true);

    try {
      const buyerRounds = newRounds.filter(r => r.role === 'buyer').length;
      const res = await fetch('/api/negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          listingId: listing.id, 
          cropType: listing.cropType,
          variety: listing.variety,
          quantityKg: qty,
          askingPricePerKg: listing.askingPricePerKg,
          minimumPricePerKg: listing.minimumPricePerKg || listing.currentMandiPrice,
          mandiPricePerKg: listing.currentMandiPrice,
          mspPerKg: listing.minimumSupportPrice || 0,
          buyerOfferPerKg: numOffer,
          buyerName: "Buyer",
          roundNumber: buyerRounds,
          qualityGrade: listing.qualityGrade,
          organicCertified: listing.organicCertified,
        })
      });

      let action = "reject";
      let aiPrice = listing.askingPricePerKg;
      let aiMessage = "I cannot accept this offer.";

      if (res.ok) {
        const data = await res.json();
        action = data.action;
        aiPrice = data.counterPrice || numOffer;
        aiMessage = data.reasoning || "Offer processed.";
      } else {
        aiMessage = "Negotiation service unavailable. Please try again.";
      }

      setRounds([...newRounds, { role: "ai", message: aiMessage, price: action !== "reject" ? aiPrice : undefined }]);

      if (action === "accept") {
        setAgreedPrice(aiPrice || numOffer);
      } else if (buyerRounds >= 10) {
        setRounds(prev => [...prev, { role: "system", message: "Maximum 10 negotiation rounds reached." }]);
      }

    } catch (e) {
      console.error(e);
      setRounds([...newRounds, { role: "system", message: "Negotiation failed. Try again." }]);
    } finally {
      setIsNegotiating(false);
    }
  };

  const handleAddAgreedToCart = () => {
    if (!agreedPrice) return;
    onAddToCart({
      listingId: listing.id,
      listing: listing,
      quantityKg: qty,
      pricePerKg: agreedPrice,
      subtotal: agreedPrice * qty,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative glass liquid-glass w-full max-w-md rounded-2xl flex flex-col h-[80vh] shadow-2xl border border-[var(--separator)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--separator)] flex items-center justify-between bg-gradient-to-r from-[#34C759]/10 to-transparent">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Handshake className="w-5 h-5 text-[#34C759]" /> AI Negotiation
            </h2>
            <p className="text-xs text-[var(--text-secondary)] capitalize mt-1">
              {qty}kg {listing.cropType} • Farmer: {listing.farmerName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--fill-secondary)] text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-primary)]/50">
          {rounds.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'buyer' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.role === 'system' ? (
                <div className="bg-[var(--fill-secondary)] px-3 py-1.5 rounded-lg text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold text-center max-w-[80%] border border-[var(--separator)]">
                  {msg.message}
                </div>
              ) : (
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                  msg.role === 'buyer' 
                    ? 'bg-[#007AFF] text-white rounded-tr-sm' 
                    : 'glass liquid-glass border border-[var(--separator)] text-[var(--text-primary)] rounded-tl-sm'
                }`}>
                  <p>{msg.message}</p>
                </div>
              )}
            </div>
          ))}
          {isNegotiating && (
            <div className="flex justify-start">
              <div className="glass liquid-glass border border-[var(--separator)] rounded-2xl rounded-tl-sm p-3 shadow-sm flex gap-1">
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--separator)] bg-white/50 dark:bg-black/50 backdrop-blur-md">
          {agreedPrice ? (
             <button 
               onClick={handleAddAgreedToCart}
               className="w-full bg-[#34C759] text-white font-bold py-3.5 rounded-xl hover:bg-[#2eaf4e] transition-all shadow-lg flex items-center justify-center gap-2"
             >
               Add to Cart at ₹{agreedPrice}/kg
             </button>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-medium">₹</span>
                <input 
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Enter your offer per kg..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleOffer(); }}
                  disabled={rounds.length >= 10}
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-xl py-3 pl-8 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all shadow-sm disabled:opacity-50"
                />
              </div>
              <button 
                onClick={handleOffer}
                disabled={!offerPrice || isNegotiating || rounds.length >= 10}
                className="bg-[#007AFF] text-white px-5 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-[#005bb5] transition-colors shadow-sm"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ===== BUYER ORDERS VIEW =====
function BuyerOrdersView({ orders, user }: { orders: Order[]; user: any }) {
  const statusSteps = ['pending', 'confirmed', 'in_transit', 'delivered'];
  const statusLabels: Record<string, string> = {
    pending: 'Order Placed',
    confirmed: 'Confirmed',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'confirmed': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'in_transit': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'delivered': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };
  const sorted = [...orders].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-20 relative z-10">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">My Orders</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{sorted.length} order{sorted.length !== 1 ? 's' : ''}</p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-20 h-20 mx-auto mb-6 text-[var(--text-tertiary)] opacity-40" />
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No orders yet</h3>
          <p className="text-[var(--text-tertiary)]">Browse the marketplace and place your first order!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sorted.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[var(--fill-secondary)] backdrop-blur-xl border border-[var(--separator)] rounded-[24px] p-6 shadow-lg"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] capitalize">
                    {order.cropType} {order.variety ? `(${order.variety})` : ''}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    Order #{order.id?.slice(-8)} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.status as string)}`}>
                  {statusLabels[order.status as string] || (order.status as string)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--separator)]">
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">Quantity</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{order.quantityKg} kg</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">Price</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">₹{order.agreedPricePerKg}/kg</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">Total</p>
                  <p className="text-sm font-bold text-[var(--tint-green)]">₹{order.totalAmount || (order.quantityKg * order.agreedPricePerKg)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">Farmer</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{order.farmerName || 'Farmer'}</p>
                </div>
              </div>

              {order.status !== 'cancelled' && (
                <div className="flex items-center gap-0 w-full">
                  {statusSteps.map((step, idx) => {
                    const currentIdx = statusSteps.indexOf(order.status as string);
                    const isCompleted = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center" style={{ minWidth: 'fit-content' }}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                            isCompleted ? 'bg-[var(--tint-green)] border-[var(--tint-green)] text-white' : 'bg-[var(--fill-secondary)] border-[var(--separator)]'
                          } ${isCurrent ? 'ring-4 ring-green-500/20' : ''}`}>
                            {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <span className={`text-[10px] mt-1.5 font-medium text-center leading-tight ${isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                            {statusLabels[step]}
                          </span>
                        </div>
                        {idx < statusSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mt-[-16px] rounded-full ${currentIdx > idx ? 'bg-[var(--tint-green)]' : 'bg-[var(--separator)]'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/5 p-3 rounded-xl">
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">This order was cancelled</span>
                </div>
              )}

              {order.deliveryAddress && (
                <div className="mt-4 pt-4 border-t border-[var(--separator)] flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Delivery: {order.deliveryAddress}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
