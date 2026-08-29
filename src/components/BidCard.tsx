"use client";

import { useState, useEffect } from "react";
import { Bid } from "@/lib/types";
import CountdownTimer from "./CountdownTimer";

interface BidCardProps {
  bid: Bid;
  onAccept: (bidId: string) => void;
  onReject: (bidId: string) => void;
  onCounter: (bidId: string, counterPrice: number) => void;
  onViewMap?: (bidId: string) => void;
  onPaymentReceived?: (bidId: string) => void;
  onNegotiate?: (bidId: string) => void;
}

export default function BidCard({ bid, onAccept, onReject, onCounter, onViewMap, onPaymentReceived, onNegotiate }: BidCardProps) {
  const [showCounter, setShowCounter] = useState(false);
  const [counterPrice, setCounterPrice] = useState(bid.offeredPricePerKg + 2);

  const isAccepted = bid.status === "accepted";
  const isRejected = bid.status === "rejected";
  const isExpired = bid.status === "expired";
  const isDelivered = bid.status === "delivered";
  const isPaymentCleared = bid.status === "payment_cleared";
  const isDisabled = isRejected || isExpired;

  // Fast Timer Logic for Demo
  const [fastSeconds, setFastSeconds] = useState(bid.etaMinutes * 6); // 1 real minute = 6 fast seconds for demo
  useEffect(() => {
    if (isAccepted && fastSeconds > 0) {
      const timer = setInterval(() => setFastSeconds(s => s - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isAccepted, fastSeconds]);

  return (
    <div
      className={`ios-card p-5 transition-all duration-500 border ${
        isAccepted
          ? "border-[#34C759]/40 bg-[#34C759]/5 glass shadow-[0_4px_15px_rgba(52,199,89,0.1)]"
          : isRejected
          ? "opacity-50 border-[#FF3B30]/20"
          : isExpired
          ? "opacity-40 border-[#E5E5EA]"
          : "border-[var(--separator)] glass liquid-glass hover:shadow-xl hover:scale-[1.02]"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#007AFF]/20 to-[#AF52DE]/20 border border-[var(--separator)] flex items-center justify-center text-sm font-bold text-[#007AFF] shadow-sm">
            {(bid.wholesalerName || "W").charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">{bid.wholesalerName || "Wholesaler"}</p>
            <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
              {bid.distanceKm} km · {bid.etaMinutes} min away
            </p>
          </div>
        </div>

        {!isDisabled && (
          <div className="clay px-2 py-1 bg-[var(--fill-secondary)]">
            <CountdownTimer expiresAt={bid.expiresAt} size="sm" />
          </div>
        )}

        {isAccepted && (
          <div className="text-right flex flex-col items-end">
            <span className="badge badge-safe mb-1 shadow-sm">✓ In Route</span>
            <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[#FF9500] animate-pulse">
              ETA: {Math.floor(fastSeconds / 60)}m {fastSeconds % 60}s
            </span>
          </div>
        )}
        {isDelivered && (
          <span className="badge badge-warning shadow-sm">⌛ Delivered (Unpaid)</span>
        )}
        {isPaymentCleared && (
          <span className="badge badge-safe shadow-sm">✓ Completed</span>
        )}
        {isRejected && (
          <span className="badge badge-danger shadow-sm">Rejected</span>
        )}
      </div>

      {/* Price & Quantity */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="clay text-center p-3">
          <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Price/kg</p>
          <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-[#34C759] mt-1 drop-shadow-sm">
            ₹{bid.offeredPricePerKg}
          </p>
        </div>
        <div className="clay text-center p-3">
          <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Quantity</p>
          <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-[var(--text-primary)] mt-1 drop-shadow-sm">
            {(bid.requestedQuantityKg / 1000).toFixed(0)}T
          </p>
        </div>
        <div className="clay text-center p-3">
          <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Total</p>
          <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-[#007AFF] mt-1 drop-shadow-sm">
            ₹{(bid.totalValue / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Counter offer input */}
      {showCounter && !isDisabled && (
        <div className="mb-4 p-4 rounded-xl glass bg-[#FF9500]/5 border border-[#FF9500]/20 shadow-[0_4px_15px_rgba(255,149,0,0.1)]">
          <label className="text-[10px] text-[#FF9500] uppercase tracking-widest block mb-3 font-bold">
            Your counter price (₹/kg)
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={counterPrice}
              onChange={(e) => setCounterPrice(Number(e.target.value))}
              className="ios-input flex-1 font-[family-name:var(--font-mono)] text-base font-bold"
              min={1}
              step={0.5}
            />
            <button
              onClick={() => {
                onCounter(bid.id, counterPrice);
                setShowCounter(false);
              }}
              className="skeuomorphic-btn skeuomorphic-primary text-sm px-5 font-bold"
            >
              Send
            </button>
            <button
              onClick={() => setShowCounter(false)}
              className="skeuomorphic-btn skeuomorphic-danger text-sm px-4 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {(!isDisabled && !isAccepted && !isDelivered && !isPaymentCleared) && (
        <div className="flex gap-3">
          <button
            onClick={() => onAccept(bid.id)}
            className="skeuomorphic-btn skeuomorphic-primary flex-1 text-sm py-3 font-bold"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Accept
          </button>
          <button
            onClick={() => setShowCounter(!showCounter)}
            className="skeuomorphic-btn flex-1 text-sm py-3 font-bold text-[#FF9500]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Counter
          </button>
          <button
            onClick={() => onReject(bid.id)}
            className="skeuomorphic-btn skeuomorphic-danger text-sm px-4 py-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Fleet Negotiate AI Button */}
      {(!isDisabled && !isAccepted && !isDelivered && !isPaymentCleared && onNegotiate) && (
        <button
          onClick={() => onNegotiate(bid.id)}
          className="w-full mt-3 skeuomorphic-btn text-sm py-3 font-bold text-[#AF52DE] flex items-center justify-center gap-2 border border-[#AF52DE]/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.428-1.428L13.5 18.75l1.178-.394a2.25 2.25 0 0 0 1.428-1.428l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.428 1.428l1.178.394-1.178.394a2.25 2.25 0 0 0-1.428 1.428Z" />
          </svg>
          AI Negotiation
        </button>
      )}

      {/* Post-Acceptance Actions */}
      {isAccepted && onViewMap && (
        <button
          onClick={() => onViewMap(bid.id)}
          className="w-full mt-3 skeuomorphic-btn text-sm py-3 font-bold text-[#007AFF]"
        >
          View Route Map
        </button>
      )}

      {isDelivered && onPaymentReceived && (
        <button
          onClick={() => onPaymentReceived(bid.id)}
          className="w-full mt-3 skeuomorphic-btn skeuomorphic-primary text-sm py-3 font-bold"
        >
          Confirm Payment Received
        </button>
      )}
    </div>
  );
}
