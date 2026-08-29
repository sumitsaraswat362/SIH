import { NextResponse } from 'next/server';
import { ai, DEFAULT_MODEL } from '@/lib/vertex-client';

export async function GET() {
  try {
    const prompt = `You are the backend logic for an autonomous "Nerve Center" dashboard that monitors an agricultural marketplace.
Generate a realistic sequence of 8-10 terminal log entries representing market events and how the multi-agent system autonomously handled them.

Examples of events:
- "Fetching today's onion rates from Nashik APMC..."
- "Mandi price alert: Tomato rate dropped 18% in Vashi market"
- "MarketMonitorAgent: Matching 500kg Alphonso mangoes with premium export buyer"
- "MatchmakingAgent: Found 3 verified buyers within 50km radius"
- "NegotiationAgent: Counter-offer sent. Farmer's price: ₹35/kg vs Buyer offer: ₹28/kg"
- "Deal closed: ₹4,200 more earned than local mandi price"
- "Commission agent bypassed. Farmer saved ₹12,600 in intermediary fees"

The agents involved:
- 'System': Core system initializing or confirming final actions.
- 'MarketMonitorAgent': Scans telemetry and detects anomalies.
- 'MatchmakingAgent': Evaluates the situation and initiates protocols.
- 'NotificationAgent': Sends alerts or dispatch commands.
- 'MarketAgent': Negotiates bids or interacts with external buyers.

Output ONLY a JSON array of objects with the following schema:
[
  {
    "agent": "System|MarketMonitorAgent|MatchmakingAgent|NotificationAgent|MarketAgent",
    "message": "String representing the terminal log text.",
    "type": "system|info|warning|critical|action|success"
  }
]`;

    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = result.text || '[]';
    const logs = JSON.parse(text);
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Nerve Center Feed API error:', error);
    // Fallback response in case of API error
    return NextResponse.json([
      { agent: 'System', message: 'Initializing Neural Routing Core...', type: 'system' },
      { agent: 'MarketMonitorAgent', message: 'Scanning active farmers...', type: 'info' },
      { agent: 'System', message: 'API connection failed. Running in mock offline mode.', type: 'warning' },
    ]);
  }
}
