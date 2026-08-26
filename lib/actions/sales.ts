"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export type SerializedSale = {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  costPrice: number;
  costTotal: number;
  note: string | null;
  createdAt: Date;
  item: { name: string; size: string | null; color: string | null; image: string | null };
};

// See lib/actions/items.ts for why expected/validation errors are returned
// as a value instead of thrown - Next.js redacts thrown error messages in
// production.
export type ActionResult = { error: string } | undefined;

export async function getSales(limit?: number): Promise<SerializedSale[]> {
  await requireAuth();
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { item: true },
  });

  return sales.map((sale) => ({
    id: sale.id,
    itemId: sale.itemId,
    quantity: sale.quantity,
    unitPrice: Number(sale.unitPrice),
    total: Number(sale.total),
    costPrice: Number(sale.costPrice),
    costTotal: Number(sale.costTotal),
    note: sale.note,
    createdAt: sale.createdAt,
    item: {
      name: sale.item.name,
      size: sale.item.size,
      color: sale.item.color,
      image: sale.item.image,
    },
  }));
}

export async function createSale(
  formData: FormData
): Promise<{ id: string } | { error: string }> {
  await requireAuth();
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const unitPrice = Number(formData.get("unitPrice") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!itemId) return { error: "Item is required" };
  if (!Number.isInteger(quantity) || quantity <= 0) return { error: "Invalid quantity" };
  if (Number.isNaN(unitPrice) || unitPrice < 0) return { error: "Invalid unit price" };

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Item not found");
      if (item.quantity < quantity) throw new Error("Not enough stock");

      await tx.item.update({
        where: { id: itemId },
        data: { quantity: item.quantity - quantity },
      });

      const costPrice = Number(item.costPrice);

      return tx.sale.create({
        data: {
          itemId,
          quantity,
          unitPrice,
          total: unitPrice * quantity,
          costPrice,
          costTotal: costPrice * quantity,
          note,
        },
      });
    });

    revalidatePath("/sales");
    revalidatePath("/items");
    revalidatePath("/");

    return { id: sale.id };
  } catch (e) {
    if (e instanceof Error && (e.message === "Item not found" || e.message === "Not enough stock")) {
      return { error: e.message };
    }
    throw e;
  }
}

export async function deleteSale(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({ where: { id } });
    if (!sale) return;

    await tx.item.update({
      where: { id: sale.itemId },
      data: { quantity: { increment: sale.quantity } },
    });

    await tx.sale.delete({ where: { id } });
  });

  revalidatePath("/sales");
  revalidatePath("/items");
  revalidatePath("/");
  return;
}
