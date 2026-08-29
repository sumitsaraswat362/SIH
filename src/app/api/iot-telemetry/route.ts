import { Firestore } from "@google-cloud/firestore";
import { BigQuery } from "@google-cloud/bigquery";
import { NextResponse } from "next/server";
import { calculateSpoilageTime } from "../../../lib/simulator";

const PROJECT_ID = process.env.GCP_PROJECT_ID || "project-a9c284f8-6bca-440a-a0c";

const firestore = new Firestore({ projectId: PROJECT_ID });
const bigquery = new BigQuery({ projectId: PROJECT_ID });

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-device-key");
    if (authHeader !== "ANNAPURNA_IOT_SECURE_KEY_2026") {
      return NextResponse.json({ error: "Unauthorized device" }, { status: 401 });
    }

    const body = await req.json();
    const { cargoId = "cargo-001", temperature, humidity, ethyleneLevel = "low", rawGasValue = 0 } = body;

    if (temperature === undefined || humidity === undefined) {
      return NextResponse.json({ error: "Missing temperature or humidity" }, { status: 400 });
    }

    const timestamp = Date.now();
    const tempNum = Number(temperature);
    const humNum = Number(humidity);

    // Calculate spoilage time based on physical formula
    const spoilageMinutes = calculateSpoilageTime(tempNum, 10, ethyleneLevel);

    // 1. Update Firestore Real-time Cargo Telemetry
    const cargoRef = firestore.collection("cargos").doc(cargoId);
    const cargoDoc = await cargoRef.get();

    let newStatus = "in_transit";
    if (tempNum > 10) newStatus = "warning";
    if (spoilageMinutes < 260 && tempNum > 12) newStatus = "emergency";

    if (cargoDoc.exists) {
      const previousStatus = cargoDoc.data()?.status;
      const finalStatus = previousStatus === "rerouting" ? "rerouting" : newStatus;
      
      await cargoRef.set(
        {
          telemetry: {
            temperature: tempNum,
            humidity: humNum,
            ethyleneLevel,
            timestamp,
          },
          spoilageTimeMinutes: spoilageMinutes,
          status: finalStatus,
        },
        { merge: true }
      );

      // Send real notifications when status escalates to emergency
      if (newStatus === "emergency" && previousStatus !== "emergency" && previousStatus !== "rerouting") {
        const alertMsg = `🚨 EMERGENCY: Cargo ${cargoId} temperature hit ${tempNum}°C (humidity: ${humNum}%). Spoilage in ~${spoilageMinutes} min. Immediate action required!`;
        
        // Fire-and-forget: don't block the IoT response
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://annapurna-web-887568501843.us-central1.run.app';
        
        fetch(`${baseUrl}/api/notify/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: `🚨 EMERGENCY: Cargo ${cargoId} — ${tempNum}°C`, body: alertMsg }),
        }).catch(e => console.warn('[Email Alert]:', e.message));

        fetch(`${baseUrl}/api/notify/whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: alertMsg }),
        }).catch(e => console.warn('[WhatsApp Alert]:', e.message));
      }
    }

    // 2. Stream to BigQuery Telemetry Table
    try {
      await bigquery
        .dataset("annapurna_telemetry")
        .table("truck_telemetry")
        .insert([
          {
            truck_id: cargoId,
            temperature_celsius: tempNum,
            humidity_percent: humNum,
            ethylene_level: ethyleneLevel,
            status: newStatus,
            timestamp: new Date(timestamp).toISOString(),
          },
        ]);
    } catch (bqErr: any) {
      console.warn("[BigQuery IoT Stream Warning]:", bqErr.message);
    }

    return NextResponse.json({
      success: true,
      cargoId,
      status: newStatus,
      spoilageMinutes,
      timestamp,
    });
  } catch (error: any) {
    console.error("IoT Telemetry Ingestion Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
