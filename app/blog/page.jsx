import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { getAllPosts, formatPostDate } from "@/lib/posts";

export const metadata = {
  title: "Blog",
  description:
    "Guides and playbooks on Generative Engine Optimization (GEO), AI visibility, and getting your brand recommended by ChatGPT, Gemini, Claude, and Perplexity.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="autosend-page">
      <SiteNavbar />

      <div className="oras-blog">
        <header className="oras-blog-head">
          <span className="oras-legal-eyebrow">BLOG</span>
          <h1>GEO &amp; AI visibility playbooks</h1>
          <p className="oras-blog-intro">
            Practical guides on getting your brand recommended inside AI answers.
          </p>
        </header>

        <ul className="oras-blog-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="oras-blog-card">
                <div className="oras-blog-card-meta">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readMinutes} min read</span>
                </div>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.description}</p>
                <div className="oras-blog-tags">
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <Link className="oras-blog-readmore" href={`/blog/${post.slug}`}>
                  Read article →
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <footer className="oras-legal-foot">
          <Link href="/">← Back to home</Link>
          <Link href="/pricing">View pricing</Link>
        </footer>
      </div>
    </main>
  );
}
