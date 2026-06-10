import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/onboarding";

  const redirectToSignin = (message) => {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("error", message);
    return NextResponse.redirect(signinUrl);
  };

  // Provider returned an explicit error (e.g. user cancelled OAuth).
  if (error) {
    return redirectToSignin(errorDescription || error);
  }

  // Neither auth method present — nothing to exchange.
  if (!code && !tokenHash) {
    return redirectToSignin("Missing authentication code.");
  }

  // Capture cookies emitted during the exchange so we can apply them to the
  // final redirect (whose destination depends on onboarding status).
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

  // Two sign-in paths land here:
  //   - OAuth / PKCE magic-link  -> `code`        -> exchangeCodeForSession
  //   - Email OTP magic-link     -> `token_hash`  -> verifyOtp
  let authData;
  let authError;
  if (code) {
    ({ data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    ({ data: authData, error: authError } = await supabase.auth.verifyOtp({
      type: type || "email",
      token_hash: tokenHash,
    }));
  }

  if (authError) {
    return redirectToSignin(authError.message);
  }

  // Onboarding-aware routing: completed users go straight to the dashboard.
  let destination = next;
  const userId = authData?.user?.id;
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
