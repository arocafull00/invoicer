import { apiClient } from '../client';
import type { Expense, ExpenseType } from '@/shared/types';

export const getExpenseTypes = async (): Promise<ExpenseType[]> => {
  return await apiClient.getExpenseTypes();
};

export const createExpenseType = async (
  expenseType: Omit<ExpenseType, 'id' | 'user_id'>
): Promise<ExpenseType> => {
  return await apiClient.createExpenseType(expenseType);
};

export const updateExpenseType = async (
  id: string,
  expenseType: Partial<Omit<ExpenseType, 'id' | 'user_id'>>
): Promise<ExpenseType> => {
  return await apiClient.updateExpenseType(id, expenseType);
};

export const deleteExpenseType = async (id: string): Promise<void> => {
  return await apiClient.deleteExpenseType(id);
};

export const getExpenses = async (): Promise<Expense[]> => {
  return await apiClient.getExpenses();
};

export const createExpense = async (
  expense: Omit<Expense, 'id' | 'user_id'>
): Promise<Expense> => {
  return await apiClient.createExpense(expense);
};

export const updateExpense = async (
  id: string,
  expense: Partial<Omit<Expense, 'id' | 'user_id'>>
): Promise<Expense> => {
  return await apiClient.updateExpense(id, expense);
};

export const deleteExpense = async (id: string): Promise<void> => {
  return await apiClient.deleteExpense(id);
};


