import { createServerFn } from '@tanstack/react-start';
import { connectToDatabase } from '../lib/db';
import type { Task } from '../lib/store';
import { z } from 'zod';

export const getTasksServer = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await connectToDatabase();
  const tasks = await db.collection('tasks').find({}).toArray();
  console.log('Fetched tasks count:', tasks.length);
  return tasks.map(({ _id, ...rest }) => rest) as Task[];
});

export const saveTaskServer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    title: z.string(),
    description: z.string().optional(),
    dueDate: z.string(),
    priority: z.string(),
    category: z.string(),
    completed: z.boolean().optional(),
    autoLogExpense: z.boolean().optional(),
    estimatedCost: z.number().optional()
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectToDatabase();
      const newTask = {
        ...data,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      };
      await db.collection('tasks').insertOne(newTask);
      console.log('✅ TASK INSERT SUCCESS');
      return newTask;
    } catch (error) {
      console.error('❌ TASK INSERT ERROR:', error);
      throw error;
    }
  });

export const updateTaskServer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    dueDate: z.string(),
    priority: z.string(),
    category: z.string(),
    completed: z.boolean().optional(),
    autoLogExpense: z.boolean().optional(),
    estimatedCost: z.number().optional(),
    createdAt: z.string().optional(),
    linkedExpenseId: z.string().optional()
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectToDatabase();
      await db.collection('tasks').updateOne({ id: data.id }, { $set: data });
      console.log('✅ TASK UPDATE SUCCESS');
      return data as Task;
    } catch (error) {
      console.error('❌ TASK UPDATE ERROR:', error);
      throw error;
    }
  });

export const deleteTaskServer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectToDatabase();
      const result = await db.collection('tasks').deleteOne({ id: data.id });
      console.log('✅ DELETE SUCCESS:', data.id, 'Deleted:', result.deletedCount);
    } catch (error) {
      console.error('❌ DELETE ERROR:', error);
      throw error;
    }
  });