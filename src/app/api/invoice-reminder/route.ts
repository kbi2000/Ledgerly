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

  const { clientName, amount, dueDate, businessName } = await req.json();
  if (typeof clientName !== "string" || !clientName.trim()) {
    return NextResponse.json({ error: "clientName is required" }, { status: 400 });
  }
  if (typeof amount !== "number") {
    return NextResponse.json({ error: "amount (number) is required" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const daysOverdue =
    typeof dueDate === "string" ? Math.max(0, Math.round((Date.parse(today) - Date.parse(dueDate)) / 86_400_000)) : 0;

  const result = await callGemini({
    apiKey,
    temperature: 0.5,
    system:
      "You write short, polite, professional payment reminder emails for a small business. Respond with plain text only: a Subject line, a blank line, then the body. No markdown, no placeholders like [Your Name] — sign off simply with the business name given, or omit a signature if none is given.",
    parts: [
      {
        text: JSON.stringify({
          clientName,
          amountDue: amount,
          dueDate: dueDate ?? null,
          daysOverdue,
          businessName: businessName ?? null,
        }),
      },
    ],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ draft: result.text });
}
