import { apiClient } from '../client';
import type { PaymentInstruction } from '@/shared/types';

export const getPaymentInstructions = async (): Promise<PaymentInstruction[]> => {
  return await apiClient.getPaymentInstructions();
};

export const createPaymentInstruction = async (
  paymentInstruction: Omit<PaymentInstruction, 'id' | 'user_id'>
): Promise<PaymentInstruction> => {
  return await apiClient.createPaymentInstruction(paymentInstruction);
};

export const updatePaymentInstruction = async (
  id: string,
  paymentInstruction: Partial<Omit<PaymentInstruction, 'id' | 'user_id'>>
): Promise<PaymentInstruction> => {
  return await apiClient.updatePaymentInstruction(id, paymentInstruction);
};

export const deletePaymentInstruction = async (
  id: string
): Promise<void> => {
  return await apiClient.deletePaymentInstruction(id);
};