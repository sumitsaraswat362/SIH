"use client";

import { useEffect, useState, useCallback } from "react";

interface CountdownTimerProps {
  expiresAt: number;
  onExpire?: () => void;
  size?: "sm" | "lg";
}

export default function CountdownTimer({
  expiresAt,
  onExpire,
  size = "sm",
}: CountdownTimerProps) {
  const expireTime = typeof expiresAt === "string" ? new Date(expiresAt).getTime() : Number(expiresAt);
  const [remaining, setRemaining] = useState(() => Math.max(0, expireTime - Date.now()));
  const [expired, setExpired] = useState(false);

  const tick = useCallback(() => {
    const validExpireTime = isNaN(expireTime) ? Date.now() + 5 * 60000 : expireTime;
    const diff = Math.max(0, validExpireTime - Date.now());
    setRemaining(diff);
    if (diff <= 0 && !expired) {
      setExpired(true);
      onExpire?.();
    }
  }, [expireTime, expired, onExpire]);

  useEffect(() => {
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [tick]);

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isUrgent = totalSeconds < 120;
  const isCritical = totalSeconds < 60;

  if (expired) {
    return (
      <span
        className={`font-[family-name:var(--font-mono)] font-bold text-[#FF3B30] animate-pulse ${
          size === "lg" ? "text-2xl" : "text-[13px]"
        }`}
      >
        EXPIRED
      </span>
    );
  }

  return (
    <span
      className={`font-[family-name:var(--font-mono)] font-semibold tabular-nums tracking-tight transition-colors duration-300 ${
        isCritical
          ? "text-[#FF3B30] animate-pulse"
          : isUrgent
          ? "text-[#FF3B30] animate-pulse-danger"
          : "text-[#FF9500]"
      } ${size === "lg" ? "text-3xl" : "text-[13px]"}`}
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
