import { apiClient } from '../client';
import type { LineItemTemplate } from '@/shared/types';

export const getLineItemTemplates = async (): Promise<LineItemTemplate[]> => {
  return await apiClient.getLineItemTemplates();
};

export const createLineItemTemplate = async (
  template: Omit<LineItemTemplate, 'id' | 'user_id' | 'usage_count' | 'last_used_at' | 'created_at' | 'updated_at'>
): Promise<LineItemTemplate> => {
  return await apiClient.createLineItemTemplate(template);
};

export const updateLineItemTemplate = async (
  id: string,
  template: Partial<Omit<LineItemTemplate, 'id' | 'user_id' | 'created_at'>>
): Promise<LineItemTemplate> => {
  return await apiClient.updateLineItemTemplate(id, template);
};

export const deleteLineItemTemplate = async (id: string): Promise<void> => {
  return await apiClient.deleteLineItemTemplate(id);
};

export const updateTemplateUsage = async (id: string): Promise<void> => {
  return await apiClient.updateTemplateUsage(id);
};

export const createDefaultTemplatesForUser = async (): Promise<void> => {
  return await apiClient.createDefaultTemplatesForUser();
};
