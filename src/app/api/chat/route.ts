import { NextResponse } from 'next/server';
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore({
  projectId: 'project-a9c284f8-6bca-440a-a0c',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chatId, sender, message, timestamp } = body;

    if (!chatId || !sender || !message || !timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = await firestore.collection('chats').add({
      chatId,
      sender,
      message,
      timestamp,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chatId' }, { status: 400 });
    }

    const snapshot = await firestore
      .collection('chats')
      .where('chatId', '==', chatId)
      .orderBy('timestamp', 'asc')
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
