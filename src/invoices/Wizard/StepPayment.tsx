import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useInvoiceStore } from '@/shared/lib/stores';
import { createPaymentInstruction } from '@/shared/api/services';
import type { PaymentInstruction } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

export const StepPayment: React.FC = () => {
  const { payment_instructions, wizardDraft, addPaymentInstruction, setWizardDraft } = useInvoiceStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentInstruction | null>(
    wizardDraft.payment_instructions || null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<PaymentInstruction>>({
    account_holder: '',
    iban: '',
    payment_method: 'Transferencia bancaria',
    payment_terms: 'El pago debe realizarse dentro de los 14 días naturales desde la fecha de la factura.',
    additional_data: 'ESTA OPERACIÓN ESTÁ EXENTA DE IVA en virtud del artículo 21.1 de la Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido.'
  });

  const handlePaymentSelect = (payment: PaymentInstruction) => {
    setSelectedPayment(payment);
    setWizardDraft({ ...wizardDraft, payment_instructions: payment });
  };

  const handleAddNew = async () => {
    if (!newPayment.account_holder || !newPayment.iban || !newPayment.payment_method || 
        !newPayment.payment_terms || !newPayment.additional_data) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsCreating(true);

    try {
      const paymentData = {
        account_holder: newPayment.account_holder,
        iban: newPayment.iban,
        payment_method: newPayment.payment_method,
        payment_terms: newPayment.payment_terms,
        additional_data: newPayment.additional_data
      };

      const createdPayment = await createPaymentInstruction(paymentData);
      
      // Añadir al store local
      addPaymentInstruction(createdPayment);
      
      // Seleccionar las nuevas instrucciones de pago
      setSelectedPayment(createdPayment);
      setWizardDraft({ ...wizardDraft, payment_instructions: createdPayment });
      
      // Limpiar formulario
      setIsAddingNew(false);
      setNewPayment({
        account_holder: '',
        iban: '',
        payment_method: 'Transferencia bancaria',
        payment_terms: 'El pago debe realizarse dentro de los 14 días naturales desde la fecha de la factura.',
        additional_data: 'ESTA OPERACIÓN ESTÁ EXENTA DE IVA en virtud del artículo 21.1 de la Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido.'
      });

      toast.success('Instrucciones de pago creadas exitosamente');
      
    } catch (error) {
      console.error('Error creating payment instruction:', error);
      toast.error('Error al crear las instrucciones de pago. Inténtalo de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isAddingNew ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-card-foreground">Seleccionar Instrucciones de Pago</Label>
            <Select onValueChange={(value: string) => {
              const payment = payment_instructions.find(p => p.id === value);
              if (payment) {
                handlePaymentSelect(payment);
              }
            }}>
              <SelectTrigger className="bg-input border-border text-card-foreground">
                <SelectValue placeholder="Elige instrucciones de pago existentes" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {payment_instructions.map((payment) => (
                  <SelectItem key={payment.id} value={payment.id} className="text-popover-foreground">
                    {payment.account_holder} - {payment.payment_method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={() => setIsAddingNew(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Crear nuevas instrucciones de pago
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="titular" className="text-card-foreground">
                Titular de la cuenta
              </Label>
              <Input
                id="titular"
                value={newPayment.account_holder}
                onChange={(e) => setNewPayment({...newPayment, account_holder: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="Lucía Fernández"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="iban" className="text-card-foreground">
                IBAN
              </Label>
              <Input
                id="iban"
                value={newPayment.iban}
                onChange={(e) => setNewPayment({...newPayment, iban: e.target.value})}
                className="bg-input border-border text-card-foreground"
                placeholder="ES9121000418450200051332"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-card-foreground">Método de pago</Label>
              <Select value={newPayment.payment_method} onValueChange={(value: string) => setNewPayment({...newPayment, payment_method: value})}>
                <SelectTrigger className="bg-input border-border text-card-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Transferencia bancaria" className="text-popover-foreground">Transferencia bancaria</SelectItem>
                  <SelectItem value="PayPal" className="text-popover-foreground">PayPal</SelectItem>
                  <SelectItem value="Tarjeta de crédito" className="text-popover-foreground">Tarjeta de crédito</SelectItem>
                  <SelectItem value="Efectivo" className="text-popover-foreground">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-card-foreground">Plazo de pago</Label>
              <Select value={newPayment.payment_terms} onValueChange={(value: string) => setNewPayment({...newPayment, payment_terms: value})}>
                <SelectTrigger className="bg-input border-border text-card-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="El pago debe realizarse dentro de los 14 días naturales desde la fecha de la factura." className="text-popover-foreground">
                    14 días
                  </SelectItem>
                  <SelectItem value="El pago debe realizarse dentro de los 30 días naturales desde la fecha de la factura." className="text-popover-foreground">
                    30 días
                  </SelectItem>
                  <SelectItem value="El pago debe realizarse de forma inmediata a la recepción de esta factura." className="text-popover-foreground">
                    Inmediato
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="additionalData" className="text-card-foreground">
                Datos adicionales
              </Label>
              <Textarea
                id="additionalData"
                value={newPayment.additional_data}
                onChange={(e) => setNewPayment({...newPayment, additional_data: e.target.value})}
                className="bg-input border-border text-card-foreground h-20"
                placeholder="ESTA OPERACIÓN ESTÁ EXENTA DE IVA en virtud del artículo 21.1 de la Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido."
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleAddNew}
              className="flex-1"
               disabled={isCreating || !newPayment.account_holder || !newPayment.iban || !newPayment.payment_method || 
                        !newPayment.payment_terms || !newPayment.additional_data}
            >
              {isCreating ? 'Creando...' : 'Guardar instrucciones'}
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

      {selectedPayment && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold text-card-foreground mb-2">Instrucciones seleccionadas:</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><span className="font-medium">Titular:</span> {selectedPayment.account_holder}</p>
            <p><span className="font-medium">IBAN:</span> {selectedPayment.iban}</p>
            <p><span className="font-medium">Método:</span> {selectedPayment.payment_method}</p>
            <p><span className="font-medium">Plazo:</span> {selectedPayment.payment_terms}</p>
            <p><span className="font-medium">Datos adicionales:</span> {selectedPayment.additional_data}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 