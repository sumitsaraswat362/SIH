"use client";

import { useState, useEffect } from "react";
import CountdownTimer from "./CountdownTimer";
import { Cargo, Bid } from "@/lib/types";

interface CargoOfferCardProps {
  cargo: Cargo;
  distance: number;
  etaMinutes: number;
  onAcceptFull: (cargoId: string) => void;
  onAcceptPartial: (cargoId: string, quantity: number) => void;
  onCounterOffer: (cargoId: string, pricePerKg: number, quantity: number) => void;
  onNegotiate?: (cargoId: string) => void;
  existingBid?: Bid;
  matchScore?: number;
}

export default function CargoOfferCard({
  cargo,
  distance,
  etaMinutes,
  onAcceptFull,
  onAcceptPartial,
  onCounterOffer,
  onNegotiate,
  existingBid,
  matchScore,
}: CargoOfferCardProps) {
  const [mode, setMode] = useState<"idle" | "partial" | "counter">("idle");
  const [partialQty, setPartialQty] = useState(Math.floor(cargo.quantityKg / 2));
  
  // If there's a counter offer from logistics, use it as default
  const defaultPrice = existingBid?.status === "counter_offered" && existingBid.counterPricePerKg
    ? existingBid.counterPricePerKg
    : (cargo.askingPricePerKg ? cargo.askingPricePerKg - 2 : 10);
    
  const [counterPrice, setCounterPrice] = useState(defaultPrice);
  const [counterQty, setCounterQty] = useState(cargo.quantityKg);
  const [accepted, setAccepted] = useState(false);

  const urgency =
    cargo.telemetry.temperature > cargo.safeTemperatureMax + 5
      ? "critical"
      : cargo.telemetry.temperature > cargo.safeTemperatureMax
      ? "warning"
      : "normal";

  const qualityPercent =
    urgency === "critical" ? 78 : urgency === "warning" ? 85 : 95;
  const qualityLabel =
    urgency === "critical"
      ? "Sell within 1hr"
      : urgency === "warning"
      ? "Good if sold within 2hrs"
      : "Excellent";

  const borderColor =
    urgency === "critical"
      ? "border-[#FF3B30]/30"
      : urgency === "warning"
      ? "border-[#FF9500]/30"
      : "border-[#E5E5EA]";

  const expiresAt = Date.now() + (urgency === "critical" ? 5 * 60 * 1000 : 15 * 60 * 1000);

  if (accepted) {
    return (
      <div className="ios-card clay p-5 border border-[#34C759]/40">
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[#34C759]/10 border border-[#34C759]/30 flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#34C759] mb-1">Order Placed!</h3>
          <p className="text-sm text-[#8E8E93]">
            {(cargo.type || "cargo").charAt(0).toUpperCase() + (cargo.type || "cargo").slice(1)} · Truck arriving in ~{etaMinutes} min
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aura-container relative group">
      {urgency === "critical" && <div className="aura-orb aura-red w-[150%] h-[150%] top-[-25%] left-[-25%]" />}
      {urgency === "warning" && <div className="aura-orb aura-blue w-[150%] h-[150%] top-[-25%] left-[-25%]" />}
      
      <div className={`ios-card glass p-5 transition-all duration-300 border ${borderColor} group-hover:scale-[1.02] group-hover:shadow-2xl`}>
        {/* Urgency Strip */}
        {urgency === "critical" && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-[#FF3B30] animate-pulse-danger shadow-[0_0_15px_rgba(255,59,48,0.5)]">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
              Urgent — Respond Immediately
            </span>
          </div>
        )}

        {urgency === "warning" && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-[#FF9500] shadow-[0_0_15px_rgba(255,149,0,0.3)]">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
              Warning — Cold Chain at Risk
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              {(cargo.type || "cargo").charAt(0).toUpperCase() + (cargo.type || "cargo").slice(1)}
              <span className="font-[family-name:var(--font-mono)] text-[var(--text-tertiary)] text-sm ml-2 font-semibold bg-[var(--fill-secondary)] px-2 py-1 rounded-md">
                {(cargo.quantityKg / 1000).toFixed(0)} Tonnes
              </span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-[#34C759] mr-1"></span> Truck: {cargo.truckPlate} · From {cargo.origin.name}
            </p>
          </div>
          <div className="bg-[var(--fill-secondary)] px-3 py-1.5 rounded-xl clay">
            <CountdownTimer expiresAt={expiresAt} size="sm" />
          </div>
        </div>

        {/* Stats Grid — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="clay text-center p-3">
            <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Temp</p>
            <p className={`font-[family-name:var(--font-mono)] text-base font-bold mt-1 ${
              urgency === "critical" ? "text-[#FF3B30] animate-pulse" : urgency === "warning" ? "text-[#FF9500]" : "text-[#34C759]"
            }`}>
              {(cargo.telemetry?.temperature || 0).toFixed(1)}°C
            </p>
          </div>
          <div className="clay text-center p-3">
            <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Quality</p>
            <p className={`font-[family-name:var(--font-mono)] text-base font-bold mt-1 ${
              qualityPercent > 85 ? "text-[#34C759]" : qualityPercent > 70 ? "text-[#FF9500]" : "text-[#FF3B30]"
            }`}>
              {qualityPercent}%
            </p>
          </div>
          <div className="clay text-center p-3">
            <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Distance</p>
            <p className="font-[family-name:var(--font-mono)] text-base font-bold text-[var(--text-primary)] mt-1">
              {distance} km
            </p>
          </div>
          <div className="clay text-center p-3">
            <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">ETA</p>
            <p className="font-[family-name:var(--font-mono)] text-base font-bold text-[var(--text-primary)] mt-1">
              {etaMinutes}m
            </p>
          </div>
        </div>

      {/* Match Score Bar */}
      {matchScore !== undefined && (
        <div className="mb-4 bg-[var(--fill-secondary)] p-3 rounded-xl border border-[var(--separator)]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">AI Best Match</span>
            <span className={`text-xs font-bold ${matchScore > 70 ? 'text-[#34C759]' : matchScore >= 40 ? 'text-[#FF9500]' : 'text-[#FF3B30]'}`}>{Math.round(matchScore)}%</span>
          </div>
          <div className="h-2 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${matchScore > 70 ? 'bg-[#34C759]' : matchScore >= 40 ? 'bg-[#FF9500]' : 'bg-[#FF3B30]'}`} 
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Quality Note */}
      <p className="text-xs text-[var(--text-tertiary)] mb-4 italic font-medium">
        Quality estimate: <span className={qualityPercent > 85 ? "text-[#34C759]" : "text-[#FF9500]"}>{qualityLabel}</span>
      </p>

      {/* Asking Price */}
      <div className="flex items-center justify-between mb-5 clay p-4 rounded-xl border border-[var(--separator)]">
        <span className="text-sm font-semibold text-[var(--text-secondary)]">Asking Price</span>
        <div className="flex flex-col items-end">
          <span className="font-[family-name:var(--font-mono)] text-2xl font-bold text-[#34C759] drop-shadow-sm">
            ₹{cargo.askingPricePerKg ?? 0}/kg
          </span>
        </div>
      </div>

      {/* Counter Offer Status */}
      {existingBid && existingBid.status === "counter_offered" && existingBid.counterPricePerKg && mode === "idle" && (
        <div className="mb-5 p-4 rounded-xl glass bg-[#AF52DE]/10 border border-[#AF52DE]/30 shadow-[0_4px_15px_rgba(175,82,222,0.15)]">
          <p className="text-[10px] text-[#AF52DE] uppercase tracking-widest block mb-2 font-bold">
            Logistics Countered Your Bid
          </p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-[var(--text-primary)]">They want:</span>
            <span className="font-[family-name:var(--font-mono)] text-xl font-bold text-[#AF52DE] drop-shadow-sm">
              ₹{existingBid.counterPricePerKg}/kg
            </span>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                onAcceptFull(cargo.id);
                setAccepted(true);
              }}
              className="skeuomorphic-btn skeuomorphic-primary flex-1 text-sm py-3 font-bold"
            >
              Accept at ₹{existingBid.counterPricePerKg}/kg
            </button>
            {onNegotiate && (
              <button
                onClick={() => onNegotiate(cargo.id)}
                className="skeuomorphic-btn flex-1 text-sm py-3 font-bold text-[var(--text-primary)]"
              >
                Negotiate
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Pending Status */}
      {existingBid && existingBid.status === "pending" && mode === "idle" && (
        <div className="mb-5 p-4 rounded-xl glass bg-[#007AFF]/10 border border-[#007AFF]/30 text-center shadow-[0_4px_15px_rgba(0,122,255,0.15)]">
           <span className="text-sm font-bold text-[#007AFF] block mb-3">Your Bid is Pending Review...</span>
           {onNegotiate && (
             <button
               onClick={() => onNegotiate(cargo.id)}
               className="skeuomorphic-btn skeuomorphic-primary w-full text-sm py-2 font-bold"
             >
               Open AI Negotiation Panel
             </button>
           )}
        </div>
      )}

      {/* Partial Order Form */}
      {mode === "partial" && (
        <div className="mb-5 p-4 rounded-xl glass bg-[#007AFF]/5 border border-[#007AFF]/20 shadow-[0_4px_15px_rgba(0,122,255,0.1)]">
          <label className="text-[10px] text-[#007AFF] uppercase tracking-widest block mb-3 font-bold">
            How much do you want? (kg)
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="range"
              min={500}
              max={cargo.quantityKg}
              step={500}
              value={partialQty}
              onChange={(e) => setPartialQty(Number(e.target.value))}
              className="flex-1 accent-[#007AFF] h-2 bg-[var(--fill-secondary)] rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-[family-name:var(--font-mono)] text-base font-bold text-[#007AFF] w-20 text-right bg-white/50 dark:bg-black/50 px-2 py-1 rounded-md">
              {(partialQty / 1000).toFixed(1)}T
            </span>
          </div>
          <div className="flex justify-between mt-3 text-sm font-medium text-[var(--text-secondary)]">
            <span>Total: ₹{((cargo.askingPricePerKg ?? 0) * partialQty).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                onAcceptPartial(cargo.id, partialQty);
                setAccepted(true);
              }}
              className="skeuomorphic-btn skeuomorphic-primary flex-1 text-sm py-3 font-bold"
            >
              Confirm {(partialQty / 1000).toFixed(1)}T Order
            </button>
            <button onClick={() => setMode("idle")} className="skeuomorphic-btn text-sm py-3 px-5 font-bold text-[var(--text-primary)]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Counter Offer Form */}
      {mode === "counter" && (
        <div className="mb-5 p-4 rounded-xl glass bg-[#FF9500]/5 border border-[#FF9500]/20 shadow-[0_4px_15px_rgba(255,149,0,0.1)]">
          <label className="text-[10px] text-[#FF9500] uppercase tracking-widest block mb-3 font-bold">
            Your offer
          </label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] block mb-1.5 font-bold">Price (₹/kg)</span>
              <input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(Number(e.target.value))}
                className="ios-input font-[family-name:var(--font-mono)] text-base font-bold"
                min={1}
                step={0.5}
              />
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] block mb-1.5 font-bold">Quantity (kg)</span>
              <input
                type="number"
                value={counterQty}
                onChange={(e) => setCounterQty(Number(e.target.value))}
                className="ios-input font-[family-name:var(--font-mono)] text-base font-bold"
                min={500}
                max={cargo.quantityKg}
                step={500}
              />
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-4">
            Total offer: <span className="font-[family-name:var(--font-mono)] text-lg font-bold text-[#FF9500]">₹{(counterPrice * counterQty).toLocaleString("en-IN")}</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                onCounterOffer(cargo.id, counterPrice, counterQty);
                setAccepted(true);
              }}
              className="skeuomorphic-btn skeuomorphic-primary flex-1 text-sm py-3 font-bold"
            >
              Send Counter Offer
            </button>
            <button onClick={() => setMode("idle")} className="skeuomorphic-btn text-sm py-3 px-5 font-bold text-[var(--text-primary)]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {mode === "idle" && (!existingBid || existingBid.status === "counter_offered") && (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              onAcceptFull(cargo.id);
              setAccepted(true);
            }}
            className="skeuomorphic-btn skeuomorphic-primary text-sm py-3.5 flex flex-col items-center gap-1.5 font-bold hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Accept Full
          </button>
          <button
            onClick={() => setMode("partial")}
            className="skeuomorphic-btn text-sm py-3.5 flex flex-col items-center gap-1.5 font-bold text-[#007AFF] hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Z" />
            </svg>
            Partial
          </button>
          <button
            onClick={() => setMode("counter")}
            className="skeuomorphic-btn text-sm py-3.5 flex flex-col items-center gap-1.5 font-bold text-[#FF9500] hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Counter
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
