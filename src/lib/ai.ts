import { createServerFn } from "@tanstack/react-start";

const GEMINI_MODEL = "gemini-2.0-flash";

type GenerateCaptionInput = {
  draft: string;
  platform: string;
  brandName: string;
  toneWords: string[];
  writingSample: string;
  contentPillars: string[];
};

function buildPrompt(d: GenerateCaptionInput) {
  const lines = [
    `You are writing a social media caption for "${d.brandName || "this brand"}" to post on ${d.platform}.`,
    d.toneWords.length ? `Brand tone: ${d.toneWords.join(", ")}.` : "",
    d.writingSample ? `Match the voice of this writing sample:\n"${d.writingSample}"` : "",
    d.contentPillars.length ? `The brand's usual content pillars: ${d.contentPillars.join(", ")}.` : "",
    d.draft.trim()
      ? `Rewrite and polish this rough draft into a finished caption, keeping its core idea intact:\n"${d.draft.trim()}"`
      : `Write a short, scroll-stopping caption idea for this brand, drawing on its content pillars.`,
    "Return only the caption text itself — no surrounding quotes, no explanation, no markdown.",
  ];
  return lines.filter(Boolean).join("\n\n");
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini request failed (${response.status}): ${errText.slice(0, 300)}`);
  }

  const json: { candidates?: { content?: { parts?: { text?: string }[] } }[] } = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response.");
  return text.trim();
}

export const generateCaption = createServerFn({ method: "POST" })
  .validator((data: GenerateCaptionInput) => data)
  .handler(async ({ data }) => {
    const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_BACKUP].filter((k): k is string => !!k);
    if (keys.length === 0) {
      throw new Error("Gemini isn't configured on the server yet (missing GEMINI_API_KEY).");
    }

    const prompt = buildPrompt(data);
    let lastError: unknown;
    for (const key of keys) {
      try {
        return await callGemini(key, prompt);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Gemini request failed.");
  });
