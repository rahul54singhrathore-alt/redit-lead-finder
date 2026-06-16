import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
};

// Wraps the build for Sentry. Source-map upload only runs when SENTRY_ORG/
// SENTRY_PROJECT/SENTRY_AUTH_TOKEN are set; otherwise it's a harmless no-op.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  disableLogger: true,
  disableSourceMapUpload: !process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
});
