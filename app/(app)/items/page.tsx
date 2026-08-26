import ItemsView from "@/components/ItemsView";
import { getItems, getArchivedItems } from "@/lib/actions/items";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const [items, archivedItems] = await Promise.all([getItems(), getArchivedItems()]);

  return <ItemsView items={items} archivedItems={archivedItems} />;
}
