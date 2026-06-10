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
