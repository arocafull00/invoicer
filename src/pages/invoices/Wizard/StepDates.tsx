import React from 'react';
import { useInvoiceStore } from '@/lib/stores';
import { DatePicker } from '@/components/DatePicker';

export const StepDates: React.FC = () => {
  const { wizardDraft } = useInvoiceStore();

  const handleStartDateChange = (date: string) => {
    useInvoiceStore.setState({
      wizardDraft: { ...wizardDraft, start_date: date }
    });
  };

  const handleEndDateChange = (date: string) => {
    useInvoiceStore.setState({
      wizardDraft: { ...wizardDraft, end_date: date }
    });
  };

  const isEndDateValid = () => {
    if (!wizardDraft.start_date || !wizardDraft.end_date) return true;
    return new Date(wizardDraft.end_date) >= new Date(wizardDraft.start_date);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text mb-2">Período de Trabajo</h2>
        <p className="text-textMedium">Define el período de trabajo para la factura</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Fecha de inicio
          </label>
          <DatePicker
            value={wizardDraft.start_date || ''}
            onChange={handleStartDateChange}
            placeholder="Seleccionar fecha de inicio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Fecha de fin
          </label>
          <DatePicker
            value={wizardDraft.end_date || ''}
            onChange={handleEndDateChange}
            placeholder="Seleccionar fecha de fin"
          />
          {!isEndDateValid() && (
            <p className="text-red-500 text-sm mt-1">
              La fecha de fin debe ser posterior a la fecha de inicio
            </p>
          )}
        </div>
      </div>

      {wizardDraft.start_date && wizardDraft.end_date && isEndDateValid() && (
        <div className="bg-surface p-4 rounded-lg">
          <h3 className="font-semibold text-text mb-2">Período seleccionado:</h3>
          <div className="text-sm text-textMedium">
            <p>
              <strong>Desde:</strong> {new Date(wizardDraft.start_date).toLocaleDateString('es-ES')}
            </p>
            <p>
              <strong>Hasta:</strong> {new Date(wizardDraft.end_date).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 