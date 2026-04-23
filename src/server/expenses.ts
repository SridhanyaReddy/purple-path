export type ExpenseCategory = 'food' | 'travel' | 'bills' | 'shopping' | 'entertainment' | 'health' | 'other';

export interface Expense {
  _id?: string;
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes: string;
  linkedTaskId?: string;
}

async function apiCall(action: string, payload?: any) {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection: 'expenses', action, payload }),
  });
  if (!res.ok) throw new Error('Expense API Error');
  return res.json();
}

export const getExpensesServer = async () => {
  const data = await apiCall('find');
  return data.map((item: any) => ({ ...item, id: item._id }));
};

export const saveExpenseServer = async ({ data }: { data: Omit<Expense, 'id'> }) => {
  return apiCall('insert', data);
};

export const updateExpenseServer = async ({ data }: { data: Expense }) => {
  return apiCall('update', { ...data, id: data.id });
};

export const deleteExpenseServer = async ({ data }: { id: string }) => {
  return apiCall('delete', { id: data.id });
};