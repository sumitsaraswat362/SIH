const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore({ projectId: 'project-a9c284f8-6bca-440a-a0c' });

const DEMO_CARGO = {
  id: "cargo-001",
  type: "tomatoes",
  quantityKg: 5000,
  truckId: "truck-001",
  truckPlate: "KA-01-AB-1234",
  driverName: "Ramesh Patil",
  driverPhone: "+91-9876543210",
  origin: { name: "Nashik Farm Cooperative", location: { lat: 19.9975, lng: 73.7898 } },
  originalDestination: { name: "Mumbai APMC Market", location: { lat: 19.0760, lng: 72.8777 } },
  currentLocation: { lat: 19.3200, lng: 73.0800 },
  routePolyline: [],
  telemetry: { temperature: 4.2, humidity: 72, ethyleneLevel: "low", timestamp: Date.now() },
  safeTemperatureMax: 10,
  loadedAt: Date.now() - 3 * 60 * 60 * 1000,
  status: "in_transit",
  spoilageTimeMinutes: null,
  etaMinutes: 260,
  estimatedCargoValue: 100000,
  askingPricePerKg: null,
  reroutableMarkets: [],
  selectedMarket: null,
};

const FLEET_CARGOS = [
  DEMO_CARGO,
  {
    id: "cargo-002",
    type: "mangoes",
    quantityKg: 3000,
    truckId: "truck-002",
    truckPlate: "MH-04-CD-5678",
    driverName: "Sunil Jadhav",
    driverPhone: "+91-9876543211",
    origin: { name: "Ratnagiri Orchards", location: { lat: 16.9902, lng: 73.3120 } },
    originalDestination: { name: "Pune Crawford Market", location: { lat: 18.5204, lng: 73.8567 } },
    currentLocation: { lat: 17.6800, lng: 73.5100 },
    routePolyline: [],
    telemetry: { temperature: 6.8, humidity: 65, ethyleneLevel: "low", timestamp: Date.now() },
    safeTemperatureMax: 12,
    loadedAt: Date.now() - 2 * 60 * 60 * 1000,
    status: "in_transit",
    spoilageTimeMinutes: null,
    etaMinutes: 180,
    estimatedCargoValue: 135000,
    askingPricePerKg: null,
    reroutableMarkets: [],
    selectedMarket: null,
  },
  {
    id: "cargo-003",
    type: "fish",
    quantityKg: 2000,
    truckId: "truck-003",
    truckPlate: "GJ-05-EF-9012",
    driverName: "Ahmed Khan",
    driverPhone: "+91-9876543212",
    origin: { name: "Veraval Fish Harbor", location: { lat: 20.9070, lng: 70.3675 } },
    originalDestination: { name: "Ahmedabad Fish Market", location: { lat: 23.0225, lng: 72.5714 } },
    currentLocation: { lat: 21.7645, lng: 72.1519 },
    routePolyline: [],
    telemetry: { temperature: 2.1, humidity: 88, ethyleneLevel: "low", timestamp: Date.now() },
    safeTemperatureMax: 4,
    loadedAt: Date.now() - 1 * 60 * 60 * 1000,
    status: "in_transit",
    spoilageTimeMinutes: null,
    etaMinutes: 320,
    estimatedCargoValue: 240000,
    askingPricePerKg: null,
    reroutableMarkets: [],
    selectedMarket: null,
  }
];

async function seed() {
  const batch = firestore.batch();
  FLEET_CARGOS.forEach(c => {
    batch.set(firestore.collection("cargos").doc(c.id), c);
  });
  await batch.commit();
  console.log("Seeded 3 mock cargos into live Firestore!");
}

seed().catch(console.error);
