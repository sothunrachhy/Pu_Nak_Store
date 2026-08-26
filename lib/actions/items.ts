"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { deleteItemImage } from "@/lib/actions/upload";
import { isOurBlobUrl } from "@/lib/blobUrl";

export type SerializedItem = {
  id: string;
  name: string;
  category: string | null;
  size: string | null;
  color: string | null;
  image: string | null;
  costPrice: number;
  price: number;
  quantity: number;
  // Whether the item has ever been sold. An item with sales can't be deleted
  // without destroying that history, so the UI offers Archive instead.
  salesCount: number;
};

// Next.js redacts the .message of any thrown Error in production for
// security, so user-facing validation/business errors must be returned as a
// value instead of thrown - only truly unexpected errors should still throw
// (those are caught by the app's error boundary).
export type ActionResult = { error: string } | undefined;

function serializeItem(item: {
  id: string;
  name: string;
  category: string | null;
  size: string | null;
  color: string | null;
  image: string | null;
  costPrice: unknown;
  price: unknown;
  quantity: number;
  _count: { sales: number };
}): SerializedItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    size: item.size,
    color: item.color,
    image: item.image,
    costPrice: Number(item.costPrice),
    price: Number(item.price),
    quantity: item.quantity,
    salesCount: item._count.sales,
  };
}

function readImage(formData: FormData): { image: string | null } | { error: string } {
  const image = String(formData.get("image") ?? "").trim();
  if (!image) return { image: null };
  if (!isOurBlobUrl(image)) return { error: "Invalid image" };
  return { image };
}

const withSalesCount = { _count: { select: { sales: true } } } as const;

export async function getItems(): Promise<SerializedItem[]> {
  await requireAuth();
  const items = await prisma.item.findMany({
    where: { archivedAt: null },
    orderBy: { name: "asc" },
    include: withSalesCount,
  });
  return items.map(serializeItem);
}

export async function getArchivedItems(): Promise<SerializedItem[]> {
  await requireAuth();
  const items = await prisma.item.findMany({
    where: { archivedAt: { not: null } },
    orderBy: { archivedAt: "desc" },
    include: withSalesCount,
  });
  return items.map(serializeItem);
}

export async function getItem(id: string): Promise<SerializedItem | null> {
  await requireAuth();
  const item = await prisma.item.findUnique({
    where: { id },
    include: withSalesCount,
  });
  return item ? serializeItem(item) : null;
}

export async function createItem(formData: FormData): Promise<ActionResult> {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const size = String(formData.get("size") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "").trim() || null;
  const costPrice = Number(formData.get("costPrice") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  const quantity = Number(formData.get("quantity") ?? 0);

  const imageResult = readImage(formData);
  if ("error" in imageResult) return { error: imageResult.error };
  const image = imageResult.image;

  if (!name) return { error: "Item name is required" };
  if (Number.isNaN(costPrice) || costPrice < 0) return { error: "Invalid cost price" };
  if (Number.isNaN(price) || price < 0) return { error: "Invalid sell price" };
  if (Number.isNaN(quantity) || quantity < 0) return { error: "Invalid quantity" };

  await prisma.item.create({
    data: { name, category, size, color, image, costPrice, price, quantity },
  });

  revalidatePath("/items");
  revalidatePath("/sales");
  revalidatePath("/");
  return;
}

export async function updateItem(id: string, formData: FormData): Promise<ActionResult> {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const size = String(formData.get("size") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "").trim() || null;
  const costPrice = Number(formData.get("costPrice") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  const quantity = Number(formData.get("quantity") ?? 0);

  const imageResult = readImage(formData);
  if ("error" in imageResult) return { error: imageResult.error };
  const image = imageResult.image;

  if (!name) return { error: "Item name is required" };
  if (Number.isNaN(costPrice) || costPrice < 0) return { error: "Invalid cost price" };
  if (Number.isNaN(price) || price < 0) return { error: "Invalid sell price" };
  if (Number.isNaN(quantity) || quantity < 0) return { error: "Invalid quantity" };

  const previous = await prisma.item.findUnique({ where: { id }, select: { image: true } });

  await prisma.item.update({
    where: { id },
    data: { name, category, size, color, image, costPrice, price, quantity },
  });

  if (previous?.image && previous.image !== image) {
    await deleteItemImage(previous.image);
  }

  revalidatePath("/items");
  revalidatePath("/sales");
  revalidatePath("/");
  return;
}

export async function archiveItem(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.item.update({ where: { id }, data: { archivedAt: new Date() } });
  revalidatePath("/items");
  revalidatePath("/sales");
  revalidatePath("/");
  return;
}

export async function unarchiveItem(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.item.update({ where: { id }, data: { archivedAt: null } });
  revalidatePath("/items");
  revalidatePath("/sales");
  revalidatePath("/");
  return;
}

export async function deleteItem(id: string): Promise<ActionResult> {
  await requireAuth();

  let item;
  try {
    item = await prisma.item.delete({ where: { id } });
  } catch (e) {
    // The UI only offers Delete on items with no sales, so this is the
    // fallback for an item that was sold between page load and the click.
    if (e instanceof Error && e.message.includes("foreign key constraint")) {
      return {
        error:
          "This item has been sold at least once, so deleting it would erase that sales history. Archive it instead to hide it from your items and sales.",
      };
    }
    throw e;
  }

  if (item.image) {
    await deleteItemImage(item.image);
  }
  revalidatePath("/items");
  revalidatePath("/sales");
  revalidatePath("/");
  return;
}
