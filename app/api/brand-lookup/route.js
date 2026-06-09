import { NextResponse } from "next/server";

import { INDUSTRY_OPTIONS } from "@/lib/workspace-profile";

// Keyword hints used to guess the brand's industry from its homepage copy.
const INDUSTRY_HINTS = {
  SEO: ["seo", "search engine", "geo", "serp", "backlink", "ranking", "keyword"],
  Marketing: ["marketing", "campaign", "advertis", "growth", "social media", "content"],
  AI: ["ai ", "artificial intelligence", "machine learning", "llm", "gpt", "agent"],
  SaaS: ["saas", "software", "platform", "dashboard", "api", "workflow", "automation"],
  "E-commerce": ["ecommerce", "e-commerce", "shop", "store", "checkout", "product catalog", "cart"],
};

function normalizeUrl(raw) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchMeta(html, names) {
  for (const name of names) {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`, "i"),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decodeEntities(match[1]);
    }
  }
  return "";
}

function guessIndustry(text) {
  const haystack = text.toLowerCase();
  let best = "";
  let bestScore = 0;
  for (const option of INDUSTRY_OPTIONS) {
    const hints = INDUSTRY_HINTS[option] || [];
    const score = hints.reduce((total, hint) => (haystack.includes(hint) ? total + 1 : total), 0);
    if (score > bestScore) {
      bestScore = score;
      best = option;
    }
  }
  return best;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const url = normalizeUrl(body?.url);
  if (!url) {
    return NextResponse.json({ error: "Enter a valid website URL." }, { status: 400 });
  }

  let html = "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "OrasBot/1.0 (+https://oras.com)" },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not reach the site (status ${response.status}).` },
        { status: 502 },
      );
    }
    html = (await response.text()).slice(0, 250000);
  } catch {
    return NextResponse.json(
      { error: "Could not reach that website. Check the URL and try again." },
      { status: 502 },
    );
  }

  const titleTag = decodeEntities((html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "");
  const ogSiteName = matchMeta(html, ["og:site_name"]);
  const ogTitle = matchMeta(html, ["og:title", "twitter:title"]);
  const description = matchMeta(html, ["description", "og:description", "twitter:description"]);

  // Prefer a clean brand name: site_name, then the part of the title before a separator.
  const rawName = ogSiteName || ogTitle || titleTag;
  const brandName = decodeEntities(rawName.split(/\s*[|\-–—:·]\s*/)[0] || rawName);

  const industry = guessIndustry(`${titleTag} ${ogTitle} ${description}`);

  return NextResponse.json({
    brandName,
    description,
    industry,
    websiteUrl: url.toString(),
  });
}
