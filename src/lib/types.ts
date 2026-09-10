// ============================================================
// ANNAPURNA — Direct Farm-to-Fork Marketplace
// SIH 26033 — Core Type Definitions
// ============================================================

// --- Geographic ---

export interface GeoPoint {
  lat: number;
  lng: number;
}

// --- Crop & Produce ---

export type CropCategory =
  | "vegetables"
  | "fruits"
  | "grains"
  | "pulses"
  | "spices"
  | "dairy"
  | "oilseeds"
  | "flowers"
  | "organic";

export type CropType =
  | "tomatoes"
  | "onions"
  | "potatoes"
  | "wheat"
  | "rice"
  | "maize"
  | "bajra"
  | "jowar"
  | "sugarcane"
  | "cotton"
  | "soybean"
  | "groundnut"
  | "mustard"
  | "mangoes"
  | "bananas"
  | "grapes"
  | "pomegranate"
  | "oranges"
  | "apples"
  | "guava"
  | "papaya"
  | "watermelon"
  | "chilli"
  | "turmeric"
  | "ginger"
  | "garlic"
  | "coriander"
  | "cumin"
  | "cauliflower"
  | "cabbage"
  | "brinjal"
  | "okra"
  | "spinach"
  | "capsicum"
  | "drumstick"
  | "bitter_gourd"
  | "bottle_gourd"
  | "cucumber"
  | "carrot"
  | "peas"
  | "beans"
  | "toor_dal"
  | "chana_dal"
  | "moong_dal"
  | "urad_dal"
  | "milk"
  | "paneer"
  | "ghee"
  | "curd"
  | "marigold"
  | "jasmine"
  | "rose";

export type QualityGrade = "A+" | "A" | "B" | "C";

export type ListingStatus =
  | "listed"          // Farmer listed, available for buyers
  | "matched"         // AI found matching buyers
  | "negotiating"     // Price negotiation in progress
  | "sold"            // Deal confirmed, pending pickup
  | "in_transit"      // Picked up, on the way to buyer
  | "delivered"       // Successfully delivered
  | "cancelled"       // Listing cancelled by farmer
  | "expired";        // Listing expired (produce too old)

// --- Produce Listing (Core Entity) ---

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  fpoId?: string;
  fpoName?: string;

  // Product Info
  cropType: CropType;
  cropCategory: CropCategory;
  variety?: string;              // "Alphonso", "Basmati 1121", "Nashik Red", etc.
  quantityKg: number;
  availableQuantityKg: number;   // Remaining after partial sales
  unitOfMeasure: "kg" | "quintal" | "ton" | "dozen" | "bunch";

  // Pricing
  askingPricePerKg: number;      // Farmer's asking price
  minimumPricePerKg: number;     // Won't sell below this (≥ MSP)
  currentMandiPrice: number;     // Real-time APMC mandi price
  minimumSupportPrice: number;   // Government MSP for this crop
  platformRecommendedPrice: number; // AI-optimized price

  // Quality
  harvestDate: number;           // Unix timestamp
  freshnessScore: number;        // 0-100, AI computed based on harvest age
  qualityGrade: QualityGrade;    // AI vision graded from photo
  qualityPhotoUrl?: string;      // Uploaded harvest photo
  organicCertified: boolean;
  fssaiCompliant: boolean;

  // Location
  farmLocation: GeoPoint;
  farmAddress: string;
  village?: string;
  district: string;
  state: string;
  pincode: string;

  // Logistics
  deliveryModes: DeliveryMode[];
  maxDeliveryRadiusKm: number;

  // Status
  status: ListingStatus;
  totalBuyerInterests: number;   // How many buyers showed interest
  viewCount: number;

  // Timestamps
  createdAt: number;
  updatedAt?: number;
  expiresAt?: number;            // Auto-expire after X days
}

export type DeliveryMode = "farm_pickup" | "platform_logistics" | "fpo_hub" | "local_delivery";

// --- Farmer ---

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  aadhaarVerified: boolean;
  kccNumber?: string;            // Kisan Credit Card

  // Farm Details
  farmLocation: GeoPoint;
  farmAddress: string;
  farmSizeAcres: number;
  village: string;
  district: string;
  state: string;
  pincode: string;

  // FPO
  fpoId?: string;
  fpoName?: string;

  // Profile
  cropSpecialization: CropType[];
  organicCertified: boolean;
  profilePhotoUrl?: string;
  rating: number;                // 0-5 stars
  totalTransactions: number;
  totalEarnings: number;         // Cumulative ₹
  joinedAt: number;

  // Preferences
  preferredLanguage: SupportedLanguage;
}

export type SupportedLanguage = "en" | "hi" | "mr" | "ta" | "te" | "kn" | "pa" | "gu" | "bn";

// --- Buyer ---

export type BuyerType = "consumer" | "restaurant" | "retailer" | "bulk_buyer" | "fpo" | "institution";

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  buyerType: BuyerType;
  businessName?: string;         // For restaurants, retailers, etc.
  gstNumber?: string;            // For business buyers

  // Location
  location: GeoPoint;
  deliveryAddress: string;
  city: string;
  state: string;
  pincode: string;

  // Profile
  preferredCrops: CropType[];
  maxDeliveryRadiusKm: number;
  rating: number;                // 0-5 stars
  totalOrders: number;
  profilePhotoUrl?: string;
  joinedAt: number;

  preferredLanguage: SupportedLanguage;
}

// --- FPO (Farmer Producer Organization) ---

export interface FPO {
  id: string;
  name: string;
  registrationNumber: string;
  district: string;
  state: string;
  location: GeoPoint;

  // Members
  memberFarmerIds: string[];
  totalMembers: number;

  // Capabilities
  hasAggregationCenter: boolean;
  hasColdStorage: boolean;
  hasProcessingUnit: boolean;
  logisticsCapability: boolean;

  // Contact
  contactPerson: string;
  phone: string;
  email?: string;

  createdAt: number;
}

// --- Order ---

export type OrderStatus =
  | "pending"          // Buyer placed, waiting for farmer confirmation
  | "confirmed"        // Farmer confirmed
  | "payment_escrowed" // Buyer paid, money in escrow
  | "picked_up"        // Produce picked up from farm
  | "in_transit"       // On the way to buyer
  | "delivered"        // Successfully delivered
  | "completed"        // Buyer confirmed receipt, payment released
  | "disputed"         // Quality/quantity dispute
  | "cancelled"        // Cancelled by either party
  | "refunded";        // Refund processed

export type PaymentStatus =
  | "pending"
  | "escrowed"
  | "released_to_farmer"
  | "refunded"
  | "disputed";

export interface Order {
  id: string;
  listingId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;

  // Product
  cropType: CropType;
  variety?: string;
  quantityKg: number;

  // Pricing
  agreedPricePerKg: number;
  totalAmount: number;
  platformFee: number;           // 2% commission
  farmerPayout: number;          // totalAmount - platformFee
  mandiPriceComparison: number;  // How much more/less vs mandi (%)
  middlemanSavings: number;      // ₹ saved vs traditional supply chain

  // Delivery
  deliveryMode: DeliveryMode;
  deliveryAddress: string;
  estimatedDeliveryDate?: number;
  deliveryDistanceKm: number;
  deliveryFee: number;

  // Route (if platform logistics)
  routePolyline?: GeoPoint[];
  currentLocation?: GeoPoint;

  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;

  // Quality
  qualityGrade: QualityGrade;
  qualityPhotoUrl?: string;

  // Ratings
  farmerRating?: number;         // Buyer rates farmer
  buyerRating?: number;          // Farmer rates buyer

  // Timestamps
  createdAt: number;
  confirmedAt?: number;
  pickedUpAt?: number;
  deliveredAt?: number;
  completedAt?: number;
}

// --- AI Negotiation ---

export type NegotiationAction = "accept" | "counter" | "reject" | "escalate";

export interface NegotiationRound {
  round: number;
  buyerOffer: number;            // ₹/kg
  aiCounterOffer?: number;       // ₹/kg
  action: NegotiationAction;
  reasoning: string;             // AI explanation
  timestamp: number;
}

export interface Negotiation {
  id: string;
  listingId: string;
  farmerId: string;
  buyerId: string;
  rounds: NegotiationRound[];
  finalPricePerKg?: number;
  status: "active" | "completed" | "failed" | "expired";
  mspFloor: number;              // Minimum Support Price floor
  mandiReference: number;        // Current mandi price
  createdAt: number;
}

// --- AI Match ---

export interface AIMatch {
  listingId: string;
  buyerId: string;
  buyerName: string;
  buyerType: BuyerType;
  score: number;                 // 0-100 composite match score
  distanceKm: number;
  estimatedDeliveryMinutes: number;
  offeredPricePerKg: number;
  pricePremiumVsMandi: number;   // % above mandi price
  reasoning: string;             // AI explanation
}

// --- Demand Forecast ---

export interface DemandForecast {
  cropType: CropType;
  region: string;
  date: string;                  // ISO date string
  predictedDemandKg: number;
  predictedPricePerKg: number;
  currentPricePerKg: number;
  trend: "rising" | "stable" | "falling";
  confidence: number;            // 0-1
  recommendation: string;        // "Good time to sell" or "Hold for better prices"
}

// --- Mandi Price ---

export interface MandiPrice {
  commodity: string;
  variety?: string;
  market: string;
  district: string;
  state: string;
  minPrice: number;              // ₹/quintal
  maxPrice: number;              // ₹/quintal
  modalPrice: number;            // ₹/quintal (most common)
  pricePerKg: number;            // Computed: modalPrice / 100
  arrivalDate: string;           // ISO date string
  source: "data_gov_in" | "agmarknet" | "mock";
}

// --- Notification ---

export interface Notification {
  id: string;
  userId: string;
  type:
    | "new_listing"
    | "buyer_interest"
    | "order_placed"
    | "order_confirmed"
    | "payment_received"
    | "delivery_update"
    | "price_alert"
    | "demand_forecast"
    | "quality_graded"
    | "negotiation_update"
    | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

// --- Cart (Client-side) ---

export interface CartItem {
  listingId: string;
  listing: ProduceListing;
  quantityKg: number;
  pricePerKg: number;
  subtotal: number;
}

// --- Government Scheme ---

export interface GovernmentScheme {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  eligibility: string;
  benefit: string;
  applicationUrl: string;
  ministry: string;
  category: "credit" | "insurance" | "subsidy" | "market" | "infrastructure";
}

// --- Analytics ---

export interface FarmerEarningsSummary {
  farmerId: string;
  period: "daily" | "weekly" | "monthly" | "all_time";
  totalEarnings: number;
  totalTransactions: number;
  avgPricePerKg: number;
  avgMandiPricePerKg: number;
  earningsVsMandiPercent: number; // How much more they earned vs mandi
  middlemanSavingsTotal: number;
  topCrop: CropType;
  topBuyerType: BuyerType;
}
