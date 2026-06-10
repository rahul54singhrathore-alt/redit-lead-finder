const SITE_URL = "https://www.tryoras.com";

// Allow public pages to be crawled by search engines and AI answer engines,
// but keep authenticated app routes and API endpoints out of the index.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/onboarding", "/api", "/auth"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
