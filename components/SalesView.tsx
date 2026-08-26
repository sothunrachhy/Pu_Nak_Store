"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useI18n, useErrorText } from "@/lib/i18n";
import { runAction } from "@/lib/actionError";
import { formatMoney, formatDate } from "@/lib/format";
import {
  createSale,
  createSaleBatch,
  deleteSale,
  deleteSales,
  type SerializedSale,
} from "@/lib/actions/sales";
import type { SerializedItem } from "@/lib/actions/items";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  CheckIcon,
  ImagePlaceholderIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";

type Toast = {
  // A basket records one sale row per item, so undo has to reverse all of them.
  saleIds: string[];
  label: string;
  total: number;
};

export default function SalesView({
  items,
  sales,
}: {
  items: SerializedItem[];
  sales: SerializedSale[];
}) {
  const { t, lang } = useI18n();
  const errorText = useErrorText();
  const [showForm, setShowForm] = useState(false);
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(items[0]?.price ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // itemId -> quantity the customer is buying right now. Nothing is written
  // until the basket is recorded, so a mis-tap costs nothing.
  const [cart, setCart] = useState<Record<string, number>>({});
  const [basketOpen, setBasketOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stepperItemId, setStepperItemId] = useState<string | null>(null);
  const [stepperQty, setStepperQty] = useState(1);
  const [toast, setToast] = useState<Toast | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === itemId),
    [items, itemId]
  );

  const total = unitPrice * quantity;

  const basketLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const item = items.find((i) => i.id === id);
          return item ? { item, quantity } : null;
        })
        .filter((line): line is { item: SerializedItem; quantity: number } => line !== null),
    [cart, items]
  );
  // Quick Sell shows what is actually moving first, narrowed by the search
  // box. The Custom Sale picker keeps the full, name-ordered list.
  const quickSellItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter(
        (i) =>
          !q ||
          [i.name, i.category, i.size, i.color].some((field) =>
            field?.toLowerCase().includes(q)
          )
      )
      .sort(
        (a, b) => b.recentUnitsSold - a.recentUnitsSold || a.name.localeCompare(b.name)
      );
  }, [items, search]);

  const basketCount = basketLines.reduce((n, l) => n + l.quantity, 0);
  const basketTotal = basketLines.reduce((n, l) => n + l.item.price * l.quantity, 0);

  const handleItemChange = (id: string) => {
    setItemId(id);
    const found = items.find((i) => i.id === id);
    if (found) setUnitPrice(found.price);
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await runAction(() => createSale(formData));
      if ("error" in result) {
        setError(result.error);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      setShowForm(false);
      setQuantity(1);
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteError(null);
    startTransition(async () => {
      const result = await runAction(() => deleteSale(id));
      if (result?.error) {
        setDeleteError(result.error);
      } else {
        setDeleteTarget(null);
      }
    });
  };

  const showToast = (t: Toast) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastError(null);
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const addToBasket = (item: SerializedItem, qty: number) => {
    setToastError(null);
    setCart((prev) => {
      const next = Math.min(item.quantity, (prev[item.id] ?? 0) + qty);
      return next > 0 ? { ...prev, [item.id]: next } : prev;
    });
    setStepperItemId(null);
  };

  const setBasketQty = (item: SerializedItem, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const clamped = Math.max(0, Math.min(item.quantity, qty));
      if (clamped === 0) delete next[item.id];
      else next[item.id] = clamped;
      return next;
    });
  };

  const clearBasket = () => {
    setCart({});
    setBasketOpen(false);
  };

  const recordBasket = () => {
    if (!basketLines.length || pending) return;
    const lines = basketLines.map((l) => ({ itemId: l.item.id, quantity: l.quantity }));
    const label =
      basketLines.length === 1
        ? `${basketLines[0].quantity} × ${basketLines[0].item.name}`
        : `${basketCount} ${t("itemsWord")}`;
    const total = basketTotal;

    startTransition(async () => {
      const result = await runAction(() => createSaleBatch(lines));
      if ("error" in result) {
        setToastError(result.error);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastError(null), 4000);
        return;
      }
      setCart({});
      setBasketOpen(false);
      showToast({ saleIds: result.ids, label, total });
    });
  };

  const handleUndo = () => {
    if (!toast) return;
    const ids = toast.saleIds;
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    startTransition(async () => {
      await runAction(() => deleteSales(ids));
    });
  };

  const openStepper = (item: SerializedItem) => {
    setStepperItemId(item.id);
    setStepperQty(1);
  };

  if (showForm) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-lg font-semibold text-ink">{t("customSale")}</h1>

        {items.length === 0 ? (
          <p className="card p-6 text-center text-sm text-muted">{t("noItems")}</p>
        ) : (
          <form action={handleSubmit} className="flex flex-col gap-4">
            <input type="hidden" name="itemId" value={itemId} />

            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">
                {t("selectItem")}
              </span>
              <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-xl border border-line bg-cream p-2">
                {items.map((it) => {
                  const selected = it.id === itemId;
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => handleItemChange(it.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                          selected
                            ? "border-primary bg-surface ring-1 ring-primary"
                            : "border-transparent bg-surface"
                        }`}
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-cream">
                          {it.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={it.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-line">
                              <ImagePlaceholderIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">
                            {it.name}
                            {it.size ? ` · ${it.size}` : ""}
                            {it.color ? ` · ${it.color}` : ""}
                          </p>
                          <p className="text-xs text-muted">
                            {formatMoney(it.price)} · {it.quantity} {t("inStock")}
                          </p>
                        </div>
                        {selected && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                            <CheckIcon className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink">{t("quantity")}</span>
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
                <span className="text-sm font-medium text-ink">{t("unitPrice")}</span>
                <input
                  type="number"
                  step="1"
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
              <span className="text-sm font-medium text-ink">{t("note")}</span>
              <input name="note" className="input" />
            </label>

            <div className="card bg-cream p-4 text-center">
              <p className="text-xs text-muted">{t("total")}</p>
              <p className="font-heading text-2xl font-semibold text-ink">
                {formatMoney(total)}
              </p>
            </div>

            {error && (
              <p className="text-sm text-danger">
                {errorText(error)}
              </p>
            )}

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                {t("cancel")}
              </button>
              <button type="submit" disabled={pending} className="btn-primary flex-1">
                {pending ? t("saving") : t("recordSaleButton")}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-ink">{t("sales")}</h1>
        {items.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink active:bg-cream"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            {t("customSale")}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-muted">{t("noItems")}</p>
          <Link href="/items" className="btn-primary px-5 py-2.5 text-sm">
            {t("addItem")}
          </Link>
        </div>
      ) : (
        <section>
          <p className="mb-0.5 text-sm font-medium text-muted">{t("quickSell")}</p>
          <p className="mb-2 text-xs text-muted/80">{t("quickSellHint")}</p>
          {items.length > 5 && (
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchItems")}
              className="input mb-2 py-2 text-sm"
            />
          )}

          {quickSellItems.length === 0 ? (
            <p className="card p-5 text-center text-sm text-muted">{t("noItems")}</p>
          ) : (
          <ul className="grid grid-cols-3 gap-2">
            {quickSellItems.map((item) => {
              const outOfStock = item.quantity === 0;
              const inBasket = cart[item.id] ?? 0;
              const inStepper = stepperItemId === item.id;

              if (inStepper) {
                return (
                  <li key={item.id} className="card flex flex-col items-center gap-2 p-2">
                    <p className="line-clamp-2 h-8 w-full text-center text-[11px] font-medium text-ink">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStepperQty((q) => Math.max(1, q - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-sm font-semibold text-ink"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-ink">
                        {stepperQty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setStepperQty((q) => Math.min(item.quantity, q + 1))
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-sm font-semibold text-ink"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex w-full gap-1">
                      <button
                        type="button"
                        onClick={() => setStepperItemId(null)}
                        className="btn-secondary flex-1 px-1 py-1.5 text-[11px]"
                      >
                        {t("cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={() => addToBasket(item, stepperQty)}
                        className="btn-primary flex-1 px-1 py-1.5 text-[11px]"
                      >
                        {t("add")}
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => addToBasket(item, 1)}
                    disabled={outOfStock}
                    className={`card w-full overflow-hidden text-left transition-opacity disabled:opacity-50 ${
                      inBasket ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="aspect-square w-full bg-cream">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-line">
                          <ImagePlaceholderIcon className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-[11px] font-medium text-ink">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-semibold text-primary">
                        {formatMoney(item.price)}
                      </p>
                    </div>
                  </button>
                  {inBasket > 0 && (
                    <span className="absolute left-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white shadow-sm">
                      {inBasket}
                    </span>
                  )}
                  {outOfStock ? (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[9px] font-medium text-white">
                      {t("outOfStock")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      aria-label={t("quantity")}
                      onClick={(e) => {
                        e.stopPropagation();
                        openStepper(item);
                      }}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface/95 text-ink shadow-sm"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          )}
        </section>
      )}

      <section>
        <p className="mb-2 text-sm font-medium text-muted">{t("recentSales")}</p>
        {sales.length === 0 ? (
          <p className="card p-6 text-center text-sm text-muted">{t("noSales")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sales.map((sale) => (
              <li key={sale.id} className="card p-3">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line bg-cream">
                    {sale.item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sale.item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-line">
                        <ImagePlaceholderIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{sale.item.name}</p>
                    <p className="text-xs text-muted">
                      {[sale.item.size, sale.item.color].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {sale.quantity} × {formatMoney(sale.unitPrice)} ·{" "}
                      {formatDate(sale.createdAt, lang)}
                    </p>
                    {sale.note && <p className="mt-1 text-xs italic text-muted">{sale.note}</p>}
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-success">
                    {formatMoney(sale.total)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteTarget(sale.id);
                  }}
                  aria-label={t("delete")}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-danger/20 py-2 text-xs font-medium text-danger active:bg-danger-soft"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  {t("delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Keeps the last sale row clear of the fixed basket bar. */}
      {basketLines.length > 0 && <div className="h-16" aria-hidden />}

      {basketLines.length > 0 && (
        <div className="fixed inset-x-3 bottom-24 z-30 mx-auto max-w-sm">
          <div className="flex items-center gap-2 rounded-2xl bg-ink p-2 pl-4 text-white shadow-lg">
            <button
              type="button"
              onClick={() => setBasketOpen(true)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block text-[11px] text-white/60">
                {t("basket")} · {basketCount} {t("itemsWord")}
              </span>
              <span className="block font-heading text-lg font-semibold">
                {formatMoney(basketTotal)}
              </span>
            </button>
            <button
              type="button"
              onClick={recordBasket}
              disabled={pending}
              className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white active:bg-primary-dark disabled:opacity-60"
            >
              {pending ? t("saving") : t("recordSaleButton")}
            </button>
          </div>
        </div>
      )}

      {basketOpen && basketLines.length > 0 && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 p-3"
          onClick={() => setBasketOpen(false)}
        >
          <div className="card w-full max-w-sm p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-heading text-base font-semibold text-ink">{t("basket")}</p>
              <button
                type="button"
                onClick={clearBasket}
                className="text-xs font-medium text-danger"
              >
                {t("clear")}
              </button>
            </div>

            <ul className="mb-3 flex max-h-72 flex-col gap-2 overflow-y-auto">
              {basketLines.map(({ item, quantity }) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-xl border border-line p-2"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line bg-cream">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-line">
                        <ImagePlaceholderIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-muted">{formatMoney(item.price * quantity)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={t("delete")}
                      onClick={() => setBasketQty(item, quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-sm font-semibold text-ink"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-ink">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={t("add")}
                      disabled={quantity >= item.quantity}
                      onClick={() => setBasketQty(item, quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-sm font-semibold text-ink disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="text-sm text-muted">{t("total")}</span>
              <span className="font-heading text-lg font-semibold text-ink">
                {formatMoney(basketTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={recordBasket}
              disabled={pending}
              className="btn-primary mt-3 w-full"
            >
              {pending ? t("saving") : t("recordSaleButton")}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-xl bg-ink px-4 py-3 text-white shadow-lg">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
              <CheckIcon className="h-3 w-3" />
            </span>
            <span className="truncate">
              {t("sold")} {toast.label} · {formatMoney(toast.total)}
            </span>
          </span>
          <button
            onClick={handleUndo}
            className="shrink-0 text-sm font-semibold text-amber-300"
          >
            {t("undo")}
          </button>
        </div>
      )}

      {toastError && (
        <div className="fixed inset-x-4 bottom-24 z-30 mx-auto max-w-sm rounded-xl bg-danger px-4 py-3 text-center text-sm text-white shadow-lg">
          {errorText(toastError)}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        message={t("confirmDelete")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        pending={pending}
        error={errorText(deleteError)}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
