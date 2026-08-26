import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session";
// iOS fetches the manifest and icons while installing to the home screen,
// before anyone has a session - they must not redirect to /login.
const PUBLIC_PATHS = ["/login", "/manifest.webmanifest"];
const PUBLIC_PREFIXES = ["/_next", "/favicon", "/icon-", "/apple-touch-icon"];

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  const secret = process.env.APP_PASSWORD;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const expected = secret ? await sha256Hex(`session:${secret}`) : null;

  // Fail closed: if the secret is missing/misconfigured, deny access rather
  // than letting every request through unauthenticated.
  if (!expected || token !== expected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
