import AppShell from "@/components/AppShell";
import SalesView from "@/components/SalesView";
import { getSales } from "@/lib/actions/sales";
import { getItems } from "@/lib/actions/items";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [items, sales] = await Promise.all([getItems(), getSales(100)]);

  return (
    <AppShell>
      <SalesView items={items} sales={sales} />
    </AppShell>
  );
}
