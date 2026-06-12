import * as Sentry from "@sentry/nextjs";

// Server-side error tracking. Disabled until NEXT_PUBLIC_SENTRY_DSN is set,
// so this is a safe no-op until you create a Sentry project and add the DSN.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 1,
});
