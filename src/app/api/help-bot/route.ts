import { NextResponse } from 'next/server';
import { ai, DEFAULT_MODEL } from '@/lib/vertex-client';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const systemPrompt = `You are Annapurna AI Assistant, helping users navigate India's first direct farm-to-fork marketplace. You help:
- Farmers: list produce, understand mandi prices, track earnings, find buyers
- Buyers: find fresh produce, compare prices with mandi/retail, track orders
- Everyone: understand government schemes (PM-KISAN, e-NAM, KCC), FSSAI compliance, organic certification

You speak Hindi, Marathi, Tamil, Telugu, and English. Keep answers simple and practical. You are an advocate for fair farmer pricing.

Key platform features: AI demand forecasting, vision-based quality grading, MSP-protected negotiation, multi-language voice support, direct farmer-buyer chat.`;

    const formattedHistory = history
      .filter((msg: any) => msg.role !== 'system')
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemPrompt
      }
    });

    const reply = response.text || "I'm sorry, I couldn't process that.";

    return NextResponse.json({ response: reply });
  } catch (error) {
    console.error('Error in help-bot API:', error);
    return NextResponse.json({ response: 'Sorry, I encountered an error.' }, { status: 500 });
  }
}
