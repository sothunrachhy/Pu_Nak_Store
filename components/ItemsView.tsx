"use client";

import { useRef, useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { resizeImageFile } from "@/lib/image";
import { CATEGORY_OPTIONS, SIZE_OPTIONS, COLOR_OPTIONS } from "@/lib/clothingOptions";
import {
  createItem,
  updateItem,
  deleteItem,
  type SerializedItem,
} from "@/lib/actions/items";
import {
  CameraIcon,
  CloseIcon,
  ImagePlaceholderIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";

export default function ItemsView({ items }: { items: SerializedItem[] }) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState<SerializedItem | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setImageData(null);
    setEditing("new");
  };

  const openEdit = (item: SerializedItem) => {
    setImageData(item.image);
    setEditing(item);
  };

  const closeForm = () => {
    setEditing(null);
    setError(null);
    setImageData(null);
  };

  const handleImagePick = async (file: File | undefined) => {
    if (!file) return;
    setImageBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      setImageData(dataUrl);
    } catch {
      setError("Could not process image");
    } finally {
      setImageBusy(false);
    }
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
        await new Promise((resolve) => setTimeout(resolve, 300));
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
        <h1 className="font-heading text-lg font-semibold text-ink">
          {isNew ? t("addItem") : t("editItem")}
        </h1>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="image" value={imageData ?? ""} />

          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-2xl border border-line bg-cream">
                {imageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageData}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <ImagePlaceholderIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
              {imageData && (
                <button
                  type="button"
                  onClick={() => setImageData(null)}
                  aria-label={t("delete")}
                  className="absolute -right-2 -top-2 rounded-full bg-ink p-1.5 text-white shadow"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageBusy}
              className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink active:bg-cream disabled:opacity-60"
            >
              <CameraIcon className="h-4 w-4" />
              {imageBusy ? t("saving") : t("addPhoto")}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleImagePick(e.target.files?.[0])}
            />
          </div>

          <Field label={t("itemName")}>
            <input
              name="name"
              defaultValue={item?.name}
              required
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <SelectOrOtherField
              name="category"
              label={t("category")}
              options={CATEGORY_OPTIONS[lang]}
              initialValue={item?.category ?? null}
            />
            <SelectOrOtherField
              name="size"
              label={t("size")}
              options={SIZE_OPTIONS[lang]}
              initialValue={item?.size ?? null}
            />
          </div>
          <SelectOrOtherField
            name="color"
            label={t("color")}
            options={COLOR_OPTIONS[lang]}
            initialValue={item?.color ?? null}
          />
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

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="btn-secondary flex-1"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={pending || imageBusy}
              className="btn-primary flex-1"
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
        <h1 className="font-heading text-lg font-semibold text-ink">{t("items")}</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white active:bg-primary-dark"
        >
          <PlusIcon className="h-4 w-4" />
          {t("addItem")}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="card p-6 text-center text-sm text-muted">{t("noItems")}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <li key={item.id} className="card overflow-hidden">
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
                    <ImagePlaceholderIcon className="h-9 w-9" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                <p className="truncate text-xs text-muted">
                  {[item.size, item.color].filter(Boolean).join(" · ") || "—"}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {formatMoney(item.price)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.quantity <= 3
                        ? "bg-warning-soft text-warning"
                        : "bg-cream text-muted"
                    }`}
                  >
                    {item.quantity} {t("inStock")}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    aria-label={t("edit")}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-line py-2 text-xs font-medium text-ink active:bg-cream"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label={t("delete")}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-danger/20 py-2 text-xs font-medium text-danger active:bg-danger-soft"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
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
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

const OTHER = "__other__";

function SelectOrOtherField({
  name,
  label,
  options,
  initialValue,
}: {
  name: string;
  label: string;
  options: readonly string[];
  initialValue: string | null;
}) {
  const startsAsOther = !!initialValue && !options.includes(initialValue);
  const [value, setValue] = useState(startsAsOther ? OTHER : initialValue ?? "");
  const [otherValue, setOtherValue] = useState(startsAsOther ? initialValue ?? "" : "");
  const isOther = value === OTHER;
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-1.5" data-field={name}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input type="hidden" name={isOther ? undefined : name} value={value} />
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setValue(opt)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              value === opt
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-ink active:bg-cream"
            }`}
          >
            {opt}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setValue(OTHER)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            isOther
              ? "border-primary bg-primary text-white"
              : "border-line bg-surface text-ink active:bg-cream"
          }`}
        >
          {t("other")}
        </button>
      </div>
      {isOther && (
        <input
          name={name}
          value={otherValue}
          onChange={(e) => setOtherValue(e.target.value)}
          placeholder={t("other")}
          autoFocus
          className="input"
        />
      )}
    </div>
  );
}
