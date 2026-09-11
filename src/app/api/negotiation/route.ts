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

    const effectiveFloor = Math.max(minimumPricePerKg || 0, mspPerKg || 0, (mandiPricePerKg || 0) * 0.9);
    const round = roundNumber || 1;

    // Let Gemini AI make the ACTUAL negotiation decision
    const systemInstruction = `You are the Annapurna AI Negotiation Agent. You protect farmer interests while facilitating fair deals.

CONTEXT: This is a direct farmer-to-buyer marketplace eliminating middlemen. You negotiate on behalf of the farmer.

HARD RULES:
1. NEVER accept below the effective floor price of ₹${effectiveFloor}/kg (this is the MSP/mandi-derived minimum).
2. Be flexible — if the offer is close to asking price (within 10%), accept it.
3. On early rounds (1-3), counter higher. On later rounds (4-7), be more willing to meet in the middle. After round 7, try to close the deal.
4. Consider quality grade, organic certification, and market conditions in your reasoning.
5. Your counter price MUST be between the buyer's offer and the asking price, and ABOVE the floor.

Return ONLY valid JSON with this exact schema:
{
  "action": "accept" | "counter" | "reject",
  "counterPrice": <number or null>,
  "reasoning": "<2-3 sentence explanation to the buyer>",
  "mandiComparison": "<short comparison to mandi rate>",
  "farmerBenefit": "<how this protects the farmer>"
}`;

    const promptText = `NEGOTIATION ROUND ${round}:
Crop: ${organicCertified ? 'Organic ' : ''}${cropType}${variety ? ` (${variety})` : ''}
Quality Grade: ${qualityGrade || 'Standard'}
Quantity: ${quantityKg || 'N/A'} kg
Farmer's Asking Price: ₹${askingPricePerKg}/kg
Effective Floor (absolute minimum): ₹${effectiveFloor}/kg
Current Mandi Rate: ₹${mandiPricePerKg || 'N/A'}/kg
Government MSP: ${mspPerKg ? '₹' + mspPerKg + '/kg' : 'N/A'}

Buyer "${buyerName || 'Buyer'}" offers: ₹${buyerOfferPerKg}/kg

Make your negotiation decision. Remember:
- If offer >= ${Math.round(askingPricePerKg * 0.90)}, you should ACCEPT (it's within 10% of asking)
- If offer < ${effectiveFloor}, you MUST REJECT
- Otherwise, COUNTER with a fair price between offer and asking
- This is round ${round} of max 10. ${round >= 7 ? 'We are in late rounds — try to close the deal.' : ''}`;

    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          systemInstruction,
          temperature: 0.4,
          responseMimeType: "application/json",
        }
      });

      const cleanText = (response.text || "").replace(/```json\n|\n```|```/g, "").trim();
      const aiDecision = JSON.parse(cleanText);

      // Safety guardrails on AI output
      if (aiDecision.action === "accept" && buyerOfferPerKg < effectiveFloor) {
        aiDecision.action = "reject";
        aiDecision.reasoning = `Sorry, ₹${buyerOfferPerKg}/kg is below the minimum protected price of ₹${effectiveFloor}/kg.`;
        aiDecision.counterPrice = null;
      }

      if (aiDecision.action === "counter") {
        // Ensure counter price is valid
        let cp = aiDecision.counterPrice || Math.round((askingPricePerKg + buyerOfferPerKg) / 2);
        cp = Math.max(cp, effectiveFloor); // Never below floor
        cp = Math.min(cp, askingPricePerKg); // Never above asking
        aiDecision.counterPrice = cp;
      }

      return NextResponse.json({
        action: aiDecision.action,
        counterPrice: aiDecision.counterPrice || null,
        reasoning: aiDecision.reasoning || "Offer processed.",
        mandiComparison: aiDecision.mandiComparison || "",
        farmerBenefit: aiDecision.farmerBenefit || "",
      });

    } catch (aiError) {
      console.warn("AI negotiation failed, using rule-based fallback:", aiError);

      // Rule-based fallback only if AI is unavailable
      const offerRatio = buyerOfferPerKg / askingPricePerKg;
      let action: "accept" | "counter" | "reject" = "counter";
      let counterPrice = askingPricePerKg;
      let reasoning = "";

      if (buyerOfferPerKg >= askingPricePerKg * 0.90) {
        action = "accept";
        reasoning = `Your offer of ₹${buyerOfferPerKg}/kg is fair. Deal accepted! This ${organicCertified ? 'organic ' : ''}${cropType} will be reserved for you.`;
      } else if (buyerOfferPerKg < effectiveFloor) {
        action = "reject";
        reasoning = `₹${buyerOfferPerKg}/kg is below the minimum protected price of ₹${effectiveFloor}/kg. The mandi rate is ₹${mandiPricePerKg}/kg — we cannot go below market floor.`;
      } else {
        // Progressive concession based on round
        const concessionRate = Math.min(0.5, 0.2 + (round * 0.05));
        counterPrice = Math.round(askingPricePerKg - (askingPricePerKg - buyerOfferPerKg) * concessionRate);
        counterPrice = Math.max(counterPrice, effectiveFloor);
        action = "counter";
        reasoning = `I appreciate your offer of ₹${buyerOfferPerKg}/kg. How about ₹${counterPrice}/kg? This is Grade ${qualityGrade || 'A'} ${cropType}, and the current mandi rate is ₹${mandiPricePerKg}/kg.`;
      }

      return NextResponse.json({
        action,
        counterPrice: action === "counter" ? counterPrice : null,
        reasoning,
        mandiComparison: `Mandi rate: ₹${mandiPricePerKg || 'N/A'}/kg`,
        farmerBenefit: action === "accept" ? "Fair trade price secured" : "Farmer's minimum price protected",
      });
    }

  } catch (error) {
    console.error("Negotiation API Error:", error);
    return NextResponse.json({ error: "Failed to process negotiation" }, { status: 500 });
  }
}
