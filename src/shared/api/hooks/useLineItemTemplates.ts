import { useEffect } from 'react';
import { useInvoiceStore } from '@/shared/lib/stores';
import { 
  getLineItemTemplates, 
  createLineItemTemplate, 
  updateLineItemTemplate as updateTemplateApi,
  deleteLineItemTemplate,
  updateTemplateUsage,
  createDefaultTemplatesForUser
} from '../services/lineItemTemplates';
import type { LineItemTemplate } from '@/shared/types';

export const useLineItemTemplates = () => {
  const { 
    line_item_templates, 
    setLineItemTemplates, 
    addLineItemTemplate, 
    updateLineItemTemplate,
    removeLineItemTemplate 
  } = useInvoiceStore();

  // Load templates only if they haven't been loaded yet
  useEffect(() => {
    if (line_item_templates.length === 0) {
      loadTemplates();
    }
  }, []);

  const loadTemplates = async () => {
    try {
      const templates = await getLineItemTemplates();
      setLineItemTemplates(templates);
      
      // If no templates exist, create default ones
      if (templates.length === 0) {
        await createDefaultTemplatesForUser();
        const newTemplates = await getLineItemTemplates();
        setLineItemTemplates(newTemplates);
      }
    } catch (error) {
      console.error('Error loading line item templates:', error);
    }
  };

  const createTemplate = async (
    template: Omit<LineItemTemplate, 'id' | 'user_id' | 'usage_count' | 'last_used_at' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const newTemplate = await createLineItemTemplate(template);
      addLineItemTemplate(newTemplate);
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  };

  const updateTemplate = async (
    id: string, 
    updates: Partial<Omit<LineItemTemplate, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      const updatedTemplate = await updateTemplateApi(id, updates);
      updateLineItemTemplate(id, updatedTemplate);
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await deleteLineItemTemplate(id);
      removeLineItemTemplate(id);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  };

  const useTemplate = async (template: LineItemTemplate) => {
    try {
      await updateTemplateUsage(template.id);
      // Update local usage count
      updateLineItemTemplate(template.id, { 
        usage_count: template.usage_count + 1,
        last_used_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating template usage:', error);
    }
  };

  const searchTemplates = (query: string): LineItemTemplate[] => {
    if (!query.trim()) return line_item_templates;
    
    const searchTerm = query.toLowerCase();
    return line_item_templates.filter(template =>
      template.description.toLowerCase().includes(searchTerm) ||
      (template.category && template.category.toLowerCase().includes(searchTerm))
    );
  };

  const getTemplatesByCategory = (): Record<string, LineItemTemplate[]> => {
    const grouped: Record<string, LineItemTemplate[]> = {};
    
    line_item_templates.forEach(template => {
      const category = template.category || 'Sin categoría';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    });

    // Sort templates within each category by usage count
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => b.usage_count - a.usage_count);
    });

    return grouped;
  };

  const getMostUsedTemplates = (limit: number = 5): LineItemTemplate[] => {
    return [...line_item_templates]
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit);
  };

  return {
    templates: line_item_templates,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    searchTemplates,
    getTemplatesByCategory,
    getMostUsedTemplates,
  };
};
