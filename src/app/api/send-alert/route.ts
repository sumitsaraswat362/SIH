import { NextResponse } from 'next/server';
import { sendAlertEmail } from '@/lib/email-client';

export async function POST(request: Request) {
  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sendAlertEmail(to, subject, body);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Send alert error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
