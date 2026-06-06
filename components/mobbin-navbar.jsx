"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase";
import { LogIn, LogOut, User } from "lucide-react";

export default function MobbinNavbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="mobbin-navbar">
      <div className="mobbin-navbar-container">
        <Link href="/" className="mobbin-navbar-logo">
          <div className="mobbin-logo-icon">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="14" fill="#000" />
              <path d="M10 12h12M10 16h12M10 20h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="mobbin-navbar-title">LeadFinder</span>
        </Link>

        <div className="mobbin-navbar-links">
          <Link href="/" className="mobbin-navbar-link">Home</Link>
          <Link href="/dashboard" className="mobbin-navbar-link">Dashboard</Link>
          <Link href="/dashboard/keywords" className="mobbin-navbar-link">Keywords</Link>
        </div>

        <div className="mobbin-navbar-user">
          {loading ? (
            <div className="mobbin-loading" />
          ) : user ? (
            <>
              <div className="mobbin-user-avatar">
                {user.email?.charAt(0).toUpperCase() || <User size={16} />}
              </div>
              <button className="mobbin-logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <Link href="/signin" className="mobbin-signin-btn">
              <LogIn size={16} />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
