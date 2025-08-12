import React, { useState } from 'react';
import { useInvoiceStore } from '@/shared/lib/stores';
import type { Consultant } from '@/shared/types';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Plus } from 'lucide-react';

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
      {!isAddingNew ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-card-foreground">Seleccionar Consultor</Label>
            <Select onValueChange={(value) => {
              const consultant = consultants.find(c => c.id === value);
              if (consultant) {
                handleConsultantSelect(consultant);
              }
            }}>
              <SelectTrigger className="bg-input border-border text-card-foreground">
                <SelectValue placeholder="Elige un consultor existente" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {consultants.map((consultant) => (
                  <SelectItem key={consultant.id} value={consultant.id} className="text-popover-foreground">
                    {consultant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={() => setIsAddingNew(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Añadir nuevo consultor
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="consultorNombre" className="text-card-foreground">
                Nombre completo
              </Label>
              <Input
                id="consultorNombre"
                value={newConsultant.name}
                onChange={(e) => setNewConsultant({...newConsultant, name: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="Adrián Rocafull Berbel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultorEmail" className="text-card-foreground">
                Email
              </Label>
              <Input
                id="consultorEmail"
                type="email"
                value={newConsultant.email}
                onChange={(e) => setNewConsultant({...newConsultant, email: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="adrianrocafull1@gmail.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="consultorDireccion" className="text-card-foreground">
                Dirección
              </Label>
              <Input
                id="consultorDireccion"
                value={newConsultant.address}
                onChange={(e) => setNewConsultant({...newConsultant, address: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="Avenida Rey Juan Carlos I, 12, 16"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultorCiudad" className="text-card-foreground">
                Ciudad
              </Label>
              <Input
                id="consultorCiudad"
                value={newConsultant.city}
                onChange={(e) => setNewConsultant({...newConsultant, city: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="Torrent, Valencia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultorPais" className="text-card-foreground">
                País
              </Label>
              <Input
                id="consultorPais"
                value={newConsultant.country}
                onChange={(e) => setNewConsultant({...newConsultant, country: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="Spain"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="consultorNIF" className="text-card-foreground">
                NIF
              </Label>
              <Input
                id="consultorNIF"
                value={newConsultant.nif}
                onChange={(e) => setNewConsultant({...newConsultant, nif: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="53882287A"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleAddNew}
              className="flex-1"
              disabled={!newConsultant.name || !newConsultant.email || !newConsultant.address || 
                       !newConsultant.city || !newConsultant.country || !newConsultant.nif}
            >
              Añadir consultor
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddingNew(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {selectedConsultant && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold text-card-foreground mb-2">Consultor seleccionado:</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">Nombre:</span> {selectedConsultant.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {selectedConsultant.email}
            </p>
            <p>
              <span className="font-medium">Dirección:</span> {selectedConsultant.address}
            </p>
            <p>
              <span className="font-medium">Ciudad:</span> {selectedConsultant.city}, {selectedConsultant.country}
            </p>
            <p>
              <span className="font-medium">NIF:</span> {selectedConsultant.nif}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 