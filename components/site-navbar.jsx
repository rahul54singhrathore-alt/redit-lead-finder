"use client";

import Link from "next/link";
import { AuthNavActions } from "@/components/auth-nav-actions";

export function SiteNavbar({ className = "" }) {
  const classNames = ["autosend-nav", "oras-simple-nav", className]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classNames}>
      <nav className="autosend-links" aria-label="Primary">
        <Link href="/#docs">How it works</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/blog">Blog</Link>
      </nav>

      <AuthNavActions primary />
    </header>
  );
}
