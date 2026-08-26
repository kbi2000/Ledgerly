import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

const MAX_TRANSACTIONS = 400;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 501 }
    );
  }

  const { question, transactions } = await req.json();
  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }
  if (!Array.isArray(transactions)) {
    return NextResponse.json({ error: "transactions must be an array" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const trimmed = transactions.slice(0, MAX_TRANSACTIONS).map((t) => ({
    description: t.description,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.date,
  }));

  const result = await callGemini({
    apiKey,
    temperature: 0.3,
    system:
      "You are a bookkeeping assistant answering questions about a small business's own recorded transactions. Only use the transaction data provided — never invent numbers. If the data can't answer the question, say so plainly. Reply in 1-4 short sentences, plain language, no markdown, no tables. Use $ for money.",
    parts: [
      {
        text: `Today's date is ${today}.\n\nTransactions (JSON array): ${JSON.stringify(
          trimmed
        )}\n\nQuestion: ${question}`,
      },
    ],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ answer: result.text });
}
