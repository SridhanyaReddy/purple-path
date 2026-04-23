import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Search, Wallet, Settings } from 'lucide-react';
import {
  getExpenses, addExpense, updateExpense, deleteExpense,
  getBudget, saveBudget,
  type Expense, type ExpenseCategory,
} from '@/lib/store';

const expenseCategories: ExpenseCategory[] = ['food', 'travel', 'bills', 'shopping', 'entertainment', 'health', 'other'];

const categoryEmoji: Record<ExpenseCategory, string> = {
  food: '🍔', travel: '✈️', bills: '📄', shopping: '🛒', entertainment: '🎬', health: '💊', other: '📦',
};

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<ExpenseCategory | 'all'>('all');
  const [showBudget, setShowBudget] = useState(false);
  const [budgetVal, setBudgetVal] = useState(50000);

  const [form, setForm] = useState({
    amount: 0, category: 'food' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0], notes: '',
  });

  useEffect(() => {
    setExpenses(getExpenses());
    setBudgetVal(getBudget().monthly);
  }, []);

  const reload = () => setExpenses(getExpenses());

  const resetForm = () => {
    setForm({ amount: 0, category: 'food', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowForm(false);
    setEditId(null);
  };

  const handleSubmit = () => {
    if (!form.amount) return;
    if (editId) {
      updateExpense(editId, form);
    } else {
      addExpense(form);
    }
    resetForm();
    reload();
  };

  const handleEdit = (exp: Expense) => {
    setForm({ amount: exp.amount, category: exp.category, date: exp.date, notes: exp.notes });
    setEditId(exp.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    reload();
  };

  const saveBudgetValue = () => {
    saveBudget({ monthly: budgetVal });
    setShowBudget(false);
  };

  const filtered = expenses
    .filter(e => e.notes.toLowerCase().includes(search.toLowerCase()) || e.category.includes(search.toLowerCase()))
    .filter(e => filterCat === 'all' || e.category === filterCat)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Expenses</h1>
          <p className="mt-1 text-muted-foreground">Track and manage your spending</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBudget(!showBudget)}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition hover:bg-accent">
            <Settings className="h-4 w-4" /> Budget
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Budget editor */}
      <AnimatePresence>
        {showBudget && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-3 font-display text-lg font-semibold text-card-foreground">Set Monthly Budget</h3>
            <div className="flex gap-3">
              <input type="number" value={budgetVal} onChange={e => setBudgetVal(Number(e.target.value))}
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={saveBudgetValue}
                className="rounded-xl gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Save</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..."
            className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex flex-wrap gap-1">
          {(['all', ...expenseCategories] as const).map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterCat === c ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>
              {c === 'all' ? 'All' : `${categoryEmoji[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="rounded-2xl gradient-primary p-5 text-primary-foreground shadow-glow">
        <p className="text-sm opacity-80">Filtered Total</p>
        <p className="font-display text-3xl font-bold">₹{total.toLocaleString()}</p>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-4 font-display text-lg font-semibold text-card-foreground">{editId ? 'Edit Expense' : 'New Expense'}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Amount (₹)" type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                {expenseCategories.map(c => <option key={c} value={c}>{categoryEmoji[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSubmit}
                className="rounded-xl gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                {editId ? 'Update' : 'Add'}
              </button>
              <button onClick={resetForm}
                className="rounded-xl bg-secondary px-5 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-accent">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(exp => (
            <motion.div key={exp.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:shadow-glow/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg">
                {categoryEmoji[exp.category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-card-foreground">₹{exp.amount.toLocaleString()}</p>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground uppercase">{exp.category}</span>
                </div>
                {exp.notes && <p className="mt-0.5 text-xs text-muted-foreground truncate">{exp.notes}</p>}
                <p className="mt-0.5 text-xs text-muted-foreground">{exp.date}</p>
              </div>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => handleEdit(exp)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(exp.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Wallet className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>No expenses yet. Add one to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
}
