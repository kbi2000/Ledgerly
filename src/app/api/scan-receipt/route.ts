import { NextRequest, NextResponse } from "next/server";
import { categoriesFor } from "@/lib/categories";
import { callGemini, parseJsonResponse } from "@/lib/gemini";
import type { BusinessType } from "@/lib/types";

interface ReceiptExtraction {
  merchant?: string;
  amount?: number;
  date?: string;
  category?: string;
  notReceipt?: boolean;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 501 }
    );
  }

  const { imageBase64, mimeType, businessType } = await req.json();
  if (typeof imageBase64 !== "string" || !imageBase64) {
    return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
  }
  if (typeof mimeType !== "string" || !mimeType.startsWith("image/")) {
    return NextResponse.json({ error: "mimeType must be an image/* type" }, { status: 400 });
  }

  const expenseCategories = categoriesFor("expense", businessType as BusinessType | undefined);
  const today = new Date().toISOString().slice(0, 10);

  const result = await callGemini({
    apiKey,
    parts: [
      { inlineData: { mimeType, data: imageBase64 } },
      {
        text: `Extract this receipt into JSON for bookkeeping software. Respond with ONLY a JSON object, no markdown fences, no explanation, matching exactly this shape:
{"merchant": string, "amount": number, "date": "YYYY-MM-DD", "category": one of [${expenseCategories.join(
          ", "
        )}]}
Today's date is ${today} — use it if the receipt date is illegible or missing. "amount" is the final total paid, as a plain number with no currency symbol.
If the image is not a receipt or invoice, respond with exactly {"notReceipt": true} instead.`,
      },
    ],
    system:
      "You are a precise receipt-scanning assistant for accounting software. You only ever respond with the exact JSON shape requested — never prose, never markdown fences.",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const extraction = parseJsonResponse<ReceiptExtraction>(result.text);
  if (!extraction) {
    return NextResponse.json({ error: "Couldn't parse the receipt. Try a clearer photo." }, { status: 502 });
  }
  if (extraction.notReceipt) {
    return NextResponse.json({ error: "That doesn't look like a receipt or invoice." }, { status: 422 });
  }
  if (typeof extraction.amount !== "number" || !extraction.date) {
    return NextResponse.json({ error: "Couldn't read an amount and date off that receipt." }, { status: 422 });
  }

  const category = expenseCategories.find(
    (c) => c.toLowerCase() === extraction.category?.toLowerCase()
  ) ?? "Other";

  return NextResponse.json({
    description: extraction.merchant?.trim() || "Receipt",
    amount: Math.abs(extraction.amount),
    date: extraction.date,
    category,
  });
}
