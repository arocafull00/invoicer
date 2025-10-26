import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrendingUp } from 'lucide-react';
import { useLineItemTemplates } from '@/shared/api/hooks/useLineItemTemplates';
import type { LineItemTemplate } from '@/shared/types';

interface LineItemTemplateSelectorProps {
  onSelectTemplate: (template: LineItemTemplate) => void;
  selectedTemplateId?: string;
}

export const LineItemTemplateSelector: React.FC<LineItemTemplateSelectorProps> = ({
  onSelectTemplate,
  selectedTemplateId
}) => {
  const [openNewTemplate, setOpenNewTemplate] = React.useState(false);
  const [newTemplate, setNewTemplate] = React.useState({
    description: '',
    default_quantity: 1,
    default_rate: 0,
    category: 'Personalizado'
  });

  const { 
    templates, 
    createTemplate, 
    getMostUsedTemplates 
  } = useLineItemTemplates();

  const mostUsedTemplates = getMostUsedTemplates(5);

  const handleCreateNewTemplate = async () => {
    if (!newTemplate.description.trim() || newTemplate.default_rate <= 0) return;

    try {
      const createdTemplate = await createTemplate(newTemplate);
      onSelectTemplate(createdTemplate);
      setOpenNewTemplate(false);
      setNewTemplate({
        description: '',
        default_quantity: 1,
        default_rate: 0,
        category: 'Personalizado'
      });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <Select
          value={selectedTemplateId}
          onValueChange={(templateId) => {
            if (templateId === 'custom') {
              // No hacer nada, solo permitir escribir manualmente
              return;
            }
            const template = templates.find(t => t.id === templateId);
            if (template) {
              onSelectTemplate(template);
            }
          }}
        >
          <SelectTrigger className="bg-input border-border text-card-foreground">
            <SelectValue placeholder="Seleccionar plantilla..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {/* Most used templates first */}
            {mostUsedTemplates.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Más utilizados
                </div>
                {mostUsedTemplates.map((template) => (
                  <SelectItem
                    key={template.id}
                    value={template.id}
                    className="text-popover-foreground"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{template.description}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.usage_count}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          €{template.default_rate.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
                {templates.length > mostUsedTemplates.length && (
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t">
                    Todas las plantillas
                  </div>
                )}
              </>
            )}
            
            {/* All templates */}
            {templates.map((template) => {
              // Don't show most used templates again
              if (mostUsedTemplates.some(mut => mut.id === template.id)) {
                return null;
              }
              return (
                <SelectItem
                  key={template.id}
                  value={template.id}
                  className="text-popover-foreground"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span>{template.description}</span>
                      {template.category && (
                        <Badge variant="outline" className="text-xs ml-2">
                          {template.category}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      €{template.default_rate.toFixed(2)}
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
      <Dialog open={openNewTemplate} onOpenChange={setOpenNewTemplate}>
        <DialogTrigger asChild>
          <Button variant="outline">Nuevo</Button>
        </DialogTrigger>
        <DialogContent className="bg-popover border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Crear plantilla de concepto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Descripción</Label>
              <Input
                className="bg-input border-border text-card-foreground"
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, description: e.target.value })
                }
                placeholder="Ej: Desarrollo web, Consultoría..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Cantidad por defecto</Label>
                <Input
                  type="number"
                  min="1"
                  className="bg-input border-border text-card-foreground"
                  value={newTemplate.default_quantity}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, default_quantity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Tarifa por defecto (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="bg-input border-border text-card-foreground"
                  value={newTemplate.default_rate}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, default_rate: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Categoría</Label>
              <Input
                className="bg-input border-border text-card-foreground"
                value={newTemplate.category}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, category: e.target.value })
                }
                placeholder="Ej: Desarrollo, Consultoría, Diseño..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateNewTemplate}>Crear plantilla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
