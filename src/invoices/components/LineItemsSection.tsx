import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLineItemTemplates } from "@/shared/api/hooks/useLineItemTemplates";
import { getWeekdayCountFromInvoiceIssueDate } from "@/shared/lib/helpers";
import type { LineItemTemplate } from "@/shared/types";

type LineItemWithoutId = Omit<
  import("@/shared/types").LineItem,
  "id" | "total"
>;

type FormLineItem = LineItemWithoutId & { clientKey: string };

interface LineItemsSectionProps {
  lineItems: FormLineItem[];
  issueDate: string;
  currentLineItem: LineItemWithoutId;
  vatRate: number;
  onUpdateLineItem: (index: number, data: Partial<LineItemWithoutId>) => void;
  onRemoveLineItem: (index: number) => void;
  onSetCurrentLineItem: (data: Partial<LineItemWithoutId>) => void;
  onAddLineItem: () => void;
  getLineItemTotal: (item: LineItemWithoutId) => number;
  getSubtotal: () => number;
  getVatAmount: () => number;
  getTotalAmount: () => number;
}

export const LineItemsSection: React.FC<LineItemsSectionProps> = ({
  lineItems,
  issueDate,
  vatRate,
  onUpdateLineItem,
  onSetCurrentLineItem,
  onAddLineItem,
  onRemoveLineItem,
  getLineItemTotal,
  getSubtotal,
  getVatAmount,
  getTotalAmount,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openTemplateEditor, setOpenTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LineItemTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<LineItemTemplate | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    description: '',
    default_quantity: 1,
    default_rate: 0,
    category: 'Personalizado'
  });

  const { 
    templates, 
    createTemplate, 
    updateTemplate,
    deleteTemplate,
    getMostUsedTemplates 
  } = useLineItemTemplates();

  const mostUsedTemplates = getMostUsedTemplates(5);

  const weekdayHours = useMemo(() => {
    const days = getWeekdayCountFromInvoiceIssueDate(issueDate);
    if (days === null) return null;
    return days * 8;
  }, [issueDate]);

  const handleSelectTemplate = (template: LineItemTemplate) => {
    // Set the values from the template
    onSetCurrentLineItem({
      description: template.description,
      quantity: template.default_quantity,
      rate: template.default_rate,
      includeVat: false,
    });
    // Add the line item immediately
    onAddLineItem();
    // Close the dialog
    setIsDialogOpen(false);
  };

  const isTemplateValid =
    newTemplate.description.trim().length > 0 &&
    Number.isFinite(newTemplate.default_quantity) &&
    newTemplate.default_quantity >= 1 &&
    Number.isFinite(newTemplate.default_rate) &&
    newTemplate.default_rate > 0;

  const handleOpenTemplateEditor = (template: LineItemTemplate | null = null) => {
    setEditingTemplate(template);
    setNewTemplate({
      description: template?.description ?? '',
      default_quantity: template?.default_quantity ?? 1,
      default_rate: template?.default_rate ?? 0,
      category: template ? template.category ?? '' : 'Personalizado',
    });
    setOpenTemplateEditor(true);
  };

  const handleSaveTemplate = async () => {
    if (!isTemplateValid || isSavingTemplate) return;

    setIsSavingTemplate(true);
    try {
      const values = {
        ...newTemplate,
        description: newTemplate.description.trim(),
        category: newTemplate.category.trim(),
      };
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, values);
        toast.success('Plantilla actualizada');
      } else {
        const createdTemplate = await createTemplate(values);
        handleSelectTemplate(createdTemplate);
      }
      setOpenTemplateEditor(false);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete || isDeletingTemplate) return;

    setIsDeletingTemplate(true);
    try {
      await deleteTemplate(templateToDelete.id);
      toast.success('Plantilla eliminada');
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setIsDeletingTemplate(false);
    }
  };

  const renderTemplate = (template: LineItemTemplate, showUsage: boolean) => (
    <div
      key={template.id}
      className="flex items-center gap-1 rounded-lg bg-input border border-border p-1"
    >
      <button
        type="button"
        onClick={() => handleSelectTemplate(template)}
        className="min-w-0 flex-1 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md p-2 hover:bg-input/80 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-card-foreground font-medium break-words min-w-0">
              {template.description}
            </p>
            {!showUsage && template.category && (
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {template.default_quantity} × €{template.default_rate.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showUsage && (
            <Badge variant="secondary" className="text-xs">
              {template.usage_count}
            </Badge>
          )}
          <span className="text-sm font-semibold text-card-foreground">
            €{(template.default_quantity * template.default_rate).toFixed(2)}
          </span>
        </div>
      </button>
      <div className="flex shrink-0 items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleOpenTemplateEditor(template)}
          aria-label={`Editar plantilla: ${template.description}`}
          title="Editar plantilla"
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setTemplateToDelete(template)}
          aria-label={`Eliminar plantilla: ${template.description}`}
          title="Eliminar plantilla"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-card-foreground">Conceptos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* List of added line items */}
          {lineItems.length > 0 && (
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div
                  key={item.clientKey}
                  className="flex items-start gap-3 p-4 rounded-lg bg-accent/30 border border-border"
                >
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Descripción</Label>
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            onUpdateLineItem(index, { description: e.target.value })
                          }
                          placeholder="Descripción del concepto..."
                          className="bg-input border-border text-card-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Cantidad</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={item.quantity}
                            onChange={(e) =>
                              onUpdateLineItem(index, { quantity: Number(e.target.value) })
                            }
                            className="min-w-0 flex-1 bg-input border-border text-card-foreground"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={weekdayHours === null}
                                  onClick={() => {
                                    if (weekdayHours === null) return;
                                    onUpdateLineItem(index, {
                                      quantity: weekdayHours,
                                    });
                                  }}
                                  className="h-10 w-10 text-muted-foreground hover:text-card-foreground"
                                  aria-label="Rellenar horas según días laborables del mes"
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6} className="max-w-xs">
                              Asigna la cantidad como horas: días de lunes a
                              viernes del mes de la fecha de emisión (sin festivos)
                              × 8 h por día.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Tarifa (€)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            onUpdateLineItem(index, { rate: Number(e.target.value) })
                          }
                          className="bg-input border-border text-card-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Total</Label>
                        <div className="h-10 flex items-center px-3 rounded-md bg-accent/30 border border-border">
                          <span className="text-card-foreground font-semibold">
                            €{getLineItemTotal(item).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-1">
                      <Switch
                        id={`vat-${index}`}
                        checked={item.includeVat || false}
                        onCheckedChange={(checked) =>
                          onUpdateLineItem(index, { includeVat: checked })
                        }
                      />
                      <Label htmlFor={`vat-${index}`} className="text-xs text-muted-foreground cursor-pointer">
                        Aplicar IVA ({vatRate}%) a este concepto
                      </Label>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveLineItem(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 mt-7"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add line item button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            Añadir concepto
          </Button>
        </div>

        {/* Dialog for selecting template */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-popover border-border max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                Seleccionar plantilla de concepto
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Most used templates */}
              {mostUsedTemplates.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2">
                    <TrendingUp className="w-4 h-4" />
                    Más utilizados
                  </div>
                  <div className="space-y-2">
                    {mostUsedTemplates.map((template) => renderTemplate(template, true))}
                  </div>
                </div>
              )}

              {/* All templates */}
              {templates.length > mostUsedTemplates.length && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground px-2 border-t border-border pt-4">
                    Todas las plantillas
                  </div>
                  <div className="space-y-2">
                    {templates.map((template) => {
                      // Don't show most used templates again
                      if (mostUsedTemplates.some(mut => mut.id === template.id)) {
                        return null;
                      }
                      return renderTemplate(template, false);
                    })}
                  </div>
                </div>
              )}

              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay plantillas. Crea una para añadir conceptos rápidamente.
                </p>
              )}

              {/* Create new template button */}
              <div className="border-t border-border pt-4">
                <Button 
                  type="button"
                  onClick={() => handleOpenTemplateEditor()}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear nueva plantilla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog for creating or editing a template */}
        <Dialog
          open={openTemplateEditor}
          onOpenChange={(open) => {
            if (!isSavingTemplate) setOpenTemplateEditor(open);
          }}
        >
          <DialogContent className="bg-popover border-border" showClose={!isSavingTemplate}>
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                {editingTemplate ? 'Editar plantilla de concepto' : 'Crear plantilla de concepto'}
              </DialogTitle>
            </DialogHeader>
            <fieldset disabled={isSavingTemplate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="template-description" className="text-card-foreground">Descripción</Label>
                <Input
                  id="template-description"
                  className="bg-input border-border text-card-foreground"
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, description: e.target.value })
                  }
                  placeholder="Ej: Desarrollo web, Consultoría..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="template-quantity" className="text-card-foreground">Cantidad por defecto</Label>
                  <Input
                    id="template-quantity"
                    type="number"
                    min="1"
                    className="bg-input border-border text-card-foreground"
                    value={newTemplate.default_quantity}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, default_quantity: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="template-rate" className="text-card-foreground">Tarifa por defecto (€)</Label>
                  <Input
                    id="template-rate"
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="template-category" className="text-card-foreground">Categoría</Label>
                <Input
                  id="template-category"
                  className="bg-input border-border text-card-foreground"
                  value={newTemplate.category}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, category: e.target.value })
                  }
                  placeholder="Ej: Desarrollo, Consultoría, Diseño..."
                />
              </div>
            </fieldset>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSavingTemplate}
                onClick={() => setOpenTemplateEditor(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveTemplate}
                disabled={!isTemplateValid || isSavingTemplate}
              >
                {isSavingTemplate ? 'Guardando...' : editingTemplate ? 'Guardar cambios' : 'Crear plantilla'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(templateToDelete)}
          onOpenChange={(open) => {
            if (!open && !isDeletingTemplate) setTemplateToDelete(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar plantilla</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Quieres eliminar la plantilla «{templateToDelete?.description}»?
                Esta acción no se puede deshacer. Los conceptos ya añadidos a
                las facturas se conservarán.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingTemplate}>Cancelar</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeletingTemplate}
                  onClick={(event) => {
                    event.preventDefault();
                    void handleDeleteTemplate();
                  }}
                >
                  {isDeletingTemplate ? 'Eliminando...' : 'Eliminar plantilla'}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Totals */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row md:justify-end">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-card-foreground font-medium">
                  € {getSubtotal().toFixed(2)}
                </span>
              </div>
              {getVatAmount() > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">IVA ({vatRate}%)</span>
                  <span className="text-card-foreground font-medium">
                    € {getVatAmount().toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-card-foreground font-semibold text-base">
                  Total
                </span>
                <span className="text-card-foreground font-bold text-xl">
                  € {getTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* VAT Information */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {getVatAmount() > 0
              ? `Se está aplicando IVA (${vatRate}%) a ${lineItems.filter(item => item.includeVat).length} de ${lineItems.length} concepto(s)`
              : "No se está aplicando IVA a ningún concepto"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
