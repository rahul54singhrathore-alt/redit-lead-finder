"use client";

import Link from "next/link";
import { AuthNavActions } from "@/components/auth-nav-actions";

export function SiteNavbar({ className = "" }) {
  const classNames = ["autosend-nav", "oras-simple-nav", className]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classNames}>
      <Link className="autosend-brand" href="/">
        <img src="/logo.png" alt="" />
        <span>ORAS</span>
      </Link>

      <AuthNavActions primary />
    </header>
  );
}
