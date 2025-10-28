import React from "react";
import { toast } from "react-toastify";
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
import type { Consultant } from "@/shared/types";

interface ConsultantSectionProps {
  consultants: Consultant[];
  selectedConsultantId: string;
  selectedConsultant: Consultant | undefined;
  openDialog: boolean;
  newConsultant: Partial<Consultant>;
  onSelectConsultant: (id: string) => void;
  onDialogChange: (open: boolean) => void;
  onNewConsultantChange: (data: Partial<Consultant>) => void;
  onCreateConsultant: () => Promise<void>;
}

export const ConsultantSection: React.FC<ConsultantSectionProps> = ({
  consultants,
  selectedConsultantId,
  selectedConsultant,
  openDialog,
  newConsultant,
  onSelectConsultant,
  onDialogChange,
  onNewConsultantChange,
  onCreateConsultant,
}) => {
  const handleCreate = async () => {
    try {
      await onCreateConsultant();
      toast.success("Consultor creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el consultor");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-card-foreground">Emitido por</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Select
              value={selectedConsultantId}
              onValueChange={onSelectConsultant}
            >
              <SelectTrigger className="bg-input border-border text-card-foreground">
                <SelectValue placeholder="Seleccionar consultor" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {consultants.map((c) => (
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
                  Crear consultor
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Nombre</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newConsultant.name || ""}
                    onChange={(e) =>
                      onNewConsultantChange({ name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Email</Label>
                  <Input
                    type="email"
                    className="bg-input border-border text-card-foreground"
                    value={newConsultant.email || ""}
                    onChange={(e) =>
                      onNewConsultantChange({ email: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-card-foreground">Dirección</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newConsultant.address || ""}
                    onChange={(e) =>
                      onNewConsultantChange({ address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Ciudad</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newConsultant.city || ""}
                    onChange={(e) =>
                      onNewConsultantChange({ city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">País</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newConsultant.country || ""}
                    onChange={(e) =>
                      onNewConsultantChange({ country: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-card-foreground">NIF</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newConsultant.nif || ""}
                    onChange={(e) =>
                      onNewConsultantChange({ nif: e.target.value })
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
        {selectedConsultant && (
          <div className="text-sm text-muted-foreground leading-6">
            <div className="font-semibold text-card-foreground">
              {selectedConsultant.name}
            </div>
            <div>{selectedConsultant.address}</div>
            <div>
              {selectedConsultant.city}, {selectedConsultant.country}
            </div>
            <div>{selectedConsultant.email}</div>
            <div>NIF: {selectedConsultant.nif}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
