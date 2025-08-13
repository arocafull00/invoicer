import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useInvoiceStore } from '@/shared/lib/stores';
import { createConsultant } from '@/shared/api/services';
import type { Consultant } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export const StepConsultant: React.FC = () => {
  const { consultants, wizardDraft, addConsultant, setWizardDraft } = useInvoiceStore();
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(
    wizardDraft.consultant || null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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
    setWizardDraft({ ...wizardDraft, consultant });
  };

  const handleAddNew = async () => {
    if (!newConsultant.name || !newConsultant.email || !newConsultant.address || 
        !newConsultant.city || !newConsultant.country || !newConsultant.nif) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsCreating(true);

    try {
      const consultantData = {
        name: newConsultant.name,
        email: newConsultant.email,
        address: newConsultant.address,
        city: newConsultant.city,
        country: newConsultant.country,
        nif: newConsultant.nif
      };

      const createdConsultant = await createConsultant(consultantData);
      
      // Añadir al store local
      addConsultant(createdConsultant);
      
      // Seleccionar el nuevo consultor
      setSelectedConsultant(createdConsultant);
      setWizardDraft({ ...wizardDraft, consultant: createdConsultant });
      
      // Limpiar formulario
      setIsAddingNew(false);
      setNewConsultant({
        name: '',
        email: '',
        address: '',
        city: '',
        country: '',
        nif: ''
      });

      toast.success('Consultor creado exitosamente');
      
    } catch (error) {
      console.error('Error creating consultant:', error);
      toast.error('Error al crear el consultor. Inténtalo de nuevo.');
    } finally {
      setIsCreating(false);
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
                placeholder="Lucía Fernández"
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
                placeholder="lucia.fernandez@example.com"
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
                placeholder="Calle Falsa 123, Piso 4B"
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
                placeholder="Sevilla"
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
                placeholder="España"
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
                placeholder="X1234567A"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleAddNew}
              className="flex-1"
              disabled={isCreating || !newConsultant.name || !newConsultant.email || !newConsultant.address || 
                       !newConsultant.city || !newConsultant.country || !newConsultant.nif}
            >
              {isCreating ? 'Creando...' : 'Añadir consultor'}
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