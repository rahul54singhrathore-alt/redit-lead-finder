"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { AuthNavActions } from "@/components/auth-nav-actions";

export function SiteNavbar({ className = "" }) {
  const [open, setOpen] = useState(false);

  const classNames = ["autosend-nav", "oras-simple-nav", className]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={classNames}>
        <Link className="autosend-brand" href="/">
          <img src="/logo.png" alt="" />
          <span>ORAS</span>
        </Link>

        <nav className="autosend-links" aria-label="Primary">
          <Link href="/pricing">Pricing</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="oras-nav-right">
          <AuthNavActions primary />
          <button
            type="button"
            className="oras-mobile-menu-btn"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(o => !o)}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {open && (
        <div className="oras-mobile-menu" onClick={() => setOpen(false)}>
          <Link href="/pricing">Pricing</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/signin">Sign in</Link>
        </div>
      )}
    </>
  );
}
