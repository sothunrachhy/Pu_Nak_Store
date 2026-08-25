"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { formatMoney, formatDate } from "@/lib/format";

type Period = { income: number; expense: number; profit: number };

type Item = {
  id: string;
  name: string;
  size: string | null;
  color: string | null;
  quantity: number;
};

type Sale = {
  id: string;
  quantity: number;
  total: number;
  createdAt: Date;
  item: { name: string };
};

export default function DashboardView({
  today,
  week,
  month,
  lowStockItems,
  recentSales,
}: {
  today: Period;
  week: Period;
  month: Period;
  lowStockItems: Item[];
  recentSales: Sale[];
}) {
  const { t, lang } = useI18n();

  const periods: { label: string; data: Period }[] = [
    { label: t("today"), data: today },
    { label: t("thisWeek"), data: week },
    { label: t("thisMonth"), data: month },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-3">
        {periods.map((p) => (
          <div
            key={p.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="mb-3 text-sm font-medium text-gray-500 font-khmer">
              {p.label}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-400 font-khmer">{t("income")}</p>
                <p className="text-base font-semibold text-emerald-600">
                  {formatMoney(p.data.income)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-khmer">{t("expense")}</p>
                <p className="text-base font-semibold text-red-500">
                  {formatMoney(p.data.expense)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-khmer">{t("profit")}</p>
                <p
                  className={`text-base font-semibold ${
                    p.data.profit >= 0 ? "text-gray-900" : "text-red-500"
                  }`}
                >
                  {formatMoney(p.data.profit)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {lowStockItems.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-medium text-amber-800 font-khmer">
            ⚠️ {t("lowStock")}
          </p>
          <p className="mb-3 text-xs text-amber-700 font-khmer">{t("lowStockDesc")}</p>
          <ul className="flex flex-col gap-2">
            {lowStockItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium">
                  {item.name}
                  {item.size ? ` · ${item.size}` : ""}
                  {item.color ? ` · ${item.color}` : ""}
                </span>
                <span className="font-semibold text-amber-700">{item.quantity}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 font-khmer">
            {t("recentSales")}
          </p>
          <Link href="/sales" className="text-xs text-gray-500 underline font-khmer">
            {t("sales")}
          </Link>
        </div>
        {recentSales.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-400 font-khmer">
            {t("noSales")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentSales.map((sale) => (
              <li
                key={sale.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3"
              >
                <div>
                  <p className="text-sm font-medium">{sale.item.name}</p>
                  <p className="text-xs text-gray-400">
                    {sale.quantity} × · {formatDate(sale.createdAt, lang)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-emerald-600">
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
