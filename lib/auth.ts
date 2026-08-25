import { cookies } from "next/headers";

const SESSION_COOKIE = "session";

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getExpectedToken() {
  const secret = process.env.APP_PASSWORD;
  if (!secret) {
    throw new Error("APP_PASSWORD environment variable is not set");
  }
  return sha256Hex(`session:${secret}`);
}

export async function createSession() {
  const token = await getExpectedToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    return token === (await getExpectedToken());
  } catch {
    return false;
  }
}

export async function verifyPassword(password: string) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    throw new Error("APP_PASSWORD environment variable is not set");
  }
  return password === expected;
}

export { SESSION_COOKIE };
