"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function AuthNavActions({ primary = false }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setIsLoggedIn(Boolean(data.session));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="autosend-actions">
      <Link
        className={`autosend-button ${primary ? "autosend-button-primary" : "autosend-button-ghost"}`}
        href={isLoggedIn ? "/dashboard" : "/signin"}
      >
        {isLoggedIn ? "DASHBOARD" : "LOG IN"}
      </Link>
      <button className="autosend-menu" type="button" aria-label="Open menu">
        <MenuIcon aria-hidden="true" />
      </button>
    </div>
  );
}
