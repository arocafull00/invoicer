import React from "react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { PaymentInstruction } from "@/shared/types";

interface PaymentMethodSectionProps {
  paymentInstructions: PaymentInstruction[];
  selectedPaymentId: string;
  selectedPayment: PaymentInstruction | undefined;
  openDialog: boolean;
  newPayment: Partial<PaymentInstruction>;
  onSelectPayment: (id: string) => void;
  onDialogChange: (open: boolean) => void;
  onNewPaymentChange: (data: Partial<PaymentInstruction>) => void;
  onCreatePayment: () => Promise<void>;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  paymentInstructions,
  selectedPaymentId,
  selectedPayment,
  openDialog,
  newPayment,
  onSelectPayment,
  onDialogChange,
  onNewPaymentChange,
  onCreatePayment,
}) => {
  const handleCreate = async () => {
    try {
      await onCreatePayment();
      toast.success("Método de pago creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el método de pago");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-card-foreground">Método de pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Select value={selectedPaymentId} onValueChange={onSelectPayment}>
              <SelectTrigger className="bg-input border-border text-card-foreground">
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {paymentInstructions.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    className="text-popover-foreground"
                  >
                    {p.account_holder} - {p.payment_method}
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
                  Crear método de pago
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Titular</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newPayment.account_holder || ""}
                    onChange={(e) =>
                      onNewPaymentChange({ account_holder: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">IBAN</Label>
                  <Input
                    className="bg-input border-border text-card-foreground"
                    value={newPayment.iban || ""}
                    onChange={(e) => onNewPaymentChange({ iban: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Método</Label>
                  <Select
                    value={newPayment.payment_method || ""}
                    onValueChange={(v: string) =>
                      onNewPaymentChange({ payment_method: v })
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-card-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem
                        value="Transferencia bancaria"
                        className="text-popover-foreground"
                      >
                        Transferencia bancaria
                      </SelectItem>
                      <SelectItem value="PayPal" className="text-popover-foreground">
                        PayPal
                      </SelectItem>
                      <SelectItem
                        value="Tarjeta de crédito"
                        className="text-popover-foreground"
                      >
                        Tarjeta de crédito
                      </SelectItem>
                      <SelectItem
                        value="Efectivo"
                        className="text-popover-foreground"
                      >
                        Efectivo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Plazo</Label>
                  <Select
                    value={newPayment.payment_terms || ""}
                    onValueChange={(v: string) =>
                      onNewPaymentChange({ payment_terms: v })
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-card-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem
                        value="El pago debe realizarse dentro de los 14 días naturales desde la fecha de la factura."
                        className="text-popover-foreground"
                      >
                        14 días
                      </SelectItem>
                      <SelectItem
                        value="El pago debe realizarse dentro de los 30 días naturales desde la fecha de la factura."
                        className="text-popover-foreground"
                      >
                        30 días
                      </SelectItem>
                      <SelectItem
                        value="El pago debe realizarse de forma inmediata a la recepción de esta factura."
                        className="text-popover-foreground"
                      >
                        Inmediato
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-card-foreground">
                    Datos adicionales
                  </Label>
                  <Textarea
                    className="bg-input border-border text-card-foreground h-24"
                    value={newPayment.additional_data || ""}
                    onChange={(e) =>
                      onNewPaymentChange({ additional_data: e.target.value })
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
        {selectedPayment && (
          <div className="text-sm text-[#A1A1AA] leading-6">
            <div className="font-semibold text-white">
              {selectedPayment.account_holder} — {selectedPayment.payment_method}
            </div>
            <div>IBAN: {selectedPayment.iban}</div>
            <div>{selectedPayment.payment_terms}</div>
            <div className="text-xs opacity-80">
              {selectedPayment.additional_data}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
