"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { useI18n } from "@/lib/i18n";

export default function LoginForm() {
  const { t, lang, setLang } = useI18n();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="mb-6 flex overflow-hidden rounded-full border border-gray-300 text-xs">
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-3 py-1 ${lang === "en" ? "bg-gray-900 text-white" : "bg-white text-gray-600"}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLang("km")}
          className={`px-3 py-1 font-khmer ${lang === "km" ? "bg-gray-900 text-white" : "bg-white text-gray-600"}`}
        >
          ខ្មែរ
        </button>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold font-khmer">
          {t("appName")}
        </h1>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 font-khmer">
              {t("password")}
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-gray-900 focus:outline-none"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 font-khmer">{t("loginError")}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-gray-900 px-4 py-3 text-base font-medium text-white active:bg-gray-800 disabled:opacity-60 font-khmer"
          >
            {t("loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
