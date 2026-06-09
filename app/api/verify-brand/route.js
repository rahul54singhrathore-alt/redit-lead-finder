import { NextResponse } from "next/server";
import { groqJSON, GroqError, hasGroqKey } from "../../../lib/groq";

// Verifies whether a typed name is a real, recognizable brand/company/product
// that exists in the real world — so the checker only runs on real brands.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brand = String(body?.brand || "").trim();
  if (!brand) {
    return NextResponse.json({ error: "Brand is required." }, { status: 400 });
  }

  // If the AI key isn't configured, we can't verify — allow it through.
  if (!hasGroqKey()) {
    return NextResponse.json({ exists: true, known_for: "", verified: false });
  }

  try {
    const parsed = await groqJSON({
      maxTokens: 300,
      system:
        "You verify brand names. Given a name, decide if it is a real, recognizable " +
        "company, brand, or product that exists in the real world (anywhere worldwide). " +
        "Well-known and niche-but-real brands count as existing. Random gibberish, " +
        "made-up words, or names with no real-world entity do NOT exist. Be accurate. " +
        'Respond with ONLY a JSON object of the form ' +
        '{"exists": true|false, "known_for": "one short phrase, or empty"}.',
      user: `Does this brand exist in the real world? "${brand}"`,
    });

    return NextResponse.json({
      exists: Boolean(parsed.exists),
      known_for: parsed.known_for || "",
      verified: true,
    });
  } catch (error) {
    // On any AI error, fail open (allow) so the tool stays usable.
    const status = error instanceof GroqError && error.status === 401 ? 401 : 200;
    return NextResponse.json({ exists: true, known_for: "", verified: false }, { status });
  }
}
