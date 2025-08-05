import React from 'react';
import { DatePicker } from '../../../components/DatePicker';
import { useInvoiceStore } from '../../../lib/stores';

export const StepDates: React.FC = () => {
  const { wizardDraft, setWizardDraft } = useInvoiceStore();

  const handleStartDateChange = (date: string) => {
    setWizardDraft({ start_date: date });
  };

  const handleEndDateChange = (date: string) => {
    setWizardDraft({ end_date: date });
  };

  const isEndDateValid = () => {
    if (!wizardDraft.start_date || !wizardDraft.end_date) return true;
    return new Date(wizardDraft.end_date) >= new Date(wizardDraft.start_date);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text mb-2">Paso 3: Definir Fechas</h2>
        <p className="text-textMedium">
          Establece el período de trabajo para la factura
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker
            value={wizardDraft.start_date}
            onChange={handleStartDateChange}
            label="Fecha de inicio"
            placeholder="Seleccionar fecha de inicio"
          />
          
          <DatePicker
            value={wizardDraft.end_date}
            onChange={handleEndDateChange}
            label="Fecha de fin"
            placeholder="Seleccionar fecha de fin"
            error={!isEndDateValid() ? 'La fecha de fin debe ser posterior a la fecha de inicio' : undefined}
          />
        </div>

        {wizardDraft.start_date && wizardDraft.end_date && isEndDateValid() && (
          <div className="bg-surface/30 rounded-lg p-4 border border-surface/20">
            <h3 className="font-medium text-text mb-2">Período de trabajo:</h3>
            <div className="text-textMedium">
              <p>
                <span className="font-medium">Desde:</span> {new Date(wizardDraft.start_date).toLocaleDateString('es-ES')}
              </p>
              <p>
                <span className="font-medium">Hasta:</span> {new Date(wizardDraft.end_date).toLocaleDateString('es-ES')}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-medium">Duración:</span> {
                  Math.ceil((new Date(wizardDraft.end_date).getTime() - new Date(wizardDraft.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
                } días
              </p>
            </div>
          </div>
        )}

        <div className="text-sm text-textMedium">
          <p>💡 La fecha de creación será automáticamente la fecha actual</p>
          <p>💡 Asegúrate de que la fecha de fin sea posterior a la fecha de inicio</p>
        </div>
      </div>
    </div>
  );
}; 