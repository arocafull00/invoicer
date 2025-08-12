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