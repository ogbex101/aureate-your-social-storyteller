import { createServerFn } from "@tanstack/react-start";

const GEMINI_MODEL = "gemini-3.5-flash";

function getGeminiKeys(): string[] {
  return [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_BACKUP].filter((k): k is string => !!k);
}

async function callGemini(apiKey: string, prompt: string, jsonMode = false): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        ...(jsonMode ? { generationConfig: { responseMimeType: "application/json" } } : {}),
      }),
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

async function callGeminiWithFallback(prompt: string, jsonMode = false): Promise<string> {
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    throw new Error("Gemini isn't configured on the server yet (missing GEMINI_API_KEY).");
  }
  let lastError: unknown;
  for (const key of keys) {
    try {
      return await callGemini(key, prompt, jsonMode);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Gemini request failed.");
}

type GenerateCaptionInput = {
  draft: string;
  platform: string;
  brandName: string;
  toneWords: string[];
  writingSample: string;
  contentPillars: string[];
  context: string;
};

function buildCaptionPrompt(d: GenerateCaptionInput) {
  const lines = [
    `You are writing a social media caption for "${d.brandName || "this brand"}" to post on ${d.platform}.`,
    d.toneWords.length ? `Brand tone: ${d.toneWords.join(", ")}.` : "",
    d.writingSample ? `Match the voice of this writing sample:\n"${d.writingSample}"` : "",
    d.contentPillars.length ? `The brand's usual content pillars: ${d.contentPillars.join(", ")}.` : "",
    d.context.trim() ? `What this specific post is about: ${d.context.trim()}` : "",
    d.draft.trim()
      ? `Rewrite and polish this rough draft into a finished caption, keeping its core idea intact:\n"${d.draft.trim()}"`
      : `Write a short, scroll-stopping caption idea for this brand, drawing on its content pillars${d.context.trim() ? " and the context given above" : ""}.`,
    "Return only the caption text itself — no surrounding quotes, no explanation, no markdown.",
  ];
  return lines.filter(Boolean).join("\n\n");
}

export const generateCaption = createServerFn({ method: "POST" })
  .validator((data: GenerateCaptionInput) => data)
  .handler(async ({ data }) => callGeminiWithFallback(buildCaptionPrompt(data)));

type RegenerateVoiceInput = {
  brandName: string;
  currentSample: string;
  currentTone: string[];
  contentPillars: string[];
};

function buildVoicePrompt(d: RegenerateVoiceInput) {
  return [
    `Analyze the brand voice of "${d.brandName || "this brand"}" from this writing sample:`,
    `"${d.currentSample}"`,
    d.currentTone.length ? `Current tone words: ${d.currentTone.join(", ")}.` : "",
    d.contentPillars.length ? `Content pillars: ${d.contentPillars.join(", ")}.` : "",
    `Suggest a refined voice profile. Respond with ONLY a JSON object of the exact shape:`,
    `{"toneWords": ["word1", "word2", "word3", "word4"], "writingSample": "a two-to-three sentence rewritten sample in this voice"}`,
    `4 tone words, no more, no fewer. No markdown, no explanation — just the JSON object.`,
  ].filter(Boolean).join("\n\n");
}

export const regenerateVoiceProfile = createServerFn({ method: "POST" })
  .validator((data: RegenerateVoiceInput) => data)
  .handler(async ({ data }) => {
    const raw = await callGeminiWithFallback(buildVoicePrompt(data), true);
    let parsed: { toneWords?: unknown; writingSample?: unknown };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Gemini returned an unexpected format. Try again.");
    }
    const toneWords = Array.isArray(parsed.toneWords) ? parsed.toneWords.filter((t): t is string => typeof t === "string") : [];
    const writingSample = typeof parsed.writingSample === "string" ? parsed.writingSample : "";
    if (toneWords.length === 0 || !writingSample) throw new Error("Gemini returned an incomplete voice profile. Try again.");
    return { toneWords, writingSample };
  });

type ParseVoiceCommandInput = {
  transcript: string;
  brandName: string;
  toneWords: string[];
  writingSample: string;
  connectedPlatforms: string[];
};

function buildVoiceCommandPrompt(d: ParseVoiceCommandInput) {
  return [
    `A user of "${d.brandName || "this brand"}" spoke this voice command to draft a social media post:`,
    `"${d.transcript.trim()}"`,
    d.toneWords.length ? `Brand tone: ${d.toneWords.join(", ")}.` : "",
    d.writingSample ? `Match the voice of this writing sample:\n"${d.writingSample}"` : "",
    d.connectedPlatforms.length
      ? `The user's connected platforms are: ${d.connectedPlatforms.join(", ")}. If they named specific ones in the command, return only those (using these exact lowercase ids). If they didn't mention any platform, return an empty array.`
      : "",
    `Respond with ONLY a JSON object of the exact shape:`,
    `{"context": "a one-sentence summary of what the post should be about", "caption": "a finished, ready-to-post caption in the brand's voice", "platforms": ["..."]}`,
    `No markdown, no explanation — just the JSON object.`,
  ].filter(Boolean).join("\n\n");
}

export const parseVoiceCommand = createServerFn({ method: "POST" })
  .validator((data: ParseVoiceCommandInput) => data)
  .handler(async ({ data }) => {
    if (!data.transcript.trim()) throw new Error("Didn't catch anything — try again.");
    const raw = await callGeminiWithFallback(buildVoiceCommandPrompt(data), true);
    let parsed: { context?: unknown; caption?: unknown; platforms?: unknown };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Gemini returned an unexpected format. Try again.");
    }
    const context = typeof parsed.context === "string" ? parsed.context : "";
    const caption = typeof parsed.caption === "string" ? parsed.caption : "";
    const platforms = Array.isArray(parsed.platforms)
      ? parsed.platforms.filter((p): p is string => typeof p === "string" && data.connectedPlatforms.includes(p))
      : [];
    if (!caption) throw new Error("Couldn't turn that into a draft. Try again.");
    return { context, caption, platforms };
  });
