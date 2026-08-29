// ============================================================
// ANNAPURNA — Simulator & Spoilage Calculator
// ============================================================

import { TelemetryData } from "./types";
import { TEMPERATURE_FAILURE_SEQUENCE } from "@/data/mock-data";

/**
 * Get the telemetry data for a given simulation step.
 * Returns the last frame if step exceeds sequence length.
 */
export function getSimulationFrame(step: number): TelemetryData {
  const idx = Math.min(step, TEMPERATURE_FAILURE_SEQUENCE.length - 1);
  const frame = TEMPERATURE_FAILURE_SEQUENCE[idx];
  return {
    temperature: frame.temp,
    humidity: frame.humidity,
    ethyleneLevel: frame.ethylene,
    timestamp: Date.now(),
  };
}

/**
 * Calculate estimated minutes until cargo is unsalvageable.
 *
 * Model: Based on how far above the safe maximum the temperature is.
 * - Every 1°C above safeMax reduces remaining life by ~15 minutes
 * - High ethylene accelerates spoilage by 40%
 * - Base shelf life at safeMax = 6 hours (360 min)
 *
 * This is a simplified model for the demo.
 * In production, this would use a per-commodity spoilage curve.
 */
export function calculateSpoilageTime(
  currentTemp: number,
  safeMax: number,
  ethylene: string
): number {
  if (currentTemp <= safeMax) {
    return 360; // 6 hours — safe zone
  }

  const tempExcess = currentTemp - safeMax;
  const baseLifeMinutes = 360;
  const degradationPerDegree = 15; // minutes lost per °C above safe
  const ethyleneMultiplier = ethylene === "high" ? 1.4 : ethylene === "medium" ? 1.15 : 1.0;

  const remainingLife = Math.max(
    0,
    baseLifeMinutes - tempExcess * degradationPerDegree * ethyleneMultiplier
  );

  return Math.round(remainingLife);
}

/**
 * Should the Agentic AI trigger Emergency Liquidation Mode?
 * Returns true if cargo will spoil before reaching its destination.
 */
export function shouldTriggerEmergency(
  spoilageMinutes: number,
  etaMinutes: number
): boolean {
  // Trigger if spoilage will happen before arrival (with 15 min safety margin)
  return spoilageMinutes < etaMinutes + 15;
}

/**
 * Get the total number of simulation frames available.
 */
export function getTotalFrames(): number {
  return TEMPERATURE_FAILURE_SEQUENCE.length;
}
