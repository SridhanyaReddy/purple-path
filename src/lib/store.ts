export type Priority = 'low' | 'medium' | 'high';
export type TaskCategory = 'personal' | 'work' | 'shopping' | 'health' | 'finance' | 'other';
export type ExpenseCategory = 'food' | 'travel' | 'bills' | 'shopping' | 'entertainment' | 'health' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  category: TaskCategory;
  completed: boolean;
  linkedExpenseId?: string;
  autoLogExpense: boolean;
  estimatedCost?: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes: string;
  linkedTaskId?: string;
  createdAt: string;
}

export interface Budget {
  monthly: number;
}

const TASKS_KEY = 'fusion_tasks';
const EXPENSES_KEY = 'fusion_expenses';
const BUDGET_KEY = 'fusion_budget';
const THEME_KEY = 'fusion_theme';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Tasks
export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
  const newTask: Task = { ...task, id: generateId(), createdAt: new Date().toISOString() };
  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates };
  saveTasks(tasks);
  return tasks[idx];
}

export function deleteTask(id: string) {
  saveTasks(getTasks().filter(t => t.id !== id));
}

// Expenses
export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(EXPENSES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Expense {
  const newExpense: Expense = { ...expense, id: generateId(), createdAt: new Date().toISOString() };
  const expenses = getExpenses();
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
}

export function updateExpense(id: string, updates: Partial<Expense>): Expense | null {
  const expenses = getExpenses();
  const idx = expenses.findIndex(e => e.id === id);
  if (idx === -1) return null;
  expenses[idx] = { ...expenses[idx], ...updates };
  saveExpenses(expenses);
  return expenses[idx];
}

export function deleteExpense(id: string) {
  saveExpenses(getExpenses().filter(e => e.id !== id));
}

// Budget
export function getBudget(): Budget {
  if (typeof window === 'undefined') return { monthly: 50000 };
  const raw = localStorage.getItem(BUDGET_KEY);
  return raw ? JSON.parse(raw) : { monthly: 50000 };
}

export function saveBudget(budget: Budget) {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
}

// Theme
export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'dark';
}

export function saveTheme(theme: 'light' | 'dark') {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// Export CSV
export function exportTasksCSV(): string {
  const tasks = getTasks();
  const header = 'Title,Description,Due Date,Priority,Category,Completed,Estimated Cost\n';
  const rows = tasks.map(t =>
    `"${t.title}","${t.description}","${t.dueDate}","${t.priority}","${t.category}",${t.completed},${t.estimatedCost || 0}`
  ).join('\n');
  return header + rows;
}

export function exportExpensesCSV(): string {
  const expenses = getExpenses();
  const header = 'Amount,Category,Date,Notes\n';
  const rows = expenses.map(e =>
    `${e.amount},"${e.category}","${e.date}","${e.notes}"`
  ).join('\n');
  return header + rows;
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Stats helpers
export function getMonthlyExpenseTotal(): number {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return getExpenses()
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getExpensesByCategory(): Record<string, number> {
  const result: Record<string, number> = {};
  getExpenses().forEach(e => {
    result[e.category] = (result[e.category] || 0) + e.amount;
  });
  return result;
}

export function getWeeklySpending(): { label: string; amount: number }[] {
  const now = new Date();
  const result: { label: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en', { weekday: 'short' });
    const total = getExpenses()
      .filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);
    result.push({ label: dayLabel, amount: total });
  }
  return result;
}
