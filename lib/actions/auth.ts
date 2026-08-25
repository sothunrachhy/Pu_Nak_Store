"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export async function loginAction(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const ok = await verifyPassword(password);
  if (!ok) {
    // Slow down naive automated brute-force attempts against the login form.
    await new Promise((resolve) => setTimeout(resolve, 750));
    return { error: "invalid" };
  }

  // "//evil.com" starts with "/" but browsers treat it as protocol-relative,
  // redirecting off-site — only allow a genuine same-origin path.
  const isSafeRedirect = next.startsWith("/") && !next.startsWith("//");
  await createSession();
  redirect(isSafeRedirect ? next : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
