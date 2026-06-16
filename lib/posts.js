// Blog content lives here as structured data so we can render it without any
// markdown/MDX dependency. Each post has frontmatter-style metadata plus a
// `body` array of typed blocks the renderer understands:
//   { type: "h2", text }            section heading
//   { type: "p", text }             paragraph
//   { type: "ul", items: [...] }    bullet list
//   { type: "quote", text }         pull quote
//
// Posts are ordered newest-first in this array.

export const posts = [
  {
    slug: "geo-for-saas-startups",
    title: "GEO for SaaS startups: how to build AI visibility from zero",
    description:
      "Early-stage SaaS companies have a real advantage in GEO — you can build the right habits from day one. Here's exactly where to start when your brand is unknown to AI engines.",
    date: "2026-06-16",
    author: "The Oras Team",
    readMinutes: 7,
    tags: ["GEO", "Playbook"],
    body: [
      {
        type: "p",
        text: "If you're an early-stage SaaS company, AI engines don't know you exist yet — and that's actually an advantage. You get to build your GEO presence the right way from the start, without years of inconsistent positioning to undo. Here's the playbook.",
      },
      { type: "h2", text: "Start with entity clarity — before anything else" },
      {
        type: "p",
        text: "AI engines can only recommend what they can clearly understand. Before you build citations or create content, make sure your brand's identity is crisp and consistent everywhere. What category do you belong to? Who is it for? What makes you different from the three most obvious alternatives? Answer those three questions in one sentence and use that sentence — verbatim or very close to it — on your homepage, G2 profile, LinkedIn company page, Product Hunt listing, and every press kit.",
      },
      { type: "h2", text: "Launch on the platforms AI engines retrieve from" },
      {
        type: "ul",
        items: [
          "Product Hunt: an early launch drives a cluster of reviews and mentions that models retrieve as social proof.",
          "G2 and Capterra: list your product and actively gather reviews. Category and comparison pages on these sites are heavily retrieved.",
          "Crunchbase: fill in your full profile. Models treat Crunchbase listings as entity anchors.",
          "IndieHackers and BetaList: early-adopter communities whose content is frequently retrieved for emerging-tool queries.",
        ],
      },
      { type: "h2", text: "Get into the Reddit conversations early" },
      {
        type: "p",
        text: "Find the 5–10 subreddits where your target buyers ask 'what tool should I use for X' questions. Contribute genuinely and consistently before you ever mention your product. When it's relevant and you disclose your affiliation, name your product. Early Reddit presence compounds — threads from two years ago still get retrieved and cited in AI answers today.",
      },
      { type: "h2", text: "Build your comparison pages before your competitors do" },
      {
        type: "p",
        text: "\"Your brand vs. Competitor\" pages are the highest-retrieval content for comparison prompts, which are the prompts closest to a purchase decision. Build dedicated comparison pages for each of your top 3 competitors within your first three months. Write them factually, not as marketing copy — the model needs to be able to extract clear, attributable claims.",
      },
      {
        type: "quote",
        text: "You don't need to be big to win GEO. You need to be clear, consistent, and present in the sources that matter.",
      },
      { type: "h2", text: "Track your baseline from week one" },
      {
        type: "p",
        text: "Run your target prompts in ChatGPT, Gemini, Claude, and Perplexity every week. At first you'll almost certainly get nothing — that's expected. The point is establishing a baseline so you can see the moment your entity work and citations start landing. The brands that grow fastest in GEO are the ones that measure earliest.",
      },
    ],
  },
  {
    slug: "how-to-rank-on-perplexity",
    title: "How to rank on Perplexity: what's different and what to do",
    description:
      "Perplexity cites sources more explicitly than any other AI engine — which means the path to visibility there is different. Here's what actually works.",
    date: "2026-06-15",
    author: "The Oras Team",
    readMinutes: 5,
    tags: ["GEO", "Perplexity"],
    body: [
      {
        type: "p",
        text: "Perplexity is the most retrieval-heavy of the major AI engines. Where ChatGPT and Claude lean on training data, Perplexity actively searches the web and cites sources in every answer. That makes it both harder and more transparent to optimize for — you can see exactly which pages it's pulling from, which means you can see exactly where your gaps are.",
      },
      { type: "h2", text: "Why Perplexity is different" },
      {
        type: "ul",
        items: [
          "Every answer comes with citations — you can see the exact URLs driving each recommendation.",
          "Recency matters more: Perplexity weights fresh, indexed content more heavily than training-era data.",
          "Domain authority plays a larger role than on ChatGPT, since Perplexity is essentially a retrieval engine with a synthesis layer on top.",
          "Structured pages — FAQs, comparison tables, spec lists — extract cleanly and get cited more often.",
        ],
      },
      { type: "h2", text: "What to build for Perplexity visibility" },
      {
        type: "p",
        text: "The highest-retrieval pages on Perplexity are specific and factual: comparison pages, 'best of' roundups, review posts with star ratings, and Q&A pages that answer the exact prompts you care about. Publish content that makes confident, specific claims about your product — Perplexity retrieves pages it can extract a clear answer from, not marketing copy that hedges every sentence.",
      },
      { type: "h2", text: "Fix your indexing first" },
      {
        type: "p",
        text: "If your pages aren't indexed or are slow to crawl, Perplexity can't retrieve them. Check your sitemap, fix crawl errors, ensure your robots.txt doesn't block anything it shouldn't, and make sure new comparison and FAQ pages are submitted to Google Search Console immediately. Perplexity's crawler follows the same signals as Google's.",
      },
      {
        type: "quote",
        text: "Perplexity shows you the answer and the receipts. If your brand isn't cited, you can see exactly who is — and reverse-engineer what they did to get there.",
      },
      { type: "h2", text: "Monitor which sources Perplexity is citing for your category" },
      {
        type: "p",
        text: "Run your 10 most important prompts in Perplexity and note every source it cites for competitor recommendations. That list is your citation gap — the specific sites and pages you need to earn mentions on. Work through them systematically: pitch the authors, submit your product to the directories, and build the comparison pages that compete directly with those that are being cited.",
      },
    ],
  },
  {
    slug: "faq-schema-ai-visibility",
    title: "FAQ schema and structured data: the technical GEO checklist",
    description:
      "Structured data is one of the fastest technical wins for AI visibility. Here's exactly which markup to add, where, and why it gets your brand cited more often.",
    date: "2026-06-14",
    author: "The Oras Team",
    readMinutes: 5,
    tags: ["Technical", "GEO"],
    body: [
      {
        type: "p",
        text: "AI engines are much better at extracting clean, attributable answers from structured content than from prose. Adding FAQ schema, organization markup, and product structured data doesn't just help with Google — it makes every piece of content on your site dramatically easier for AI engines to retrieve and cite. Here's the checklist.",
      },
      { type: "h2", text: "FAQ schema — highest ROI for GEO" },
      {
        type: "p",
        text: "Add FAQ schema to every page that answers questions: your homepage FAQ section, your pricing page objection-handlers, your comparison pages, and any dedicated Q&A content. The schema should include the exact text of the question and the full answer, not just a summary. AI engines extract from the schema object directly, so the text quality matters as much as the markup.",
      },
      {
        type: "ul",
        items: [
          "Use @type: FAQPage with mainEntity containing multiple Question objects.",
          "Each Question must have a name (the question text) and an acceptedAnswer with @type: Answer and text.",
          "Keep answers factual and complete — they will be extracted verbatim.",
          "Include your brand name and category naturally in several answers so the extracted text has clear entity attribution.",
        ],
      },
      { type: "h2", text: "Organization markup — your entity anchor" },
      {
        type: "p",
        text: "Add Organization schema to your homepage with your full company name, URL, description, logo, and sameAs links to your G2, LinkedIn, Crunchbase, Twitter, and other profiles. This is how AI engines build their entity graph for your brand. The sameAs array is especially important — it tells models that all these profiles are the same entity.",
      },
      { type: "h2", text: "Product and SoftwareApplication markup" },
      {
        type: "p",
        text: "If you build software, add SoftwareApplication schema to your product pages. Include: name, applicationCategory, operatingSystem, offers (with price and priceCurrency), aggregateRating, and a clear description. Models retrieve this data when answering category and comparison prompts, and a structured product entry is far more likely to be cited than prose.",
      },
      { type: "h2", text: "BreadcrumbList and HowTo for instructional content" },
      {
        type: "p",
        text: "Step-by-step content with HowTo schema is extracted by AI engines for procedural queries. If you have any 'how to' guides or setup instructions in your docs or blog, add HowTo markup. Each Step should include a name and the full text of that step. Gemini and Perplexity in particular retrieve well-structured HowTo content for instructional prompts.",
      },
      {
        type: "quote",
        text: "Structured data is not just for search engines. It's the clearest signal you can give an AI engine about what your content means.",
      },
    ],
  },
  {
    slug: "comparison-pages-geo",
    title: "Why comparison pages are the highest-ROI content for GEO",
    description:
      "Comparison prompts are closest to a purchase decision — and comparison pages are the content AI engines retrieve most for them. Here's how to build them right.",
    date: "2026-06-13",
    author: "The Oras Team",
    readMinutes: 6,
    tags: ["Content", "GEO"],
    body: [
      {
        type: "p",
        text: "When a buyer types 'Notion vs Coda' or 'best HubSpot alternative' into an AI engine, that engine needs to find a clear, factual comparison to synthesize from. If you have a well-structured comparison page and your competitor doesn't, AI engines will pull your version — and your framing of the comparison becomes what the buyer reads. This is why comparison pages are pound-for-pound the most valuable content investment in GEO.",
      },
      { type: "h2", text: "Which comparisons to build first" },
      {
        type: "p",
        text: "Prioritize by prompt volume and purchase intent. Start with direct comparisons against your top 3 competitors and 'alternatives to [competitor]' pages for the tools buyers most often come from before choosing you. These are the prompts where someone is actively deciding, and they're the prompts AI engines retrieve comparison pages for most often.",
      },
      { type: "h2", text: "What makes a comparison page AI-retrievable" },
      {
        type: "ul",
        items: [
          "A clear, factual summary in the first 100 words that states what each product is and who it's best for.",
          "A feature comparison table with specific, verifiable claims — not vague adjectives.",
          "A pricing section with real numbers. AI engines extract pricing frequently for comparison queries.",
          "A 'who should choose X' section that makes direct, confident recommendations.",
          "FAQ schema at the bottom answering the top questions buyers have about the comparison.",
        ],
      },
      { type: "h2", text: "Tone: factual, not promotional" },
      {
        type: "p",
        text: "The biggest mistake brands make on comparison pages is writing marketing copy that's obviously one-sided. AI engines have seen thousands of examples of this and penalize it by ignoring pages that don't make extractable, attributable claims. Write as if you're explaining the comparison to a neutral third party: acknowledge your competitor's genuine strengths, be specific about where you're better, and let the facts speak.",
      },
      { type: "h2", text: "Build the link equity too" },
      {
        type: "p",
        text: "Comparison pages need to be discoverable to be retrieved. Link to them from your homepage, your pricing page, and your blog posts. Get them indexed quickly by submitting to Search Console. And build internal links from your main docs and feature pages to your comparison pages so they accumulate domain authority alongside your core content.",
      },
      {
        type: "quote",
        text: "A comparison page you own is a conversation about your product that you get to moderate. Build it before someone else does it for you.",
      },
    ],
  },
  {
    slug: "ai-search-vs-google-search",
    title: "AI search vs Google search: what the shift means for your brand",
    description:
      "A growing share of buyers are skipping Google entirely and asking AI engines directly. Here's what that shift means for brand discovery, consideration, and what you should do about it.",
    date: "2026-06-12",
    author: "The Oras Team",
    readMinutes: 6,
    tags: ["Fundamentals", "GEO"],
    body: [
      {
        type: "p",
        text: "The search paradigm is splitting. Buyers are increasingly going to ChatGPT, Gemini, Claude, or Perplexity for the research queries that used to start on Google — 'best CRM for startups,' 'what's the difference between X and Y,' 'alternatives to [tool I'm already using].' Those two channels operate by completely different rules, and brands that treat them the same are invisible in one of them.",
      },
      { type: "h2", text: "How buyer behavior differs" },
      {
        type: "ul",
        items: [
          "Google returns a list of ranked links. AI engines return a synthesized answer. The entire consideration stage can happen inside a single AI response.",
          "In Google search, rank #4 still gets clicks. In AI answers, if you're not named in the first response, you're not in the consideration set.",
          "Google searchers click through to your site. AI searchers often don't — the model has already extracted what it needs.",
          "Google's index is crawled and transparent. AI engines' training data and retrieval sources are partially opaque.",
        ],
      },
      { type: "h2", text: "What still matters from your Google investment" },
      {
        type: "p",
        text: "High-ranking pages on Google tend to be the same pages AI engines retrieve — because both rank high-authority, well-structured, frequently linked content. A strong SEO presence is the foundation of GEO, not an alternative to it. If your content ranks on page one for competitive keywords, it's likely being retrieved by at least some AI engines too.",
      },
      { type: "h2", text: "What changes" },
      {
        type: "p",
        text: "The new layer of work is everything SEO never cared about: community thread presence (Reddit, Quora), entity consistency across directories, comparison page coverage, and directly measuring your mention rate in AI answers. SEO tools won't show you any of this. You need a GEO-specific measurement layer to see it.",
      },
      {
        type: "quote",
        text: "Google tells you who ranked for a keyword. AI engines just tell the buyer who to choose. That's the difference — and it's enormous.",
      },
      { type: "h2", text: "How to prepare without abandoning SEO" },
      {
        type: "p",
        text: "You don't need to choose between SEO and GEO — they compound each other. The practical move is to add GEO-specific work on top of your existing SEO investment: measure your AI mention rate, fill the citation gaps, add FAQ schema to your most important pages, and build comparison pages for the prompts closest to a purchase decision. Start small, measure weekly, and scale what moves the needle.",
      },
    ],
  },
  {
    slug: "ai-visibility-metrics-guide",
    title: "The 6 AI visibility metrics every brand should track",
    description:
      "Mention rate, mention position, engine coverage, citation sources, answer accuracy, and competitor gap. Here's what each one means and how to use it.",
    date: "2026-06-11",
    author: "The Oras Team",
    readMinutes: 5,
    tags: ["Measurement", "GEO"],
    body: [
      {
        type: "p",
        text: "'Are we mentioned by AI engines?' is a yes/no question. 'How well are we doing in AI search?' requires six metrics. Here's what each one measures, why it matters, and what a good number looks like.",
      },
      { type: "h2", text: "1. Mention rate" },
      {
        type: "p",
        text: "The percentage of your tracked prompts in which your brand is named at least once. If you track 20 prompts and appear in 8 of them, your mention rate is 40%. This is the most fundamental metric — everything else is secondary to whether you're being named at all. Benchmark: strong brands in established categories hit 60–80% mention rates. New or niche brands often start below 20%.",
      },
      { type: "h2", text: "2. Mention position" },
      {
        type: "p",
        text: "Where you appear within an answer — first, second, or further down. Being named first in a list of recommendations has meaningfully higher conversion impact than being named third after two competitors. Track your average mention position across all engines, not just whether you're included.",
      },
      { type: "h2", text: "3. Engine coverage" },
      {
        type: "p",
        text: "How many of the major AI engines (ChatGPT, Gemini, Claude, Perplexity) mention you for a given prompt. A brand visible on only one engine is fragile — algorithm changes or training updates can eliminate that visibility overnight. Broad coverage across all four engines indicates a robust citation base that isn't dependent on any single model's preferences.",
      },
      { type: "h2", text: "4. Citation source coverage" },
      {
        type: "p",
        text: "The number and variety of high-trust sources citing your brand. AI engines don't just count mentions — they weight them by source authority. A brand appearing on 15 diverse, authoritative sources (Reddit, G2, TechCrunch, independent blog posts) has a much stronger citation profile than one appearing 15 times on its own domain.",
      },
      { type: "h2", text: "5. Answer accuracy" },
      {
        type: "p",
        text: "When AI engines describe your brand, is the description accurate? Outdated pricing, incorrect feature lists, or wrong category classification all reduce the quality of your visibility even when you're named. Monitor the actual text of AI answers about your brand weekly and flag inaccuracies — then update the source content the model is retrieving from.",
      },
      { type: "h2", text: "6. Competitor gap" },
      {
        type: "p",
        text: "The difference between your mention rate and the highest competitor's mention rate for the same set of prompts. A gap of 20 points or more in a prompt set that matters to you is a clear signal that citation and entity work is needed. The specific sources driving the competitor's higher rate are usually visible in the AI's cited sources — those are your highest-priority targets.",
      },
      {
        type: "quote",
        text: "Track all six metrics together. Mention rate without position tells half the story. Position without engine coverage misses fragility. The full picture is what drives the right decisions.",
      },
    ],
  },
  {
    slug: "chatgpt-recommend-your-brand",
    title: "How to get ChatGPT to recommend your brand",
    description:
      "ChatGPT recommendations aren't random — they follow predictable patterns you can influence. Here's a practical, step-by-step approach to getting named in the answers that matter.",
    date: "2026-06-04",
    author: "The Oras Team",
    readMinutes: 7,
    tags: ["GEO", "Playbook"],
    body: [
      {
        type: "p",
        text: "When a buyer asks ChatGPT \"what's the best tool for X,\" the model synthesizes everything it has seen across its training data and live retrieval. Getting recommended isn't about gaming an algorithm — it's about building a presence the model can confidently surface. Here's how to do it systematically.",
      },
      { type: "h2", text: "Step 1 — Know the exact prompts that matter" },
      {
        type: "p",
        text: "ChatGPT recommendations live or die on which prompts you're targeting. Start by mapping the category, comparison, and job-to-be-done questions your buyers actually ask: \"best project management tool for remote teams,\" \"alternatives to Asana,\" \"what should I use to manage client projects.\" These are the prompts you need to own, and they're the ones you should track weekly.",
      },
      { type: "h2", text: "Step 2 — Strengthen your entity" },
      {
        type: "p",
        text: "ChatGPT needs to understand who you are before it can recommend you. Your entity — the coherent, factual identity of your brand — must be consistent across your site, your third-party profiles, and the sources the model retrieves. Make sure your homepage, About page, and every listing site describes what you do, who it's for, and how you differ, in clear, jargon-free language.",
      },
      { type: "h2", text: "Step 3 — Earn mentions in high-trust sources" },
      {
        type: "ul",
        items: [
          "Reddit and Quora threads where real users answer the prompts you care about.",
          "Independent review posts on recognized industry blogs and news sites.",
          "Comparison pages on sites like G2, Capterra, and Product Hunt.",
          "Journalist coverage — even a brief mention in a trade publication raises your signal significantly.",
          "Your own comparison and \"vs.\" pages that give the model text to retrieve.",
        ],
      },
      { type: "h2", text: "Step 4 — Add structured content the model can extract" },
      {
        type: "p",
        text: "FAQ pages, structured schema markup, and clear heading hierarchies make it easier for ChatGPT to pull clean, attributable answers from your site. Write FAQ sections that answer the exact prompts you're targeting. Use FAQ schema so the information is surfaced cleanly. An answer that's easy to extract is an answer that gets cited.",
      },
      {
        type: "quote",
        text: "You can't negotiate with an AI model — but you can build the kind of evidence base it finds impossible to ignore.",
      },
      { type: "h2", text: "Step 5 — Measure and iterate" },
      {
        type: "p",
        text: "Run your target prompts across ChatGPT weekly. Track whether you're mentioned, where in the answer, and what sources the model cites. When a competitor appears instead of you, look at what they have that you don't — almost always it's a specific citation source or piece of content you can match. GEO is a compounding game: each new citation and piece of content raises your baseline.",
      },
    ],
  },
  {
    slug: "geo-vs-seo-key-differences",
    title: "GEO vs SEO: key differences and what still applies",
    description:
      "GEO and SEO share some DNA but follow different rules. Here's what changes when you optimize for AI answers instead of search rankings — and what you should keep doing either way.",
    date: "2026-05-28",
    author: "The Oras Team",
    readMinutes: 6,
    tags: ["GEO", "Fundamentals"],
    body: [
      {
        type: "p",
        text: "If you've spent years doing SEO, GEO will feel familiar in some places and foreign in others. Both disciplines are about being found when someone is looking for what you do. But the mechanics underneath are different enough that treating GEO as \"SEO for AI\" will leave you optimizing the wrong things.",
      },
      { type: "h2", text: "What's fundamentally different" },
      {
        type: "ul",
        items: [
          "SEO targets a ranked list; GEO targets a synthesized answer. There is no second place in an AI response — you're either named or you're not.",
          "SEO measures rank position and click-through rate. GEO measures mention rate, mention position within the answer, and answer accuracy.",
          "SEO traffic lands on your site and is visible in analytics. GEO mentions happen inside the AI's response — off-site, often without a link.",
          "SEO responds to backlink velocity and keyword density. GEO responds to entity clarity, citation source trust, and content that's easy to extract and quote.",
          "SEO is tied to a search index you can query. GEO is tied to model training data and live retrieval sources you can influence but not directly inspect.",
        ],
      },
      { type: "h2", text: "What still applies from SEO" },
      {
        type: "p",
        text: "High-quality content, authoritative backlinks, and technical site health all still matter — because the same sources that rank well in Google tend to be the sources AI engines retrieve from. A strong SEO presence is a prerequisite for GEO, not a replacement strategy.",
      },
      {
        type: "ul",
        items: [
          "Authoritative third-party coverage: still critical, just for different reasons.",
          "Structured data and schema markup: even more important — it helps models extract clean facts.",
          "Clear, factual writing: AI engines reward prose that makes confident, attributable claims.",
          "Page authority and domain trust: retrieval-augmented models weight sources the same way search engines do.",
        ],
      },
      { type: "h2", text: "The new priorities GEO adds" },
      {
        type: "p",
        text: "Beyond the SEO foundation, GEO requires deliberate work in areas SEO never cared about: community thread presence (Reddit, Quora), entity consistency across all profiles, comparison page coverage, and direct measurement of AI mention rates. These are not SEO tasks — they're a new layer on top.",
      },
      {
        type: "quote",
        text: "Think of SEO as the floor GEO is built on. You need the floor, but the floor alone won't get you recommended.",
      },
      { type: "h2", text: "Where to focus if you're starting from scratch" },
      {
        type: "p",
        text: "Audit your current SEO foundation first. If it's strong, move quickly to GEO-specific work: entity cleanup, community citations, and measurement. If your SEO foundation is weak, fixing it will give you both SEO and GEO returns — start there.",
      },
    ],
  },
  {
    slug: "top-citation-sources-ai-engines-trust",
    title: "The top citation sources AI engines trust",
    description:
      "AI engines don't treat all sources equally. Reddit threads, Quora answers, comparison sites, news coverage, and independent blogs each carry different weight. Here's what actually moves the needle.",
    date: "2026-05-21",
    author: "The Oras Team",
    readMinutes: 5,
    tags: ["Citations", "GEO"],
    body: [
      {
        type: "p",
        text: "When ChatGPT, Perplexity, or Gemini recommends a product, they're not pulling from thin air. They're synthesizing patterns from the sources they retrieve — and some sources carry dramatically more weight than others. Understanding the hierarchy is the fastest way to prioritize your citation-building efforts.",
      },
      { type: "h2", text: "Tier 1 — Community platforms (Reddit, Quora)" },
      {
        type: "p",
        text: "Reddit and Quora carry outsized weight because they're authentic, high-volume, and frequently retrieved. A product recommended in dozens of Reddit threads has a much stronger signal than a single press release. AI engines interpret community consensus as real-world validation. If your brand isn't appearing in relevant subreddits and Quora topic threads, this is your highest-leverage starting point.",
      },
      { type: "h2", text: "Tier 2 — Comparison and review sites" },
      {
        type: "ul",
        items: [
          "G2, Capterra, and Trustpilot: high-volume, structured data that models retrieve for product category queries.",
          "Product Hunt: early-adopter signal the model treats as social proof.",
          "Niche comparison sites (e.g., SaaSworthy, GetApp): category-specific authority that targets precise use cases.",
          "Independent \"best X\" roundups: blog posts from recognized authors that the model treats as editorial consensus.",
        ],
      },
      { type: "h2", text: "Tier 3 — News and trade press" },
      {
        type: "p",
        text: "Coverage in recognized publications — TechCrunch, Forbes, industry newsletters, trade journals — establishes legitimacy the model can point to. Even a brief mention in a credible outlet lifts your overall citation profile. Journalist outreach and PR efforts that would feel low-ROI for SEO often have outsized GEO impact.",
      },
      { type: "h2", text: "Tier 4 — Independent blog posts and creator content" },
      {
        type: "p",
        text: "Detailed, author-attributed blog posts from recognized creators in your space are retrieved when engines look for expert opinion. \"I tested five CRMs and here's what I found\" content is exactly what models quote. Seeding this kind of content — through partnerships, review programs, or content syndication — pays compounding returns.",
      },
      {
        type: "quote",
        text: "One strong Reddit thread can do more for your AI visibility than ten well-optimized landing pages.",
      },
      {
        type: "p",
        text: "The citations driving your competitors' recommendations are visible in Oras — every answer engine's response shows which sources it's drawing from, so you can see exactly where your gaps are and which citations to target next.",
      },
    ],
  },
  {
    slug: "write-brand-description-ai-understands",
    title: "How to write a brand description AI engines understand",
    description:
      "AI engines need to clearly understand who you are before they'll recommend you. Entity clarity and factual writing are the foundation. Here's how to get it right.",
    date: "2026-05-14",
    author: "The Oras Team",
    readMinutes: 4,
    tags: ["Content", "Fundamentals"],
    body: [
      {
        type: "p",
        text: "Before an AI engine will confidently recommend your brand, it needs to understand your brand — what you do, who you serve, how you differ from alternatives, and what category you belong to. This sounds obvious, but most company descriptions are written for humans who fill in context. AI models can't fill in context. They need it spelled out.",
      },
      { type: "h2", text: "The four elements of an AI-readable brand description" },
      {
        type: "ul",
        items: [
          "Category: name the category you belong to explicitly. \"Project management software\" is better than \"the modern way teams work.\"",
          "Audience: state who the product is for. \"Built for marketing agencies\" gives the model a retrieval hook.",
          "Differentiation: name one or two concrete ways you differ from alternatives. Avoid vague claims like \"powerful\" or \"easy to use.\"",
          "Proof: include a factual claim — a customer count, a notable integration, a recognizable customer name — that the model can treat as evidence.",
        ],
      },
      { type: "h2", text: "Entity consistency across the web" },
      {
        type: "p",
        text: "Your brand description should be materially consistent across your homepage, your About page, your G2 and Capterra profiles, your LinkedIn company page, your Crunchbase listing, and any press kit. When the model retrieves your brand from five different sources and sees the same core description, it builds confidence. When it sees contradictions — different positioning, different category labels — it hedges.",
      },
      { type: "h2", text: "What to avoid" },
      {
        type: "ul",
        items: [
          "Marketing language that makes no factual claims (\"transformative,\" \"next-generation,\" \"game-changing\").",
          "Category ambiguity — positioning yourself in three different categories across different pages.",
          "Outdated descriptions that still reference old product names, deprecated features, or incorrect pricing.",
          "Competitor comparisons written in a way that buries what you actually are.",
        ],
      },
      {
        type: "quote",
        text: "Write your brand description as if you're explaining it to someone with no prior context who will quote it directly. That's exactly what an AI model will do.",
      },
      {
        type: "p",
        text: "Run a quick audit: paste your homepage description, G2 listing, and LinkedIn summary side by side. If the category, audience, and differentiation don't match across all three, an AI model is reading three different brands — and won't confidently recommend any of them.",
      },
    ],
  },
  {
    slug: "what-is-geo-score",
    title: "What is a GEO Score and how is it calculated",
    description:
      "A GEO Score is a single number that tells you how visible your brand is across AI answer engines. Here's what goes into the score and how to interpret it.",
    date: "2026-05-07",
    author: "The Oras Team",
    readMinutes: 5,
    tags: ["Measurement", "GEO"],
    body: [
      {
        type: "p",
        text: "Tracking AI visibility across ChatGPT, Gemini, Claude, and Perplexity produces a lot of data — mention counts, mention positions, citation sources, answer accuracy, competitor comparisons. A GEO Score compresses all of that into one number so you can answer the question that matters most: \"am I winning or losing ground in AI recommendations?\"",
      },
      { type: "h2", text: "What a GEO Score measures" },
      {
        type: "ul",
        items: [
          "Mention rate: what percentage of your tracked prompts result in your brand being named?",
          "Mention position: are you named first, second, or buried after multiple competitors?",
          "Engine coverage: are you visible across all four major engines, or only one or two?",
          "Answer accuracy: when you're mentioned, is the description accurate and current?",
          "Competitor gap: how do your mention rates compare to the leading alternative in your category?",
        ],
      },
      { type: "h2", text: "How the components are weighted" },
      {
        type: "p",
        text: "Not all signals matter equally. Mention rate carries the most weight — if you're not named at all, nothing else matters. Mention position is next: being named first versus third in an answer has real behavioral impact on buyers. Engine coverage is weighted to reward presence across multiple platforms rather than dominance in one. Accuracy and competitor gap are secondary signals that influence the fine-grained score.",
      },
      { type: "h2", text: "How to read the score" },
      {
        type: "p",
        text: "A score above 70 indicates strong, consistent visibility — you're being recommended in most of your tracked prompts, across most engines, and your descriptions are accurate. A score between 40 and 70 means you're visible in some contexts but have meaningful gaps in prompt coverage, engine distribution, or citation depth. Below 40 indicates you're largely absent from AI recommendations and are likely losing consideration to competitors who have built a stronger GEO presence.",
      },
      {
        type: "quote",
        text: "A GEO Score isn't a vanity metric — it's a leading indicator. Brands that improve their score consistently are the ones AI engines recommend more often six months from now.",
      },
      { type: "h2", text: "What moves the score" },
      {
        type: "p",
        text: "The actions that move a GEO Score are the same ones that build real AI visibility: earning new citations on high-trust sources, improving entity clarity, publishing comparison content, and building community presence on Reddit and Quora. The score is designed to respond to these changes within days of them being indexed, so you get fast feedback on whether your GEO work is landing.",
      },
    ],
  },
  {
    slug: "reddit-quora-community-content-ai-recommendations",
    title: "Reddit and Quora: why community content drives AI recommendations",
    description:
      "Community platforms carry more weight with AI engines than almost any other source. Here's why — and how to build a community presence that shows up in AI answers.",
    date: "2026-05-01",
    author: "The Oras Team",
    readMinutes: 6,
    tags: ["Community", "Citations"],
    body: [
      {
        type: "p",
        text: "If you want to understand why some brands get recommended by AI engines and others don't, start with Reddit and Quora. These platforms appear as citation sources in AI answers more often than virtually any other category. The reason is simple: AI engines are trained on and retrieve from the open web, and community platforms are where real people ask real questions and give real opinions — exactly the kind of authentic signal models are designed to reflect.",
      },
      { type: "h2", text: "Why AI engines trust community content" },
      {
        type: "ul",
        items: [
          "Volume and recency: subreddits and Quora topics generate ongoing threads that models treat as fresh, crowd-validated information.",
          "Authenticity signals: first-person recommendations in community threads read differently to models than branded marketing copy.",
          "Question-answer structure: Quora's format maps directly to how AI engines process and retrieve information for question-answering tasks.",
          "Upvotes and engagement: heavily upvoted community answers signal consensus, which models interpret as reliability.",
        ],
      },
      { type: "h2", text: "How to build a Reddit presence that gets cited" },
      {
        type: "p",
        text: "The wrong approach is to post promotional content or create fake accounts — subreddits detect and remove this quickly, and it destroys your credibility with the community. The right approach is genuine participation: answer questions helpfully in relevant subreddits, mention your product only when it's directly relevant and disclose your affiliation, and make sure your product appears in \"best of\" and \"what do you use for X\" threads through earned recommendations from real users.",
      },
      { type: "h2", text: "How to build a Quora presence that gets cited" },
      {
        type: "p",
        text: "Quora rewards detailed, expert answers. Identify the questions in your category — \"what's the best tool for X,\" \"how do I solve Y\" — and write comprehensive answers that mention your product where it genuinely fits. Long-form, specific answers that cite data or examples consistently outperform brief promotional responses in both Quora ranking and AI engine retrieval.",
      },
      {
        type: "quote",
        text: "Community content is the one citation source you can't buy. It has to be earned — and that's exactly why AI engines weight it so heavily.",
      },
      { type: "h2", text: "Turning customer advocates into citations" },
      {
        type: "p",
        text: "Your most effective community citations won't come from you — they'll come from happy customers who organically recommend your product when someone asks. The highest-leverage community strategy is identifying which customers are already active on Reddit and Quora, and making sure they have everything they need to recommend you confidently: clear positioning, shareable comparison content, and an easy way to refer others. Their authentic endorsements become the community signal AI engines surface.",
      },
    ],
  },
  {
    slug: "what-is-generative-engine-optimization",
    title: "What is Generative Engine Optimization (GEO)?",
    description:
      "GEO is the practice of getting your brand recommended inside AI answers from ChatGPT, Gemini, Claude, and Perplexity. Here's how it differs from SEO and where to start.",
    date: "2026-06-10",
    author: "The Oras Team",
    readMinutes: 6,
    tags: ["GEO", "Fundamentals"],
    body: [
      {
        type: "p",
        text: "For two decades, being found online meant ranking on Google. Today a growing share of buyers never see a search results page at all — they ask ChatGPT, Gemini, Claude, or Perplexity a question and act on the answer. Generative Engine Optimization (GEO) is the discipline of making sure your brand is the one those engines name.",
      },
      { type: "h2", text: "GEO vs. SEO" },
      {
        type: "p",
        text: "SEO optimizes for a ranked list of blue links. GEO optimizes for a single synthesized answer. The difference matters: in search, ranking #3 still gets clicks; in an AI answer, if you aren't mentioned, you are invisible. There is no second page.",
      },
      {
        type: "ul",
        items: [
          "SEO rewards keywords and backlinks; GEO rewards entity clarity and citations the model trusts.",
          "SEO traffic is measurable in your analytics; GEO mentions happen off-site, inside the model's answer.",
          "SEO changes rank gradually; GEO mentions can shift the moment a model updates its training or retrieval sources.",
        ],
      },
      { type: "h2", text: "How AI engines decide who to recommend" },
      {
        type: "p",
        text: "Answer engines pull from a mix of their training data and live retrieval (web search, indexed pages, and high-trust sources like Reddit, Quora, comparison sites, and news). When a model recommends a product, it is reflecting the consensus it has seen across those sources. Brands that appear consistently, with clear descriptions and credible citations, get named first.",
      },
      {
        type: "quote",
        text: "If you aren't mentioned in the answer, you aren't in the consideration set — no matter how good your product is.",
      },
      { type: "h2", text: "Where to start" },
      {
        type: "ul",
        items: [
          "Measure your baseline: track which engines mention you for the prompts that matter, and which mention competitors instead.",
          "Find the gaps: identify prompts where competitors appear and you don't.",
          "Build citations: earn mentions on the high-authority sources models retrieve from.",
          "Strengthen your entity: add comparison pages, FAQ schema, and clear, factual descriptions of what you do.",
        ],
      },
      {
        type: "p",
        text: "Oras tracks all of this in one dashboard — your visibility score across each engine, competitor gaps, the citation sources behind every answer, and the specific actions that move you into the recommendation.",
      },
    ],
  },
  {
    slug: "track-brand-visibility-in-ai-answers",
    title: "How to track your brand's visibility across ChatGPT, Gemini, and Claude",
    description:
      "You can't improve what you don't measure. Here's a practical framework for monitoring how often AI answer engines mention your brand — and your competitors.",
    date: "2026-06-08",
    author: "The Oras Team",
    readMinutes: 5,
    tags: ["Measurement", "Playbook"],
    body: [
      {
        type: "p",
        text: "Brand visibility in AI answers is volatile. The same prompt can name you in ChatGPT, ignore you in Claude, and surface a competitor in Perplexity — and those results drift week to week. Tracking it manually doesn't scale. Here's a framework that does.",
      },
      { type: "h2", text: "1. Build a prompt set that mirrors real buyers" },
      {
        type: "p",
        text: "Start from the questions a prospective customer would actually ask: \"best CRM for startups,\" \"top influencer marketing platforms,\" \"alternatives to [competitor].\" These category and comparison prompts are where recommendations get made.",
      },
      { type: "h2", text: "2. Run the same prompts across every engine" },
      {
        type: "p",
        text: "Coverage matters. ChatGPT, Gemini, Claude, and Perplexity each weight sources differently, so a brand can be strong in one and absent in another. Track them side by side to see the full picture rather than a single engine's view.",
      },
      { type: "h2", text: "3. Score mentions, not just presence" },
      {
        type: "ul",
        items: [
          "Is your brand named at all?",
          "Is it named first, or buried after competitors?",
          "Is the description accurate, or outdated?",
          "Which sources is the engine citing to justify the answer?",
        ],
      },
      { type: "h2", text: "4. Watch the trend, not the snapshot" },
      {
        type: "p",
        text: "A single scan tells you where you stand today. Daily scans tell you whether you're gaining or losing ground — and whether the content and citation work you're doing is actually moving the needle.",
      },
      {
        type: "p",
        text: "Oras automates this end to end: daily scans across every engine, yesterday-vs-today mention tracking, competitor comparisons, and a single GEO score so you can see progress at a glance.",
      },
    ],
  },
  {
    slug: "why-ai-recommends-your-competitors",
    title: "Why AI engines recommend your competitors (and how to fix it)",
    description:
      "If ChatGPT keeps naming a competitor instead of you, it's usually for a reason you can diagnose — and fix. Here are the five most common causes.",
    date: "2026-06-05",
    author: "The Oras Team",
    readMinutes: 7,
    tags: ["Competitive", "Playbook"],
    body: [
      {
        type: "p",
        text: "When an answer engine recommends a competitor over you, it isn't random. The model is reflecting patterns in the sources it has seen. Diagnose the cause and you can usually close the gap. Here are the five we see most often.",
      },
      { type: "h2", text: "1. They have more high-authority citations" },
      {
        type: "p",
        text: "Models lean on sources they trust: established blogs, news, comparison sites, and active community threads. If a competitor appears across 15 such sources and you appear on 3, the model's consensus favors them. The fix is earning mentions on the sources that matter for your category.",
      },
      { type: "h2", text: "2. Your entity is unclear" },
      {
        type: "p",
        text: "If a model can't cleanly answer \"what is this company and what does it do,\" it hesitates to recommend you. Clear, consistent, factual descriptions across your site and third-party profiles strengthen your entity.",
      },
      { type: "h2", text: "3. You're missing comparison pages" },
      {
        type: "p",
        text: "\"X vs. Y\" and \"best [category]\" pages are exactly what engines retrieve when answering comparison prompts. If competitors have them and you don't, they own the narrative.",
      },
      { type: "h2", text: "4. Weak presence in community sources" },
      {
        type: "p",
        text: "Reddit, Quora, and forum threads carry outsized weight because they read as authentic. A competitor recommended repeatedly in those threads will surface in AI answers that draw on them.",
      },
      { type: "h2", text: "5. Outdated or thin structured data" },
      {
        type: "ul",
        items: [
          "Add FAQ schema so engines can extract clear answers.",
          "Add author and organization markup to reinforce credibility.",
          "Keep pricing, features, and positioning current — stale facts get you dropped.",
        ],
      },
      {
        type: "quote",
        text: "Every \"why not me?\" has a root cause. The brands that win GEO are the ones that diagnose it instead of guessing.",
      },
      {
        type: "p",
        text: "Oras explains why competitors appear for each prompt — the citations, entity coverage, and missing pages behind the answer — and turns it into a prioritized list of actions.",
      },
    ],
  },
];

export function getAllPosts() {
  return posts;
}

export function getPostBySlug(slug) {
  return posts.find((post) => post.slug === slug) || null;
}

export function formatPostDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}
