import React, { useState } from 'react';
import { useInvoiceStore } from '@/shared/lib/stores';
import type { Client } from '@/shared/types';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Plus } from 'lucide-react';

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
      {!isAddingNew ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-card-foreground">Seleccionar Cliente</Label>
            <Select onValueChange={(value) => {
              const client = clients.find(c => c.id === value);
              if (client) {
                handleClientSelect(client);
              }
            }}>
              <SelectTrigger className="bg-input border-border text-card-foreground">
                <SelectValue placeholder="Elige un cliente existente" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="text-popover-foreground">
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={() => setIsAddingNew(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Añadir nuevo cliente
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clienteNombre" className="text-card-foreground">
                Nombre de la empresa
              </Label>
              <Input
                id="clienteNombre"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="ViralRankers Ltd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clienteEmail" className="text-card-foreground">
                Email
              </Label>
              <Input
                id="clienteEmail"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="info@viralrankers.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clienteDireccion" className="text-card-foreground">
                Dirección
              </Label>
              <Input
                id="clienteDireccion"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="Victoria House, Office D, Suite 21/22, 26 Main Street"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clienteCiudad" className="text-card-foreground">
                Ciudad
              </Label>
              <Input
                id="clienteCiudad"
                value={newClient.city}
                onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="Gibraltar, GX11 1AA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clienteNumeroEmpresa" className="text-card-foreground">
                Número de empresa
              </Label>
              <Input
                id="clienteNumeroEmpresa"
                value={newClient.company_number}
                onChange={(e) => setNewClient({...newClient, company_number: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="125275"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleAddNew}
              className="flex-1"
              disabled={!newClient.name || !newClient.email || !newClient.address || 
                       !newClient.city}
            >
              Añadir cliente
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

      {selectedClient && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold text-card-foreground mb-3">Cliente seleccionado:</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">Empresa:</span> {selectedClient.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {selectedClient.email}
            </p>
            <p>
              <span className="font-medium">Dirección:</span> {selectedClient.address}
            </p>
            <p>
              <span className="font-medium">Ciudad:</span> {selectedClient.city}
            </p>
            {selectedClient.company_number && (
              <p>
                <span className="font-medium">Número de empresa:</span> {selectedClient.company_number}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 