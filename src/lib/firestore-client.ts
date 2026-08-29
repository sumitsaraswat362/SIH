import { Firestore, FieldValue } from '@google-cloud/firestore';

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'project-a9c284f8-6bca-440a-a0c';

const getFirestore = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString());
    return new Firestore({ projectId: PROJECT_ID, credentials });
  }
  return new Firestore({ projectId: PROJECT_ID });
};

let _firestoreInstance: Firestore | null = null;
const firestore = new Proxy({} as Firestore, {
  get(target, prop) {
    if (!_firestoreInstance) {
      _firestoreInstance = getFirestore();
    }
    const val = (_firestoreInstance as any)[prop];
    return typeof val === 'function' ? val.bind(_firestoreInstance) : val;
  }
});

export async function saveAlert(alert: object): Promise<string> {
  const coll = firestore.collection('alerts');
  const docRef = await coll.add({
    ...alert,
    timestamp: FieldValue.serverTimestamp(),
  });
  console.log(`[Firestore] Saved alert: ${docRef.id}`);
  return docRef.id;
}

export async function saveCargoState(cargoId: string, state: object): Promise<void> {
  const docRef = firestore.collection('cargos').doc(cargoId);
  await docRef.set({
    ...state,
    lastUpdated: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log(`[Firestore] Updated cargo state: ${cargoId}`);
}

export async function getRecentAlerts(limit: number): Promise<any[]> {
  const coll = firestore.collection('alerts');
  const snapshot = await coll.orderBy('timestamp', 'desc').limit(limit).get();
  
  const alerts: any[] = [];
  snapshot.forEach(doc => alerts.push({ id: doc.id, ...doc.data() }));
  
  return alerts;
}

export async function saveMarketplaceListing(listing: object): Promise<string> {
  const coll = firestore.collection('marketplace_listings');
  const docRef = await coll.add({
    ...listing,
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log(`[Firestore] Saved listing: ${docRef.id}`);
  return docRef.id;
}
