import { NextResponse } from 'next/server';
import { Firestore } from '@google-cloud/firestore';

const PROJECT_ID = 'project-a9c284f8-6bca-440a-a0c';

const getFirestore = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString());
    return new Firestore({ projectId: PROJECT_ID, credentials });
  }
  return new Firestore({ projectId: PROJECT_ID });
};

export async function GET() {
  try {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('notification_history').orderBy('timestamp', 'desc').limit(50).get();
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(history);
  } catch (error: any) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch history', details: error.message }, { status: 500 });
  }
}
