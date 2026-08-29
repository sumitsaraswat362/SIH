import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'project-a9c284f8-6bca-440a-a0c';
const DATASET_ID = 'annapurna_telemetry';
const TABLE_ID = 'truck_telemetry';

// Ensure this route runs dynamically for cron jobs
export const dynamic = 'force-dynamic';

const getBigQuery = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString());
    return new BigQuery({ projectId: PROJECT_ID, credentials });
  }
  return new BigQuery({ projectId: PROJECT_ID });
};

const bigquery = getBigQuery();

function randomBetween(min: number, max: number): number {
  return min + (max - min) * Math.random();
}

export async function GET() {
  try {
    const table = bigquery.dataset(DATASET_ID).table(TABLE_ID);
    
    // Generate 3 real-time telemetry events
    const rows = [
      {
        truck_id: 'TRK-001',
        truck_plate: 'DL 1M 1234',
        driver_name: 'Rajesh Kumar',
        cargo_type: 'tomatoes',
        temperature_celsius: parseFloat(randomBetween(4.0, 9.0).toFixed(1)), // Normal temp for tomatoes
        humidity_percent: parseFloat(randomBetween(80, 90).toFixed(1)),
        ethylene_level: 'low',
        location_city: 'Delhi',
        latitude: parseFloat(randomBetween(28.5, 28.7).toFixed(4)),
        longitude: parseFloat(randomBetween(77.1, 77.3).toFixed(4)),
        status: 'In Transit',
        timestamp: new Date().toISOString(),
      },
      {
        truck_id: 'TRK-002',
        truck_plate: 'MH 04 AB 9876',
        driver_name: 'Suresh Patel',
        cargo_type: 'mangoes',
        temperature_celsius: parseFloat(randomBetween(13.0, 19.5).toFixed(1)), // Spike!
        humidity_percent: parseFloat(randomBetween(85, 95).toFixed(1)),
        ethylene_level: 'high',
        location_city: 'Mumbai',
        latitude: parseFloat(randomBetween(19.0, 19.2).toFixed(4)),
        longitude: parseFloat(randomBetween(72.8, 73.0).toFixed(4)),
        status: 'Delayed',
        timestamp: new Date().toISOString(),
      }
    ];

    console.log('[BigQuery Stream] Inserting', rows.length, 'new telemetry rows...');
    
    // Real-time streaming insert
    await table.insert(rows);

    return NextResponse.json({
      success: true,
      message: 'Successfully streamed telemetry to BigQuery',
      insertedRows: rows.length,
      data: rows
    });

  } catch (error: any) {
    console.error('[BigQuery Stream Error]', error);
    if (error.name === 'PartialFailureError') {
      console.error(JSON.stringify(error.errors, null, 2));
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
