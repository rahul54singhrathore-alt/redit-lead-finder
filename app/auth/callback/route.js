import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/";
  const redirectUrl = new URL(next, request.url);

  if (error) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(signinUrl);
  }
  
  if (code) {
    const response = NextResponse.redirect(redirectUrl);
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      const signinUrl = new URL("/signin", request.url);
      signinUrl.searchParams.set("error", exchangeError.message);
      return NextResponse.redirect(signinUrl);
    }

    return response;
  }

  const signinUrl = new URL("/signin", request.url);
  signinUrl.searchParams.set("error", "Missing authentication code.");
  return NextResponse.redirect(signinUrl);
}
