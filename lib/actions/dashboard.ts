"use server";

import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 = Sunday
  x.setDate(x.getDate() - day);
  return x;
}

function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

async function sumSalesSince(since: Date) {
  const result = await prisma.sale.aggregate({
    _sum: { total: true },
    where: { createdAt: { gte: since } },
  });
  return Number(result._sum.total ?? 0);
}

async function sumExpensesSince(since: Date) {
  const result = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: since } },
  });
  return Number(result._sum.amount ?? 0);
}

export async function getDashboardStats() {
  const now = new Date();
  const today = startOfDay(now);
  const week = startOfWeek(now);
  const month = startOfMonth(now);

  const [
    todayIncome,
    todayExpense,
    weekIncome,
    weekExpense,
    monthIncome,
    monthExpense,
    lowStockItems,
    recentSales,
  ] = await Promise.all([
    sumSalesSince(today),
    sumExpensesSince(today),
    sumSalesSince(week),
    sumExpensesSince(week),
    sumSalesSince(month),
    sumExpensesSince(month),
    prisma.item.findMany({
      where: { quantity: { lte: 3 } },
      orderBy: { quantity: "asc" },
      take: 10,
    }),
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { item: true },
    }),
  ]);

  return {
    today: { income: todayIncome, expense: todayExpense, profit: todayIncome - todayExpense },
    week: { income: weekIncome, expense: weekExpense, profit: weekIncome - weekExpense },
    month: { income: monthIncome, expense: monthExpense, profit: monthIncome - monthExpense },
    lowStockItems: lowStockItems.map((item) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    })),
    recentSales: recentSales.map((sale) => ({
      id: sale.id,
      quantity: sale.quantity,
      total: Number(sale.total),
      createdAt: sale.createdAt,
      item: { name: sale.item.name },
    })),
  };
}
