import { NextResponse } from "next/server";

import { enginesStatus, fallbackAvailable } from "../../../lib/engines";

// Reports which AI engines are live (their own provider key is configured) vs.
// falling back to Groq. Returns NO secrets — only booleans, labels, and model
// names — so it is safe to call from the dashboard.

export async function GET() {
  return NextResponse.json({
    engines: enginesStatus(),
    fallbackAvailable: fallbackAvailable(),
  });
}
