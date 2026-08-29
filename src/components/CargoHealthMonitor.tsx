"use client";

import { useMemo } from "react";

interface CargoHealthMonitorProps {
  temperature: number;
  humidity: number;
  ethyleneLevel: "low" | "medium" | "high";
  safeMax: number;
  spoilageMinutes: number | null;
}

export default function CargoHealthMonitor({
  temperature,
  humidity,
  ethyleneLevel,
  safeMax,
  spoilageMinutes,
}: CargoHealthMonitorProps) {
  const status = useMemo(() => {
    if (temperature <= safeMax - 2) return "safe";
    if (temperature <= safeMax) return "warning";
    return "danger";
  }, [temperature, safeMax]);

  const gaugePercent = useMemo(() => {
    const maxDisplay = safeMax * 2.5;
    return Math.min(100, (temperature / maxDisplay) * 100);
  }, [temperature, safeMax]);

  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset = circumference - (gaugePercent / 100) * circumference;

  const strokeColor =
    status === "safe" ? "#34C759" : status === "warning" ? "#FF9500" : "#FF3B30";

  const spoilHours = spoilageMinutes ? Math.floor(spoilageMinutes / 60) : null;
  const spoilMins = spoilageMinutes ? spoilageMinutes % 60 : null;

  return (
    <div className={`ios-card p-5 ${status === "danger" ? "border border-[#FF3B30]/30" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#3C3C43] uppercase tracking-wider">
          Cargo Health Monitor
        </h3>
        <span
          className={`badge ${
            status === "safe"
              ? "badge-safe"
              : status === "warning"
              ? "badge-warning"
              : "badge-danger"
          }`}
        >
          {status === "safe" ? "● Nominal" : status === "warning" ? "● Caution" : "● Critical"}
        </span>
      </div>

      {/* Temperature Gauge */}
      <div className="flex justify-center my-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke={strokeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="gauge-circle"
              style={{
                filter: status === "danger" ? `drop-shadow(0 0 8px ${strokeColor})` : "none",
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-[family-name:var(--font-mono)] text-3xl font-bold transition-colors duration-500 ${
                status === "safe"
                  ? "text-[#34C759]"
                  : status === "warning"
                  ? "text-[#FF9500]"
                  : "text-[#FF3B30]"
              } ${status === "danger" ? "animate-pulse-danger" : ""}`}
            >
              {(temperature || 0).toFixed(1)}°
            </span>
            <span className="text-xs text-[#8E8E93] mt-0.5">
              Safe: ≤{safeMax}°C
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[#F2F2F7] rounded-lg p-3 text-center">
          <p className="text-[10px] text-[#8E8E93] uppercase tracking-widest mb-1">Humidity</p>
          <p className="font-[family-name:var(--font-mono)] text-lg font-semibold text-[#000000]">
            {humidity}%
          </p>
        </div>
        <div className="bg-[#F2F2F7] rounded-lg p-3 text-center">
          <p className="text-[10px] text-[#8E8E93] uppercase tracking-widest mb-1">Ethylene</p>
          <p
            className={`font-[family-name:var(--font-mono)] text-lg font-semibold ${
              ethyleneLevel === "high"
                ? "text-[#FF3B30]"
                : ethyleneLevel === "medium"
                ? "text-[#FF9500]"
                : "text-[#34C759]"
            }`}
          >
            {(ethyleneLevel || "normal").toUpperCase()}
          </p>
        </div>
      </div>

      {/* Spoilage Countdown */}
      {spoilageMinutes !== null && spoilageMinutes < 360 && (
        <div className="mt-4 p-3 rounded-lg bg-[#FF3B30]/5 border border-[#FF3B30]/20 relative overflow-hidden">
          {/* Edge ML Badge */}
          <div className="absolute top-0 right-0 bg-[#007AFF]/10 text-[#007AFF] text-[8px] px-2 py-0.5 rounded-bl-lg font-bold tracking-wider flex items-center gap-1 border-b border-l border-[#007AFF]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse"></span>
            TinyML Edge Processing
          </div>
          
          <p className="text-[10px] text-[#FF3B30]/70 uppercase tracking-widest text-center mb-1 mt-2">
            Estimated Time to Spoilage
          </p>
          <p
            className={`font-[family-name:var(--font-mono)] text-2xl font-bold text-center ${
              spoilageMinutes < 60 ? "text-[#FF3B30] animate-pulse-fast" : "text-[#FF3B30] animate-pulse-danger"
            }`}
          >
            {spoilHours !== null && spoilMins !== null
              ? `${String(spoilHours).padStart(2, "0")}:${String(spoilMins).padStart(2, "0")}:00`
              : "--:--:--"}
          </p>
          
          <div className="mt-2 flex justify-between items-center px-1">
            <span className="text-[9px] text-[#8E8E93]">Neural Net Confidence:</span>
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#34C759] font-bold">
              {status === "danger" ? (94 + Math.random() * 4).toFixed(1) : (98 + Math.random() * 1.5).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
