import { NextResponse } from 'next/server';
import { ai, DEFAULT_MODEL } from '@/lib/vertex-client';
import { DEMO_FORECASTS } from '@/data/mock-data';
import { DemandForecast } from '@/lib/types';
import { Type, Schema } from '@google/genai';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cropType = searchParams.get('cropType');
    const region = searchParams.get('region');

    if (!cropType || !region) {
      return NextResponse.json({ error: 'Missing cropType or region' }, { status: 400 });
    }

    const systemPrompt = "You are an agricultural market analyst for India. Given a crop type and region, predict the demand and price trend for the next 7-14 days. Consider seasonal patterns, recent market data, and weather conditions. Return structured JSON.";

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        cropType: { type: Type.STRING },
        region: { type: Type.STRING },
        date: { type: Type.STRING, description: 'ISO date string' },
        predictedDemandKg: { type: Type.INTEGER },
        predictedPricePerKg: { type: Type.NUMBER },
        currentPricePerKg: { type: Type.NUMBER },
        trend: { type: Type.STRING, enum: ['rising', 'stable', 'falling'] },
        confidence: { type: Type.NUMBER, description: 'Number between 0 and 1' },
        recommendation: { type: Type.STRING }
      },
      required: ['cropType', 'region', 'date', 'predictedDemandKg', 'predictedPricePerKg', 'currentPricePerKg', 'trend', 'confidence', 'recommendation']
    };

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Crop Type: ${cropType}, Region: ${region}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    if (response.text) {
      const forecast: DemandForecast = JSON.parse(response.text);
      return NextResponse.json({ forecast });
    } else {
      throw new Error("No response text from model");
    }
  } catch (error) {
    console.warn('Error fetching AI demand forecast, falling back to mock data:', error);
    
    const { searchParams } = new URL(req.url);
    const cropType = searchParams.get('cropType')?.toLowerCase() || '';
    const region = searchParams.get('region')?.toLowerCase() || '';

    // Find the closest match in DEMO_FORECASTS
    const match = DEMO_FORECASTS.find(
      f => f.cropType.toLowerCase() === cropType && f.region.toLowerCase() === region
    );

    if (match) {
      return NextResponse.json({ forecast: match });
    }

    // Default fallback if no match found
    const defaultFallback = DEMO_FORECASTS[0];
    return NextResponse.json({ forecast: { ...defaultFallback, cropType: cropType as any, region: region || defaultFallback.region } });
  }
}
