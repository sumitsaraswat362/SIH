import { NextResponse } from 'next/server';
import { ai, DEFAULT_MODEL } from '@/lib/vertex-client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      cropType,
      variety,
      quantityKg,
      askingPricePerKg,
      minimumPricePerKg,
      mandiPricePerKg,
      mspPerKg,
      buyerOfferPerKg,
      buyerName,
      roundNumber,
      qualityGrade,
      organicCertified
    } = body;

    let action: 'accept' | 'counter' | 'reject' = 'reject';
    let counterPrice: number | undefined;

    const offerRatio = buyerOfferPerKg / askingPricePerKg;

    if (buyerOfferPerKg >= askingPricePerKg * 0.95) {
      action = 'accept';
    } else if (buyerOfferPerKg < minimumPricePerKg) {
      action = 'reject';
    } else if (offerRatio < 0.70) {
      action = 'reject';
      // Suggest a reasonable counter (midpoint between ask and minimum) for the buyer to consider next time,
      // but the action is technically reject for this specific offer.
      counterPrice = Math.round((askingPricePerKg + minimumPricePerKg) / 2);
    } else {
      action = 'counter';
      // Fair midpoint weighted toward the farmer
      counterPrice = Math.round(buyerOfferPerKg + (askingPricePerKg - buyerOfferPerKg) * 0.6);
      // Ensure we don't counter below minimum
      if (counterPrice < minimumPricePerKg) {
         counterPrice = minimumPricePerKg;
      }
    }

    const prompt = `You are the Annapurna AI Negotiation Agent, protecting farmer interests in a direct marketplace. You ensure farmers always get fair prices above MSP. You explain market dynamics and price reasoning in simple language. You are the farmer's advocate.

Crop: ${cropType} ${variety ? `(${variety})` : ''}
Quantity: ${quantityKg} kg
Quality Grade: ${qualityGrade}
Organic: ${organicCertified ? 'Yes' : 'No'}

Farmer Asking Price: ₹${askingPricePerKg}/kg
Farmer Minimum Price: ₹${minimumPricePerKg}/kg
Government MSP: ₹${mspPerKg}/kg
Current Mandi Price: ₹${mandiPricePerKg}/kg

Buyer (${buyerName}) Offer: ₹${buyerOfferPerKg}/kg
Round Number: ${roundNumber}

AI Decision: ${action}
${counterPrice ? `AI Counter Price: ₹${counterPrice}/kg` : ''}

Write a professional, natural-language reasoning explaining this decision to the buyer on behalf of the farmer.
Include a comparison to the current mandi rate ('This offer is X% above/below current mandi rate').
Include MSP floor protection ('Price cannot go below ₹X/kg (Government MSP)') if relevant to the decision.
No time pressure.

Return ONLY a JSON object with this exact structure, do not wrap in markdown blocks:
{
  "reasoning": "your natural language explanation to the buyer",
  "mandiComparison": "short string comparing to mandi price",
  "farmerBenefit": "short string explaining how this helps the farmer"
}`;

    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    });

    const responseText = result.text?.trim() || "{}";
    // Strip markdown formatting if the model still includes it
    const cleanJson = responseText.replace(/```json\n|\n```|```/g, '');
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanJson);
    } catch (e) {
      aiResponse = {
        reasoning: `We have decided to ${action} your offer. We are looking for a fair price above the mandi rate.`,
        mandiComparison: `Current Mandi rate is ₹${mandiPricePerKg}/kg.`,
        farmerBenefit: 'Ensures fair compensation for the farmer.'
      };
    }

    return NextResponse.json({
      action,
      counterPrice,
      reasoning: aiResponse.reasoning,
      mandiComparison: aiResponse.mandiComparison,
      farmerBenefit: aiResponse.farmerBenefit
    });

  } catch (error) {
    console.error('Negotiation API error:', error);
    return NextResponse.json({ error: 'Failed to process negotiation' }, { status: 500 });
  }
}
