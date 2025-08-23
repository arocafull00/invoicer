import { apiClient } from '../client';
import type { Client } from '@/shared/types';

export const getClients = async (): Promise<Client[]> => {
  return await apiClient.getClients();
};

export const createClient = async (
  client: Partial<Omit<Client, 'id' | 'user_id'>>
): Promise<Client> => {
  return await apiClient.createClient(client);
};

export const updateClient = async (
  id: string,
  client: Partial<Omit<Client, 'id' | 'user_id'>>
): Promise<Client> => {
  return await apiClient.updateClient(id, client);
};

export const deleteClient = async (
  id: string
): Promise<void> => {
  return await apiClient.deleteClient(id);
};