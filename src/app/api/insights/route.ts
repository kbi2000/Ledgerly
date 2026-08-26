import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-3.6-flash";

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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You are a friendly accounting analyst. Given aggregated financial totals, write 2-3 short, plain-language insight sentences (no jargon, no headers, no markdown) a small-business owner would find useful: call out trends, risks, or notable categories. Do not repeat raw numbers verbatim unless it strengthens the point.",
            },
          ],
        },
        contents: [
          {
            role: "user",
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
          },
        ],
        // gemini-3.6-flash spends a variable (and sometimes large) number of tokens
        // "thinking" before the answer; keep plenty of headroom over the prose itself.
        generationConfig: { maxOutputTokens: 2048, temperature: 0.6 },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: `Gemini request failed: ${detail}` }, { status: 502 });
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

  return NextResponse.json({ insight: text });
}
