import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "../../../../lib/supabase-server";
import { getTier, hasFeature } from "../../../../lib/subscription";

const FROM = process.env.DIGEST_FROM_EMAIL || "alerts@tryoras.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.tryoras.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function buildAlertHtml({ title, subreddit, intent, score, draft }) {
  const intentColor = intent === "High" ? "#16a34a" : intent === "Medium" ? "#d97706" : "#71717a";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
    <div style="padding:24px 28px 20px;border-bottom:1px solid #f4f4f5;">
      <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.1em;color:#71717a;text-transform:uppercase;">Oras Alert</p>
      <h1 style="margin:6px 0 0;font-size:20px;font-weight:700;color:#09090b;letter-spacing:-0.02em;">New high-intent signal found</h1>
    </div>
    <div style="padding:24px 28px;">
      <div style="background:#f9fafb;border-radius:8px;border:1px solid #e4e4e7;padding:16px 18px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#09090b;">${title}</p>
        <p style="margin:0;font-size:13px;color:#71717a;">
          r/${subreddit}&nbsp;&nbsp;·&nbsp;&nbsp;
          <span style="color:${intentColor};font-weight:600;">${intent} intent</span>&nbsp;&nbsp;·&nbsp;&nbsp;
          Score ${score}
        </p>
      </div>
      ${draft ? `<div style="margin-bottom:20px;"><p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;">Suggested reply</p><p style="margin:0;font-size:14px;color:#3f3f46;line-height:1.6;background:#f4f4f5;border-radius:6px;padding:12px 14px;">${draft}</p></div>` : ""}
      <a href="${APP_URL}/dashboard/reddit" style="display:inline-block;background:#09090b;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">Open Reddit Engine →</a>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #f4f4f5;text-align:center;">
      <p style="margin:0;font-size:11px;color:#a1a1aa;">Manage alerts at <a href="${APP_URL}/dashboard/alerts" style="color:#71717a;">tryoras.com/dashboard/alerts</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { userId, lead } = body || {};
  if (!userId || !lead) {
    return NextResponse.json({ error: "userId and lead are required." }, { status: 400 });
  }

  // Only send for High or Medium intent
  if (!["High", "Medium"].includes(lead.intent)) {
    return NextResponse.json({ skipped: true, reason: "Low intent — no alert sent." });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server config error." }, { status: 500 });
  }

  // Load user profile for tier + email
  const [{ data: profile }, { data: authUser }] = await Promise.all([
    supabase.from("user_profiles").select("subscription_tier").eq("user_id", userId).maybeSingle(),
    supabase.auth.admin.getUserById(userId),
  ]);

  const tierKey = profile?.subscription_tier || "free";
  const emailAlertsEnabled = hasFeature(tierKey, "emailAlerts");

  // Check if user has any active alert rules
  const { data: rules } = await supabase
    .from("alert_rules")
    .select("id")
    .eq("user_id", userId)
    .eq("active", true)
    .limit(1);

  const hasActiveRules = (rules?.length ?? 0) > 0;

  if (!emailAlertsEnabled || !hasActiveRules) {
    return NextResponse.json({ skipped: true, reason: "Email alerts not enabled or no active rules." });
  }

  const email = authUser?.user?.email;
  if (!email) {
    return NextResponse.json({ skipped: true, reason: "No email address found." });
  }

  const resend = getResend();
  if (!resend) {
    return NextResponse.json({ skipped: true, reason: "Resend not configured." });
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `⚡ ${lead.intent}-intent Reddit signal: "${lead.title?.slice(0, 60)}${lead.title?.length > 60 ? "…" : ""}"`,
      html: buildAlertHtml(lead),
    });
    return NextResponse.json({ sent: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Email send failed." }, { status: 502 });
  }
}
