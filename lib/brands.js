// Curated dataset of well-known real brands for autocomplete suggestions.
// Grouped loosely by category but stored as a flat, de-duplicated list.

export const BRANDS = [
  // SEO / AI visibility / marketing tools
  "Ahrefs", "Semrush", "Moz", "Surfer SEO", "Clearscope", "MarketMuse", "SE Ranking",
  "Screaming Frog", "Sistrix", "Serpstat", "Mangools", "Ubersuggest", "Profound",
  "Otterly", "Peec AI", "Scrunch AI", "Writesonic", "Jasper", "Copy.ai", "Frase",
  "SpyFu", "BrightEdge", "Conductor", "seoClarity", "Rankora",
  // SaaS / productivity
  "Notion", "Coda", "Airtable", "Asana", "Trello", "ClickUp", "Monday.com", "Jira",
  "Linear", "Basecamp", "Slack", "Microsoft Teams", "Zoom", "Loom", "Calendly",
  "Miro", "Figma", "Canva", "Webflow", "Framer", "Wix", "Squarespace", "WordPress",
  "Shopify", "Wordpress", "Ghost", "Substack", "Zapier", "Make", "Retool",
  // CRM / sales / marketing
  "Salesforce", "HubSpot", "Pipedrive", "Zoho", "Mailchimp", "Klaviyo", "ActiveCampaign",
  "Intercom", "Drift", "Zendesk", "Freshworks", "Marketo", "Pardot", "Brevo", "ConvertKit",
  // Analytics / data
  "Google Analytics", "Mixpanel", "Amplitude", "Hotjar", "Segment", "Heap", "Looker",
  "Tableau", "Power BI", "Snowflake", "Databricks", "Metabase",
  // Dev / infra
  "GitHub", "GitLab", "Bitbucket", "Vercel", "Netlify", "Cloudflare", "AWS", "Google Cloud",
  "Microsoft Azure", "DigitalOcean", "Heroku", "Supabase", "Firebase", "MongoDB", "PostgreSQL",
  "Stripe", "PayPal", "Razorpay", "Plaid", "Twilio", "SendGrid", "Postman", "Sentry", "Datadog",
  // AI / ML
  "OpenAI", "ChatGPT", "Anthropic", "Claude", "Google Gemini", "Perplexity", "Midjourney",
  "Stability AI", "Hugging Face", "Cohere", "Mistral AI", "Runway", "ElevenLabs", "Replicate",
  "Character.AI", "Pika", "Suno",
  // Consumer / big tech
  "Apple", "Google", "Microsoft", "Amazon", "Meta", "Netflix", "Spotify", "Adobe",
  "Samsung", "Sony", "Nvidia", "Intel", "Tesla", "Uber", "Airbnb", "Lyft", "DoorDash",
  "Instacart", "Pinterest", "Snapchat", "TikTok", "LinkedIn", "Reddit", "Quora", "X",
  "YouTube", "WhatsApp", "Telegram", "Discord", "Twitch", "Dropbox", "Box", "Evernote",
  // E-commerce / retail
  "Walmart", "Target", "Best Buy", "eBay", "Etsy", "Alibaba", "Flipkart", "Myntra",
  "Nykaa", "Zomato", "Swiggy", "Wayfair", "Chewy", "Shein", "Temu",
  // Fashion / lifestyle
  "Nike", "Adidas", "Puma", "Zara", "H&M", "Uniqlo", "Levi's", "Gucci", "Louis Vuitton",
  // Food / beverage
  "Coca-Cola", "Pepsi", "Starbucks", "McDonald's", "Domino's", "Nestle", "Red Bull",
  // Finance / fintech
  "Visa", "Mastercard", "American Express", "Chime", "Robinhood", "Coinbase", "Revolut",
  "Wise", "Square", "Klarna", "Affirm", "Paytm", "PhonePe",
  // Travel / automotive
  "Booking.com", "Expedia", "Marriott", "Hilton", "BMW", "Mercedes-Benz", "Audi", "Toyota",
  "Honda", "Ford", "Volkswagen",
];

const SORTED = [...new Set(BRANDS)].sort((a, b) => a.localeCompare(b));

// Returns brand suggestions matching the query. Prefix matches rank first,
// then substring matches. Empty query returns a few popular defaults.
export function searchBrands(query, limit = 8) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) {
    return ["Ahrefs", "Semrush", "Notion", "HubSpot", "Shopify", "OpenAI"].slice(0, limit);
  }
  const prefix = [];
  const contains = [];
  for (const name of SORTED) {
    const lower = name.toLowerCase();
    if (lower.startsWith(q)) prefix.push(name);
    else if (lower.includes(q)) contains.push(name);
    if (prefix.length >= limit) break;
  }
  return [...prefix, ...contains].slice(0, limit);
}

