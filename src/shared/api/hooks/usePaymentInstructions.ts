import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaymentInstructions, createPaymentInstruction } from '../services';
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