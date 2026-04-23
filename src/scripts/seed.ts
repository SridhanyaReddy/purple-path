import 'dotenv/config';
import { connectToDatabase } from '../lib/db';

async function seedDatabase() {
  const db = await connectToDatabase();

  // Sample tasks
  const tasks = [
    {
      id: 'task1',
      title: 'Complete project proposal',
      description: 'Write and finalize the project proposal document',
      dueDate: '2026-04-30',
      priority: 'high',
      category: 'work',
      completed: false,
      autoLogExpense: false,
      estimatedCost: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task2',
      title: 'Buy groceries',
      description: 'Weekly grocery shopping',
      dueDate: '2026-04-25',
      priority: 'medium',
      category: 'shopping',
      completed: false,
      autoLogExpense: true,
      estimatedCost: 150,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task3',
      title: 'Morning run',
      description: 'Daily exercise routine',
      dueDate: '2026-04-24',
      priority: 'low',
      category: 'health',
      completed: true,
      autoLogExpense: false,
      estimatedCost: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  // Sample expenses
  const expenses = [
    {
      id: 'exp1',
      amount: 50,
      category: 'food',
      date: '2026-04-20',
      notes: 'Lunch at restaurant',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp2',
      amount: 200,
      category: 'travel',
      date: '2026-04-18',
      notes: 'Bus ticket to city',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp3',
      amount: 100,
      category: 'shopping',
      date: '2026-04-22',
      notes: 'New headphones',
      createdAt: new Date().toISOString(),
    },
  ];

  await db.collection('tasks').insertMany(tasks);
  await db.collection('expenses').insertMany(expenses);

  console.log('Sample data inserted successfully!');
}

seedDatabase().catch(console.error);