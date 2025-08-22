import { apiClient } from '../client';
import type { Income } from '@/shared/types';

export const getIncomes = async (): Promise<Income[]> => {
  return await apiClient.getIncomes();
};

export const createIncome = async (
  income: Omit<Income, 'id' | 'user_id'>
): Promise<Income> => {
  return await apiClient.createIncome(income);
};

export const updateIncome = async (
  id: string,
  income: Partial<Omit<Income, 'id' | 'user_id'>>
): Promise<Income> => {
  return await apiClient.updateIncome(id, income);
};

export const deleteIncome = async (id: string): Promise<void> => {
  return await apiClient.deleteIncome(id);
};




