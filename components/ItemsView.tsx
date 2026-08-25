"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import {
  createItem,
  updateItem,
  deleteItem,
  type SerializedItem,
} from "@/lib/actions/items";

export default function ItemsView({ items }: { items: SerializedItem[] }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<SerializedItem | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const closeForm = () => {
    setEditing(null);
    setError(null);
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (editing === "new") {
          await createItem(formData);
        } else if (editing) {
          await updateItem(editing.id, formData);
        }
        closeForm();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      await deleteItem(id);
    });
  };

  if (editing) {
    const isNew = editing === "new";
    const item = isNew ? null : editing;
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold font-khmer">
          {isNew ? t("addItem") : t("editItem")}
        </h1>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <Field label={t("itemName")}>
            <input
              name="name"
              defaultValue={item?.name}
              required
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("category")}>
              <input name="category" defaultValue={item?.category ?? ""} className="input" />
            </Field>
            <Field label={t("size")}>
              <input name="size" defaultValue={item?.size ?? ""} className="input" />
            </Field>
          </div>
          <Field label={t("color")}>
            <input name="color" defaultValue={item?.color ?? ""} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("costPrice")}>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costPrice"
                defaultValue={item?.costPrice ?? 0}
                required
                className="input"
              />
            </Field>
            <Field label={t("sellPrice")}>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                defaultValue={item?.price ?? 0}
                required
                className="input"
              />
            </Field>
          </div>
          <Field label={t("quantity")}>
            <input
              type="number"
              step="1"
              min="0"
              name="quantity"
              defaultValue={item?.quantity ?? 0}
              required
              className="input"
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="flex-1 rounded-lg border border-gray-300 py-3 text-base font-medium text-gray-700 active:bg-gray-100 font-khmer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-gray-900 py-3 text-base font-medium text-white active:bg-gray-800 disabled:opacity-60 font-khmer"
            >
              {pending ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold font-khmer">{t("items")}</h1>
        <button
          onClick={() => setEditing("new")}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white active:bg-gray-800 font-khmer"
        >
          + {t("addItem")}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400 font-khmer">
          {t("noItems")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    {[item.category, item.size, item.color].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="text-gray-500 font-khmer">{t("sellPrice")}: </span>
                    <span className="font-medium">{formatMoney(item.price)}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-lg font-semibold ${
                      item.quantity <= 3 ? "text-amber-600" : "text-gray-900"
                    }`}
                  >
                    {item.quantity}
                  </p>
                  <p className="text-xs text-gray-400 font-khmer">{t("inStock")}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => setEditing(item)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 active:bg-gray-100 font-khmer"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 active:bg-red-50 font-khmer"
                >
                  {t("delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700 font-khmer">{label}</span>
      {children}
    </label>
  );
}
