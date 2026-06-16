import { getAllPosts } from "@/lib/posts";

const SITE_URL = "https://www.tryoras.com";

export default function sitemap() {
  const routes = [
    { path: "/",        priority: 1.0, changeFrequency: "weekly"  },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly"  },
    { path: "/tools",   priority: 0.9, changeFrequency: "weekly"  },
    { path: "/compare", priority: 0.8, changeFrequency: "monthly" },
    { path: "/blog",    priority: 0.8, changeFrequency: "weekly"  },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/signin",  priority: 0.4, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly"  },
    { path: "/terms",   priority: 0.2, changeFrequency: "yearly"  },
  ];

  const staticEntries = routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  const postEntries = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
