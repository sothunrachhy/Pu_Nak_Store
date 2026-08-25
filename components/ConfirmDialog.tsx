"use client";

import { WarningIcon } from "@/components/icons";

export default function ConfirmDialog({
  open,
  message,
  confirmLabel,
  cancelLabel,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4"
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm p-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger">
          <WarningIcon className="h-5 w-5" />
        </div>
        <p className="text-sm text-ink">{message}</p>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 rounded-xl bg-danger py-3 text-base font-medium text-white transition-colors active:opacity-90 disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
