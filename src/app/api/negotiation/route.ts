import { NextResponse } from 'next/server';
import { ai, DEFAULT_MODEL } from '@/lib/vertex-client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      cargoId,
      cargoType,
      cargoValue,
      askingPricePerKg,
      spoilageMinutes,
      quantityKg,
      bidPricePerKg,
      bidQuantityKg,
      roundNumber
    } = body;

    let action: 'accept' | 'counter' | 'reject' = 'reject';
    let counterPrice: number | undefined;

    const bidRatio = bidPricePerKg / askingPricePerKg;

    if (roundNumber >= 3) {
      // Urgency wins, accept the offer
      action = 'accept';
    } else {
      if (bidRatio >= 0.85) {
        action = 'accept';
      } else if (bidRatio < 0.70) {
        action = 'counter';
        counterPrice = askingPricePerKg * 0.85; // Counter with 85% of asking
      } else {
        action = 'counter';
        counterPrice = askingPricePerKg * 0.90; // Counter with 90%
      }
    }

    const prompt = `You are the Marketplace AI negotiating on behalf of the farmer.
Your goal is to maximize farmer profit by eliminating the 30% commission agent cut.
Produce: fresh farm produce (${cargoType}), Quantity: ${quantityKg} kg.
Asking Price: ${askingPricePerKg}/kg (Minimum acceptable price).
Buyer Bid: ${bidPricePerKg}/kg for ${bidQuantityKg} kg.
Current Round: ${roundNumber} (max 3).
AI Action Decided: ${action}.
${counterPrice ? `Counter Price: ${counterPrice}/kg.` : ''}

Compare the offer against the local mandi rate. Refuse any bid below the farmer's asking price. Emphasize the benefits of direct sale.
Write a short, professional natural-language reasoning explaining this decision to the buyer.
Return ONLY the string reasoning. Do not wrap in JSON.`;

    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    });

    const reasoning = result.text?.trim() || `We have decided to ${action} your bid based on current market conditions and direct sale urgency.`;

    return NextResponse.json({
      action,
      counterPrice,
      reasoning,
      round: roundNumber
    });

  } catch (error) {
    console.error('Negotiation API error:', error);
    return NextResponse.json({ error: 'Failed to process negotiation' }, { status: 500 });
  }
}
