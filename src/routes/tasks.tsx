import { createFileRoute } from '@tanstack/react-router';
import { AppLayout } from '@/components/AppLayout';
import { TasksPage } from '@/components/TasksPage';

export const Route = createFileRoute('/tasks')({
  component: Tasks,
});

function Tasks() {
  return (
    <AppLayout>
      <TasksPage />
    </AppLayout>
  );
}
