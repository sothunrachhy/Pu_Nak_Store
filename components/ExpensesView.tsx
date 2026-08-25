"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n";
import { formatMoney, formatDate } from "@/lib/format";
import {
  createExpense,
  deleteExpense,
  type SerializedExpense,
} from "@/lib/actions/expenses";

export default function ExpensesView({
  expenses,
}: {
  expenses: SerializedExpense[];
}) {
  const { t, lang } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await createExpense(formData);
        setShowForm(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      await deleteExpense(id);
    });
  };

  if (showForm) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold font-khmer">{t("addExpense")}</h1>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 font-khmer">
              {t("description")}
            </span>
            <input name="description" required autoFocus className="input" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 font-khmer">
              {t("amount")}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              required
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 font-khmer">
              {t("note")}
            </span>
            <input name="note" className="input" />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

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
        <h1 className="text-lg font-semibold font-khmer">{t("expenses")}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white active:bg-gray-800 font-khmer"
        >
          + {t("addExpense")}
        </button>
      </div>

      {expenses.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400 font-khmer">
          {t("noExpenses")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{expense.description}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(expense.createdAt, lang)}
                  </p>
                  {expense.note && (
                    <p className="mt-1 text-xs text-gray-500 italic">{expense.note}</p>
                  )}
                </div>
                <p className="shrink-0 text-lg font-semibold text-red-500">
                  {formatMoney(expense.amount)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(expense.id)}
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
