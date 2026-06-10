import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNavbar } from "@/components/site-navbar";
import { getAllPosts, getPostBySlug, formatPostDate } from "@/lib/posts";

// Pre-render every post at build time.
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function Block({ block }) {
  switch (block.type) {
    case "h2":
      return <h2>{block.text}</h2>;
    case "p":
      return <p>{block.text}</p>;
    case "quote":
      return <blockquote>{block.text}</blockquote>;
    case "ul":
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  // JSON-LD so search and AI engines can parse the article cleanly — fitting
  // for a product about being understood by answer engines.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Oras" },
    mainEntityOfPage: `https://www.tryoras.com/blog/${post.slug}`,
  };

  return (
    <main className="autosend-page">
      <SiteNavbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="oras-legal oras-post">
        <header className="oras-legal-head">
          <Link className="oras-post-back" href="/blog">
            ← All articles
          </Link>
          <h1>{post.title}</h1>
          <p className="oras-legal-meta">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time> ·{" "}
            {post.readMinutes} min read · {post.author}
          </p>
        </header>

        <div className="oras-post-body">
          {post.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        <section className="oras-post-cta">
          <h2>See where AI engines mention your brand</h2>
          <p>
            Oras tracks your visibility across ChatGPT, Gemini, Claude, and
            Perplexity, finds competitor gaps, and tells you what to fix.
          </p>
          <Link className="autosend-button autosend-button-primary" href="/#check">
            Check your visibility free
          </Link>
        </section>

        <footer className="oras-legal-foot">
          <Link href="/blog">← All articles</Link>
          <Link href="/pricing">View pricing</Link>
        </footer>
      </article>
    </main>
  );
}
