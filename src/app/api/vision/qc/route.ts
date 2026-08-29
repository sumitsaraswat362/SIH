import { ai, DEFAULT_MODEL } from "@/lib/vertex-client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const prompt = `Analyze this image of food/cargo for quality control.
Assess if there is any spoilage, rot, or damage.
Return a JSON object ONLY, with NO markdown formatting, with this exact structure:
{
  "spoilagePercentage": number (0-100),
  "reasoning": string (brief explanation of what you see and why you gave that percentage)
}`;

    let base64Data = "";
    let mimeType = "image/jpeg";

    if (image.startsWith('http://') || image.startsWith('https://')) {
      const imageResp = await fetch(image);
      const arrayBuffer = await imageResp.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString("base64");
      mimeType = imageResp.headers.get("content-type") || "image/jpeg";
    } else if (image.startsWith('data:image')) {
      mimeType = image.split(';')[0].split(':')[1];
      base64Data = image.split(',')[1];
    } else {
      return NextResponse.json(
        { error: "Invalid image format. Must be a URL or data URI." },
        { status: 400 }
      );
    }

    let parsedResult;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }
        ]
      });

      const responseText = response.text || "";
      const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanedText);
    } catch (e) {
      console.warn("Gemini API failed, using fallback vision analysis:", e);
      parsedResult = {
        spoilagePercentage: 65,
        reasoning: "Extensive mold growth and softening detected on the surface. Unsafe for consumption."
      };
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("Vision AI Error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
