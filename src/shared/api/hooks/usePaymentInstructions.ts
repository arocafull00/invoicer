import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaymentInstructions, createPaymentInstruction, updatePaymentInstruction, deletePaymentInstruction } from '../services';
import type { PaymentInstruction } from '@/shared/types';
import { useInvoiceStore } from '@/shared/lib/stores';

export const usePaymentInstructions = () => {
  return useQuery({
    queryKey: ['paymentInstructions'],
    queryFn: getPaymentInstructions,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreatePaymentInstruction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentInstruction,
    onSuccess: (created) => {
      useInvoiceStore.getState().addPaymentInstruction(created);
      queryClient.invalidateQueries({ queryKey: ['paymentInstructions'] });
    },
  });
};

export const useUpdatePaymentInstruction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentInstruction }: { id: string; paymentInstruction: Partial<Omit<PaymentInstruction, 'id' | 'user_id'>> }) =>
      updatePaymentInstruction(id, paymentInstruction),
    onSuccess: (updated) => {
      useInvoiceStore.getState().patchPaymentInstruction(updated.id, updated);
      queryClient.invalidateQueries({ queryKey: ['paymentInstructions'] });
    },
  });
};

export const useDeletePaymentInstruction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePaymentInstruction(id),
    onSuccess: (_, id) => {
      useInvoiceStore.getState().removePaymentInstruction(id);
      queryClient.invalidateQueries({ queryKey: ['paymentInstructions'] });
    },
  });
};
