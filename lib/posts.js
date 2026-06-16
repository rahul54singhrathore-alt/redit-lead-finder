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
