"use client";

import { useMemo, useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n";
import { formatMoney, formatDate } from "@/lib/format";
import { createSale, deleteSale, type SerializedSale } from "@/lib/actions/sales";
import type { SerializedItem } from "@/lib/actions/items";

export default function SalesView({
  items,
  sales,
}: {
  items: SerializedItem[];
  sales: SerializedSale[];
}) {
  const { t, lang } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(items[0]?.price ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedItem = useMemo(
    () => items.find((i) => i.id === itemId),
    [items, itemId]
  );

  const total = unitPrice * quantity;

  const handleItemChange = (id: string) => {
    setItemId(id);
    const found = items.find((i) => i.id === id);
    if (found) setUnitPrice(found.price);
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await createSale(formData);
        setShowForm(false);
        setQuantity(1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      await deleteSale(id);
    });
  };

  if (showForm) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold font-khmer">{t("recordSale")}</h1>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400 font-khmer">
            {t("noItems")}
          </p>
        ) : (
          <form action={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700 font-khmer">
                {t("selectItem")}
              </span>
              <select
                name="itemId"
                value={itemId}
                onChange={(e) => handleItemChange(e.target.value)}
                className="input"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.size ? ` · ${item.size}` : ""}
                    {item.color ? ` · ${item.color}` : ""} ({item.quantity} {t("inStock")})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700 font-khmer">
                  {t("quantity")}
                </span>
                <input
                  type="number"
                  name="quantity"
                  min={1}
                  max={selectedItem?.quantity ?? undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700 font-khmer">
                  {t("unitPrice")}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  name="unitPrice"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  required
                  className="input"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700 font-khmer">
                {t("note")}
              </span>
              <input name="note" className="input" />
            </label>

            <div className="rounded-xl bg-gray-100 p-4 text-center">
              <p className="text-xs text-gray-500 font-khmer">{t("total")}</p>
              <p className="text-2xl font-semibold">{formatMoney(total)}</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-khmer">
                {error === "Not enough stock" ? t("notEnoughStock") : error}
              </p>
            )}

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-gray-300 py-3 text-base font-medium text-gray-700 active:bg-gray-100 font-khmer"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-lg bg-gray-900 py-3 text-base font-medium text-white active:bg-gray-800 disabled:opacity-60 font-khmer"
              >
                {pending ? t("saving") : t("recordSaleButton")}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold font-khmer">{t("sales")}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white active:bg-gray-800 font-khmer"
        >
          + {t("recordSale")}
        </button>
      </div>

      {sales.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400 font-khmer">
          {t("noSales")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sales.map((sale) => (
            <li
              key={sale.id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{sale.item.name}</p>
                  <p className="text-xs text-gray-400">
                    {[sale.item.size, sale.item.color].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {sale.quantity} × {formatMoney(sale.unitPrice)} ·{" "}
                    {formatDate(sale.createdAt, lang)}
                  </p>
                  {sale.note && (
                    <p className="mt-1 text-xs text-gray-500 italic">{sale.note}</p>
                  )}
                </div>
                <p className="shrink-0 text-lg font-semibold text-emerald-600">
                  {formatMoney(sale.total)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(sale.id)}
                className="mt-3 w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 active:bg-red-50 font-khmer"
              >
                {t("delete")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
