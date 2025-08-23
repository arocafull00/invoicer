import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getExpenses, createExpense, updateExpense, deleteExpense,
  getExpenseTypes, createExpenseType, updateExpenseType, deleteExpenseType
} from '../services';
import type { Expense, ExpenseType } from '@/shared/types';

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
    staleTime: 1000 * 60 * 5,
  });
};

export const useExpenseTypes = () => {
  return useQuery({
    queryKey: ['expense_types'],
    queryFn: getExpenseTypes,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expense: Omit<Expense, 'id' | 'user_id'>) => createExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, expense }: { id: string; expense: Partial<Omit<Expense, 'id' | 'user_id'>> }) => updateExpense(id, expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useCreateExpenseType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseType: Omit<ExpenseType, 'id' | 'user_id'>) => createExpenseType(expenseType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_types'] });
    },
  });
};

export const useUpdateExpenseType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, expenseType }: { id: string; expenseType: Partial<Omit<ExpenseType, 'id' | 'user_id'>> }) => updateExpenseType(id, expenseType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_types'] });
    },
  });
};

export const useDeleteExpenseType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpenseType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_types'] });
    },
  });
};


