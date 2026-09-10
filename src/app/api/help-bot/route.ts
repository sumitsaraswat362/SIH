import { NextResponse } from "next/server";
import { ai, DEFAULT_MODEL } from "@/lib/vertex-client";

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const safeHistory = Array.isArray(history) ? history : [];

    const systemInstruction = `You are the Annapurna AI Assistant, helping farmers and buyers on a direct farm-to-fork marketplace.

RULES:
1. Keep answers SHORT. Maximum 3 sentences per reply.
2. Be direct and practical. No fluff. No repetition.
3. Use emojis sparingly (🌾, 📦, 💰).
4. If asked about mandi prices, say they can check the "Mandi Prices" section in their dashboard.
5. If asked about listing produce, explain they can click "+ List New Produce" on their dashboard.
6. You represent the Annapurna platform for SIH Problem Statement 26033.`;

    const formattedHistory = safeHistory
      .filter((msg: any) => msg && msg.role && msg.content)
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    const reply = response.text || "I'm sorry, I couldn't process that request.";

    return NextResponse.json({ response: reply });

  } catch (error) {
    console.error("AI Help Bot Error:", error);
    return NextResponse.json({ response: "Sorry, I'm having trouble connecting. Please try again in a moment." });
  }
}
