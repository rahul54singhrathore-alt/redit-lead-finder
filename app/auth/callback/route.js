import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/onboarding";

  if (error) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(signinUrl);
  }

  if (code) {
    // Capture cookies emitted during the code exchange so we can apply them to
    // the final redirect (whose destination depends on onboarding status).
    let cookiesToApply = [];
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToApply = cookiesToSet;
          },
        },
      },
    );

    const { data: exchangeData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      const signinUrl = new URL("/signin", request.url);
      signinUrl.searchParams.set("error", exchangeError.message);
      return NextResponse.redirect(signinUrl);
    }

    // Onboarding-aware routing: completed users go straight to the dashboard.
    let destination = next;
    const userId = exchangeData?.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("user_id", userId)
        .maybeSingle();
      if (profile?.onboarding_completed) {
        destination = "/dashboard";
      }
    }

    const response = NextResponse.redirect(new URL(destination, request.url));
    cookiesToApply.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  }

  const signinUrl = new URL("/signin", request.url);
  signinUrl.searchParams.set("error", "Missing authentication code.");
  return NextResponse.redirect(signinUrl);
}
