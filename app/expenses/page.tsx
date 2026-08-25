import AppShell from "@/components/AppShell";
import ExpensesView from "@/components/ExpensesView";
import { getExpenses } from "@/lib/actions/expenses";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await getExpenses(100);

  return (
    <AppShell>
      <ExpensesView expenses={expenses} />
    </AppShell>
  );
}
