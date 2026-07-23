import { apiClient } from '../client';
import type { Expense, ExpenseType } from '@/shared/types';

export const getExpenseTypes = async (): Promise<ExpenseType[]> => {
  return await apiClient.getExpenseTypes();
};

export const createExpenseType = async (
  expenseType: Omit<ExpenseType, 'id'>
): Promise<ExpenseType> => {
  return await apiClient.createExpenseType(expenseType);
};

export const getExpenses = async (): Promise<Expense[]> => {
  return await apiClient.getExpenses();
};

export const createExpense = async (
  expense: Omit<Expense, 'id' | 'expense_type' | 'created_at' | 'updated_at'>
): Promise<Expense> => {
  return await apiClient.createExpense(expense);
};

export const deleteExpense = async (id: string): Promise<void> => {
  return await apiClient.deleteExpense(id);
};
