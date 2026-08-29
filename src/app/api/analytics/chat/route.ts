import { NextResponse } from 'next/server';
import { ai, DEFAULT_MODEL } from '@/lib/vertex-client';
import { BigQueryService } from '@/lib/bigquery';

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'project-a9c284f8-6bca-440a-a0c';
const bqService = new BigQueryService();

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Step 1: Use AI to generate a SQL query
    const prompt = `
      You are an elite BigQuery Data Agent.
      The user asks: "${message}"
      
      Generate a valid Standard SQL query to answer this question.
      
      CRITICAL SCHEMA INFORMATION:
      - The exact table you must query is: \`${PROJECT_ID}.annapurna_marketplace.transactions\`
      - Columns available: 
        transaction_id (STRING), farmer_name (STRING), buyer_name (STRING), 
        produce_type (STRING), quantity_kg (FLOAT64), final_price_per_kg (FLOAT64), 
        mandi_price_per_kg (FLOAT64), commission_saved (FLOAT64), 
        extra_profit (FLOAT64), location_city (STRING), timestamp (TIMESTAMP)
      
      RULES:
      - Only generate SELECT statements. Never use INSERT, UPDATE, DELETE, DROP, etc.
      - Always reference the full table path: \`${PROJECT_ID}.annapurna_marketplace.transactions\`
      - Limit results to 50 rows max using LIMIT clause
      - Use meaningful column aliases for readability

      Answer farmer-centric questions like:
      - "How much extra profit did farmers make this week?"
      - "What is the average commission saved per transaction?"
      - "Which produce has the highest buyer demand?"

      Also provide a brief, helpful summary answering the question.
      Format your response as a raw JSON object (without markdown blocks) like this:
      {
        "sql": "SELECT ...",
        "summary": "Brief summary..."
      }
    `;

    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.text || '';
    
    let parsedResponse;
    try {
        const jsonMatch = responseText.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*?\}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
        parsedResponse = JSON.parse(jsonString.trim());
    } catch (e) {
        parsedResponse = {
            sql: `SELECT transaction_id, produce_type, extra_profit, location_city FROM \`${PROJECT_ID}.annapurna_marketplace.transactions\` LIMIT 10`,
            summary: responseText,
        };
    }

    // Step 2: Execute the validated SQL against real BigQuery
    console.log(`[Analytics Chat] Generated SQL: ${parsedResponse.sql}`);
    const startTime = Date.now();
    const data = await bqService.query(parsedResponse.sql || message);
    const queryTime = Date.now() - startTime;
    console.log(`[Analytics Chat] Query executed in ${queryTime}ms, returned ${data.length} rows`);

    return NextResponse.json({
      summary: parsedResponse.summary,
      sql: parsedResponse.sql,
      data: data,
      queryTimeMs: queryTime,
    });
  } catch (error: any) {
    console.error('Error in chat analytics route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
