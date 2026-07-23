import React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Client } from "@/shared/types";

interface ClientSectionProps {
  clients: Client[];
  selectedClientId: string;
  selectedClient: Client | undefined;
  openDialog: boolean;
  newClient: Partial<Client>;
  onSelectClient: (id: string) => void;
  onDialogChange: (open: boolean) => void;
  onNewClientChange: (data: Partial<Client>) => void;
  onCreateClient: () => Promise<void>;
}

export const ClientSection: React.FC<ClientSectionProps> = ({
  clients,
  selectedClientId,
  selectedClient,
  openDialog,
  newClient,
  onSelectClient,
  onDialogChange,
  onNewClientChange,
  onCreateClient,
}) => {
  const handleCreate = async () => {
    try {
      await onCreateClient();
      toast.success("Cliente creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el cliente");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-card-foreground">Facturar a</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Select value={selectedClientId} onValueChange={onSelectClient}>
              <SelectTrigger className="bg-input border-border text-card-foreground">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {clients.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={c.id}
                    className="text-popover-foreground"
                  >
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={openDialog} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
              <Button variant="outline">Nuevo</Button>
            </DialogTrigger>
            <DialogContent className="bg-popover border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">
                  Crear cliente
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Nombre</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newClient.name || ""}
                    onChange={(e) => onNewClientChange({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Email</Label>
                  <Input
                    type="email"
                    className="bg-input border-border text-card-foreground"
                    value={newClient.email || ""}
                    onChange={(e) =>
                      onNewClientChange({ email: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-card-foreground">Dirección</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newClient.address || ""}
                    onChange={(e) =>
                      onNewClientChange({ address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Ciudad</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newClient.city || ""}
                    onChange={(e) => onNewClientChange({ city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">País</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newClient.country || ""}
                    onChange={(e) =>
                      onNewClientChange({ country: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-card-foreground">
                    Número de empresa (opcional)
                  </Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newClient.company_number || ""}
                    onChange={(e) =>
                      onNewClientChange({ company_number: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {selectedClient && (
          <div className="text-sm text-muted-foreground leading-6">
            <div className="font-semibold text-card-foreground">{selectedClient.name}</div>
            <div>{selectedClient.address}</div>
            <div>
              {selectedClient.city}, {selectedClient.country}
            </div>
            {selectedClient.company_number && (
              <div>Número de empresa: {selectedClient.company_number}</div>
            )}
            <div>{selectedClient.email}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
