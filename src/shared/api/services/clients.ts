import { apiClient } from '../client';
import type { Client } from '@/shared/types';

export const getClients = async (): Promise<Client[]> => {
  return await apiClient.getClients();
};

export const createClient = async (
  client: Omit<Client, 'id' | 'user_id'>
): Promise<Client> => {
  return await apiClient.createClient(client);
};