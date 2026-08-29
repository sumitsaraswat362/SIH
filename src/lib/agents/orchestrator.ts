import { Cargo, Market, AIDecision } from "../types";
import { LlmAgent, FunctionTool, InMemoryRunner } from "@google/adk";
import { z } from "zod";
import { saveAlert, saveCargoState } from "../firestore-client";

// --- 1. ADK Function Tools ---

export const rerouteTruckTool = new FunctionTool({
  name: "reroute_truck",
  description: "Reroute a truck to a new destination market.",
  parameters: z.object({
    truckId: z.string().describe("The ID of the truck to reroute"),
    destination: z.string().describe("The name of the new destination market"),
  }),
  execute: async ({ truckId, destination }) => {
    const result = `Successfully rerouted truck ${truckId} to ${destination}.`;
    console.log(`[ADK Tool] ${result}`);
    await saveCargoState(truckId, { status: 'rerouted', destination });
    return { result };
  },
});

export const alertWholesalerTool = new FunctionTool({
  name: "alert_wholesaler",
  description: "Send an alert message to the wholesaler.",
  parameters: z.object({
    message: z.string().describe("The message to send to the wholesaler"),
    cargoId: z.string().describe("The ID of the cargo at risk"),
  }),
  execute: async ({ message, cargoId }) => {
    const result = `Wholesaler alerted for cargo ${cargoId}: ${message}`;
    console.log(`[ADK Tool] ${result}`);
    await saveAlert({ cargoId, alertType: 'WHOLESALER_ALERT', message });
    return { result };
  },
});

// --- 2. ADK Agent Definition ---

export const fleetDecisionAgent = new LlmAgent({
  name: "marketplace_decision_agent",
  model: "gemini-2.5-flash",
  description: "Autonomous Marketplace Orchestrator that evaluates produce listings and executes Matches or Alerts.",
  instruction: `You are the Annapurna Marketplace Decision Engine.
  You will receive details for a produce listing that is experiencing freshness degradation.
  Your job is to analyze the details, evaluate the available buyers, and immediately take action.
  If the produce will degrade before reaching its original destination, you MUST call 'reroute_truck' to send it to the nearest viable buyer.
  You MUST also call 'alert_wholesaler' to notify stakeholders of the freshness degradation.
  Return a brief summary of your actions as text.`,
  tools: [rerouteTruckTool, alertWholesalerTool],
});

// --- 3. Orchestrator Logic ---

const AVAILABLE_MARKETS: Market[] = [
  { id: "m1", name: "Azadpur Mandi", location: { lat: 28.737, lng: 77.178 }, distanceKm: 45, etaMinutes: 50, type: "mandi" },
  { id: "m2", name: "Okhla Sabzi Mandi", location: { lat: 28.563, lng: 77.279 }, distanceKm: 15, etaMinutes: 20, type: "wholesale_market" }
];

const FLEET_CARGOS: Cargo[] = [
  {
    id: "cargo-101", type: "tomatoes", quantityKg: 5000, truckId: "truck-001", truckPlate: "DL 1M 1234",
    driverName: "Rajesh Kumar", driverPhone: "+919876543210", origin: { name: "Sonipat Farms", location: { lat: 28.993, lng: 77.015 } },
    originalDestination: { name: "Chandigarh Market", location: { lat: 30.733, lng: 76.779 } },
    currentLocation: { lat: 29.5, lng: 76.9 }, routePolyline: [],
    telemetry: { temperature: 4.5, humidity: 85, ethyleneLevel: "low", timestamp: Date.now() },
    safeTemperatureMax: 10.0, loadedAt: Date.now() - 3600000, status: "in_transit", spoilageTimeMinutes: null, etaMinutes: 180, estimatedCargoValue: 100000, askingPricePerKg: null, reroutableMarkets: AVAILABLE_MARKETS, selectedMarket: null,
  },
  {
    id: "cargo-102", type: "mangoes", quantityKg: 3000, truckId: "truck-002", truckPlate: "MH 04 AB 9876",
    driverName: "Suresh", driverPhone: "+919876543211", origin: { name: "Ratnagiri", location: { lat: 16.99, lng: 73.31 } },
    originalDestination: { name: "Mumbai APMC", location: { lat: 19.07, lng: 72.87 } },
    currentLocation: { lat: 18.5, lng: 73.0 }, routePolyline: [],
    telemetry: { temperature: 18.5, humidity: 90, ethyleneLevel: "high", timestamp: Date.now() },
    safeTemperatureMax: 13.0, loadedAt: Date.now() - 7200000, status: "warning", spoilageTimeMinutes: null, etaMinutes: 120, estimatedCargoValue: 300000, askingPricePerKg: null, reroutableMarkets: AVAILABLE_MARKETS, selectedMarket: null,
  },
];

export async function runAutonomousCycle() {
  console.log("[ADK Orchestrator] Starting cycle...");
  const atRiskCargos = FLEET_CARGOS.filter(c => c.telemetry.temperature > c.safeTemperatureMax);
  console.log(`[ADK Orchestrator] Found ${atRiskCargos.length} cargos at risk.`);

  const runner = new InMemoryRunner({ agent: fleetDecisionAgent, appName: "annapurna_fleet" });
  const session = await runner.sessionService.createSession({ appName: "annapurna_fleet", userId: "system" });
  const toolExecutions: any[] = [];

  for (const cargo of atRiskCargos) {
    console.log(`[ADK Orchestrator] Evaluating ${cargo.id} using ADK LlmAgent...`);
    
    const promptText = `
      Cargo ID: ${cargo.id}
      Truck ID: ${cargo.truckId}
      Original Destination: ${cargo.originalDestination?.name || "destination"} (ETA: ${cargo.etaMinutes} min)
      Telemetry: Temperature ${cargo.telemetry.temperature}°C, Humidity ${cargo.telemetry.humidity}%, Ethylene ${cargo.telemetry.ethyleneLevel}
      Safe Temperature Max: ${cargo.safeTemperatureMax}°C
      Available Markets for Rerouting: ${JSON.stringify(cargo.reroutableMarkets)}
    `;

    const stream = runner.runAsync({
      userId: "system",
      sessionId: session.id,
      newMessage: { role: "user", parts: [{ text: promptText }] },
    });

    for await (const event of stream) {
      const ev = event as any;
      if (ev.toolCalls) {
        for (const call of ev.toolCalls) {
          toolExecutions.push({ name: call.name, args: call.args });
        }
      }
      if (ev.content?.parts?.[0]?.text && ev.author === 'fleet_decision_agent') {
        console.log(`[ADK Agent Output] ${ev.content.parts[0].text}`);
      }
    }
  }

  return {
    totalCargosChecked: FLEET_CARGOS.length,
    atRiskCount: atRiskCargos.length,
    toolExecutions
  };
}
