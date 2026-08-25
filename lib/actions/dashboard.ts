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
    _sum: { total: true, costTotal: true },
    where: { createdAt: { gte: since } },
  });
  return {
    income: Number(result._sum.total ?? 0),
    cogs: Number(result._sum.costTotal ?? 0),
  };
}

async function sumExpensesSince(since: Date) {
  const result = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: since } },
  });
  return Number(result._sum.amount ?? 0);
}

function toPeriod(sales: { income: number; cogs: number }, expense: number) {
  return {
    income: sales.income,
    cogs: sales.cogs,
    expense,
    profit: sales.income - sales.cogs - expense,
  };
}

async function getLast7DaysIncome(now: Date) {
  const start = startOfDay(now);
  start.setDate(start.getDate() - 6);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true, total: true },
  });

  const days: { date: Date; income: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(start);
    dayStart.setDate(dayStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const income = sales
      .filter((s) => s.createdAt >= dayStart && s.createdAt < dayEnd)
      .reduce((sum, s) => sum + Number(s.total), 0);
    days.push({ date: dayStart, income });
  }
  return days;
}

export async function getDashboardStats() {
  const now = new Date();
  const today = startOfDay(now);
  const week = startOfWeek(now);
  const month = startOfMonth(now);

  const [
    todaySales,
    todayExpense,
    weekSales,
    weekExpense,
    monthSales,
    monthExpense,
    lowStockItems,
    recentSales,
    last7Days,
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
    getLast7DaysIncome(now),
  ]);

  return {
    today: toPeriod(todaySales, todayExpense),
    week: toPeriod(weekSales, weekExpense),
    month: toPeriod(monthSales, monthExpense),
    last7Days: last7Days.map((d) => ({ date: d.date.toISOString(), income: d.income })),
    lowStockItems: lowStockItems.map((item) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      color: item.color,
      image: item.image,
      quantity: item.quantity,
    })),
    recentSales: recentSales.map((sale) => ({
      id: sale.id,
      quantity: sale.quantity,
      total: Number(sale.total),
      createdAt: sale.createdAt,
      item: { name: sale.item.name, image: sale.item.image },
    })),
  };
}
