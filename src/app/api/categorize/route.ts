import { NextRequest, NextResponse } from "next/server";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";

const GEMINI_MODEL = "gemini-3.6-flash";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 501 }
    );
  }

  const { description, amount, type } = await req.json();
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }
  if (type !== "income" && type !== "expense") {
    return NextResponse.json({ error: "type must be 'income' or 'expense'" }, { status: 400 });
  }

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You categorize accounting transactions. Reply with ONLY the single best-matching category name from the provided list, exactly as written. No explanation.",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Categories: ${categories.join(", ")}\n\nTransaction: "${description}"${
                  typeof amount === "number" ? ` for $${amount}` : ""
                }\n\nWhich category fits best?`,
              },
            ],
          },
        ],
        // gemini-3.6-flash spends a variable number of tokens "thinking" before
        // the answer; a low budget can get truncated before any text comes out.
        generationConfig: { maxOutputTokens: 500, temperature: 0 },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: `Gemini request failed: ${detail}` }, { status: 502 });
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  const category = categories.find((c) => c.toLowerCase() === text.toLowerCase()) ?? "Other";

  return NextResponse.json({ category });
}
