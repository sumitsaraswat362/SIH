import { NextResponse } from 'next/server';
import { ai, DEFAULT_MODEL } from '@/lib/vertex-client';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const systemPrompt = `You are the Annapurna AI Assistant, an agricultural marketplace assistant.
Help farmers list produce, understand pricing, and track deals.
Help buyers find verified farm-fresh produce.
Explain how Annapurna eliminates middlemen and saves farmer earnings by removing commission agent cuts.
Be concise and friendly.
If user asks about navigation, suggest the correct page.`;

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
