// flash-lite: no hidden "thinking" tokens (unlike gemini-3.6-flash, which burns a
// variable, sometimes huge budget reasoning before answering) and a much higher
// free-tier daily quota — a better fit for frequent, low-latency calls.
const GEMINI_MODEL = "gemini-3.5-flash-lite";

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

const DEFAULT_MAX_OUTPUT_TOKENS = 500;

export async function callGemini({
  apiKey,
  system,
  parts,
  temperature = 0,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
}: {
  apiKey: string;
  system: string;
  parts: GeminiPart[];
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts }],
        generationConfig: { maxOutputTokens, temperature },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    return { ok: false, error: `Gemini request failed: ${detail}` };
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!text) {
    const finishReason = data.candidates?.[0]?.finishReason;
    return { ok: false, error: `Gemini returned no text (finishReason: ${finishReason ?? "unknown"})` };
  }
  return { ok: true, text };
}

/** Strips ```json fences models sometimes add despite instructions not to. */
export function parseJsonResponse<T>(text: string): T | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
