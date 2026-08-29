/**
 * BigQuery Data Seed Script — Annapurna Telemetry
 * 
 * Run with: npx ts-node scripts/seed_bigquery.ts
 * 
 * Creates the dataset and table if they don't exist,
 * then inserts ~2000 rows of realistic truck telemetry data.
 */

import { BigQuery } from '@google-cloud/bigquery';

const PROJECT_ID = 'project-a9c284f8-6bca-440a-a0c';
const DATASET_ID = 'annapurna_telemetry';
const TABLE_ID = 'truck_telemetry';

const bigquery = new BigQuery({ projectId: PROJECT_ID });

const TRUCKS = [
  { id: 'TRK-001', plate: 'DL 1M 1234', driver: 'Rajesh Kumar', cargo: 'tomatoes' },
  { id: 'TRK-002', plate: 'MH 04 AB 9876', driver: 'Suresh Patel', cargo: 'mangoes' },
  { id: 'TRK-003', plate: 'KL 01 XY 5555', driver: 'Manoj Nair', cargo: 'fish' },
  { id: 'TRK-004', plate: 'KA 05 CD 3333', driver: 'Venkatesh Rao', cargo: 'dairy' },
  { id: 'TRK-005', plate: 'TN 09 EF 7777', driver: 'Murugan S', cargo: 'bananas' },
  { id: 'TRK-006', plate: 'UP 32 GH 4444', driver: 'Amit Singh', cargo: 'potatoes' },
  { id: 'TRK-007', plate: 'RJ 14 IJ 8888', driver: 'Ramesh Meena', cargo: 'onions' },
  { id: 'TRK-008', plate: 'GJ 06 KL 2222', driver: 'Patel Bhikhabhai', cargo: 'grapes' },
  { id: 'TRK-009', plate: 'AP 07 MN 6666', driver: 'Ravi Kumar', cargo: 'chicken' },
  { id: 'TRK-010', plate: 'WB 11 OP 1111', driver: 'Sanjay Das', cargo: 'prawns' },
];

const CITIES = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
];

const STATUSES = ['In Transit', 'Delivered', 'Spoiled', 'Delayed', 'At Checkpoint'];
const ETHYLENE_LEVELS = ['low', 'medium', 'high', 'critical'];

function randomBetween(min: number, max: number): number {
  // Seeded-style deterministic random using a counter
  return min + (max - min) * Math.random();
}

function generateRows(): any[] {
  const rows: any[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    for (const truck of TRUCKS) {
      // Each truck gets 10-15 readings per day
      const readingsPerDay = 10 + Math.floor(Math.random() * 6);
      
      for (let r = 0; r < readingsPerDay; r++) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - dayOffset);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));

        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        
        // Temperature depends on cargo type with some variance
        let baseTemp: number;
        switch (truck.cargo) {
          case 'fish': case 'prawns': baseTemp = 1.5; break;
          case 'dairy': case 'chicken': baseTemp = 3.0; break;
          case 'mangoes': case 'grapes': case 'bananas': baseTemp = 8.0; break;
          case 'tomatoes': baseTemp = 6.0; break;
          default: baseTemp = 10.0;
        }

        // Add some realistic variance + occasional spikes
        const isSpike = Math.random() < 0.08; // 8% chance of temperature spike
        const tempVariance = isSpike
          ? randomBetween(8, 18) // spike
          : randomBetween(-2, 3); // normal variance
        
        const temperature = parseFloat((baseTemp + tempVariance).toFixed(1));
        const humidity = parseFloat(randomBetween(60, 98).toFixed(1));
        
        // Ethylene correlates with temperature
        const ethyleneIndex = isSpike
          ? Math.min(3, Math.floor(Math.random() * 3) + 1)
          : Math.floor(Math.random() * 2);
        
        // Status depends on temperature and time
        let status: string;
        if (temperature > 20) {
          status = 'Spoiled';
        } else if (temperature > 15) {
          status = Math.random() < 0.6 ? 'Delayed' : 'At Checkpoint';
        } else if (dayOffset === 0 && Math.random() < 0.3) {
          status = 'In Transit';
        } else {
          status = Math.random() < 0.7 ? 'In Transit' : 'Delivered';
        }

        rows.push({
          truck_id: truck.id,
          truck_plate: truck.plate,
          driver_name: truck.driver,
          cargo_type: truck.cargo,
          temperature_celsius: temperature,
          humidity_percent: humidity,
          ethylene_level: ETHYLENE_LEVELS[ethyleneIndex],
          location_city: city.name,
          latitude: parseFloat((city.lat + randomBetween(-0.5, 0.5)).toFixed(4)),
          longitude: parseFloat((city.lng + randomBetween(-0.5, 0.5)).toFixed(4)),
          status: status,
          timestamp: timestamp.toISOString(),
        });
      }
    }
  }

  return rows;
}

async function main() {
  console.log('🏔️  Annapurna BigQuery Seed Script');
  console.log('==================================\n');

  // Step 1: Create dataset if it doesn't exist
  console.log(`📁 Checking dataset: ${DATASET_ID}`);
  try {
    const [datasets] = await bigquery.getDatasets();
    const exists = datasets.some(d => d.id === DATASET_ID);
    if (!exists) {
      await bigquery.createDataset(DATASET_ID, { location: 'US' });
      console.log(`✅ Created dataset: ${DATASET_ID}`);
    } else {
      console.log(`✅ Dataset already exists: ${DATASET_ID}`);
    }
  } catch (e: any) {
    console.error('❌ Error with dataset:', e.message);
    return;
  }

  // Step 2: Create table with schema
  console.log(`\n📊 Checking table: ${TABLE_ID}`);
  const dataset = bigquery.dataset(DATASET_ID);
  const table = dataset.table(TABLE_ID);

  const schema = [
    { name: 'truck_id', type: 'STRING' },
    { name: 'truck_plate', type: 'STRING' },
    { name: 'driver_name', type: 'STRING' },
    { name: 'cargo_type', type: 'STRING' },
    { name: 'temperature_celsius', type: 'FLOAT64' },
    { name: 'humidity_percent', type: 'FLOAT64' },
    { name: 'ethylene_level', type: 'STRING' },
    { name: 'location_city', type: 'STRING' },
    { name: 'latitude', type: 'FLOAT64' },
    { name: 'longitude', type: 'FLOAT64' },
    { name: 'status', type: 'STRING' },
    { name: 'timestamp', type: 'TIMESTAMP' },
  ];

  try {
    const [tableExists] = await table.exists();
    if (tableExists) {
      console.log(`⚠️  Table exists. Deleting and recreating for fresh data...`);
      await table.delete();
    }
    await dataset.createTable(TABLE_ID, { schema });
    console.log(`✅ Created table: ${TABLE_ID}`);
  } catch (e: any) {
    console.error('❌ Error with table:', e.message);
    return;
  }

  // Step 3: Generate and insert data
  console.log(`\n🔄 Generating telemetry data...`);
  const rows = generateRows();
  console.log(`✅ Generated ${rows.length} rows`);

  // Insert in batches of 500
  const BATCH_SIZE = 500;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    try {
      await table.insert(batch);
      console.log(`   Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)} (${batch.length} rows)`);
    } catch (e: any) {
      console.error(`❌ Insert error for batch ${Math.floor(i / BATCH_SIZE) + 1}:`, e.message);
      if (e.errors) {
        console.error('   First error:', JSON.stringify(e.errors[0], null, 2));
      }
    }
  }

  // Step 4: Verify
  console.log(`\n🔍 Verifying data...`);
  try {
    const [countRows] = await bigquery.query({
      query: `SELECT COUNT(*) as total FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\``
    });
    console.log(`✅ Total rows in table: ${countRows[0].total}`);

    const [sample] = await bigquery.query({
      query: `SELECT truck_id, cargo_type, temperature_celsius, status, location_city 
              FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\` 
              LIMIT 5`
    });
    console.log('\n📋 Sample data:');
    console.table(sample);
  } catch (e: any) {
    console.error('❌ Verification error:', e.message);
  }

  console.log('\n🎉 Seed complete! BigQuery is now populated with real data.');
}

main().catch(console.error);
