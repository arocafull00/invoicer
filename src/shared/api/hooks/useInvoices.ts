import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvoices, createInvoice } from '../services';
import type { Invoice } from '@/shared/types';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};