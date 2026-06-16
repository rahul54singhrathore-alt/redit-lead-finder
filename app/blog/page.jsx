"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { posts, formatPostDate } from "@/lib/posts";
import { SearchIcon, ArrowRightIcon, SparklesIcon } from "lucide-react";
import { PostThumbnail } from "@/components/post-thumbnail";

/* ── Newsletter strip ─────────────────────────────── */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (email) setDone(true);
  };
  return (
    <div className="blog-nl">
      <div className="blog-nl-left">
        <span className="blog-nl-icon"><SparklesIcon /></span>
        <div>
          <p className="blog-nl-title">Stay ahead of AI</p>
          <p className="blog-nl-sub">Weekly GEO tactics, straight to your inbox. No spam.</p>
        </div>
      </div>
      {done ? (
        <p className="blog-nl-done">✓ You're in — check your inbox.</p>
      ) : (
        <form className="blog-nl-form" onSubmit={submit}>
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="blog-nl-input"
          />
          <button type="submit" className="blog-nl-btn">Subscribe</button>
        </form>
      )}
    </div>
  );
}

const ALL = "All";

export default function BlogIndex() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(ALL);

  const allTags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [ALL, ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return posts.filter((p) => {
      const tag = activeTag === ALL || p.tags.includes(activeTag);
      const text = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return tag && text;
    });
  }, [search, activeTag]);

  const [hero, second, ...grid] = filtered;

  return (
    <main className="autosend-page">
      <SiteNavbar />

      <div className="blog3">

        {/* ── Hero ── */}
        <header className="blog3-hero">
          <span className="blog3-eyebrow">✦ From the Oras team</span>
          <h1>
            GEO guides, playbooks
            <br />
            <span className="blog3-hero-muted">and AI visibility insights</span>
          </h1>
          <p>Everything you need to get your brand recommended inside ChatGPT, Gemini, Claude, and Perplexity.</p>
        </header>

        {/* ── Top 2 featured ── */}
        {(hero || second) && (
          <div className="blog3-top">
            {hero && (
              <Link href={`/blog/${hero.slug}`} className="blog3-hero-card">
                <PostThumbnail post={hero} index={0} size="hero" />
                <div className="blog3-hero-body">
                  <div className="blog3-meta">
                    <time>{formatPostDate(hero.date)}</time>
                    {hero.tags.map((t) => <span key={t} className="b3-tag">{t}</span>)}
                  </div>
                  <h2>{hero.title}</h2>
                  <p>{hero.description}</p>
                  <span className="b3-read">Read article <ArrowRightIcon /></span>
                </div>
              </Link>
            )}
            {second && (
              <Link href={`/blog/${second.slug}`} className="blog3-side-card">
                <PostThumbnail post={second} index={1} size="side" />
                <div className="blog3-side-body">
                  <div className="blog3-meta">
                    <time>{formatPostDate(second.date)}</time>
                    {second.tags.map((t) => <span key={t} className="b3-tag">{t}</span>)}
                  </div>
                  <h2>{second.title}</h2>
                  <p>{second.description}</p>
                  <span className="b3-read">Read article <ArrowRightIcon /></span>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* ── Newsletter ── */}
        <Newsletter />

        {/* ── Search + tabs bar ── */}
        <div className="blog3-toolbar">
          <div className="blog3-tabs">
            {allTags.map((t) => (
              <button
                key={t}
                type="button"
                className={`blog3-tab${activeTag === t ? " blog3-tab-on" : ""}`}
                onClick={() => setActiveTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="blog3-search-wrap">
            <SearchIcon className="blog3-search-icon" />
            <input
              className="blog3-search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Grid ── */}
        {grid.length > 0 && (
          <>
            <p className="blog3-section-label">All posts</p>
            <ul className="blog3-grid">
              {grid.map((post, i) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="blog3-card">
                    <PostThumbnail post={post} index={i + 2} />
                    <div className="blog3-card-body">
                      <div className="blog3-meta">
                        <time>{formatPostDate(post.date)}</time>
                        {post.tags.map((t) => <span key={t} className="b3-tag">{t}</span>)}
                      </div>
                      <h3>{post.title}</h3>
                      <p>{post.description}</p>
                      <span className="b3-read">Read article <ArrowRightIcon /></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {filtered.length === 0 && (
          <p className="blog3-empty">No posts match — try a different search.</p>
        )}

        <footer className="oras-legal-foot">
          <Link href="/">← Back to home</Link>
          <Link href="/pricing">View pricing</Link>
        </footer>
      </div>
    </main>
  );
}
