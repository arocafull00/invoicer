import React from 'react';
import { useInvoiceStore } from '@/shared/lib/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const StepDetails: React.FC = () => {
  const { wizardDraft } = useInvoiceStore();

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    useInvoiceStore.setState({
      wizardDraft: { ...wizardDraft, description: e.target.value }
    });
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    useInvoiceStore.setState({
      wizardDraft: { ...wizardDraft, total: value }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="descripcionServicio" className="text-card-foreground">
            Descripción del servicio
          </Label>
          <Textarea
            id="descripcionServicio"
            value={wizardDraft.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Software development and consulting services"
            className="bg-input border-border text-card-foreground min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="montoTotal" className="text-card-foreground">
            Monto total (€)
          </Label>
          <Input
            id="montoTotal"
            type="number"
            value={wizardDraft.total || ''}
            onChange={handleTotalChange}
            step="0.01"
            min="0"
            placeholder="2750"
            className="bg-input border-border text-card-foreground"
          />
        </div>

        {wizardDraft.description && wizardDraft.total && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-card-foreground font-semibold mb-3">Resumen:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Descripción:</span> {wizardDraft.description}
              </p>
              <p>
                <span className="font-medium">Total:</span> {wizardDraft.total.toFixed(2)} €
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 