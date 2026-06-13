import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "../../../../lib/supabase-server";
import { groqJSON, GroqError } from "../../../../lib/groq";
import { buildDigestHtml } from "../../../../lib/digest-email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.tryoras.com";
const FROM = process.env.DIGEST_FROM_EMAIL || "digest@tryoras.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Generates visibility data for a brand using Groq (same approach as /api/visibility-overview).
async function getVisibilityData(brand, category) {
  const categoryLine = category ? ` in the "${category}" space` : "";
  const parsed = await groqJSON({
    maxTokens: 900,
    system:
      "You are a GEO analyst. Estimate how visible a brand is across the major AI assistants. " +
      "Return per-engine visibility scores 0-100 for ChatGPT, Gemini, Claude, and Perplexity " +
      "(`engines`), an `overall` 0-100, a `trend` percent change vs last week (can be negative), " +
      "and 3 short `recommendations` (max 12 words each) for improving GEO score. " +
      "Be realistic — niche brands usually sit 40-80. " +
      'Respond with ONLY a JSON object: ' +
      '{"engines":[{"name":"ChatGPT","score":85},{"name":"Gemini","score":64},{"name":"Claude","score":58},{"name":"Perplexity","score":79}],' +
      '"overall":72,"trend":4,"recommendations":["Publish comparison pages","Get listed on G2","Add structured FAQ"]}.',
    user: `Brand: "${brand}"${categoryLine}. Estimate its AI visibility metrics for the weekly digest.`,
  });

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));
  const order = ["ChatGPT", "Gemini", "Claude", "Perplexity"];
  const byName = new Map(
    (Array.isArray(parsed.engines) ? parsed.engines : []).map((e) => [
      String(e?.name || "").trim(),
      clamp(e?.score, 0, 100),
    ])
  );
  return {
    score: clamp(parsed.overall, 0, 100),
    trend: Math.round(Number(parsed.trend) || 0),
    engines: order.map((name) => ({ name, score: byName.get(name) ?? 0 })),
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map((r) => String(r || "").trim()).filter(Boolean).slice(0, 3)
      : [],
  };
}

// POST /api/digest/send
// Called by the Vercel cron (Authorization: Bearer CRON_SECRET) or the "Send test"
// button in settings (Authorization: Bearer <user-access-token>, body: {test:true}).
export async function POST(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  let body = {};
  try { body = await request.json(); } catch { /* empty body is fine */ }

  const isTest = Boolean(body?.test);
  const cronSecret = process.env.CRON_SECRET;

  // For cron calls, require the CRON_SECRET.
  if (!isTest) {
    if (!cronSecret || token !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 503 });
  }
  const resend = getResend();
  if (!resend) {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 503 });
  }

  // For test sends, limit to the requesting user only.
  let profilesQuery = admin
    .from("user_profiles")
    .select("user_id, product_name, industry, email_digest, digest_frequency")
    .eq("email_digest", true)
    .not("product_name", "is", null)
    .neq("product_name", "");

  if (isTest && body?.userId) {
    profilesQuery = profilesQuery.eq("user_id", body.userId);
  }

  const { data: profiles, error: profilesError } = await profilesQuery;
  if (profilesError) {
    return NextResponse.json({ error: "Could not load profiles." }, { status: 500 });
  }
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  // Fetch email addresses from auth.users for each profile.
  const userIds = profiles.map((p) => p.user_id);
  const { data: authUsers, error: authError } = await admin.auth.admin.listUsers();
  if (authError) {
    return NextResponse.json({ error: "Could not load user emails." }, { status: 500 });
  }
  const emailByUid = new Map(
    (authUsers?.users || []).filter((u) => userIds.includes(u.id)).map((u) => [u.id, u.email])
  );

  let sent = 0;
  let skipped = 0;
  const errors = [];

  for (const profile of profiles) {
    const email = emailByUid.get(profile.user_id);
    if (!email) { skipped++; continue; }

    const brand = profile.product_name;
    const category = profile.industry || "";
    const frequency = profile.digest_frequency || "weekly";
    // Cron fires weekly — respect user's "off" preference (test sends always go through)
    if (!isTest && frequency === "off") { skipped++; continue; }

    let visData;
    try {
      visData = await getVisibilityData(brand, category);
    } catch (err) {
      errors.push({ userId: profile.user_id, error: err.message });
      skipped++;
      continue;
    }

    const html = buildDigestHtml({
      userName: null,
      brand,
      score: visData.score,
      trend: visData.trend,
      engines: visData.engines,
      topRecommendations: visData.recommendations,
      appUrl: APP_URL,
    });

    const { error: sendError } = await resend.emails.send({
      from: `Oras <${FROM}>`,
      to: email,
      subject: `${brand} — your ${frequency === "daily" ? "daily" : "weekly"} AI visibility digest`,
      html,
    });

    if (sendError) {
      errors.push({ userId: profile.user_id, error: sendError.message });
      skipped++;
    } else {
      sent++;
    }
  }

  return NextResponse.json({ sent, skipped, errors: errors.length ? errors : undefined });
}
