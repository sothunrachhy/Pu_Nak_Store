"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { logoutAction } from "@/lib/actions/auth";
import { HomeIcon, LogoutIcon, ReceiptIcon, TagIcon, WalletIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/", key: "dashboard", Icon: HomeIcon },
  { href: "/items", key: "items", Icon: TagIcon },
  { href: "/sales", key: "sales", Icon: ReceiptIcon },
  { href: "/expenses", key: "expenses", Icon: WalletIcon },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface/90 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
        <span className="font-heading text-lg font-semibold text-ink">{t("appName")}</span>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full border border-line text-xs">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 transition-colors ${
                lang === "en" ? "bg-ink text-white" : "bg-surface text-muted"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("km")}
              className={`px-2.5 py-1 transition-colors ${
                lang === "km" ? "bg-ink text-white" : "bg-surface text-muted"
              }`}
            >
              ខ្មែរ
            </button>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label={t("logout")}
              className="flex items-center justify-center rounded-full border border-line p-2 text-muted active:bg-cream"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-3 pb-28 pt-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-20 mx-auto max-w-sm rounded-2xl border border-line bg-surface/95 shadow-[0_8px_24px_rgba(42,33,24,0.12)] backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {NAV_ITEMS.map(({ href, key, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-primary text-white" : "text-muted"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className={active ? "font-medium text-ink" : "text-muted"}>
                  {t(key)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
