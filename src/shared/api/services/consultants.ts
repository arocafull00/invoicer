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