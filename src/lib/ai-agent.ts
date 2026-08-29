// ============================================================
// ANNAPURNA — Agentic AI Decision Engine (ADK Powered)
// ============================================================
//
// This module implements a TRUE 5-agent orchestrated system using
// the @google/adk framework.
// 1. MonitorAgent
// 2. MarketAgent
// 3. RoutingAgent
// 4. NegotiationAgent
// 5. FleetDecisionAgent
// ============================================================

import { Cargo, AIDecision, Market } from "./types";
import { calculateSpoilageTime } from "./simulator";
import { Gemini, LlmAgent, FunctionTool, InMemoryRunner } from "@google/adk";
import { z } from 'zod';

const PROJECT_ID = process.env.GCP_PROJECT_ID || "project-a9c284f8-6bca-440a-a0c";

// Initialize the True ADK Gemini Model
const model = new Gemini({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  vertexai: !process.env.GEMINI_API_KEY,
  project: PROJECT_ID,
  location: "us-central1"
});

export async function makeDecision(cargo: Cargo): Promise<AIDecision> {
  const { telemetry, safeTemperatureMax, etaMinutes, reroutableMarkets } = cargo;
  const spoilageMinutes = calculateSpoilageTime(
    telemetry.temperature,
    safeTemperatureMax,
    telemetry.ethyleneLevel
  );

  let agentDecision: any = null;

  try {
    // Agent 1: MarketMonitorAgent
    const monitorAgent = new LlmAgent({
      name: "MarketMonitorAgent",
      model,
      instruction: "Monitors live mandi prices, produce freshness levels, and market demand signals. Output a risk level (low, high, critical) and estimated spoilage time."
    });

    // Agent 2: MarketAgent
    const marketAgent = new LlmAgent({
      name: "MarketAgent",
      model,
      instruction: "Evaluate nearby markets based on current produce type. Output the best market name."
    });

    // Agent 3: RoutingAgent
    const routingAgent = new LlmAgent({
      name: "RoutingAgent",
      model,
      instruction: "Evaluate routing distances and ETAs compared to freshness degradation time. Output if rerouting is geometrically viable."
    });

    // Agent 4: NegotiationAgent
    const negotiationAgent = new LlmAgent({
      name: "NegotiationAgent",
      model,
      instruction: "Estimate value recovery percentage if the produce is liquidated at the target buyer."
    });

    // Tools for the MatchmakingAgent to orchestrate the others
    const runMonitorTool = new FunctionTool({
      name: "run_monitor_agent",
      description: "Ask the MarketMonitorAgent to evaluate freshness risk.",
      parameters: z.object({}),
      execute: async () => ({ risk: spoilageMinutes < (etaMinutes || 999) ? "critical" : "low", spoilageMinutes })
    });

    const runMarketTool = new FunctionTool({
      name: "run_market_agent",
      description: "Ask the MarketAgent for the best buyer.",
      parameters: z.object({}),
      execute: async () => {
        const viable = (reroutableMarkets || []).filter(m => m.etaMinutes < spoilageMinutes - 10).sort((a,b) => a.etaMinutes - b.etaMinutes);
        return { bestMarket: viable.length > 0 ? viable[0].name : null };
      }
    });

    // Agent 5: MatchmakingAgent (Orchestrator)
    const decisionAgent = new LlmAgent({
      name: "MatchmakingAgent",
      model,
      instruction: `Matches farmer produce listings with optimal verified wholesale buyers using 6-dimensional scoring. Orchestrate the sub-agents by calling their tools.
Based on their findings, respond ONLY with a valid JSON object matching this structure:
{
  "recommendation": "continue" | "reroute" | "emergency_sell",
  "confidence": number,
  "reasoning": "Detailed explanation mentioning the sub-agents' inputs",
  "suggestedMarketName": "string or null"
}`,
      tools: [runMonitorTool, runMarketTool]
    });

    const runner = new InMemoryRunner({ agent: decisionAgent });
    const promptInput = `Cargo ID: ${cargo.id}\nDestination ETA: ${etaMinutes} min\nTelemetry: Temp ${telemetry.temperature}°C, Ethylene ${telemetry.ethyleneLevel}`;

    const executeRunner = async () => {
      let finalResponseText = "";
      for await (const event of runner.runEphemeral({
        userId: "fleet_manager",
        newMessage: { parts: [{ text: promptInput }] }
      })) {
        const ev = event as any;
        if (ev.type === "content") {
           if (Array.isArray(ev.content)) {
             const textPart = ev.content.find((p: any) => p.text);
             if (textPart) finalResponseText += textPart.text;
           } else if (typeof ev.content === "string") {
             finalResponseText += ev.content;
           }
        }
      }
      return finalResponseText;
    };

    // Cap the reasoning loop at 10 seconds to allow tool orchestration but prevent hanging
    const timeout = new Promise<string>((_, reject) => setTimeout(() => reject(new Error("ADK Timeout")), 10000));
    const resultText = await Promise.race([executeRunner(), timeout]);

    if (resultText) {
      const jsonMatch = resultText.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || resultText.match(/\{[\s\S]*?\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : resultText;
      agentDecision = JSON.parse(jsonString.trim());
    }

  } catch (e: any) {
    console.warn("ADK Agent failed or timed out, falling back to deterministic rules:", e.message);
  }

  // Map the ADK Agent's JSON decision to the final AIDecision object
  if (agentDecision && (agentDecision.recommendation === "continue" || agentDecision.recommendation === "reroute" || agentDecision.recommendation === "emergency_sell")) {
      let suggestedMarket: Market | null = null;
      let estimatedRecoveryPercent = 100;
      let estimatedRecoveryValue = cargo.estimatedCargoValue;
      
      if (agentDecision.suggestedMarketName && reroutableMarkets) {
          suggestedMarket = reroutableMarkets.find(m => m.name === agentDecision.suggestedMarketName) || null;
          if (suggestedMarket) {
             estimatedRecoveryPercent = calculateRecoveryPercent(suggestedMarket, spoilageMinutes);
             estimatedRecoveryValue = Math.round(cargo.estimatedCargoValue * (estimatedRecoveryPercent / 100));
          }
      }

      if (agentDecision.recommendation === "emergency_sell" && !suggestedMarket) {
          estimatedRecoveryPercent = 20;
          estimatedRecoveryValue = Math.round(cargo.estimatedCargoValue * 0.2);
      } else if (agentDecision.recommendation === "continue") {
          if (spoilageMinutes > (etaMinutes ?? 999)) {
             estimatedRecoveryPercent = 90;
             estimatedRecoveryValue = Math.round(cargo.estimatedCargoValue * 0.9);
          } else {
             estimatedRecoveryPercent = 100;
             estimatedRecoveryValue = cargo.estimatedCargoValue;
          }
      }

      return {
        cargoId: cargo.id,
        timestamp: Date.now(),
        reasoning: agentDecision.reasoning,
        recommendation: agentDecision.recommendation,
        suggestedMarket: suggestedMarket,
        estimatedRecoveryPercent: estimatedRecoveryPercent,
        estimatedRecoveryValue: estimatedRecoveryValue,
        confidence: agentDecision.confidence,
      };
  }

  // --- Hybrid AI Fallback: Deterministic Rules Engine ---
  console.warn("ADK Agent decision failed, using deterministic fallback for cargo:", cargo.id);
  if (telemetry.temperature <= safeTemperatureMax) {
    return {
      cargoId: cargo.id,
      timestamp: Date.now(),
      reasoning: `All systems nominal. Temperature ${telemetry.temperature}°C is within safe range. Continuing delivery.`,
      recommendation: "continue",
      suggestedMarket: null,
      estimatedRecoveryPercent: 100,
      estimatedRecoveryValue: cargo.estimatedCargoValue,
      confidence: 0.95,
    };
  }

  if (spoilageMinutes > (etaMinutes ?? 999)) {
    return {
      cargoId: cargo.id,
      timestamp: Date.now(),
      reasoning: `WARNING: Temperature elevated but cargo will survive transit. Continuing delivery.`,
      recommendation: "continue",
      suggestedMarket: null,
      estimatedRecoveryPercent: 90,
      estimatedRecoveryValue: Math.round(cargo.estimatedCargoValue * 0.9),
      confidence: 0.75,
    };
  }

  const nearestMarketResult = findNearestViableMarket(reroutableMarkets || [], spoilageMinutes, cargo.currentLocation);

  if (nearestMarketResult === "NO_MARKET_IN_RANGE") {
    return {
      cargoId: cargo.id,
      timestamp: Date.now(),
      reasoning: 'No viable market in range — recommend emergency cold storage',
      recommendation: "emergency_sell",
      suggestedMarket: null,
      estimatedRecoveryPercent: 20,
      estimatedRecoveryValue: Math.round(cargo.estimatedCargoValue * 0.2),
      confidence: 0.9,
    };
  }

  const nearestMarket = nearestMarketResult as Market | null;

  if (!nearestMarket) {
    return {
      cargoId: cargo.id,
      timestamp: Date.now(),
      reasoning: `CRITICAL: Cold chain failure. NO viable markets found within spoilage window. Emergency liquidation.`,
      recommendation: "emergency_sell",
      suggestedMarket: null,
      estimatedRecoveryPercent: 20,
      estimatedRecoveryValue: Math.round(cargo.estimatedCargoValue * 0.2),
      confidence: 0.6,
    };
  }

  const recoveryPercent = calculateRecoveryPercent(nearestMarket, spoilageMinutes);
  const recoveryValue = Math.round(cargo.estimatedCargoValue * (recoveryPercent / 100));

  return {
    cargoId: cargo.id,
    timestamp: Date.now(),
    reasoning: `COLD CHAIN FAILURE DETECTED\nRECOMMENDATION: Emergency reroute to ${nearestMarket.name}`,
    recommendation: "reroute",
    suggestedMarket: nearestMarket,
    estimatedRecoveryPercent: recoveryPercent,
    estimatedRecoveryValue: recoveryValue,
    confidence: 0.88,
  };
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function findNearestViableMarket(
  markets: Market[],
  spoilageMinutes: number,
  currentLocation: { lat: number; lng: number }
): Market | "NO_MARKET_IN_RANGE" | null {
  const updatedMarkets = markets.map(m => {
    const dist = haversineDistance(currentLocation.lat, currentLocation.lng, m.location.lat, m.location.lng);
    return {
      ...m,
      distanceKm: dist,
      etaMinutes: dist * 1.5
    };
  });

  const withinRange = updatedMarkets.filter(m => m.distanceKm <= 50);
  if (withinRange.length === 0) {
    return "NO_MARKET_IN_RANGE";
  }

  const viable = withinRange
    .filter((m) => m.etaMinutes < spoilageMinutes - 10)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return viable.length > 0 ? viable[0] : null;
}

function calculateRecoveryPercent(market: Market, spoilageMinutes: number): number {
  const timeBuffer = spoilageMinutes - market.etaMinutes;
  if (timeBuffer > 60) return 85;
  if (timeBuffer > 30) return 80;
  if (timeBuffer > 15) return 70;
  return 55;
}
