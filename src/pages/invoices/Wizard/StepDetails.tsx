import React from 'react';
import { useInvoiceStore } from '../../../lib/stores';

export const StepDetails: React.FC = () => {
  const { wizardDraft, setWizardDraft } = useInvoiceStore();

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWizardDraft({ description: e.target.value });
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWizardDraft({ total: value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text mb-2">Paso 4: Detalles del Servicio</h2>
        <p className="text-textMedium">
          Describe el trabajo realizado y establece el total
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
            Descripción del servicio
          </label>
          <textarea
            id="description"
            value={wizardDraft.description || ''}
            onChange={handleDescriptionChange}
            rows={4}
            className="input-field w-full resize-none"
            placeholder="Describe detalladamente el trabajo realizado..."
          />
        </div>

        <div>
          <label htmlFor="total" className="block text-sm font-medium text-text mb-2">
            Total (€)
          </label>
          <input
            id="total"
            type="number"
            value={wizardDraft.total || ''}
            onChange={handleTotalChange}
            min="0"
            step="0.01"
            className="input-field w-full"
            placeholder="0.00"
          />
        </div>

        {wizardDraft.description && wizardDraft.total && (
          <div className="bg-surface/30 rounded-lg p-4 border border-surface/20">
            <h3 className="font-medium text-text mb-2">Resumen:</h3>
            <div className="text-textMedium space-y-2">
              <p>
                <span className="font-medium">Descripción:</span>
              </p>
              <p className="pl-4">{wizardDraft.description}</p>
              <p>
                <span className="font-medium">Total:</span> {wizardDraft.total.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
          </div>
        )}

        <div className="text-sm text-textMedium">
          <p>💡 Sé específico en la descripción del trabajo realizado</p>
          <p>💡 El total debe incluir todos los costos asociados al servicio</p>
        </div>
      </div>
    </div>
  );
}; 