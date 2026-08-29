import { NextResponse } from 'next/server';
import { runAutonomousCycle } from '../../../../lib/agents/orchestrator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await runAutonomousCycle();
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error("[Autonomous Monitor] Error during cycle:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
