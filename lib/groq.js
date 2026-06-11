// Server-side Groq client. Groq exposes an OpenAI-compatible Chat Completions
// API, so we call it with plain fetch (no extra dependency) and use JSON mode
// so the model returns structured data we can parse. Used by the AI routes
// (visibility-check, mention-opportunities).

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Override with GROQ_MODEL in .env.local. The 8B instant model has a much higher
// free-tier daily token limit (~5x) than 70B and is far faster — best default to
// avoid hitting the daily cap. Set GROQ_MODEL=llama-3.3-70b-versatile for higher
// quality if you have the token budget (or upgrade your Groq tier).
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

export class GroqError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "GroqError";
    this.status = status;
  }
}

export function hasGroqKey() {
  return Boolean(process.env.GROQ_API_KEY);
}

// Calls Groq in JSON mode and returns the parsed object. The caller's prompts
// must instruct the model to return JSON in the expected shape.
export async function groqJSON({ system, user, maxTokens = 2000, model = DEFAULT_MODEL }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqError("GROQ_API_KEY is not configured on the server.", 503);
  }

  let response;
  try {
    response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    throw new GroqError("Could not reach Groq.", 502);
  }

  const raw = await response.json().catch(() => null);

  if (!response.ok) {
    const message = raw?.error?.message || "Groq request failed.";
    const status = response.status === 401 ? 401 : response.status === 429 ? 429 : 502;
    throw new GroqError(message, status);
  }

  const content = raw?.choices?.[0]?.message?.content;
  if (!content) {
    throw new GroqError("Empty response from Groq.", 502);
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new GroqError("Could not parse the AI response.", 502);
  }
}
