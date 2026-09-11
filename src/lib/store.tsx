"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  ProduceListing,
  Order,
  Notification,
  DemandForecast,
  CartItem,
  AIMatch,
  OrderStatus
} from "./types";
import { DEMO_LISTINGS, DEMO_ORDERS } from "@/data/mock-data";

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
  listings: ProduceListing[];
  orders: Order[];
  cart: CartItem[];
  aiMatches: AIMatch[];
  notifications: Notification[];
  forecasts: DemandForecast[];
}

const initialState: AppState = {
  listings: [],
  orders: [],
  cart: [],
  aiMatches: [],
  notifications: [],
  forecasts: [],
};

// --- Actions ---
type Action =
  | { type: "ADD_LISTING"; listing: ProduceListing }
  | { type: "UPDATE_LISTING"; listingId: string; updates: Partial<ProduceListing> }
  | { type: "REMOVE_LISTING"; listingId: string }
  | { type: "ADD_ORDER"; order: Order }
  | { type: "UPDATE_ORDER_STATUS"; orderId: string; status: OrderStatus }
  | { type: "ADD_TO_CART"; item: CartItem }
  | { type: "REMOVE_FROM_CART"; listingId: string }
  | { type: "UPDATE_CART_QUANTITY"; listingId: string; quantityKg: number }
  | { type: "CLEAR_CART" }
  | { type: "SET_AI_MATCHES"; matches: AIMatch[] }
  | { type: "ADD_NOTIFICATION"; notification: Notification }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "SET_FORECASTS"; forecasts: DemandForecast[] }
  | { type: "SYNC_LISTINGS"; listings: ProduceListing[] }
  | { type: "SYNC_ORDERS"; orders: Order[] };

// --- Reducer ---
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_LISTING":
      return { ...state, listings: [action.listing, ...state.listings] };

    case "UPDATE_LISTING":
      return {
        ...state,
        listings: state.listings.map((l) => {
          if (l.id !== action.listingId) return l;
          const updates = { ...action.updates };
          // Handle inventory deduction: negative availableQuantityKg means decrement
          if (updates.availableQuantityKg !== undefined && updates.availableQuantityKg < 0) {
            const current = l.availableQuantityKg ?? l.quantityKg;
            updates.availableQuantityKg = Math.max(0, current + updates.availableQuantityKg);
          }
          return { ...l, ...updates };
        }),
      };

    case "REMOVE_LISTING":
      return { ...state, listings: state.listings.filter((l) => l.id !== action.listingId) };

    case "ADD_ORDER":
      return { ...state, orders: [action.order, ...state.orders] };

    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: action.status } : o
        ),
      };

    case "ADD_TO_CART": {
      const existing = state.cart.find((item) => item.listingId === action.item.listingId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.listingId === action.item.listingId
              ? {
                  ...item,
                  quantityKg: item.quantityKg + action.item.quantityKg,
                  subtotal: item.subtotal + action.item.subtotal,
                }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.item] };
    }

    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((item) => item.listingId !== action.listingId) };

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.listingId === action.listingId
            ? {
                ...item,
                quantityKg: action.quantityKg,
                subtotal: action.quantityKg * item.pricePerKg,
              }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, cart: [] };

    case "SET_AI_MATCHES":
      return { ...state, aiMatches: action.matches };

    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.notification, ...state.notifications] };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      };

    case "SET_FORECASTS":
      return { ...state, forecasts: action.forecasts };

    case "SYNC_LISTINGS":
      return { ...state, listings: action.listings };

    case "SYNC_ORDERS":
      return { ...state, orders: action.orders };

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
    const listingsRef = collection(db, "listings");
    const ordersRef = collection(db, "orders");

    // Real-time listener for listings
    const unsubListings = onSnapshot(
      listingsRef,
      (snapshot) => {
        firestoreReady.current = true;
        const listings = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as ProduceListing[];
        console.log("[Firestore] onSnapshot listings:", listings.length, "docs");
        if (listings.length > 0) {
          dispatch({ type: "SYNC_LISTINGS", listings });
        } else {
          dispatch({ type: "SYNC_LISTINGS", listings: DEMO_LISTINGS });
        }
      },
      (err) => {
        console.error("Firestore listings listener error:", err);
        dispatch({ type: "SYNC_LISTINGS", listings: DEMO_LISTINGS });
      }
    );

    // Real-time listener for orders
    const unsubOrders = onSnapshot(
      ordersRef,
      (snapshot) => {
        const orders = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Order[];
        console.log("[Firestore] onSnapshot orders:", orders.length, "docs");
        if (orders.length > 0) {
          dispatch({ type: "SYNC_ORDERS", orders });
        } else {
          dispatch({ type: "SYNC_ORDERS", orders: DEMO_ORDERS });
        }
      },
      (err) => {
        console.error("Firestore orders listener error:", err);
        dispatch({ type: "SYNC_ORDERS", orders: DEMO_ORDERS });
      }
    );

    return () => {
      unsubListings();
      unsubOrders();
    };
  }, []);

  // Persist to localStorage (client-only, guarded for SSR)
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
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
      if (action.type === "ADD_LISTING") {
        const data = sanitize({ ...action.listing, createdAt: Date.now() });
        await postToFirestore("listing", data);
      } else if (action.type === "UPDATE_LISTING") {
        await postToFirestore("listing", { id: action.listingId, ...action.updates });
      } else if (action.type === "REMOVE_LISTING") {
        await postToFirestore("delete_listing", { id: action.listingId });
      } else if (action.type === "ADD_ORDER") {
        const data = sanitize({ ...action.order, createdAt: Date.now() });
        await postToFirestore("order", data);
      } else if (action.type === "UPDATE_ORDER_STATUS") {
        await postToFirestore("order", { id: action.orderId, status: action.status });
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
