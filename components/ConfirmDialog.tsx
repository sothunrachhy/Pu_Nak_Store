"use client";

import { ArchiveIcon, WarningIcon } from "@/components/icons";

export default function ConfirmDialog({
  open,
  message,
  confirmLabel,
  cancelLabel,
  pending,
  error,
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
  error?: string | null;
  // Archiving is reversible, so it shouldn't wear the red of a delete.
  tone?: "danger" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  const isDanger = tone === "danger";
  const Icon = isDanger ? WarningIcon : ArchiveIcon;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4"
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm p-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full ${
            isDanger ? "bg-danger-soft text-danger" : "bg-cream text-muted"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm text-ink">{message}</p>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`flex-1 rounded-xl py-3 text-base font-medium text-white transition-colors active:opacity-90 disabled:opacity-60 ${
              isDanger ? "bg-danger" : "bg-primary"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
