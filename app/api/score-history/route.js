import { NextResponse } from "next/server";
import { createAdminClient, bearerToken } from "../../../lib/supabase-server";

export async function GET(request) {
  const token = bearerToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server config error." }, { status: 500 });

  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const url = new URL(request.url);
  const brand = url.searchParams.get("brand") || "";
  const days  = Math.min(90, Math.max(7, parseInt(url.searchParams.get("days") || "30", 10)));

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const query = admin
    .from("visibility_scores")
    .select("recorded_date, score, chatgpt_score, gemini_score, claude_score, perplexity_score, grok_score")
    .eq("user_id", user.id)
    .gte("recorded_date", sinceStr)
    .order("recorded_date", { ascending: true });

  if (brand) query.ilike("brand", brand);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ history: data || [] });
}
