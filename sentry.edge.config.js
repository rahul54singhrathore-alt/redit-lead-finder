import * as Sentry from "@sentry/nextjs";

// Edge-runtime error tracking (middleware, edge routes). Disabled until
// NEXT_PUBLIC_SENTRY_DSN is set.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 1,
});
