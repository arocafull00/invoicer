import React from 'react';
import { useInvoiceStore } from '@/shared/lib/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const StepDates: React.FC = () => {
  const { wizardDraft } = useInvoiceStore();

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    useInvoiceStore.setState({
      wizardDraft: { ...wizardDraft, start_date: e.target.value }
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    useInvoiceStore.setState({
      wizardDraft: { ...wizardDraft, end_date: e.target.value }
    });
  };

  const isEndDateValid = () => {
    if (!wizardDraft.start_date || !wizardDraft.end_date) return true;
    return new Date(wizardDraft.end_date) >= new Date(wizardDraft.start_date);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fechaEmision" className="text-card-foreground">
            Fecha de emisión
          </Label>
          <Input
            id="fechaEmision"
            type="date"
            value={wizardDraft.start_date || ''}
            onChange={handleStartDateChange}
            className="bg-input border-border text-card-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaVencimiento" className="text-card-foreground">
            Fecha de vencimiento
          </Label>
          <Input
            id="fechaVencimiento"
            type="date"
            value={wizardDraft.end_date || ''}
            onChange={handleEndDateChange}
            className="bg-input border-border text-card-foreground"
          />
          {!isEndDateValid() && (
            <p className="text-destructive text-sm mt-1">
              La fecha de vencimiento debe ser posterior a la fecha de emisión
            </p>
          )}
        </div>
      </div>

      {wizardDraft.start_date && wizardDraft.end_date && isEndDateValid() && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold text-card-foreground mb-2">Período seleccionado:</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">Desde:</span> {new Date(wizardDraft.start_date).toLocaleDateString('es-ES')}
            </p>
            <p>
              <span className="font-medium">Hasta:</span> {new Date(wizardDraft.end_date).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 