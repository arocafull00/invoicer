import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIncomes, createIncome, updateIncome, deleteIncome } from '../services';
import type { Income } from '@/shared/types';

export const useIncomes = () => {
  return useQuery({
    queryKey: ['incomes'],
    queryFn: getIncomes,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (income: Omit<Income, 'id' | 'user_id'>) => createIncome(income),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
  });
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, income }: { id: string; income: Partial<Omit<Income, 'id' | 'user_id'>> }) => updateIncome(id, income),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
  });
};




