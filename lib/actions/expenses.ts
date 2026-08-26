"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export type SerializedExpense = {
  id: string;
  description: string;
  amount: number;
  note: string | null;
  createdAt: Date;
};

// See lib/actions/items.ts for why expected/validation errors are returned
// as a value instead of thrown - Next.js redacts thrown error messages in
// production.
export type ActionResult = { error: string } | undefined;

export async function getExpenses(limit?: number): Promise<SerializedExpense[]> {
  await requireAuth();
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return expenses.map((expense) => ({
    id: expense.id,
    description: expense.description,
    amount: Number(expense.amount),
    note: expense.note,
    createdAt: expense.createdAt,
  }));
}

export async function createExpense(formData: FormData): Promise<ActionResult> {
  await requireAuth();
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!description) return { error: "Description is required" };
  if (Number.isNaN(amount) || amount <= 0) return { error: "Invalid amount" };

  await prisma.expense.create({ data: { description, amount, note } });

  revalidatePath("/expenses");
  revalidatePath("/");
  return;
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath("/");
  return;
}
