"use client";

import { useState, useTransition } from "react";
import { useI18n, useErrorText } from "@/lib/i18n";
import { runAction } from "@/lib/actionError";
import { formatMoney, formatDate } from "@/lib/format";
import {
  createExpense,
  deleteExpense,
  type SerializedExpense,
} from "@/lib/actions/expenses";
import ConfirmDialog from "@/components/ConfirmDialog";
import { PlusIcon, TrashIcon, WalletIcon } from "@/components/icons";

export default function ExpensesView({
  expenses,
}: {
  expenses: SerializedExpense[];
}) {
  const { t, lang } = useI18n();
  const errorText = useErrorText();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await runAction(() => createExpense(formData));
      if (result?.error) {
        setError(result.error);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      setShowForm(false);
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteError(null);
    startTransition(async () => {
      const result = await runAction(() => deleteExpense(id));
      if (result?.error) {
        setDeleteError(result.error);
      } else {
        setDeleteTarget(null);
      }
    });
  };

  if (showForm) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-lg font-semibold text-ink">{t("addExpense")}</h1>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">{t("description")}</span>
            <input name="description" required autoFocus className="input" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">{t("amount")}</span>
            <input
              type="number"
              step="1"
              min="1"
              name="amount"
              required
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">{t("note")}</span>
            <input name="note" className="input" />
          </label>

          {error && <p className="text-sm text-danger">{errorText(error)}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary flex-1"
            >
              {t("cancel")}
            </button>
            <button type="submit" disabled={pending} className="btn-primary flex-1">
              {pending ? t("saving") : t("addExpenseButton")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold text-ink">{t("expenses")}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white active:bg-primary-dark"
        >
          <PlusIcon className="h-4 w-4" />
          {t("addExpense")}
        </button>
      </div>

      {expenses.length === 0 ? (
        <p className="card p-6 text-center text-sm text-muted">{t("noExpenses")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <li key={expense.id} className="card p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
                  <WalletIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {expense.description}
                  </p>
                  <p className="text-xs text-muted">{formatDate(expense.createdAt, lang)}</p>
                  {expense.note && (
                    <p className="mt-1 text-xs italic text-muted">{expense.note}</p>
                  )}
                </div>
                <p className="shrink-0 text-sm font-semibold text-danger">
                  {formatMoney(expense.amount)}
                </p>
              </div>
              <button
                onClick={() => {
                  setDeleteError(null);
                  setDeleteTarget(expense.id);
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
