import { NextRequest, NextResponse } from "next/server";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { callGemini } from "@/lib/gemini";

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

  const result = await callGemini({
    apiKey,
    system:
      "You categorize accounting transactions. Reply with ONLY the single best-matching category name from the provided list, exactly as written. No explanation.",
    parts: [
      {
        text: `Categories: ${categories.join(", ")}\n\nTransaction: "${description}"${
          typeof amount === "number" ? ` for $${amount}` : ""
        }\n\nWhich category fits best?`,
      },
    ],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const category = categories.find((c) => c.toLowerCase() === result.text.toLowerCase()) ?? "Other";
  return NextResponse.json({ category });
}
