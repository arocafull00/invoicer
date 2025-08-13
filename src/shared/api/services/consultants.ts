import { apiClient } from '../client';
import type { Consultant } from '@/shared/types';

export const getConsultants = async (): Promise<Consultant[]> => {
  return await apiClient.getConsultants();
};

export const createConsultant = async (
  consultant: Omit<Consultant, 'id' | 'user_id'>
): Promise<Consultant> => {
  return await apiClient.createConsultant(consultant);
};

export const updateConsultant = async (
  id: string,
  consultant: Partial<Omit<Consultant, 'id' | 'user_id'>>
): Promise<Consultant> => {
  return await apiClient.updateConsultant(id, consultant);
};

export const deleteConsultant = async (
  id: string
): Promise<void> => {
  return await apiClient.deleteConsultant(id);
};