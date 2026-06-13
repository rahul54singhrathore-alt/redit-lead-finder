import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-server";

function escapeCsv(val) {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toRow(cols, row) {
  return cols.map((c) => escapeCsv(row[c])).join(",");
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server config error." }, { status: 500 });
  }

  // Verify the JWT and get the user
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
  }

  const { data: leads, error } = await supabase
    .from("reddit_leads")
    .select("id, title, subreddit, keyword, intent, score, comments, url, status, posted_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cols = ["id", "title", "subreddit", "keyword", "intent", "score", "comments", "url", "status", "posted_at", "created_at"];
  const header = cols.join(",");
  const rows = (leads || []).map((r) => toRow(cols, r));
  const csv = [header, ...rows].join("\r\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="oras-signals.csv"',
    },
  });
}
