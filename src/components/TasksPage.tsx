import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Check, Search, Link2, CheckSquare } from 'lucide-react';
import {
  getTasks, addTask, updateTask, deleteTask, addExpense,
  type Task, type Priority, type TaskCategory,
} from '@/lib/store';

const priorities: Priority[] = ['low', 'medium', 'high'];
const categories: TaskCategory[] = ['personal', 'work', 'shopping', 'health', 'finance', 'other'];

const priorityStyles: Record<Priority, string> = {
  low: 'bg-success/15 text-success',
  medium: 'bg-warning/15 text-warning',
  high: 'bg-destructive/15 text-destructive',
};

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  const [form, setForm] = useState({
    title: '', description: '', dueDate: '', priority: 'medium' as Priority,
    category: 'personal' as TaskCategory, autoLogExpense: false, estimatedCost: 0,
  });

  useEffect(() => { setTasks(getTasks()); }, []);

  const reload = () => setTasks(getTasks());

  const resetForm = () => {
    setForm({ title: '', description: '', dueDate: '', priority: 'medium', category: 'personal', autoLogExpense: false, estimatedCost: 0 });
    setShowForm(false);
    setEditId(null);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (editId) {
      updateTask(editId, form);
    } else {
      addTask({ ...form, completed: false });
    }
    resetForm();
    reload();
  };

  const handleComplete = (task: Task) => {
    const updated = updateTask(task.id, { completed: !task.completed });
    if (updated && !task.completed && task.autoLogExpense && task.estimatedCost) {
      const exp = addExpense({
        amount: task.estimatedCost,
        category: 'shopping',
        date: new Date().toISOString().split('T')[0],
        notes: `Auto-logged from task: ${task.title}`,
        linkedTaskId: task.id,
      });
      updateTask(task.id, { linkedExpenseId: exp.id });
    }
    reload();
  };

  const handleEdit = (task: Task) => {
    setForm({
      title: task.title, description: task.description, dueDate: task.dueDate,
      priority: task.priority, category: task.category,
      autoLogExpense: task.autoLogExpense, estimatedCost: task.estimatedCost || 0,
    });
    setEditId(task.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    reload();
  };

  const filtered = tasks
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter(t => filterPriority === 'all' || t.priority === filterPriority);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Tasks</h1>
          <p className="mt-1 text-muted-foreground">Manage your to-dos and link expenses</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..." className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-1">
          {(['all', ...priorities] as const).map(p => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterPriority === p ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-4 font-display text-lg font-semibold text-card-foreground">{editId ? 'Edit Task' : 'New Task'}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TaskCategory }))}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <input placeholder="Estimated cost (₹)" type="number" value={form.estimatedCost || ''} onChange={e => setForm(f => ({ ...f, estimatedCost: Number(e.target.value) }))}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={form.autoLogExpense} onChange={e => setForm(f => ({ ...f, autoLogExpense: e.target.checked }))}
                  className="h-4 w-4 rounded accent-primary" />
                Auto-log expense on completion
              </label>
            </div>
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="mt-4 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" rows={2} />
            <div className="mt-4 flex gap-2">
              <button onClick={handleSubmit}
                className="rounded-xl gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                {editId ? 'Update' : 'Create'}
              </button>
              <button onClick={resetForm}
                className="rounded-xl bg-secondary px-5 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-accent">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(task => (
            <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
              className={`group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:shadow-glow/20 ${task.completed ? 'opacity-60' : ''}`}>
              <button onClick={() => handleComplete(task)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                  task.completed ? 'border-success bg-success text-success-foreground' : 'border-muted-foreground hover:border-primary'
                }`}>
                {task.completed && <Check className="h-3.5 w-3.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium text-card-foreground ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityStyles[task.priority]}`}>{task.priority}</span>
                  {task.linkedExpenseId && <Link2 className="h-3.5 w-3.5 text-primary" />}
                </div>
                {task.description && <p className="mt-0.5 text-xs text-muted-foreground truncate">{task.description}</p>}
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  {task.dueDate && <span>Due: {task.dueDate}</span>}
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">{task.category}</span>
                  {task.estimatedCost ? <span>₹{task.estimatedCost}</span> : null}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => handleEdit(task)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(task.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <CheckSquare className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>No tasks yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
