"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SerializedItem = {
  id: string;
  name: string;
  category: string | null;
  size: string | null;
  color: string | null;
  costPrice: number;
  price: number;
  quantity: number;
};

function serializeItem(item: {
  id: string;
  name: string;
  category: string | null;
  size: string | null;
  color: string | null;
  costPrice: unknown;
  price: unknown;
  quantity: number;
}): SerializedItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    size: item.size,
    color: item.color,
    costPrice: Number(item.costPrice),
    price: Number(item.price),
    quantity: item.quantity,
  };
}

export async function getItems(): Promise<SerializedItem[]> {
  const items = await prisma.item.findMany({ orderBy: { name: "asc" } });
  return items.map(serializeItem);
}

export async function getItem(id: string): Promise<SerializedItem | null> {
  const item = await prisma.item.findUnique({ where: { id } });
  return item ? serializeItem(item) : null;
}

export async function createItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const size = String(formData.get("size") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "").trim() || null;
  const costPrice = Number(formData.get("costPrice") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  const quantity = Number(formData.get("quantity") ?? 0);

  if (!name) throw new Error("Item name is required");
  if (Number.isNaN(costPrice) || costPrice < 0) throw new Error("Invalid cost price");
  if (Number.isNaN(price) || price < 0) throw new Error("Invalid sell price");
  if (Number.isNaN(quantity) || quantity < 0) throw new Error("Invalid quantity");

  await prisma.item.create({
    data: { name, category, size, color, costPrice, price, quantity },
  });

  revalidatePath("/items");
  revalidatePath("/sales");
  revalidatePath("/");
}

export async function updateItem(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const size = String(formData.get("size") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "").trim() || null;
  const costPrice = Number(formData.get("costPrice") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  const quantity = Number(formData.get("quantity") ?? 0);

  if (!name) throw new Error("Item name is required");
  if (Number.isNaN(costPrice) || costPrice < 0) throw new Error("Invalid cost price");
  if (Number.isNaN(price) || price < 0) throw new Error("Invalid sell price");
  if (Number.isNaN(quantity) || quantity < 0) throw new Error("Invalid quantity");

  await prisma.item.update({
    where: { id },
    data: { name, category, size, color, costPrice, price, quantity },
  });

  revalidatePath("/items");
  revalidatePath("/sales");
  revalidatePath("/");
}

export async function deleteItem(id: string) {
  await prisma.item.delete({ where: { id } });
  revalidatePath("/items");
  revalidatePath("/sales");
  revalidatePath("/");
}
