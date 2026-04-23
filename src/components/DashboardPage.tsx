import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, Wallet, TrendingUp, Download, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  getTasks, getExpenses, getBudget, getMonthlyExpenseTotal,
  getExpensesByCategory, getWeeklySpending, downloadCSV, exportTasksCSV, exportExpensesCSV,
} from '@/lib/store';
import type { Task, Expense } from '@/lib/store';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

const categoryColors: Record<string, string> = {
  food: '#a855f7', travel: '#8b5cf6', bills: '#7c3aed',
  shopping: '#6d28d9', entertainment: '#c084fc', health: '#a78bfa', other: '#ddd6fe',
};

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState({ monthly: 50000 });

  useEffect(() => {
    setTasks(getTasks());
    setExpenses(getExpenses());
    setBudget(getBudget());
  }, []);

  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);
  const monthlyTotal = useMemo(() => getMonthlyExpenseTotal(), [expenses]);
  const byCategory = useMemo(() => getExpensesByCategory(), [expenses]);
  const weeklyData = useMemo(() => getWeeklySpending(), [expenses]);
  const completedTaskCost = completedTasks.reduce((s, t) => s + (t.estimatedCost || 0), 0);
  const budgetPercent = budget.monthly > 0 ? Math.min((monthlyTotal / budget.monthly) * 100, 100) : 0;
  const overBudget = monthlyTotal > budget.monthly;
  const nearBudget = budgetPercent >= 80 && !overBudget;

  const doughnutData = {
    labels: Object.keys(byCategory).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{
      data: Object.values(byCategory),
      backgroundColor: Object.keys(byCategory).map(k => categoryColors[k] || '#ddd6fe'),
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: weeklyData.map(d => d.label),
    datasets: [{
      label: 'Spending',
      data: weeklyData.map(d => d.amount),
      backgroundColor: 'oklch(0.6 0.2 285 / 0.7)',
      borderRadius: 8,
    }],
  };

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: 'text-primary' },
    { label: 'Completed', value: completedTasks.length, icon: CheckSquare, color: 'text-success' },
    { label: 'Pending', value: pendingTasks.length, icon: Clock, color: 'text-warning' },
    { label: 'Monthly Expenses', value: `₹${monthlyTotal.toLocaleString()}`, icon: Wallet, color: 'text-primary' },
    { label: 'Task Costs', value: `₹${completedTaskCost.toLocaleString()}`, icon: TrendingUp, color: 'text-chart-3' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Your productivity & finance overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadCSV(exportTasksCSV(), 'tasks.csv')}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-accent">
            <Download className="h-4 w-4" /> Tasks CSV
          </button>
          <button onClick={() => downloadCSV(exportExpensesCSV(), 'expenses.csv')}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-accent">
            <Download className="h-4 w-4" /> Expenses CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} initial="hidden" animate="visible" variants={cardVariants}
            className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-secondary p-2.5">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-display text-xl font-bold text-card-foreground">{s.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Budget */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-card-foreground">Monthly Budget</h2>
          {(overBudget || nearBudget) && (
            <span className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium ${
              overBudget ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
            }`}>
              <AlertTriangle className="h-3.5 w-3.5" />
              {overBudget ? 'Over budget!' : 'Nearing budget'}
            </span>
          )}
        </div>
        <div className="flex items-end justify-between text-sm text-muted-foreground">
          <span>₹{monthlyTotal.toLocaleString()} spent</span>
          <span>₹{budget.monthly.toLocaleString()} budget</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${budgetPercent}%` }}
            transition={{ duration: 1, delay: 0.6 }}
            className={`h-full rounded-full ${overBudget ? 'bg-destructive' : 'gradient-primary'}`}
          />
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Expenses by Category</h2>
          {Object.keys(byCategory).length > 0 ? (
            <div className="mx-auto max-w-[280px]">
              <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: 'oklch(0.65 0.04 285)', padding: 16, usePointStyle: true } } }, cutout: '65%' }} />
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">No expenses yet</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Weekly Spending</h2>
          <Bar data={barData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: 'oklch(0.65 0.04 285)' } },
              y: { grid: { color: 'oklch(0.3 0.02 280 / 0.3)' }, ticks: { color: 'oklch(0.65 0.04 285)' } },
            },
          }} />
        </motion.div>
      </div>
    </div>
  );
}
