import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { Firestore, FieldValue } from '@google-cloud/firestore';
const PROJECT_ID = 'project-a9c284f8-6bca-440a-a0c';
const getFirestore = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString());
    return new Firestore({ projectId: PROJECT_ID, credentials });
  }
  return new Firestore({ projectId: PROJECT_ID });
};


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json();

    const recipient = to || process.env.ALERT_WHATSAPP_TO;
    if (!recipient) {
      return NextResponse.json({ error: 'No recipient specified' }, { status: 400 });
    }

    // Format the number for WhatsApp if not already formatted
    const formattedTo = recipient.startsWith('whatsapp:') ? recipient : `whatsapp:${recipient}`;
    const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    const result = await client.messages.create({
      body: message || 'Annapurna AI: We found a buyer for your produce at a premium price (more than local mandi rate). Reply YES to accept.',
      from: from,
      to: formattedTo,
    });

    
    const firestore = getFirestore();
    await firestore.collection('notification_history').add({
      type: 'whatsapp',
      to: formattedTo,
      subject: 'WhatsApp Alert',
      body: message || 'Annapurna AI: We found a buyer for your produce at a premium price (more than local mandi rate). Reply YES to accept.',
      timestamp: FieldValue.serverTimestamp(),
      status: 'success'
    });

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (error: unknown) {
    console.error('WhatsApp send error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to send WhatsApp', details: message }, { status: 500 });
  }
}
