import { NextResponse } from "next/server";
import { ai, DEFAULT_MODEL } from "@/lib/vertex-client";

// Rule-based fallback parser in case Gemini has latency or network drop
function fallbackParseQuery(q: string) {
  const query = q.toLowerCase();
  const res: Record<string, any> = {};

  if (query.includes("tomato")) res.cropType = "tomatoes";
  else if (query.includes("onion")) res.cropType = "onions";
  else if (query.includes("potato")) res.cropType = "potatoes";
  else if (query.includes("wheat")) res.cropType = "wheat";
  else if (query.includes("rice")) res.cropType = "rice";
  else if (query.includes("grape")) res.cropType = "grapes";
  else if (query.includes("banana")) res.cropType = "bananas";
  else if (query.includes("mango")) res.cropType = "mangoes";
  else if (query.includes("apple")) res.cropType = "apples";
  else if (query.includes("orange")) res.cropType = "oranges";

  if (query.includes("veg")) res.cropCategory = "vegetables";
  else if (query.includes("fruit")) res.cropCategory = "fruits";
  else if (query.includes("grain")) res.cropCategory = "grains";
  else if (query.includes("pulse") || query.includes("dal")) res.cropCategory = "pulses";
  else if (query.includes("spice")) res.cropCategory = "spices";
  else if (query.includes("dairy") || query.includes("milk")) res.cropCategory = "dairy";

  if (query.includes("organic") || query.includes("pesticide free") || query.includes("natural")) {
    res.organic = true;
  }

  const priceUnder = query.match(/(?:under|below|less than|<|cheap|max)\s*(?:₹|rs\.?|inr|rupees)?\s*(\d+)/i);
  if (priceUnder) res.maxPricePerKg = Number(priceUnder[1]);
  else if (query.includes("cheap") || query.includes("budget") || query.includes("low price")) res.sortBy = "price_low";

  const priceAbove = query.match(/(?:above|more than|>|min)\s*(?:₹|rs\.?|inr|rupees)?\s*(\d+)/i);
  if (priceAbove) res.minPricePerKg = Number(priceAbove[1]);

  const distMatch = query.match(/(?:within|<|under|max)\s*(\d+)\s*(?:km|kms|kilometer)/i);
  if (distMatch) res.maxDistanceKm = Number(distMatch[1]);
  else if (query.includes("nearby") || query.includes("near me") || query.includes("close") || query.includes("local")) {
    res.maxDistanceKm = 50;
  }

  if (query.includes("fresh today") || query.includes("harvested today")) {
    res.maxHarvestAgeHours = 24;
  }

  if (query.includes("pune")) res.district = "Pune";
  if (query.includes("nashik")) res.district = "Nashik";
  if (query.includes("mumbai")) res.district = "Mumbai";
  if (query.includes("maharashtra")) res.state = "Maharashtra";

  if (query.includes("cheapest") || query.includes("lowest price") || query.includes("low to high")) {
    res.sortBy = "price_low";
  } else if (query.includes("nearest") || query.includes("closest")) {
    res.sortBy = "distance";
  } else if (query.includes("fresh") || query.includes("newest")) {
    res.sortBy = "freshness";
  } else if (query.includes("best") || query.includes("top rated")) {
    res.sortBy = "rating";
  }

  return res;
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const fallback = fallbackParseQuery(query);

    const prompt = `You are the Annapurna Marketplace Search Engine. The user is looking for fresh produce from farms. Extract structured filters from their natural language query. Examples:
- 'organic tomatoes under 40 rupees near pune' -> {"cropType":"tomatoes", "organic":true, "maxPricePerKg":40, "district":"Pune"}
- 'show me grapes from nashik' -> {"cropType":"grapes", "district":"Nashik"}
- 'cheapest onions available' -> {"cropType":"onions", "sortBy":"price_low"}

User Query: "${query}"

Respond with ONLY a JSON object matching this schema:
{
  "cropType": "string or null",
  "cropCategory": "string or null",
  "organic": "boolean or null",
  "maxPricePerKg": "number or null",
  "minPricePerKg": "number or null",
  "maxDistanceKm": "number or null",
  "qualityGrade": "string or null",
  "state": "string or null",
  "district": "string or null",
  "maxHarvestAgeHours": "number or null",
  "deliveryMode": "string or null",
  "sortBy": "price_low" | "price_high" | "freshness" | "distance" | "rating" | null
}

If a criterion is not mentioned, use null.`;

    try {
      const result = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = result.text || "{}";
      const json = JSON.parse(text);
      
      // Merge with fallback to ensure high accuracy
      const merged = { ...fallback, ...json };
      // Clean up nulls
      Object.keys(merged).forEach(k => {
        if (merged[k] === null || merged[k] === undefined) delete merged[k];
      });

      if (!merged.aiSummary) {
        merged.aiSummary = `AI applied filters for "${query}"`;
      }

      return NextResponse.json(merged);
    } catch (aiErr) {
      console.warn("AI generation fallback triggered for filter:", aiErr);
      return NextResponse.json({
        ...fallback,
        aiSummary: `Smart Filter applied for "${query}"`
      });
    }
  } catch (error) {
    console.error("Error in AI filter route:", error);
    return NextResponse.json({ error: "Failed to process AI filter" }, { status: 500 });
  }
}
