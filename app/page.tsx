import AppShell from "@/components/AppShell";
import DashboardView from "@/components/DashboardView";
import { getDashboardStats } from "@/lib/actions/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <AppShell>
      <DashboardView
        today={stats.today}
        week={stats.week}
        month={stats.month}
        lowStockItems={stats.lowStockItems}
        recentSales={stats.recentSales}
      />
    </AppShell>
  );
}
