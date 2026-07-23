import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createClient, updateClient, deleteClient } from '../services';
import type { Client } from '@/shared/types';
import { useInvoiceStore } from '@/shared/lib/stores';

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (client: Partial<Omit<Client, 'id' | 'user_id'>>) => createClient(client),
    onSuccess: (created) => {
      useInvoiceStore.getState().addClient(created);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, client }: { id: string; client: Partial<Omit<Client, 'id' | 'user_id'>> }) =>
      updateClient(id, client),
    onSuccess: (updated) => {
      useInvoiceStore.getState().patchClient(updated.id, updated);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: (_, id) => {
      useInvoiceStore.getState().removeClient(id);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
