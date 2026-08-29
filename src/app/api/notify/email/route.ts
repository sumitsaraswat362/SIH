import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Firestore, FieldValue } from '@google-cloud/firestore';
const PROJECT_ID = 'project-a9c284f8-6bca-440a-a0c';
const getFirestore = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString());
    return new Firestore({ projectId: PROJECT_ID, credentials });
  }
  return new Firestore({ projectId: PROJECT_ID });
};


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { to, subject, body, html } = await req.json();

    const recipient = to || process.env.ALERT_EMAIL_TO;
    if (!recipient) {
      return NextResponse.json({ error: 'No recipient specified' }, { status: 400 });
    }

    const mailOptions = {
      from: `"Annapurna Alerts" <${process.env.SMTP_EMAIL}>`,
      to: recipient,
      subject: subject || '🚨 Annapurna Cold Chain Alert',
      text: body || '',
      html: html || `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #007AFF, #5856D6); padding: 20px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏔️ Annapurna Alert</h1>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 16px 16px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">${body}</p>
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 16px 0;">
            <p style="font-size: 12px; color: #999;">Sent by Annapurna AI Cold Chain Platform</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    const firestore = getFirestore();
    await firestore.collection('notification_history').add({
      type: 'email',
      to: recipient,
      subject: subject || '🚨 Annapurna Cold Chain Alert',
      body: body || '',
      timestamp: FieldValue.serverTimestamp(),
      status: 'success'
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: unknown) {
    console.error('Email send error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to send email', details: message }, { status: 500 });
  }
}
