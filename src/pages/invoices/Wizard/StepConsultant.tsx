import React, { useState } from 'react';
import { useInvoiceStore } from '@/lib/stores';
import type { Consultant } from '@/types';
import { Autocomplete } from '@/components/Autocomplete';

export const StepConsultant: React.FC = () => {
  const { consultants, wizardDraft } = useInvoiceStore();
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(
    wizardDraft.consultant || null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newConsultant, setNewConsultant] = useState<Partial<Consultant>>({
    name: '',
    email: '',
    address: '',
    city: '',
    country: '',
    nif: ''
  });

  const handleConsultantSelect = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    useInvoiceStore.setState({
      wizardDraft: { ...wizardDraft, consultant }
    });
  };

  const handleAddNew = () => {
    if (newConsultant.name && newConsultant.email && newConsultant.address && 
        newConsultant.city && newConsultant.country && newConsultant.nif) {
      const consultant: Consultant = {
        id: Date.now().toString(),
        name: newConsultant.name,
        email: newConsultant.email,
        address: newConsultant.address,
        city: newConsultant.city,
        country: newConsultant.country,
        nif: newConsultant.nif
      };
      
      // Añadir a la lista de consultores
      useInvoiceStore.setState({
        consultants: [...consultants, consultant],
        wizardDraft: { ...wizardDraft, consultant }
      });
      
      setSelectedConsultant(consultant);
      setIsAddingNew(false);
      setNewConsultant({
        name: '',
        email: '',
        address: '',
        city: '',
        country: '',
        nif: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text mb-2">Seleccionar Consultor</h2>
        <p className="text-textMedium">Elige un consultor existente o añade uno nuevo</p>
      </div>

      {!isAddingNew ? (
        <div className="space-y-4">
          <Autocomplete
            options={consultants}
            value={selectedConsultant}
            onChange={handleConsultantSelect}
            getOptionLabel={(option) => option.name}
            placeholder="Buscar consultor..."
          />
          
          <button
            onClick={() => setIsAddingNew(true)}
            className="btn-secondary w-full"
          >
            + Añadir nuevo consultor
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={newConsultant.name}
                onChange={(e) => setNewConsultant({...newConsultant, name: e.target.value})}
                className="input-field w-full"
                placeholder="Adrián Rocafull Berbel"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={newConsultant.email}
                onChange={(e) => setNewConsultant({...newConsultant, email: e.target.value})}
                className="input-field w-full"
                placeholder="adrianrocafull1@gmail.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={newConsultant.address}
                onChange={(e) => setNewConsultant({...newConsultant, address: e.target.value})}
                className="input-field w-full"
                placeholder="Avenida Rey Juan Carlos I, 12, 16"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={newConsultant.city}
                onChange={(e) => setNewConsultant({...newConsultant, city: e.target.value})}
                className="input-field w-full"
                placeholder="Torrent, Valencia"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                País
              </label>
              <input
                type="text"
                value={newConsultant.country}
                onChange={(e) => setNewConsultant({...newConsultant, country: e.target.value})}
                className="input-field w-full"
                placeholder="Spain"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                NIF
              </label>
              <input
                type="text"
                value={newConsultant.nif}
                onChange={(e) => setNewConsultant({...newConsultant, nif: e.target.value})}
                className="input-field w-full"
                placeholder="53882287A"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAddNew}
              className="btn-primary flex-1"
              disabled={!newConsultant.name || !newConsultant.email || !newConsultant.address || 
                       !newConsultant.city || !newConsultant.country || !newConsultant.nif}
            >
              Añadir consultor
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

      {selectedConsultant && (
        <div className="bg-surface p-4 rounded-lg">
          <h3 className="font-semibold text-text mb-2">Consultor seleccionado:</h3>
          <div className="text-sm text-textMedium space-y-1">
            <p><strong>Nombre:</strong> {selectedConsultant.name}</p>
            <p><strong>Email:</strong> {selectedConsultant.email}</p>
            <p><strong>Dirección:</strong> {selectedConsultant.address}</p>
            <p><strong>Ciudad:</strong> {selectedConsultant.city}, {selectedConsultant.country}</p>
            <p><strong>NIF:</strong> {selectedConsultant.nif}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 