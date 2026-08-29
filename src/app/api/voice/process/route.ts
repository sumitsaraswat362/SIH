import { NextResponse } from 'next/server';
import { ai, DEFAULT_MODEL } from '@/lib/vertex-client';

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const prompt = `You are a voice assistant for a logistics fleet.
Analyze the following transcript from a truck driver.
Extract the intent and any relevant entities (like delay duration, location, issue type).
Possible intents: UpdateETA, ReportIssue, RequestHelp, StatusUpdate.
If you can't determine the intent, use "StatusUpdate".

Transcript: "${transcript}"

Return a JSON object with this exact structure:
{
  "intent": "string",
  "entities": {
    "key": "value"
  },
  "response": "string"
}
Make sure "response" is a brief confirmation message to the driver based on their input.
`;

    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (result.text) {
      const data = JSON.parse(result.text);
      return NextResponse.json(data);
    }
    
    throw new Error('No response from Gemini');
  } catch (error) {
    console.error('Error processing voice:', error);
    return NextResponse.json({ error: 'Failed to process voice' }, { status: 500 });
  }
}
