import React, { useEffect } from 'react';
import { Autocomplete } from '../../../components/Autocomplete';
import { useInvoiceStore } from '../../../lib/stores';
import { Consultant } from '../../../types';

export const StepConsultant: React.FC = () => {
  const { wizardDraft, setWizardDraft, consultants, setConsultants } = useInvoiceStore();

  useEffect(() => {
    // Simular carga de consultores - en producción esto vendría de Supabase
    const mockConsultants: Consultant[] = [
      { id: '1', name: 'Juan Pérez', email: 'juan@example.com', created_at: '2024-01-01' },
      { id: '2', name: 'María García', email: 'maria@example.com', created_at: '2024-01-01' },
      { id: '3', name: 'Carlos López', email: 'carlos@example.com', created_at: '2024-01-01' },
    ];
    setConsultants(mockConsultants);
  }, [setConsultants]);

  const handleConsultantChange = (consultantId: string) => {
    setWizardDraft({ consultant_id: consultantId });
  };

  const handleAddNewConsultant = (name: string) => {
    // En producción, esto insertaría en Supabase
    const newConsultant: Consultant = {
      id: Date.now().toString(),
      name,
      email: '',
      created_at: new Date().toISOString(),
    };
    setConsultants([...consultants, newConsultant]);
    setWizardDraft({ consultant_id: newConsultant.id });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text mb-2">Paso 1: Seleccionar Consultor</h2>
        <p className="text-textMedium">
          Elige el consultor que realizará el trabajo
        </p>
      </div>

      <div className="space-y-6">
        <Autocomplete
          options={consultants}
          value={wizardDraft.consultant_id}
          onChange={handleConsultantChange}
          placeholder="Buscar consultor..."
          label="Consultor"
          onAddNew={handleAddNewConsultant}
        />

        {wizardDraft.consultant_id && (
          <div className="bg-surface/30 rounded-lg p-4 border border-surface/20">
            <h3 className="font-medium text-text mb-2">Consultor seleccionado:</h3>
            {(() => {
              const consultant = consultants.find(c => c.id === wizardDraft.consultant_id);
              return consultant ? (
                <div className="text-textMedium">
                  <p className="font-medium text-text">{consultant.name}</p>
                  {consultant.email && <p>{consultant.email}</p>}
                </div>
              ) : null;
            })()}
          </div>
        )}

        <div className="text-sm text-textMedium">
          <p>💡 Puedes buscar por nombre o email del consultor</p>
          <p>💡 Si no encuentras el consultor, puedes agregarlo directamente</p>
        </div>
      </div>
    </div>
  );
}; 