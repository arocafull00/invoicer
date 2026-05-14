import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConsultants, createConsultant, updateConsultant, deleteConsultant } from '../services';
import type { Consultant } from '@/shared/types';
import { useInvoiceStore } from '@/shared/lib/stores';

export const useConsultants = () => {
  return useQuery({
    queryKey: ['consultants'],
    queryFn: getConsultants,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateConsultant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (consultant: Omit<Consultant, 'id' | 'user_id'>) => createConsultant(consultant),
    onSuccess: (created) => {
      useInvoiceStore.getState().addConsultant(created);
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
    },
  });
};

export const useUpdateConsultant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, consultant }: { id: string; consultant: Partial<Omit<Consultant, 'id' | 'user_id'>> }) =>
      updateConsultant(id, consultant),
    onSuccess: (updated) => {
      useInvoiceStore.getState().patchConsultant(updated.id, updated);
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
    },
  });
};

export const useDeleteConsultant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConsultant(id),
    onSuccess: (_, id) => {
      useInvoiceStore.getState().removeConsultant(id);
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
    },
  });
};