import { NextResponse } from "next/server";

function hasSupabaseAuthSession(request) {
  return request.cookies.getAll().some((cookie) => {
    const name = cookie.name.toLowerCase();
    return (
      name.startsWith("sb-") &&
      name.includes("auth-token") &&
      !name.includes("code-verifier") &&
      Boolean(cookie.value)
    );
  });
}

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const hasSession = hasSupabaseAuthSession(request);
  const isPrivatePath = path.startsWith("/dashboard") || path.startsWith("/onboarding");

  // If logged in and on signin, go to dashboard
  if (hasSession && path === "/signin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If not logged in and trying to access private paths, go to signin
  if (!hasSession && isPrivatePath) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/dashboard/:path*", "/onboarding"],
};
