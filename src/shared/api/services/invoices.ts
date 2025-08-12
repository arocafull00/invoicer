import { apiClient } from '../client';
import type { Invoice } from '@/shared/types';

export const getInvoices = async (): Promise<Invoice[]> => {
  return await apiClient.getInvoices();
};

export const createInvoice = async (invoice: Omit<Invoice, 'id' | 'user_id'>): Promise<Invoice> => {
  return await apiClient.createInvoice(invoice);
};