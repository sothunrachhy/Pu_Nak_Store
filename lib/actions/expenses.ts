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

export async function createExpense(formData: FormData) {
  await requireAuth();
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!description) throw new Error("Description is required");
  if (Number.isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

  await prisma.expense.create({ data: { description, amount, note } });

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function deleteExpense(id: string) {
  await requireAuth();
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath("/");
}
