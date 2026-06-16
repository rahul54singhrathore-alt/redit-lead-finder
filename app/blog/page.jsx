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

  const [hero] = filtered;
  const grid = filtered.slice(3);

  return (
    <main className="autosend-page">
      <SiteNavbar />

      <div className="blog3">

        {/* ── Hero ── */}
        <header className="blog3-hero">
          {/* Floating engine badges */}
          <span className="blog3-float blog3-float-1">ChatGPT</span>
          <span className="blog3-float blog3-float-2">Gemini</span>
          <span className="blog3-float blog3-float-3">Claude</span>
          <span className="blog3-float blog3-float-4">Perplexity</span>
          <span className="blog3-float blog3-float-5">Reddit</span>
          <span className="blog3-float blog3-float-6">GEO Score</span>

          <div className="blog3-hero-inner">
            <span className="blog3-eyebrow">✦ From the Oras team</span>
            <h1>
              GEO guides, playbooks
              <br />
              <span className="blog3-hero-muted">and AI visibility insights</span>
            </h1>
            <p>Everything you need to get your brand recommended inside AI answers — practical, jargon-free, and updated weekly.</p>
            <div className="blog3-hero-stats">
              <span><strong>{posts.length}</strong> articles</span>
              <span className="blog3-hero-dot" />
              <span><strong>{posts.reduce((s, p) => s + p.readMinutes, 0)}+</strong> min of GEO content</span>
              <span className="blog3-hero-dot" />
              <span>Free to read</span>
            </div>
            <a href="#posts" className="blog3-hero-cta">Browse all articles ↓</a>
          </div>
        </header>

        {/* ── Featured section ── */}
        {hero && (
          <div className="blog3-featured">
            {/* Big hero card */}
            <Link href={`/blog/${hero.slug}`} className="blog3-fc-main">
              <PostThumbnail post={hero} index={0} size="hero" />
              <div className="blog3-fc-main-body">
                <div className="blog3-meta">
                  <span className="blog3-featured-label">Featured</span>
                  <time>{formatPostDate(hero.date)}</time>
                  {hero.tags.map((t) => <span key={t} className="b3-tag">{t}</span>)}
                </div>
                <h2>{hero.title}</h2>
                <p>{hero.description}</p>
                <span className="b3-read">Read article <ArrowRightIcon /></span>
              </div>
            </Link>

            {/* Two stacked secondary cards */}
            {(filtered[1] || filtered[2]) && (
              <div className="blog3-fc-stack">
                {[filtered[1], filtered[2]].filter(Boolean).map((post, i) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="blog3-fc-small">
                    <PostThumbnail post={post} index={i + 1} size="small" />
                    <div className="blog3-fc-small-body">
                      <div className="blog3-meta">
                        <time>{formatPostDate(post.date)}</time>
                        {post.tags.map((t) => <span key={t} className="b3-tag">{t}</span>)}
                      </div>
                      <h3>{post.title}</h3>
                      <span className="b3-read">Read <ArrowRightIcon /></span>
                    </div>
                  </Link>
                ))}
              </div>
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
            <p className="blog3-section-label" id="posts">All posts</p>
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
