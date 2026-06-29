import { apiClient } from '../client';
import type { LineItemTemplate } from '@/shared/types';

function normalizeTemplate(template: LineItemTemplate): LineItemTemplate {
  return {
    ...template,
    default_quantity: Number(template.default_quantity),
    default_rate: Number(template.default_rate),
    usage_count: Number(template.usage_count),
  };
}

export const getLineItemTemplates = async (): Promise<LineItemTemplate[]> => {
  const templates = await apiClient.getLineItemTemplates();
  return templates.map(normalizeTemplate);
};

export const createLineItemTemplate = async (
  template: Omit<LineItemTemplate, 'id' | 'user_id' | 'usage_count' | 'last_used_at' | 'created_at' | 'updated_at'>
): Promise<LineItemTemplate> => {
  const created = await apiClient.createLineItemTemplate(template);
  return normalizeTemplate(created);
};

export const updateLineItemTemplate = async (
  id: string,
  template: Partial<Omit<LineItemTemplate, 'id' | 'user_id' | 'created_at'>>
): Promise<LineItemTemplate> => {
  const updated = await apiClient.updateLineItemTemplate(id, template);
  return normalizeTemplate(updated);
};

export const deleteLineItemTemplate = async (id: string): Promise<void> => {
  return await apiClient.deleteLineItemTemplate(id);
};

export const updateTemplateUsage = async (id: string): Promise<void> => {
  return await apiClient.updateTemplateUsage(id);
};
