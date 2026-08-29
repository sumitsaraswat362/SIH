/**
 * Firestore Vector Search Seed Script
 * 
 * Embeds FSSAI compliance rules using text-embedding-004
 * and saves them to Firestore with FieldValue.vector().
 */

import { Firestore, FieldValue } from '@google-cloud/firestore';
import { GoogleGenAI } from '@google/genai';

const PROJECT_ID = 'project-a9c284f8-6bca-440a-a0c';

const firestore = new Firestore({
  projectId: PROJECT_ID,
  keyFilename: '/Users/sumitsaraswat/project-a9c284f8-6bca-440a-a0c-5cdec2cf9219.json',
});

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'project-a9c284f8-6bca-440a-a0c',
  location: 'us-central1'
});

const COMPLIANCE_DOCS = [
  {
    id: 'fssai-sec-1',
    title: 'FSSAI Fresh Produce Temperature Requirements',
    content: 'According to FSSAI guidelines for perishable goods transportation, fresh produce such as tomatoes and leafy greens must be transported at temperatures between 4°C and 8°C. Deviations exceeding this range for more than 4 hours constitute a critical compliance violation resulting in cargo rejection.',
  },
  {
    id: 'fssai-sec-2',
    title: 'FSSAI Dairy Transport Compliance',
    content: 'Dairy products including milk, paneer, and cheese must be maintained strictly between 2°C and 4°C during transit. The transport vehicle must have active cooling and real-time telemetry. Any temperature spike above 7°C for more than 30 minutes renders the batch unfit for human consumption.',
  },
  {
    id: 'fssai-sec-3',
    title: 'FSSAI Meat & Poultry Standards',
    content: 'Fresh meat and poultry must be transported at -1°C to 4°C. Frozen meat must be maintained at -18°C or below. Cross-contamination protocols mandate that raw meat cannot be transported in the same compartment as fresh fruits or vegetables under any circumstances.',
  },
  {
    id: 'fssai-sec-4',
    title: 'Ethylene Management Guidelines',
    content: 'For climacteric fruits (e.g., bananas, mangoes, tomatoes), ethylene levels in transport containers must be monitored. High ethylene exposure (>2 ppm) accelerates ripening and spoilage. Mixed-load shipments must physically separate high-ethylene producers from ethylene-sensitive cargo.',
  },
  {
    id: 'fssai-sec-5',
    title: 'Annapurna Logistics Internal Protocol - Rerouting',
    content: 'In the event of a cooling unit failure resulting in temperatures exceeding FSSAI limits, Annapurna standard operating procedure dictates immediate rerouting to the nearest wholesale market within a 50km radius to salvage cargo value before total spoilage occurs.',
  },
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
    config: {
      taskType: 'RETRIEVAL_DOCUMENT',
    }
  });

  if (!response.embeddings || !response.embeddings[0]?.values) {
    throw new Error('Failed to generate embedding');
  }

  return response.embeddings[0].values;
}

async function main() {
  console.log('📚 Seeding Firestore Vector Database for RAG...');
  
  const collection = firestore.collection('legal_documents');

  for (const doc of COMPLIANCE_DOCS) {
    console.log(`Generating embedding for: ${doc.title}...`);
    const vector = await generateEmbedding(doc.content);
    
    // In Firestore, vectors are represented via FieldValue.vector()
    await collection.doc(doc.id).set({
      title: doc.title,
      content: doc.content,
      // @ts-ignore - The types might be slightly outdated in the local node_modules, but the API supports it
      embedding: FieldValue.vector(vector),
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`✅ Saved ${doc.id} to Firestore with 768-dim vector.`);
  }

  console.log('\n🎉 RAG Seed complete!');
}

main().catch(console.error);
