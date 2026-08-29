// ============================================================
// ANNAPURNA — Core Type Definitions
// ============================================================

export interface CarbonToken {
  hash: string;
  cargoId: string;
  amount: number;
  timestamp: number;
  issuedBy: string;
}
// ============================================================

export interface GeoPoint {
  lat: number;
  lng: number;
}

// --- Cargo & Truck ---

export type CargoType = "tomatoes" | "mangoes" | "fish" | "flowers" | "dairy" | "vegetables" | "seafood" | "meat" | "poultry" | "grains" | "spices" | "fruits" | "pharmaceuticals";

export type CargoStatus =
  | "in_transit"      // Normal delivery
  | "warning"         // Temperature rising, not critical yet
  | "emergency"       // AI triggered Emergency Liquidation Mode
  | "rerouting"       // Bid accepted, heading to new buyer
  | "delivered"       // Successfully delivered
  | "spoiled";        // Too late — cargo lost

export interface TelemetryData {
  temperature: number;       // °C — safe threshold varies by cargo
  humidity: number;          // %
  ethyleneLevel: "low" | "medium" | "high";  // Spoilage gas indicator
  timestamp: number;         // Unix ms
}

export interface Cargo {
  id: string;
  ownerId?: string;
  type: CargoType;
  quantityKg: number;        // Total weight in kg
  truckId: string;
  truckPlate: string;
  driverName: string;
  driverPhone: string;

  // Route
  origin: { name: string; location: GeoPoint };
  originalDestination: { name: string; location: GeoPoint } | null;
  currentLocation: GeoPoint;
  routePolyline: GeoPoint[]; // Encoded route points

  // Health
  telemetry: TelemetryData;
  safeTemperatureMax: number;  // °C — above this = danger
  loadedAt: number;            // Unix ms — when cargo was loaded

  // AI Decision
  status: CargoStatus;
  spoilageTimeMinutes: number | null;   // Minutes until spoilage (AI calculated)
  etaMinutes: number | null;            // Minutes to original destination
  estimatedCargoValue: number;          // ₹ total value of the cargo
  askingPricePerKg: number | null;      // Set by driver when emergency triggered

  // Reroute
  reroutableMarkets: Market[];          // Nearby markets the AI found
  selectedMarket: Market | null;        // The market accepted by the driver
  
  // Timestamps
  createdAt?: string | number;          // From Supabase or local
}

// --- Markets ---

export interface Market {
  id: string;
  name: string;
  location: GeoPoint;
  distanceKm: number;
  etaMinutes: number;
  type: "wholesale_market" | "mandi" | "cold_storage" | "retail";
}

// --- Bids (Wholesaler → Driver) ---

export type BidStatus =
  | "pending"         // Wholesaler submitted, waiting for driver
  | "accepted"        // Driver accepted this bid
  | "rejected"        // Driver rejected
  | "counter_offered" // Driver sent counter price
  | "expired"         // Timer ran out
  | "delivered"       // Cargo arrived at wholesaler
  | "payment_cleared"; // Funds transferred

export interface Bid {
  id: string;
  cargoId: string;
  wholesalerId: string;
  wholesalerName: string;
  wholesalerLocation: string;
  wholesalerCoords?: GeoPoint;
  distanceKm: number;
  etaMinutes: number;

  // Offer details
  offeredPricePerKg: number;
  requestedQuantityKg: number;   // Can be partial (e.g., 3000 of 5000 kg)
  totalValue: number;            // offeredPrice * requestedQuantity

  // Timing
  createdAt?: string | number;   // Unix ms or ISO string
  expiresAt: number;             // Unix ms — bid expires after this
  status: BidStatus;

  // Counter offer (if driver counters)
  counterPricePerKg?: number;
}

// --- AI Decision ---

export interface AIDecision {
  cargoId: string;
  timestamp: number;
  reasoning: string;             // Natural language explanation
  recommendation: "continue" | "reroute" | "emergency_sell";
  suggestedMarket: Market | null;
  estimatedRecoveryPercent: number;  // e.g., 80 means 80% of cargo value recoverable
  estimatedRecoveryValue: number;    // ₹
  confidence: number;                // 0-1
}

// --- Wholesaler ---

export interface Wholesaler {
  id: string;
  name: string;
  businessName: string;
  location: GeoPoint;
  phone: string;
  preferredCargo: CargoType[];
  maxRadiusKm: number;          // How far they're willing to go
  isOnline: boolean;
}

export interface ActiveOrder {
  id: string;
  cargoType: CargoType;
  quantityKg: number;
  pricePerKg: number;
  totalValue: number;
  truckPlate: string;
  status: "arriving" | "delivered" | "cancelled";
  etaMinutes: number | null;
  acceptedAt: number;
}

// --- Notification ---

export interface Notification {
  id: string;
  type: "new_cargo" | "bid_accepted" | "bid_rejected" | "counter_offer" | "cargo_arriving" | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}
