// ============================================================
// ANNAPURNA — Global State Store (React Context + useReducer)
// Synced via Firestore (real-time onSnapshot)
// ============================================================

"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Cargo,
  Bid,
  TelemetryData,
  AIDecision,
  Notification,
  CargoStatus,
  Market,
  CarbonToken,
} from "./types";
import { FLEET_CARGOS } from "@/data/mock-data";

// --- Helper: strip undefined values (Firestore rejects undefined) ---
function sanitize(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const clean: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) {
      clean[k] = null;
    } else if (typeof v === "object" && v !== null) {
      clean[k] = sanitize(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

// --- State Shape ---
export interface AppState {
  cargos: Cargo[];
  bids: Bid[];
  carbonTokens: CarbonToken[];
  aiDecisions: AIDecision[];
  notifications: Notification[];
  simulationRunning: boolean;
  simulationStep: number;
}

const initialState: AppState = {
  cargos: [],
  bids: [],
  carbonTokens: [],
  aiDecisions: [],
  notifications: [],
  simulationRunning: false,
  simulationStep: 0,
};

// --- Actions ---
type Action =
  | { type: "UPDATE_TELEMETRY"; cargoId: string; telemetry: TelemetryData }
  | { type: "UPDATE_CARGO_STATUS"; cargoId: string; status: CargoStatus; spoilageMinutes?: number }
  | { type: "SET_ASKING_PRICE"; cargoId: string; pricePerKg: number }
  | { type: "ADD_AI_DECISION"; decision: AIDecision }
  | { type: "ADD_BID"; bid: Bid }
  | { type: "UPDATE_BID_STATUS"; bidId: string; status: Bid["status"]; counterPrice?: number }
  | { type: "ACCEPT_BID"; bidId: string; cargoId: string }
  | { type: "ADD_NOTIFICATION"; notification: Notification }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "START_SIMULATION" }
  | { type: "STOP_SIMULATION" }
  | { type: "TICK_SIMULATION" }
  | { type: "SET_CARBON_TOKENS"; tokens: CarbonToken[] }
  | { type: "ADD_CARBON_TOKEN"; token: CarbonToken }
  | { type: "SET_CARGO_REROUTE"; cargoId: string; market: Market }
  | { type: "BROADCAST_TO_MARKETPLACE"; cargoId: string }
  | { type: "ADD_CARGO"; cargo: Cargo }
  | { type: "TRIGGER_MANUAL_EMERGENCY"; cargoId: string; newTemperature: number }
  | { type: "SET_CARGOS"; cargos: Cargo[] }
  | { type: "SET_BIDS"; bids: Bid[] }
  | { type: "MARK_DELIVERED"; cargoId: string }
  | { type: "DELETE_CARGO"; cargoId: string }
  | { type: "SET_FULL_STATE"; state: AppState }
  | { type: "MERGE_FIRESTORE_CARGOS"; firestoreCargos: Cargo[] };

// --- Reducer ---
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "UPDATE_TELEMETRY":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId ? { ...c, telemetry: action.telemetry } : c
        ),
      };

    case "UPDATE_CARGO_STATUS":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? {
                ...c,
                status: action.status,
                spoilageTimeMinutes: action.spoilageMinutes ?? c.spoilageTimeMinutes,
              }
            : c
        ),
      };

    case "SET_ASKING_PRICE":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? { ...c, askingPricePerKg: action.pricePerKg }
            : c
        ),
      };

    case "ADD_AI_DECISION":
      return {
        ...state,
        aiDecisions: [...state.aiDecisions, action.decision],
      };

    case "ADD_BID":
      return {
        ...state,
        bids: [...state.bids, action.bid],
      };

    case "UPDATE_BID_STATUS":
      return {
        ...state,
        bids: state.bids.map((b) =>
          b.id === action.bidId
            ? {
                ...b,
                status: action.status,
                counterPricePerKg: action.counterPrice,
              }
            : b
        ),
      };

    case "ACCEPT_BID": {
      const acceptedBid = state.bids.find((b) => b.id === action.bidId);
      const targetCargo = state.cargos.find((c) => c.id === action.cargoId);
      if (!acceptedBid || !targetCargo) return state;

      const isPartial = acceptedBid.requestedQuantityKg < targetCargo.quantityKg;

      return {
        ...state,
        bids: state.bids.map((b) =>
          b.id === action.bidId
            ? { ...b, status: "accepted" as const }
            : (!isPartial && b.cargoId === action.cargoId)
            ? { ...b, status: "rejected" as const }
            : b
        ),
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? {
                ...c,
                quantityKg: Math.max(0, c.quantityKg - acceptedBid.requestedQuantityKg),
                status: isPartial ? c.status : ("rerouting" as const),
                originalDestination: {
                  name: acceptedBid.wholesalerLocation,
                  location: acceptedBid.wholesalerCoords || {
                    lat: c.origin.location.lat - 0.5,
                    lng: c.origin.location.lng - 0.5
                  }
                },
                selectedMarket: isPartial ? c.selectedMarket : (acceptedBid
                  ? {
                      id: acceptedBid.wholesalerId,
                      name: acceptedBid.wholesalerLocation,
                      location: acceptedBid.wholesalerCoords || {
                        lat: c.origin.location.lat - 0.5,
                        lng: c.origin.location.lng - 0.5
                      },
                      distanceKm: acceptedBid.distanceKm,
                      etaMinutes: acceptedBid.etaMinutes,
                      type: "wholesale_market" as const,
                    }
                  : null),
              }
            : c
        ),
      };
    }

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      };

    case "START_SIMULATION":
      return { ...state, simulationRunning: true, simulationStep: 0 };

    case "STOP_SIMULATION":
      return { ...state, simulationRunning: false };

    case "TICK_SIMULATION":
      return { ...state, simulationStep: state.simulationStep + 1 };

    case "SET_CARBON_TOKENS":
      return { ...state, carbonTokens: action.tokens };

    case "ADD_CARBON_TOKEN":
      return { ...state, carbonTokens: [action.token, ...state.carbonTokens] };

    case "SET_CARGO_REROUTE":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? { ...c, selectedMarket: action.market, status: "rerouting" }
            : c
        ),
      };

    case "BROADCAST_TO_MARKETPLACE":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? { ...c, status: "emergency" }
            : c
        ),
        notifications: [
          {
            id: `notif-broadcast-${Date.now()}`,
            type: "new_cargo",
            title: "Emergency Cargo Broadcast",
            message: `Distress cargo ${action.cargoId} sent to nearby wholesalers. Awaiting bids.`,
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };

    case "ADD_CARGO":
      return {
        ...state,
        cargos: [action.cargo, ...state.cargos],
        notifications: [
          {
            id: `notif-add-${Date.now()}`,
            type: "system",
            title: "New Consignment Added",
            message: `Truck ${action.cargo.truckPlate} added to active fleet tracking.`,
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };

    case "TRIGGER_MANUAL_EMERGENCY":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? { 
                ...c, 
                status: "emergency", 
                telemetry: { ...c.telemetry, temperature: action.newTemperature } 
              }
            : c
        ),
      };

    case "SET_CARGOS":
      return { ...state, cargos: action.cargos };
      
    case "SET_BIDS":
      return { ...state, bids: action.bids };

    case "MARK_DELIVERED":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? { ...c, status: "delivered" as CargoStatus }
            : c
        ),
      };

    case "DELETE_CARGO":
      return {
        ...state,
        cargos: state.cargos.filter((c) => c.id !== action.cargoId),
      };

    case "SET_FULL_STATE":
      return action.state;

    // MERGE_FIRESTORE_CARGOS is deprecated — we now use SET_CARGOS directly
    case "MERGE_FIRESTORE_CARGOS": {
      return {
        ...state,
        cargos: action.firestoreCargos,
      };
    }

    default:
      return state;
  }
}

// --- Context ---
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const firestoreReady = React.useRef(false);

  // On mount: set up real-time Firestore listeners
  React.useEffect(() => {
    const cargosRef = collection(db, "cargos");
    const bidsRef = collection(db, "bids");

    // Real-time listener for cargos — Firestore is the SINGLE source of truth
    const unsubCargos = onSnapshot(cargosRef, (snapshot) => {
      firestoreReady.current = true;
      const cargos = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Cargo[];
      console.log("[Firestore] onSnapshot cargos:", cargos.length, "docs");
      if (cargos.length > 0) {
        // Use ONLY Firestore data — no stale mock data
        dispatch({ type: "SET_CARGOS", cargos });
      } else {
        // Fallback: if Firestore is empty, show demo cargos so the UI isn't blank
        dispatch({ type: "SET_CARGOS", cargos: FLEET_CARGOS });
      }
    }, (err) => {
      console.error("Firestore cargos listener error:", err);
      // On error, fall back to mock data so the app still works
      dispatch({ type: "SET_CARGOS", cargos: FLEET_CARGOS });
    });

    // Real-time listener for bids
    const unsubBids = onSnapshot(bidsRef, (snapshot) => {
      const bids = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Bid[];
      console.log("[Firestore] onSnapshot bids:", bids.length, "docs");
      dispatch({ type: "SET_BIDS", bids });
    }, (err) => {
      console.error("Firestore bids listener error:", err);
    });

    // Real-time listener for carbon tokens
    const tokensRef = collection(db, "carbon_tokens");
    const unsubTokens = onSnapshot(tokensRef, (snapshot) => {
      const tokens = snapshot.docs.map((d) => ({ ...d.data(), hash: d.id })) as CarbonToken[];
      dispatch({ type: "SET_CARBON_TOKENS", tokens: tokens.sort((a,b) => b.timestamp - a.timestamp) });
    }, (err) => {
      console.error("Firestore tokens listener error:", err);
    });

    // No localStorage fallback — Firestore is the single source of truth for cross-device sync

    return () => {
      unsubCargos();
      unsubBids();
      unsubTokens();
    };
  }, []);

  // Persist to localStorage (client-only, guarded for SSR)
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined" && (state.cargos.length > 0 || state.bids.length > 0)) {
        const s = JSON.stringify(state);
        if (localStorage.getItem("annapurna_state") !== s) {
          localStorage.setItem("annapurna_state", s);
        }
      }
    } catch (e) {
      // localStorage may be unavailable in some environments
    }
  }, [state]);

  const postToFirestore = async (type: string, data: any) => {
    const res = await fetch("/api/firestore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
    if (!res.ok) {
      throw new Error(`Failed to POST to firestore: ${res.statusText}`);
    }
  };

  // Middleware: update local state optimistically, then write to Firestore via server API
  const asyncDispatch = async (action: Action) => {
    dispatch(action); // Optimistic local update

    try {
      if (action.type === "ADD_CARGO") {
        const data = sanitize({ ...action.cargo, createdAt: Date.now() });
        await postToFirestore("cargo", data);

      } else if (action.type === "SET_ASKING_PRICE") {
        await postToFirestore("cargo", { id: action.cargoId, askingPricePerKg: action.pricePerKg });

      } else if (action.type === "BROADCAST_TO_MARKETPLACE") {
        await postToFirestore("cargo", { id: action.cargoId, status: "emergency" });

      } else if (action.type === "TRIGGER_MANUAL_EMERGENCY") {
        const cargo = state.cargos.find((c) => c.id === action.cargoId);
        if (cargo) {
          await postToFirestore("cargo", { 
            id: action.cargoId, 
            status: "emergency",
            telemetry: { ...cargo.telemetry, temperature: action.newTemperature }
          });
        }

      } else if (action.type === "UPDATE_TELEMETRY") {
        await postToFirestore("cargo", { id: action.cargoId, telemetry: action.telemetry });

      } else if (action.type === "UPDATE_CARGO_STATUS") {
        await postToFirestore("cargo", { id: action.cargoId, status: action.status, spoilageTimeMinutes: action.spoilageMinutes });


      } else if (action.type === "ADD_BID") {
        const data = sanitize({ ...action.bid, createdAt: Date.now() });
        await postToFirestore("bid", data);

      } else if (action.type === "UPDATE_BID_STATUS") {
        await postToFirestore("bid", { id: action.bidId, status: action.status, counterPricePerKg: action.counterPrice });

      } else if (action.type === "ACCEPT_BID") {
        await postToFirestore("accept_bid", { bidId: action.bidId, cargoId: action.cargoId });

      } else if (action.type === "MARK_DELIVERED") {
        await postToFirestore("cargo", { id: action.cargoId, status: "delivered" });


      } else if (action.type === "DELETE_CARGO") {
        await postToFirestore("delete_cargo", { id: action.cargoId });
      }
    } catch (err) {
      console.error("[Firestore] Sync Error:", err);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch: asyncDispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
}
