import AppShell from "@/components/AppShell";
import ItemsView from "@/components/ItemsView";
import { getItems } from "@/lib/actions/items";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <AppShell>
      <ItemsView items={items} />
    </AppShell>
  );
}
