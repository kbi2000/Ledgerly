import { NextRequest, NextResponse } from "next/server";
import { callGemini, parseJsonResponse } from "@/lib/gemini";

const SYSTEM_BY_FOCUS = {
  growth: `You are a pragmatic small-business advisor. Given a business's real financial metrics, respond with ONLY a JSON array of 3-4 short, concrete, actionable growth suggestions (each a single sentence, no markdown, no fluff, no generic advice that ignores the numbers given). Ground every suggestion in the actual data provided — cite a real trend, category, or client from it.`,
  risk: `You are a pragmatic small-business risk advisor. Given a business's real financial metrics, respond with ONLY a JSON array of 3-4 short, concrete risk-reduction actions (each a single sentence, no markdown, no fluff). Focus on real risks visible in the data: client concentration, overdue receivables, expense volatility, thin cash buffer. Ground every point in the actual numbers given — don't give generic advice that ignores them.`,
} as const;

type Focus = keyof typeof SYSTEM_BY_FOCUS;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 501 }
    );
  }

  const { focus, metrics } = await req.json();
  if (focus !== "growth" && focus !== "risk") {
    return NextResponse.json({ error: "focus must be 'growth' or 'risk'" }, { status: 400 });
  }
  if (!metrics || typeof metrics !== "object") {
    return NextResponse.json({ error: "metrics object is required" }, { status: 400 });
  }

  const result = await callGemini({
    apiKey,
    temperature: 0.5,
    system: SYSTEM_BY_FOCUS[focus as Focus],
    parts: [{ text: JSON.stringify(metrics) }],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const points = parseJsonResponse<string[]>(result.text);
  if (!points || !Array.isArray(points) || points.length === 0) {
    return NextResponse.json({ error: "Couldn't generate advice from that data." }, { status: 502 });
  }

  return NextResponse.json({ points: points.filter((p) => typeof p === "string" && p.trim()) });
}
