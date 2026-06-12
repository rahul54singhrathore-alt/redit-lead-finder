import * as Sentry from "@sentry/nextjs";

// Loads the right Sentry config per runtime. Next.js calls register() once on
// server startup; the configs are no-ops unless NEXT_PUBLIC_SENTRY_DSN is set.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captures errors thrown in nested React Server Components.
export const onRequestError = Sentry.captureRequestError;
