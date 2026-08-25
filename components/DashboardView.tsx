"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { formatMoney, formatDate, shortWeekday } from "@/lib/format";
import { ImagePlaceholderIcon, WarningIcon } from "@/components/icons";

type Period = { income: number; cogs: number; expense: number; profit: number };

type Item = {
  id: string;
  name: string;
  size: string | null;
  color: string | null;
  image: string | null;
  quantity: number;
};

type Sale = {
  id: string;
  quantity: number;
  total: number;
  createdAt: Date;
  item: { name: string; image: string | null };
};

type DayIncome = { date: string; income: number };

function Thumb({ image, alt }: { image: string | null; alt: string }) {
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line bg-cream">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-line">
          <ImagePlaceholderIcon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function ProportionBar({
  segments,
  thick = false,
}: {
  segments: { value: number; color: string }[];
  thick?: boolean;
}) {
  const positive = segments.filter((s) => s.value > 0);
  return (
    <div
      className={`flex w-full gap-0.5 overflow-hidden rounded-full bg-line/50 ${
        thick ? "h-2.5" : "h-1.5"
      }`}
    >
      {positive.map((s, i) => (
        <div
          key={i}
          style={{ flexGrow: s.value, flexBasis: 0, backgroundColor: s.color }}
          className="h-full shrink-0"
        />
      ))}
    </div>
  );
}

function Legend({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

const TREND_BAR_MAX_HEIGHT = 56;

function TrendBars({ days, lang }: { days: DayIncome[]; lang: "en" | "km" }) {
  const max = Math.max(1, ...days.map((d) => d.income));
  const todayIndex = days.length - 1;

  return (
    <div className="flex items-end justify-between gap-1.5">
      {days.map((d, i) => {
        const heightPx =
          d.income > 0 ? Math.max(4, (d.income / max) * TREND_BAR_MAX_HEIGHT) : 2;
        const isToday = i === todayIndex;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="flex w-full items-end justify-center"
              style={{ height: TREND_BAR_MAX_HEIGHT }}
            >
              <div
                style={{ height: heightPx }}
                className={`w-full max-w-6 rounded-t-md ${
                  isToday ? "bg-success" : "bg-line"
                }`}
              />
            </div>
            <span
              className={`text-[10px] ${
                isToday ? "font-semibold text-ink" : "text-muted"
              }`}
            >
              {shortWeekday(d.date, lang)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardView({
  today,
  week,
  month,
  lowStockItems,
  recentSales,
  last7Days,
}: {
  today: Period;
  week: Period;
  month: Period;
  lowStockItems: Item[];
  recentSales: Sale[];
  last7Days: DayIncome[];
}) {
  const { t, lang } = useI18n();

  const hasTrendData = last7Days.some((d) => d.income > 0);

  return (
    <div className="flex flex-col gap-6">
      <section className="card bg-ink p-5 text-white">
        <p className="text-sm font-medium text-white/70">{t("today")}</p>
        <p
          className={`mt-1 font-heading text-3xl font-semibold ${
            today.profit >= 0 ? "text-white" : "text-rose-400"
          }`}
        >
          {formatMoney(today.profit)}
        </p>
        <p className="text-xs text-white/60">{t("profit")}</p>
        <div className="mt-4 flex gap-4 border-t border-white/15 pt-3">
          <div>
            <p className="text-xs text-white/60">{t("income")}</p>
            <p className="text-lg font-semibold text-emerald-400">
              {formatMoney(today.income)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60">{t("costOfGoods")}</p>
            <p className="text-lg font-semibold text-fuchsia-400">
              {formatMoney(today.cogs)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60">{t("expense")}</p>
            <p className="text-lg font-semibold text-rose-400">
              {formatMoney(today.expense)}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ProportionBar
            thick
            segments={[
              { value: today.profit, color: "#34d399" },
              { value: today.cogs, color: "#e879f9" },
              { value: today.expense, color: "#fb7185" },
            ]}
          />
        </div>
      </section>

      <Legend
        items={[
          { label: t("profit"), color: "#059669" },
          { label: t("costOfGoods"), color: "#86198f" },
          { label: t("expense"), color: "#dc2626" },
        ]}
      />

      <section className="grid grid-cols-2 gap-3">
        {[
          { label: t("thisWeek"), data: week },
          { label: t("thisMonth"), data: month },
        ].map((p) => (
          <div key={p.label} className="card p-4">
            <p className="text-xs font-medium text-muted">{p.label}</p>
            <p
              className={`mt-1 text-lg font-semibold ${
                p.data.profit >= 0 ? "text-ink" : "text-danger-text"
              }`}
            >
              {formatMoney(p.data.profit)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <span className="text-success-text">+{formatMoney(p.data.income)}</span>
              <span className="text-cost">-{formatMoney(p.data.cogs)}</span>
              <span className="text-danger-text">-{formatMoney(p.data.expense)}</span>
            </div>
            <div className="mt-2.5">
              <ProportionBar
                segments={[
                  { value: p.data.profit, color: "#059669" },
                  { value: p.data.cogs, color: "#86198f" },
                  { value: p.data.expense, color: "#dc2626" },
                ]}
              />
            </div>
          </div>
        ))}
      </section>

      {hasTrendData && (
        <section className="card p-4">
          <p className="mb-3 text-sm font-medium text-muted">{t("salesTrend")}</p>
          <TrendBars days={last7Days} lang={lang} />
        </section>
      )}

      {lowStockItems.length > 0 && (
        <section className="card border-warning/25 bg-warning-soft p-4">
          <div className="mb-1 flex items-center gap-1.5 text-warning">
            <WarningIcon className="h-4 w-4" />
            <p className="text-sm font-semibold">{t("lowStock")}</p>
          </div>
          <p className="mb-3 text-xs text-warning/80">{t("lowStockDesc")}</p>
          <ul className="flex flex-col gap-2">
            {lowStockItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2"
              >
                <Thumb image={item.image} alt={item.name} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {item.name}
                  {item.size ? ` · ${item.size}` : ""}
                  {item.color ? ` · ${item.color}` : ""}
                </span>
                <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
                  {item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-muted">{t("recentSales")}</p>
          <Link href="/sales" className="text-xs font-medium text-primary">
            {t("sales")}
          </Link>
        </div>
        {recentSales.length === 0 ? (
          <p className="card p-4 text-center text-sm text-muted">{t("noSales")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentSales.map((sale) => (
              <li key={sale.id} className="card flex items-center gap-3 p-3">
                <Thumb image={sale.item.image} alt={sale.item.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{sale.item.name}</p>
                  <p className="text-xs text-muted">
                    {sale.quantity} × · {formatDate(sale.createdAt, lang)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-success">
                  {formatMoney(sale.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
