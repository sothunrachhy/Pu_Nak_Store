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
    return { error: "invalid" };
  }

  await createSession();
  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
