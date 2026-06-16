"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { posts, formatPostDate } from "@/lib/posts";
import { SearchIcon } from "lucide-react";

const THUMB_GRADIENTS = [
  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
  "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)",
  "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",
  "linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #6366f1 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)",
  "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)",
];

function PostThumbnail({ post, index, large = false }) {
  const gradient = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];
  return (
    <div
      className={`blog-thumb${large ? " blog-thumb-large" : ""}`}
      style={{ background: gradient }}
      aria-hidden="true"
    >
      <div className="blog-thumb-pattern" />
      <div className="blog-thumb-tag">{post.tags[0]}</div>
      <div className="blog-thumb-title">{post.title}</div>
    </div>
  );
}

const ALL_CATS = "All";

export default function BlogIndex() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(ALL_CATS);

  const allTags = useMemo(() => {
    const tags = new Set();
    posts.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return [ALL_CATS, ...Array.from(tags)];
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return posts.filter((p) => {
      const matchesTag = activeTag === ALL_CATS || p.tags.includes(activeTag);
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesTag && matchesSearch;
    });
  }, [search, activeTag]);

  const [featured, ...rest] = filtered;

  return (
    <main className="autosend-page">
      <SiteNavbar />

      <div className="oras-blog2">
        {/* Hero */}
        <header className="oras-blog2-hero">
          <h1>
            <span className="oras-blog2-hero-color">Guides, playbooks, and insights</span>
            <br />
            from the Oras team
          </h1>
          <p>Practical strategies for getting your brand recommended inside AI answers.</p>
        </header>

        {/* Featured post */}
        {featured && (
          <div className="oras-blog2-featured">
            <Link href={`/blog/${featured.slug}`} className="oras-blog2-featured-thumb">
              <PostThumbnail post={featured} index={0} large />
            </Link>
            <div className="oras-blog2-featured-body">
              <div className="oras-blog2-featured-meta">
                <time>{formatPostDate(featured.date)}</time>
                {featured.tags.map((t) => (
                  <span key={t} className="blog2-tag">{t}</span>
                ))}
              </div>
              <h2>
                <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p>{featured.description}</p>
              <div className="oras-blog2-featured-foot">
                <span className="blog2-author">
                  <span className="blog2-author-avatar">O</span>
                  {featured.author}
                </span>
                <Link href={`/blog/${featured.slug}`} className="blog2-readmore">
                  Read article →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="oras-blog2-search-wrap">
          <SearchIcon className="oras-blog2-search-icon" />
          <input
            className="oras-blog2-search"
            placeholder="Search the blog…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category tabs */}
        <div className="oras-blog2-tabs">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`oras-blog2-tab${activeTag === tag ? " oras-blog2-tab-active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        {rest.length > 0 && (
          <>
            <p className="oras-blog2-all-label">ALL POSTS</p>
            <ul className="oras-blog2-grid">
              {rest.map((post, i) => (
                <li key={post.slug}>
                  <article className="oras-blog2-card">
                    <Link href={`/blog/${post.slug}`} className="oras-blog2-card-thumb-link">
                      <PostThumbnail post={post} index={i + 1} />
                    </Link>
                    <div className="oras-blog2-card-body">
                      <div className="oras-blog2-card-meta">
                        <time>{formatPostDate(post.date)}</time>
                        {post.tags.map((t) => (
                          <span key={t} className="blog2-tag">{t}</span>
                        ))}
                      </div>
                      <h2>
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p>{post.description}</p>
                      <div className="oras-blog2-card-foot">
                        <span className="blog2-author">
                          <span className="blog2-author-avatar">O</span>
                          {post.author}
                        </span>
                        <Link href={`/blog/${post.slug}`} className="blog2-readmore">
                          Read article →
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </>
        )}

        {filtered.length === 0 && (
          <p className="oras-blog2-empty">No posts match your search.</p>
        )}

        <footer className="oras-legal-foot">
          <Link href="/">← Back to home</Link>
          <Link href="/pricing">View pricing</Link>
        </footer>
      </div>
    </main>
  );
}
