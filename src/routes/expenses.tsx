import { createFileRoute } from '@tanstack/react-router';
import { AppLayout } from '@/components/AppLayout';
import { ExpensesPage } from '@/components/ExpensesPage';

export const Route = createFileRoute('/expenses')({
  component: Expenses,
});

function Expenses() {
  return (
    <AppLayout>
      <ExpensesPage />
    </AppLayout>
  );
}
