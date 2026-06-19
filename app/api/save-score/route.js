import { NextResponse } from "next/server";
import { createAdminClient, bearerToken } from "../../../lib/supabase-server";

export async function POST(request) {
  const token = bearerToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server config error." }, { status: 500 });

  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body." }, { status: 400 }); }

  const { brand, score, engines = [] } = body;
  if (!brand || score == null) return NextResponse.json({ error: "brand and score required." }, { status: 400 });

  const byKey = (k) => engines.find((e) => e.key === k)?.score ?? null;

  const today = new Date().toISOString().slice(0, 10);

  const { error } = await admin
    .from("visibility_scores")
    .upsert(
      {
        user_id:          user.id,
        brand,
        score,
        chatgpt_score:    byKey("chatgpt"),
        gemini_score:     byKey("gemini"),
        claude_score:     byKey("claude"),
        perplexity_score: byKey("perplexity"),
        recorded_date:    today,
      },
      { onConflict: "user_id,brand,recorded_date" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ saved: true });
}
