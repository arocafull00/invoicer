import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaymentInstructions, createPaymentInstruction, updatePaymentInstruction, deletePaymentInstruction } from '../services';
import type { PaymentInstruction } from '@/shared/types';

export const usePaymentInstructions = () => {
  return useQuery({
    queryKey: ['paymentInstructions'],
    queryFn: getPaymentInstructions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreatePaymentInstruction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPaymentInstruction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentInstructions'] });
    },
  });
};

export const useUpdatePaymentInstruction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentInstruction }: { id: string; paymentInstruction: Partial<Omit<PaymentInstruction, 'id' | 'user_id'>> }) =>
      updatePaymentInstruction(id, paymentInstruction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentInstructions'] });
    },
  });
};

export const useDeletePaymentInstruction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePaymentInstruction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentInstructions'] });
    },
  });
};