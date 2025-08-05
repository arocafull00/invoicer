import React, { useState } from 'react';
import { useInvoiceStore } from '@/lib/stores';
import type { Client } from '@/types';
import { Autocomplete } from '@/components/Autocomplete';

export const StepClient: React.FC = () => {
  const { clients, wizardDraft } = useInvoiceStore();
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    wizardDraft.client || null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    address: '',
    city: '',
    country: '',
    company_number: ''
  });

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    useInvoiceStore.setState({
      wizardDraft: { ...wizardDraft, client }
    });
  };

  const handleAddNew = () => {
    if (newClient.name && newClient.email && newClient.address && 
        newClient.city && newClient.country) {
      const client: Client = {
        id: Date.now().toString(),
        name: newClient.name,
        email: newClient.email,
        address: newClient.address,
        city: newClient.city,
        country: newClient.country,
        company_number: newClient.company_number
      };
      
      // Añadir a la lista de clientes
      useInvoiceStore.setState({
        clients: [...clients, client],
        wizardDraft: { ...wizardDraft, client }
      });
      
      setSelectedClient(client);
      setIsAddingNew(false);
      setNewClient({
        name: '',
        email: '',
        address: '',
        city: '',
        country: '',
        company_number: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text mb-2">Seleccionar Cliente</h2>
        <p className="text-textMedium">Elige un cliente existente o añade uno nuevo</p>
      </div>

      {!isAddingNew ? (
        <div className="space-y-4">
          <Autocomplete
            options={clients}
            value={selectedClient}
            onChange={handleClientSelect}
            getOptionLabel={(option) => option.name}
            placeholder="Buscar cliente..."
          />
          
          <button
            onClick={() => setIsAddingNew(true)}
            className="btn-secondary w-full"
          >
            + Añadir nuevo cliente
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Nombre de la empresa
              </label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                className="input-field w-full"
                placeholder="ViralRankers Ltd"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                className="input-field w-full"
                placeholder="info@viralrankers.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                className="input-field w-full"
                placeholder="Victoria House, Office D, Suite 21/22, 26 Main Street"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={newClient.city}
                onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                className="input-field w-full"
                placeholder="Gibraltar"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                País/Código Postal
              </label>
              <input
                type="text"
                value={newClient.country}
                onChange={(e) => setNewClient({...newClient, country: e.target.value})}
                className="input-field w-full"
                placeholder="GX11 1AA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Número de empresa (opcional)
              </label>
              <input
                type="text"
                value={newClient.company_number}
                onChange={(e) => setNewClient({...newClient, company_number: e.target.value})}
                className="input-field w-full"
                placeholder="125275"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAddNew}
              className="btn-primary flex-1"
              disabled={!newClient.name || !newClient.email || !newClient.address || 
                       !newClient.city || !newClient.country}
            >
              Añadir cliente
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {selectedClient && (
        <div className="bg-surface p-4 rounded-lg">
          <h3 className="font-semibold text-text mb-2">Cliente seleccionado:</h3>
          <div className="text-sm text-textMedium space-y-1">
            <p><strong>Empresa:</strong> {selectedClient.name}</p>
            <p><strong>Email:</strong> {selectedClient.email}</p>
            <p><strong>Dirección:</strong> {selectedClient.address}</p>
            <p><strong>Ciudad:</strong> {selectedClient.city}, {selectedClient.country}</p>
            {selectedClient.company_number && (
              <p><strong>Número de empresa:</strong> {selectedClient.company_number}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 