export type Priority = 'low' | 'medium' | 'high';
export type TaskCategory = 'personal' | 'work' | 'shopping' | 'health' | 'finance' | 'other';

export interface Task {
  _id?: string;
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  priority: Priority;
  category: TaskCategory;
  autoLogExpense?: boolean;
  estimatedCost?: number;
  linkedExpenseId?: string;
}

async function apiCall(action: string, payload?: any) {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection: 'tasks', action, payload }),
  });
  if (!res.ok) throw new Error('Task API Error');
  return res.json();
}

export const getTasksServer = async () => {
  const data = await apiCall('find');
  return data.map((item: any) => ({ ...item, id: item._id }));
};

export const saveTaskServer = async ({ data }: { data: Omit<Task, 'id'> }) => {
  return apiCall('insert', data);
};

export const updateTaskServer = async ({ data }: { data: Task }) => {
  return apiCall('update', { ...data, id: data.id });
};

export const deleteTaskServer = async ({ data }: { data: { id: string } }) => {
  return apiCall('delete', { id: data.id });
};