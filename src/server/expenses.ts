import { createServerFn } from '@tanstack/react-start';
import { connectToDatabase } from '../lib/db';
import type { Expense } from '../lib/store';
import { z } from 'zod';

export const getExpensesServer = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await connectToDatabase();
  const expenses = await db.collection('expenses').find({}).toArray();
  console.log('Fetched expenses count:', expenses.length);
  return expenses.map(({ _id, ...rest }) => rest) as Expense[];
});

export const saveExpenseServer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    amount: z.number(),
    category: z.string(),
    date: z.string(),
    notes: z.string().optional(),
    linkedTaskId: z.string().optional()
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectToDatabase();
      const newExpense = {
        ...data,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      };
      await db.collection('expenses').insertOne(newExpense);
      console.log('✅ INSERT SUCCESS');
      return newExpense;
    } catch (error) {
      console.error('❌ INSERT ERROR:', error);
      throw error;
    }
  });

export const updateExpenseServer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string(),
    amount: z.number(),
    category: z.string(),
    date: z.string(),
    notes: z.string().optional(),
    linkedTaskId: z.string().optional(),
    createdAt: z.string().optional()
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectToDatabase();
      await db.collection('expenses').updateOne({ id: data.id }, { $set: data });
      console.log('✅ UPDATE SUCCESS');
      return data as Expense;
    } catch (error) {
      console.error('❌ UPDATE ERROR:', error);
      throw error;
    }
  });

export const deleteExpenseServer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectToDatabase();
      const result = await db.collection('expenses').deleteOne({ id: data.id });
      console.log('✅ DELETE SUCCESS:', data.id, 'Deleted:', result.deletedCount);
    } catch (error) {
      console.error('❌ DELETE ERROR:', error);
      throw error;
    }
  });