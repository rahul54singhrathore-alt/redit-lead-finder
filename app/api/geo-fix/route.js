import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { groqJSON, GroqError } from "../../../lib/groq";

// GEO Fix: given a prompt where the brand is NOT mentioned by AI engines,
// generate 3 copy-pasteable content pieces the user can publish TODAY to
// close the gap — a FAQ block, a community post, and JSON-LD schema markup.

const SYSTEM = `You are an expert GEO (Generative Engine Optimization) content strategist.
A brand is NOT being mentioned by AI engines (ChatGPT, Gemini, Claude, Perplexity) when users search for a specific query.
Generate 3 concrete, copy-pasteable content pieces to fix this. Each piece should directly help AI engines learn to associate this brand with the query.

Return ONLY valid JSON with this exact shape:
{
  "faq": {
    "question": "the FAQ question (close to the original query, naturally phrased)",
    "answer": "2-4 sentences answering the question and clearly mentioning the brand by name, its key benefits, and a call to action. Write it as if it will appear on the brand's website FAQ page."
  },
  "post": {
    "platform": "Reddit or Quora",
    "subreddit": "the most relevant subreddit or topic (e.g. r/SEO, r/SaaS)",
    "body": "A 3-5 sentence community post that naturally mentions the brand and answers the query topic. Should sound authentic, not promotional. First person, specific, helpful."
  },
  "schema": {
    "json": "A complete JSON-LD FAQ schema object as a string — valid JSON-LD with @context, @type FAQPage, and one mainEntity item matching the faq above. Include the brand name and key benefit in the acceptedAnswer."
  }
}`;

async function runWithClaude({ brand, prompt, category, missedEngines }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const categoryLine = category ? ` (category: ${category})` : "";
  const enginesLine = missedEngines?.length
    ? `Missing from: ${missedEngines.join(", ")}.`
    : "Missing from all AI engines.";

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1800,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Brand: "${brand}"${categoryLine}
User query where brand is NOT mentioned: "${prompt}"
${enginesLine}

Generate 3 content pieces to help "${brand}" appear when AI engines answer "${prompt}".`,
      },
    ],
  });

  const text = response.content[0]?.text || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in Claude response");
  return JSON.parse(match[0]);
}

async function runWithGroq({ brand, prompt, category, missedEngines }) {
  const categoryLine = category ? ` (category: ${category})` : "";
  const enginesLine = missedEngines?.length
    ? `Missing from: ${missedEngines.join(", ")}.`
    : "Missing from all AI engines.";

  return groqJSON({
    maxTokens: 1800,
    system: SYSTEM,
    user: `Brand: "${brand}"${categoryLine}
User query where brand is NOT mentioned: "${prompt}"
${enginesLine}

Generate 3 content pieces to help "${brand}" appear when AI engines answer "${prompt}".`,
  });
}

function validateFix(parsed, brand) {
  const faq = parsed?.faq || {};
  const post = parsed?.post || {};
  const schema = parsed?.schema || {};

  return {
    faq: {
      question: String(faq.question || "").trim() || `What is the best ${brand} alternative?`,
      answer: String(faq.answer || "").trim() || `${brand} is a great option for this.`,
    },
    post: {
      platform: String(post.platform || "Reddit").trim(),
      subreddit: String(post.subreddit || "r/SaaS").trim(),
      body: String(post.body || "").trim(),
    },
    schema: {
      json: String(schema.json || "").trim(),
    },
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brand = String(body?.brand || "").trim();
  const prompt = String(body?.prompt || "").trim();
  const category = String(body?.category || "").trim();
  const missedEngines = Array.isArray(body?.missedEngines) ? body.missedEngines : [];

  if (!brand || !prompt) {
    return NextResponse.json({ error: "brand and prompt are required." }, { status: 400 });
  }

  try {
    let parsed;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        parsed = await runWithClaude({ brand, prompt, category, missedEngines });
      } catch (claudeErr) {
        console.warn("Claude failed, falling back to Groq:", claudeErr.message);
        parsed = await runWithGroq({ brand, prompt, category, missedEngines });
      }
    } else {
      parsed = await runWithGroq({ brand, prompt, category, missedEngines });
    }

    return NextResponse.json({ brand, prompt, fix: validateFix(parsed, brand) });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GEO fix error:", error);
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
