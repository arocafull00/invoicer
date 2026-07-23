import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvoices, createInvoice } from '../services';
import { useInvoiceStore } from '@/shared/lib/stores';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: (created) => {
      useInvoiceStore.getState().addInvoice(created);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};