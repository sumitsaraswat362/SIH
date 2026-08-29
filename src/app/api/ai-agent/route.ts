import { NextResponse } from 'next/server';
import { makeDecision } from '@/lib/ai-agent';

export async function POST(req: Request) {
  try {
    const { cargo } = await req.json();
    const decision = await makeDecision(cargo);
    return NextResponse.json(decision);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
