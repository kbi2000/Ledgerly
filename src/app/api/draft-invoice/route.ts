import { NextRequest, NextResponse } from "next/server";
import { callGemini, parseJsonResponse } from "@/lib/gemini";

interface InvoiceDraft {
  clientName?: string;
  clientEmail?: string | null;
  items?: { description?: string; quantity?: number; rate?: number }[];
  issueDate?: string;
  dueDate?: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 501 }
    );
  }

  const { prompt } = await req.json();
  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const result = await callGemini({
    apiKey,
    system:
      "You convert a short natural-language request into a structured invoice draft for bookkeeping software. Respond with ONLY a JSON object, no markdown fences, no explanation.",
    parts: [
      {
        text: `Today's date is ${today}. Convert this request into JSON matching exactly this shape:
{"clientName": string, "clientEmail": string or null, "items": [{"description": string, "quantity": number, "rate": number}], "issueDate": "YYYY-MM-DD", "dueDate": "YYYY-MM-DD"}
Rules: issueDate defaults to today unless stated. dueDate defaults to 14 days after issueDate unless stated. If only a flat total is given with no rate/quantity breakdown, use quantity 1 and rate equal to that total. Split distinct billable items into separate array entries when the request implies more than one.

Request: "${prompt}"`,
      },
    ],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const draft = parseJsonResponse<InvoiceDraft>(result.text);
  if (!draft || !draft.clientName || !Array.isArray(draft.items) || draft.items.length === 0) {
    return NextResponse.json(
      { error: "Couldn't draft an invoice from that — try including a client name and what to bill for." },
      { status: 422 }
    );
  }

  const items = draft.items
    .filter((item) => item.description)
    .map((item) => ({
      description: String(item.description),
      quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
      rate: typeof item.rate === "number" ? item.rate : 0,
    }));

  return NextResponse.json({
    clientName: draft.clientName,
    clientEmail: draft.clientEmail || undefined,
    items,
    issueDate: draft.issueDate || today,
    dueDate: draft.dueDate || today,
  });
}
