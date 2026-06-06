"use client";

import Link from "next/link";
import { AuthNavActions } from "@/components/auth-nav-actions";

export function SiteNavbar({ className = "" }) {
  const classNames = ["autosend-nav", "rankora-simple-nav", className]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classNames}>
      <Link className="autosend-brand" href="/">
        <img src="/logo.png" alt="" />
        <span>RANKORA</span>
      </Link>

      <AuthNavActions primary />
    </header>
  );
}
