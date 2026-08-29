// ============================================================
// ANNAPURNA — Simulator & Price Crash Calculator
// ============================================================

import { TelemetryData } from "./types";
import { TEMPERATURE_FAILURE_SEQUENCE } from "@/data/mock-data";

/**
 * Get the telemetry data for a given simulation step.
 * Returns the last frame if step exceeds sequence length.
 * In SIH context, we are reusing the 'temperature' field to simulate the Mandi Price.
 */
export function getSimulationFrame(step: number): TelemetryData {
  const idx = Math.min(step, TEMPERATURE_FAILURE_SEQUENCE.length - 1);
  const frame = TEMPERATURE_FAILURE_SEQUENCE[idx];
  return {
    temperature: frame.temp, // Reusing temp for Mandi Price
    humidity: frame.humidity,
    ethyleneLevel: frame.ethylene,
    timestamp: Date.now(),
  };
}

/**
 * Calculate estimated minutes until cargo is unsalvageable.
 * For SIH26033: This simulates the urgency of the price crash.
 * If the current price (currentTemp) drops below the minimum acceptable (safeMax),
 * we generate a low "spoilageTime" (urgency metric) to trigger the AI to list the produce.
 */
export function calculateSpoilageTime(
  currentMandiPrice: number,
  minimumAcceptablePrice: number,
  ethylene: string
): number {
  if (currentMandiPrice >= minimumAcceptablePrice) {
    return 360; // Safe zone
  }

  // Price dropped below minimum acceptable!
  const priceDeficit = minimumAcceptablePrice - currentMandiPrice;
  const baseUrgency = 120; // Need to sell soon
  const urgencyReduction = priceDeficit * 10; // For every rupee below minimum, urgency increases (time drops)

  const remainingTime = Math.max(
    0,
    baseUrgency - urgencyReduction
  );

  return Math.round(remainingTime);
}

/**
 * Should the Agentic AI trigger Emergency Liquidation Mode?
 * For SIH26033: Should AI trigger Direct Listing/Negotiation?
 */
export function shouldTriggerEmergency(
  spoilageMinutes: number, // reused as urgency minutes
  etaMinutes: number
): boolean {
  // Trigger if urgency is high (low time remaining)
  return spoilageMinutes < 60; // Trigger if we have less than 60 mins of safety window due to price crash
}

/**
 * Get the total number of simulation frames available.
 */
export function getTotalFrames(): number {
  return TEMPERATURE_FAILURE_SEQUENCE.length;
}
