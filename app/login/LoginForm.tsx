"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { useI18n } from "@/lib/i18n";
import { LockIcon } from "@/components/icons";

export default function LoginForm() {
  const { t, lang, setLang } = useI18n();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <div className="mb-6 flex overflow-hidden rounded-full border border-line text-xs">
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-3 py-1 transition-colors ${lang === "en" ? "bg-ink text-white" : "bg-surface text-muted"}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLang("km")}
          className={`px-3 py-1 transition-colors ${lang === "km" ? "bg-ink text-white" : "bg-surface text-muted"}`}
        >
          ខ្មែរ
        </button>
      </div>

      <div className="card w-full max-w-sm p-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
          <LockIcon className="h-6 w-6" />
        </div>
        <h1 className="mb-6 text-center font-heading text-xl font-semibold text-ink">
          {t("appName")}
        </h1>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              {t("password")}
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="input"
            />
          </div>

          {state?.error && <p className="text-sm text-danger">{t("loginError")}</p>}

          <button type="submit" disabled={pending} className="btn-primary mt-2">
            {t("loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
