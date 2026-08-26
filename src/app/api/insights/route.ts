import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 501 }
    );
  }

  const { totalIncome, totalExpense, byCategory, periodLabel } = await req.json();
  if (typeof totalIncome !== "number" || typeof totalExpense !== "number") {
    return NextResponse.json(
      { error: "totalIncome and totalExpense (numbers) are required" },
      { status: 400 }
    );
  }

  const result = await callGemini({
    apiKey,
    temperature: 0.6,
    system:
      "You are a friendly accounting analyst. Given aggregated financial totals, write 2-3 short, plain-language insight sentences (no jargon, no headers, no markdown) a small-business owner would find useful: call out trends, risks, or notable categories. Do not repeat raw numbers verbatim unless it strengthens the point.",
    parts: [
      {
        text: JSON.stringify({
          period: periodLabel ?? "this period",
          totalIncome,
          totalExpense,
          net: totalIncome - totalExpense,
          byCategory: byCategory ?? {},
        }),
      },
    ],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ insight: result.text });
}
