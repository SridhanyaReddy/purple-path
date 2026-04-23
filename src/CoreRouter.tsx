import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from './components/DashboardPage.tsx';
import { TasksPage } from './components/TasksPage.tsx';
import { ExpensesPage } from './components/ExpensesPage.tsx';
import { AppLayout } from './components/AppLayout.tsx';

const queryClient = new QueryClient();

export default function CoreRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
