import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALFV0IqDjwDNc_MFyvpEme7uRnYiRgIpU",
  authDomain: "project-a9c284f8-6bca-440a-a0c.firebaseapp.com",
  projectId: "project-a9c284f8-6bca-440a-a0c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedAll() {
  // Clear old data first
  const oldCargos = await getDocs(collection(db, "cargos"));
  for (const d of oldCargos.docs) await deleteDoc(d.ref);
  const oldBids = await getDocs(collection(db, "bids"));
  for (const d of oldBids.docs) await deleteDoc(d.ref);

  // Push all 3 cargos as emergency
  await setDoc(doc(db, "cargos", "cargo-001"), {
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
    telemetry: { temperature: 18.0, humidity: 82, ethyleneLevel: "high", timestamp: Date.now() },
    safeTemperatureMax: 10,
    loadedAt: Date.now() - 3 * 60 * 60 * 1000,
    status: "emergency",
    spoilageTimeMinutes: 45,
    etaMinutes: 260,
    estimatedCargoValue: 100000,
    askingPricePerKg: 16,
    reroutableMarkets: [],
    selectedMarket: null,
    createdAt: Date.now(),
  });
  console.log("Pushed cargo-001 (tomatoes)");

  await setDoc(doc(db, "cargos", "cargo-002"), {
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
    telemetry: { temperature: 15.0, humidity: 75, ethyleneLevel: "high", timestamp: Date.now() },
    safeTemperatureMax: 12,
    loadedAt: Date.now() - 2 * 60 * 60 * 1000,
    status: "emergency",
    spoilageTimeMinutes: 60,
    etaMinutes: 180,
    estimatedCargoValue: 135000,
    askingPricePerKg: 40,
    reroutableMarkets: [],
    selectedMarket: null,
    createdAt: Date.now(),
  });
  console.log("Pushed cargo-002 (mangoes)");

  await setDoc(doc(db, "cargos", "cargo-003"), {
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
    telemetry: { temperature: 8.0, humidity: 88, ethyleneLevel: "medium", timestamp: Date.now() },
    safeTemperatureMax: 4,
    loadedAt: Date.now() - 1 * 60 * 60 * 1000,
    status: "emergency",
    spoilageTimeMinutes: 30,
    etaMinutes: 320,
    estimatedCargoValue: 240000,
    askingPricePerKg: 100,
    reroutableMarkets: [],
    selectedMarket: null,
    createdAt: Date.now(),
  });
  console.log("Pushed cargo-003 (fish)");

  console.log("\nALL 3 CARGOS PUSHED! Refresh Wholesaler page now.");
  process.exit(0);
}

seedAll();
