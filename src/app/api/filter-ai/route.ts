import { NextResponse } from "next/server";
import { ai, DEFAULT_MODEL } from "@/lib/vertex-client";

// Rule-based fallback parser in case Gemini has latency or network drop
function fallbackParseQuery(q: string) {
  const query = q.toLowerCase();
  const res: Record<string, any> = {};

  // Cargo types
  if (query.includes("seafood") || query.includes("sea food") || query.includes("prawn") || query.includes("crab")) res.type = "seafood";
  else if (query.includes("fish")) res.type = "fish";
  else if (query.includes("tomato")) res.type = "tomatoes";
  else if (query.includes("mango")) res.type = "mangoes";
  else if (query.includes("flower")) res.type = "flowers";
  else if (query.includes("dairy") || query.includes("milk") || query.includes("cheese")) res.type = "dairy";
  else if (query.includes("meat") || query.includes("beef") || query.includes("mutton")) res.type = "meat";
  else if (query.includes("poultry") || query.includes("chicken")) res.type = "poultry";
  else if (query.includes("grain") || query.includes("wheat") || query.includes("rice")) res.type = "grains";
  else if (query.includes("spice")) res.type = "spices";
  else if (query.includes("fruit")) res.type = "fruits";
  else if (query.includes("pharma") || query.includes("vaccine") || query.includes("medicine")) res.type = "pharmaceuticals";
  else if (query.includes("veg") || query.includes("vegetable") || query.includes("produce")) res.type = "vegetables";

  // Price parsing
  const priceUnder = query.match(/(?:under|below|less than|<|cheap|max)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (priceUnder) res.maxPrice = Number(priceUnder[1]);
  else if (query.includes("cheap") || query.includes("budget") || query.includes("low price")) res.maxPrice = 250;

  const priceAbove = query.match(/(?:above|more than|>|min)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (priceAbove) res.minPrice = Number(priceAbove[1]);

  // Distance parsing
  const distMatch = query.match(/(?:within|<|under|max)\s*(\d+)\s*(?:km|kms|kilometer)/i);
  if (distMatch) res.maxDistance = Number(distMatch[1]);
  else if (query.includes("nearby") || query.includes("near me") || query.includes("close")) res.maxDistance = 50;

  // Spoilage / Urgency
  const spoilMatch = query.match(/(?:spoil|expire|arriving|within)\s*(?:in|under|<)?\s*(\d+)\s*(?:m|min|mins|minutes|h|hr|hours)/i);
  if (spoilMatch) {
    let val = Number(spoilMatch[1]);
    if (query.includes("h") || query.includes("hr") || query.includes("hour")) val *= 60;
    res.maxSpoilage = val;
  } else if (query.includes("urgent") || query.includes("emergency") || query.includes("critical") || query.includes("fast")) {
    res.maxSpoilage = 120;
  }

  // Temperature
  const tempMaxMatch = query.match(/(?:temp|temperature)\s*(?:<|under|below)\s*(\d+)/i);
  if (tempMaxMatch) res.tempMax = Number(tempMaxMatch[1]);
  const tempMinMatch = query.match(/(?:temp|temperature|hot|warm)\s*(?:>|above|over)\s*(\d+)/i);
  if (tempMinMatch) res.tempMin = Number(tempMinMatch[1]);
  else if (query.includes("hot") || query.includes("high temp") || query.includes("temp spike")) res.tempMin = 10;

  // Sorting
  if (query.includes("best") || query.includes("recommend") || query.includes("match") || query.includes("top pick")) res.sortBy = "best_match";
  else if (query.includes("cheapest") || query.includes("lowest price") || query.includes("low to high")) res.sortBy = "price_asc";
  else if (query.includes("nearest") || query.includes("closest")) res.sortBy = "distance_asc";
  else if (query.includes("urgent") || query.includes("spoiling")) res.sortBy = "spoilage_asc";

  return res;
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const fallback = fallbackParseQuery(query);

    const prompt = `You are the Annapurna AI Search & Decision Support Engine. 
The user is a wholesale buyer looking for distress perishable agricultural/food cargo.
Extract structured filtering criteria from the user's natural language search query.

User Query: "${query}"

Respond with ONLY a JSON object matching this schema:
{
  "type": "tomatoes" | "mangoes" | "fish" | "flowers" | "dairy" | "vegetables" | "seafood" | "meat" | "poultry" | "grains" | "spices" | "fruits" | "pharmaceuticals" | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "minQty": number | null,
  "maxSpoilage": number | null, // in minutes (e.g. 2 hours = 120)
  "tempMin": number | null,
  "tempMax": number | null,
  "humMin": number | null,
  "humMax": number | null,
  "ethyleneLevel": "all" | "low" | "medium" | "high" | null,
  "maxDistance": number | null, // in km
  "temporal": "all" | "loaded_under_2h" | "loaded_under_4h" | "loaded_over_4h" | null,
  "sortBy": "default" | "price_asc" | "price_desc" | "spoilage_asc" | "distance_asc" | "best_match" | null,
  "aiSummary": string // e.g. "Filtered for Seafood under ₹300/kg within 50km sorted by Best Match"
}

If a criterion is not mentioned, use null.
If user asks for "cheap", set maxPrice around 250.
If user asks for "urgent" or "critical", set maxSpoilage around 120 or sortBy to "spoilage_asc".
If user asks for "best" or "recommended", set sortBy to "best_match".`;

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
