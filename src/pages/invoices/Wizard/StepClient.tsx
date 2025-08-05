import React, { useEffect } from 'react';
import { Autocomplete } from '../../../components/Autocomplete';
import { useInvoiceStore } from '../../../lib/stores';
import { Client } from '../../../types';

export const StepClient: React.FC = () => {
  const { wizardDraft, setWizardDraft, clients, setClients } = useInvoiceStore();

  useEffect(() => {
    // Simular carga de clientes - en producción esto vendría de Supabase
    const mockClients: Client[] = [
      { id: '1', name: 'Empresa ABC', email: 'contacto@abc.com', address: 'Madrid, España', created_at: '2024-01-01' },
      { id: '2', name: 'Startup XYZ', email: 'hello@xyz.com', address: 'Barcelona, España', created_at: '2024-01-01' },
      { id: '3', name: 'Tech Solutions', email: 'info@techsolutions.com', address: 'Valencia, España', created_at: '2024-01-01' },
    ];
    setClients(mockClients);
  }, [setClients]);

  const handleClientChange = (clientId: string) => {
    setWizardDraft({ client_id: clientId });
  };

  const handleAddNewClient = (name: string) => {
    // En producción, esto insertaría en Supabase
    const newClient: Client = {
      id: Date.now().toString(),
      name,
      email: '',
      address: '',
      created_at: new Date().toISOString(),
    };
    setClients([...clients, newClient]);
    setWizardDraft({ client_id: newClient.id });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text mb-2">Paso 2: Seleccionar Cliente</h2>
        <p className="text-textMedium">
          Elige el cliente para quien se realizará el trabajo
        </p>
      </div>

      <div className="space-y-6">
        <Autocomplete
          options={clients}
          value={wizardDraft.client_id}
          onChange={handleClientChange}
          placeholder="Buscar cliente..."
          label="Cliente"
          onAddNew={handleAddNewClient}
        />

        {wizardDraft.client_id && (
          <div className="bg-surface/30 rounded-lg p-4 border border-surface/20">
            <h3 className="font-medium text-text mb-2">Cliente seleccionado:</h3>
            {(() => {
              const client = clients.find(c => c.id === wizardDraft.client_id);
              return client ? (
                <div className="text-textMedium">
                  <p className="font-medium text-text">{client.name}</p>
                  {client.email && <p>{client.email}</p>}
                  {client.address && <p>{client.address}</p>}
                </div>
              ) : null;
            })()}
          </div>
        )}

        <div className="text-sm text-textMedium">
          <p>💡 Puedes buscar por nombre, email o dirección del cliente</p>
          <p>💡 Si no encuentras el cliente, puedes agregarlo directamente</p>
        </div>
      </div>
    </div>
  );
}; 