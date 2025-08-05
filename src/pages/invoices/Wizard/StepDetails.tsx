import React from 'react';
import { useInvoiceStore } from '@/lib/stores';

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
      <div>
        <h2 className="text-2xl font-bold text-text mb-2">Detalles del Servicio</h2>
        <p className="text-textMedium">Describe el servicio y establece el monto total</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Descripción del servicio
          </label>
          <textarea
            value={wizardDraft.description || ''}
            onChange={handleDescriptionChange}
            rows={4}
            className="input-field w-full resize-none"
            placeholder="Full stack development and consulting services"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Monto total (€)
          </label>
          <input
            type="number"
            value={wizardDraft.total || ''}
            onChange={handleTotalChange}
            step="0.01"
            min="0"
            className="input-field w-full"
            placeholder="2880.00"
          />
        </div>
      </div>

      {wizardDraft.description && wizardDraft.total && (
        <div className="bg-surface p-4 rounded-lg">
          <h3 className="font-semibold text-text mb-2">Resumen:</h3>
          <div className="text-sm text-textMedium space-y-1">
            <p><strong>Descripción:</strong> {wizardDraft.description}</p>
            <p><strong>Total:</strong> {wizardDraft.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 