import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// AI Citation Tracker: which websites do AI assistants lean on as sources when
// answering buyer questions in this brand's space — and which sources (including
// the brand's own blog/site) are NOT being cited. The "missing" list is the
// brand's get-cited action list. Source picks are informed AI estimates.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brand = String(body?.brand || "").trim();
  const category = String(body?.category || "").trim();
  if (!brand) {
    return NextResponse.json({ error: "brand is required." }, { status: 400 });
  }

  const categoryLine = category ? ` in the "${category}" space` : "";

  try {
    const parsed = await groqJSON({
      maxTokens: 1500,
      system:
        "You analyze which websites AI assistants and search engines cite as sources when " +
        "answering buyer questions in a given category. Be realistic. " +
        "Return `cited`: the source websites AI typically references for this topic " +
        "(e.g. Reddit, G2, Capterra, Product Hunt, HubSpot, TechCrunch, industry blogs) — each " +
        "with a short note on why. Return `missing`: sources the brand should be cited on but " +
        "likely is NOT yet — ALWAYS include the brand's own Blog and Website, plus key directories/" +
        "communities it is probably absent from — each with a short note on how to get cited there. " +
        'Respond with ONLY a JSON object of the form ' +
        '{"cited": [{"name":"Reddit","note":"..."}], "missing": [{"name":"Your Blog","note":"..."}]}.',
      user:
        `Brand: "${brand}"${categoryLine}.\n` +
        `List the websites AI assistants cite as sources when recommending tools in this space ` +
        `(cited), and the important sources — including "${brand}"'s own blog and website — where ` +
        `it is likely NOT cited yet (missing), with a short get-cited note for each.`,
    });

    const clean = (arr) =>
      Array.isArray(arr)
        ? arr
            .map((item) => ({
              name: String(item?.name || "").trim(),
              note: String(item?.note || "").trim(),
            }))
            .filter((item) => item.name)
            .slice(0, 12)
        : [];

    return NextResponse.json({
      brand,
      cited: clean(parsed.cited),
      missing: clean(parsed.missing),
    });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
