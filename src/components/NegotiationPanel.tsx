"use client";

import React, { useState, useEffect, useRef } from "react";
import { Cargo, Bid } from "@/lib/types";
import { useAppState } from "@/lib/store";
import { useAuth } from "@/lib/auth";

interface NegotiationPanelProps {
  cargo: Cargo;
  bid: Bid;
  onClose: () => void;
}

interface NegotiationMessage {
  sender: "wholesaler" | "ai" | "human";
  text: string;
  price?: number;
  timestamp: number;
}

export default function NegotiationPanel({ cargo, bid, onClose }: NegotiationPanelProps) {
  const { dispatch } = useAppState();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [round, setRound] = useState(1);
  const [isRequestingHuman, setIsRequestingHuman] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [counterPrice, setCounterPrice] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with first bid
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: "wholesaler",
          text: `I can offer ₹${bid.offeredPricePerKg}/kg for ${bid.requestedQuantityKg}kg.`,
          price: bid.offeredPricePerKg,
          timestamp: Date.now()
        }
      ]);
      evaluateBid(bid.offeredPricePerKg, 1);
    }
  }, []);

  useEffect(() => {
    if (isRequestingHuman) {
      fetchChatMessages();
      const interval = setInterval(fetchChatMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isRequestingHuman]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatMessages]);

  const evaluateBid = async (offerPrice: number, currentRound: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/negotiation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cargoId: cargo.id,
          cargoType: cargo.type,
          cargoValue: cargo.estimatedCargoValue,
          askingPricePerKg: cargo.askingPricePerKg || 100, // fallback
          spoilageMinutes: cargo.spoilageTimeMinutes || 60,
          quantityKg: cargo.quantityKg,
          bidPricePerKg: offerPrice,
          bidQuantityKg: bid.requestedQuantityKg,
          roundNumber: currentRound
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        const aiMessage: NegotiationMessage = {
          sender: "ai",
          text: data.reasoning,
          price: data.counterPrice,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        if (data.action === "accept") {
          dispatch({ type: "ACCEPT_BID", bidId: bid.id, cargoId: cargo.id });
        } else if (data.action === "counter") {
          dispatch({ 
            type: "UPDATE_BID_STATUS", 
            bidId: bid.id, 
            status: "counter_offered", 
            counterPrice: data.counterPrice 
          });
        } else {
          dispatch({ type: "UPDATE_BID_STATUS", bidId: bid.id, status: "rejected" });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWholesalerCounter = () => {
    if (!counterPrice) return;
    const nextRound = round + 1;
    setRound(nextRound);
    
    setMessages(prev => [
      ...prev,
      {
        sender: "wholesaler",
        text: `How about ₹${counterPrice}/kg?`,
        price: Number(counterPrice),
        timestamp: Date.now()
      }
    ]);
    
    evaluateBid(Number(counterPrice), nextRound);
    setCounterPrice("");
  };

  const fetchChatMessages = async () => {
    try {
      const res = await fetch(`/api/chat?chatId=${bid.id}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: bid.id,
          sender: user?.name || "Wholesaler",
          message: msg,
          timestamp: Date.now()
        })
      });
      fetchChatMessages();
    } catch (e) {
      console.error(e);
    }
  };

  const lastAiMessage = messages.filter(m => m.sender === 'ai').pop();
  const negotiationEnded = bid.status === "accepted" || bid.status === "rejected" || round >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass liquid-glass w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[var(--separator)] bg-[var(--bg-primary)]">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--separator)] flex justify-between items-center bg-[var(--fill-secondary)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Negotiating: {cargo.type}</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Asking Price: ₹{cargo.askingPricePerKg}/kg | Spoilage: {cargo.spoilageTimeMinutes}m
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--fill-tertiary)] text-[var(--text-secondary)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Chat / Negotiation Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isRequestingHuman ? (
            // AI Negotiation Timeline
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "wholesaler" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.sender === "wholesaler" 
                    ? "bg-[#007AFF] text-white rounded-br-sm" 
                    : "bg-[var(--fill-secondary)] text-[var(--text-primary)] border border-[var(--separator)] rounded-bl-sm"
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold opacity-80 uppercase">
                      {msg.sender === "wholesaler" ? "You" : "Fleet AI"}
                    </span>
                    {msg.price && (
                      <span className="font-mono font-bold text-sm bg-white/20 px-2 py-0.5 rounded">
                        ₹{msg.price}/kg
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{msg.text}</p>
                </div>
              </div>
            ))
          ) : (
            // Human Chat Timeline
            chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === user?.name ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.sender === user?.name 
                    ? "bg-[#34C759] text-white rounded-br-sm" 
                    : "bg-[var(--fill-tertiary)] text-[var(--text-primary)] rounded-bl-sm"
                }`}>
                  <p className="text-xs font-bold opacity-80 mb-1">{msg.sender}</p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))
          )}
          {loading && !isRequestingHuman && (
            <div className="flex justify-start">
              <div className="bg-[var(--fill-secondary)] text-[var(--text-primary)] border border-[var(--separator)] rounded-2xl rounded-bl-sm p-4">
                <p className="text-sm animate-pulse flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#007AFF] rounded-full"></span> AI evaluating offer...
                </p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--separator)] bg-[var(--fill-secondary)]">
          {!isRequestingHuman ? (
            <div className="space-y-3">
              {bid.status === "accepted" ? (
                <div className="bg-[#34C759]/10 text-[#34C759] p-3 rounded-xl text-center font-bold text-sm">
                  Offer Accepted! Proceed to checkout.
                </div>
              ) : bid.status === "rejected" ? (
                <div className="bg-[#FF3B30]/10 text-[#FF3B30] p-3 rounded-xl text-center font-bold text-sm">
                  Offer Rejected. Try finding another cargo.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {lastAiMessage?.price && (
                    <button
                      onClick={() => {
                        dispatch({ type: "ACCEPT_BID", bidId: bid.id, cargoId: cargo.id });
                        setMessages(prev => [...prev, {
                          sender: "wholesaler",
                          text: `I accept the offer of ₹${lastAiMessage.price}/kg.`,
                          timestamp: Date.now()
                        }]);
                      }}
                      className="w-full bg-[#007AFF] text-white py-3 rounded-xl font-bold shadow-sm"
                    >
                      Accept Counter Offer (₹{lastAiMessage.price}/kg)
                    </button>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Your counter price..."
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(Number(e.target.value))}
                      disabled={loading || negotiationEnded}
                      className="flex-1 bg-[var(--bg-primary)] border border-[var(--separator)] rounded-xl px-4 text-sm text-[var(--text-primary)]"
                    />
                    <button
                      onClick={handleWholesalerCounter}
                      disabled={!counterPrice || loading || negotiationEnded}
                      className="bg-[#34C759] text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50"
                    >
                      Counter
                    </button>
                  </div>
                  <button
                    onClick={() => setIsRequestingHuman(true)}
                    className="w-full text-xs font-bold text-[#FF9500] py-2 hover:bg-[#FF9500]/10 rounded-lg transition-colors"
                  >
                    Request Human Intervention
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--separator)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)]"
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim()}
                className="bg-[#007AFF] text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
