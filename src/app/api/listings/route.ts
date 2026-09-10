import { NextResponse } from 'next/server';
import { Firestore } from '@google-cloud/firestore';
import { ProduceListing } from '@/lib/types';

const firestore = new Firestore({
  projectId: 'project-a9c284f8-6bca-440a-a0c',
});

function calculateFreshnessScore(harvestDate: number): number {
  const now = Date.now();
  const ageMs = now - harvestDate;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  // Simple decay: 100 at day 0, 0 at day 14 (or similar depending on crop)
  // We'll use a generic 14 day max for demo purposes
  const score = Math.max(0, 100 - (ageDays * (100 / 14)));
  return Math.round(score);
}

export async function GET(req: Request) {
  try {
    const snapshot = await firestore.collection('listings').orderBy('createdAt', 'desc').get();
    
    const listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProduceListing[];

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.farmerId || !body.cropType || !body.quantityKg || !body.askingPricePerKg || !body.harvestDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const freshnessScore = calculateFreshnessScore(body.harvestDate);
    
    const newListing = {
      ...body,
      freshnessScore,
      createdAt: Date.now(),
      status: body.status || 'listed',
      availableQuantityKg: body.availableQuantityKg ?? body.quantityKg,
      totalBuyerInterests: 0,
      viewCount: 0,
    };

    const docRef = await firestore.collection('listings').add(newListing);
    const createdListing = { id: docRef.id, ...newListing };

    return NextResponse.json(createdListing, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
