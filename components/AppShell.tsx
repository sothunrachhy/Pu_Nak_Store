"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { logoutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/", key: "dashboard", icon: "🏠" },
  { href: "/items", key: "items", icon: "👕" },
  { href: "/sales", key: "sales", icon: "🧾" },
  { href: "/expenses", key: "expenses", icon: "💸" },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <span className="text-lg font-semibold text-gray-900 font-khmer">
          {t("appName")}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full border border-gray-300 text-xs">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 ${
                lang === "en" ? "bg-gray-900 text-white" : "bg-white text-gray-600"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("km")}
              className={`px-2.5 py-1 font-khmer ${
                lang === "km" ? "bg-gray-900 text-white" : "bg-white text-gray-600"
              }`}
            >
              ខ្មែរ
            </button>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 active:bg-gray-100"
            >
              {t("logout")}
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-3 pb-24 pt-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-3xl">
          {NAV_ITEMS.map((navItem) => {
            const active =
              navItem.href === "/"
                ? pathname === "/"
                : pathname.startsWith(navItem.href);
            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-khmer ${
                  active ? "text-gray-900 font-medium" : "text-gray-400"
                }`}
              >
                <span className="text-xl leading-none">{navItem.icon}</span>
                {t(navItem.key)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
