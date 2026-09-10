import { NextResponse } from "next/server";
import { ai, DEFAULT_MODEL } from "@/lib/vertex-client";

export const runtime = 'nodejs';
export const maxDuration = 30;

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
      organicCertified,
    } = body;

    if (!askingPricePerKg || !buyerOfferPerKg) {
      return NextResponse.json({ error: "Asking price and buyer offer are required" }, { status: 400 });
    }

    const offerRatio = buyerOfferPerKg / askingPricePerKg;
    let action: "accept" | "counter" | "reject" = "counter";
    let counterPrice = askingPricePerKg;

    const effectiveFloor = Math.max(minimumPricePerKg || 0, mspPerKg || 0);

    if (buyerOfferPerKg >= askingPricePerKg * 0.95) {
      action = "accept";
    } else if (buyerOfferPerKg < effectiveFloor) {
      action = "reject";
    } else if (offerRatio < 0.70) {
      action = "counter";
      counterPrice = Math.round((askingPricePerKg + effectiveFloor) / 2);
    } else {
      action = "counter";
      counterPrice = Math.round(buyerOfferPerKg * 0.4 + askingPricePerKg * 0.6);
      if (counterPrice < effectiveFloor) counterPrice = effectiveFloor;
    }

    const systemInstruction = `You are the Annapurna AI Negotiation Agent protecting farmer interests.
RULES:
1. Be polite but firm. You represent the farmer.
2. Keep reasoning under 3 sentences.
3. Return ONLY a valid JSON object. No markdown fences.`;

    const promptText = `Analyze this negotiation:
Crop: ${organicCertified ? 'Organic ' : ''}${cropType} ${variety ? `(${variety})` : ''}
Quality: Grade ${qualityGrade || 'Standard'} | Quantity: ${quantityKg} kg
Farmer Asking: ₹${askingPricePerKg}/kg | Minimum: ₹${effectiveFloor}/kg
Mandi Rate: ₹${mandiPricePerKg || 'N/A'}/kg | MSP: ${mspPerKg ? '₹' + mspPerKg + '/kg' : 'N/A'}
Buyer (${buyerName || 'Buyer'}) Offer: ₹${buyerOfferPerKg}/kg (Round ${roundNumber || 1})
Decision: ${action.toUpperCase()}${action === 'counter' ? ` at ₹${counterPrice}/kg` : ''}

Return JSON: {"reasoning":"...", "mandiComparison":"...", "farmerBenefit":"..."}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    let aiData;
    try {
      const cleanText = (response.text || "").replace(/```json\n|\n```|```/g, "").trim();
      aiData = JSON.parse(cleanText);
    } catch {
      aiData = {
        reasoning: action === 'accept' ? "Fair offer accepted." : action === 'reject' ? "Offer below minimum." : "Counter offer proposed.",
        mandiComparison: "Market aligned.",
        farmerBenefit: "Fair price secured."
      };
    }

    return NextResponse.json({
      action,
      ...(action === 'counter' && { counterPrice }),
      reasoning: aiData.reasoning,
      mandiComparison: aiData.mandiComparison,
      farmerBenefit: aiData.farmerBenefit
    });

  } catch (error) {
    console.error("Negotiation API Error:", error);
    return NextResponse.json({ error: "Failed to process negotiation" }, { status: 500 });
  }
}
