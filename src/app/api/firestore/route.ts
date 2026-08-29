import { Firestore } from "@google-cloud/firestore";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Use the service account credentials already configured in .env.local
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID || "project-a9c284f8-6bca-440a-a0c",
});

// GET - Read all cargos and bids
export async function GET() {
  try {
    const [cargosSnap, bidsSnap] = await Promise.all([
      firestore.collection("cargos").get(),
      firestore.collection("bids").get(),
    ]);

    const cargos = cargosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const bids = bidsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ cargos, bids });
  } catch (error: any) {
    console.error("Firestore GET error:", error.message);
    return NextResponse.json({ cargos: [], bids: [], error: error.message }, { status: 200 });
  }
}

// POST - Write a cargo or bid to Firestore
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "cargo") {
      await firestore.collection("cargos").doc(data.id).set(data, { merge: true });
    } else if (type === "bid") {
      await firestore.collection("bids").doc(data.id).set(data, { merge: true });
    } else if (type === "delete_cargo") {
      await firestore.collection("cargos").doc(data.id).delete();
      // Also delete associated bids
      const bidsSnap = await firestore.collection("bids").where("cargoId", "==", data.id).get();
      const batch = firestore.batch();
      bidsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    } else if (type === "accept_bid") {
      const { bidId, cargoId } = data;
      const bidSnap = await firestore.collection("bids").doc(bidId).get();
      const cargoSnap = await firestore.collection("cargos").doc(cargoId).get();
      
      if (bidSnap.exists && cargoSnap.exists) {
        const bidData = bidSnap.data();
        const cargoData = cargoSnap.data();
        
        const requestedQuantityKg = bidData?.requestedQuantityKg || 0;
        const currentCargoQuantity = cargoData?.quantityKg || 0;
        const isPartial = requestedQuantityKg < currentCargoQuantity;
        const newQuantity = Math.max(0, currentCargoQuantity - requestedQuantityKg);

        const batch = firestore.batch();
        batch.set(firestore.collection("bids").doc(bidId), { ...bidData, status: "accepted" }, { merge: true });

        if (newQuantity <= 0) {
          const otherBidsSnap = await firestore.collection("bids").where("cargoId", "==", cargoId).get();
          otherBidsSnap.docs.forEach((bDoc) => {
            if (bDoc.id !== bidId) {
              batch.set(bDoc.ref, { ...bDoc.data(), status: "rejected" }, { merge: true });
            }
          });
        }

        batch.set(firestore.collection("cargos").doc(cargoId), {
          ...cargoData,
          status: isPartial ? cargoData?.status : "rerouting",
          quantityKg: newQuantity,
        }, { merge: true });

        // Mint a Carbon Token (1 token = ~1kg of methane prevented equivalent, simplified to 45 per cargo for demo)
        const timestamp = Date.now();
        const hashStr = `${cargoId}-${bidId}-${timestamp}-ANNAPURNA`;
        const hash = crypto.createHash("sha256").update(hashStr).digest("hex");
        
        batch.set(firestore.collection("carbon_tokens").doc(hash), {
          cargoId,
          amount: 45, // Standardized 45 GCC per saved cargo
          timestamp,
          issuedBy: "Annapurna Global Network",
        });

        await batch.commit();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Firestore POST error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

