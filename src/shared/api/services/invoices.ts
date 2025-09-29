import { apiClient } from '../client';
import type { Invoice } from '@/shared/types';

export const getInvoices = async (): Promise<Invoice[]> => {
  return await apiClient.getInvoices();
};

export const createInvoice = async (
  invoice: Omit<Invoice, 'id' | 'user_id'>
): Promise<Invoice> => {
  return await apiClient.createInvoice(invoice);
};

export const updateInvoice = async (
  id: string,
  invoice: Partial<Omit<Invoice, 'id' | 'user_id'>>
): Promise<Invoice> => {
  return await apiClient.updateInvoice(id, invoice);
};

export const getNextInvoiceNumber = async (): Promise<string> => {
  return await apiClient.getNextInvoiceNumber();
};

export const softDeleteInvoice = async (id: string): Promise<Invoice> => {
  return await apiClient.softDeleteInvoice(id);
};