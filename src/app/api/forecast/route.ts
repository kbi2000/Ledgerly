import { NextRequest, NextResponse } from "next/server";
import { callGemini, parseJsonResponse } from "@/lib/gemini";

interface ForecastResult {
  projectedIncome?: number;
  projectedExpense?: number;
  reasoning?: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 501 }
    );
  }

  const { monthlyTrend, businessType } = await req.json();
  if (!Array.isArray(monthlyTrend) || monthlyTrend.length < 2) {
    return NextResponse.json(
      { error: "At least two months of history are needed to forecast." },
      { status: 400 }
    );
  }

  const result = await callGemini({
    apiKey,
    temperature: 0.3,
    system: `You are a financial forecasting analyst for a ${businessType ?? "small"} business. Given a month-by-month income/expense history, project next month's totals. Respond with ONLY a JSON object of this exact shape, no markdown fences: {"projectedIncome": number, "projectedExpense": number, "reasoning": string}. "reasoning" is one short plain-language sentence explaining the projection, grounded in the actual trend shown (seasonality, growth, decline). Never invent data outside what's given.`,
    parts: [{ text: JSON.stringify({ monthlyTrend }) }],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const forecast = parseJsonResponse<ForecastResult>(result.text);
  if (
    !forecast ||
    typeof forecast.projectedIncome !== "number" ||
    typeof forecast.projectedExpense !== "number"
  ) {
    return NextResponse.json({ error: "Couldn't generate a forecast from that data." }, { status: 502 });
  }

  return NextResponse.json({
    projectedIncome: forecast.projectedIncome,
    projectedExpense: forecast.projectedExpense,
    projectedNet: forecast.projectedIncome - forecast.projectedExpense,
    reasoning: forecast.reasoning ?? "",
  });
}
