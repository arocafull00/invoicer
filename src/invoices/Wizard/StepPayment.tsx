import React, { useState } from 'react';
import { useInvoiceStore } from '@/shared/lib/stores';
import type { PaymentInstruction } from '@/shared/types';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Textarea } from '@/shared/components/textarea';

export const StepPayment: React.FC = () => {
  const { payment_instructions, wizardDraft } = useInvoiceStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentInstruction | null>(
    wizardDraft.payment_instructions || null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<PaymentInstruction>>({
    account_holder: '',
    iban: '',
    payment_method: 'Bank transfer',
    payment_terms: 'Payment is due within 14 calendar days from the invoice date.',
    vat_exemption_text: 'THIS TRANSACTION IS EXEMPT FROM VAT UNDER Article 21.1 of the Spanish Value Added Tax Law 37/1992 of December 28.'
  });

  const handlePaymentSelect = (payment: PaymentInstruction) => {
    setSelectedPayment(payment);
    useInvoiceStore.setState({
      wizardDraft: { ...wizardDraft, payment_instructions: payment }
    });
  };

  const handleAddNew = () => {
    if (newPayment.account_holder && newPayment.iban && newPayment.payment_method && 
        newPayment.payment_terms && newPayment.vat_exemption_text) {
      const payment: PaymentInstruction = {
        id: Date.now().toString(),
        account_holder: newPayment.account_holder,
        iban: newPayment.iban,
        payment_method: newPayment.payment_method,
        payment_terms: newPayment.payment_terms,
        vat_exemption_text: newPayment.vat_exemption_text
      };
      
      // Añadir a la lista de instrucciones de pago
      useInvoiceStore.setState({
        payment_instructions: [...payment_instructions, payment],
        wizardDraft: { ...wizardDraft, payment_instructions: payment }
      });
      
      setSelectedPayment(payment);
      setIsAddingNew(false);
      setNewPayment({
        account_holder: '',
        iban: '',
        payment_method: 'Bank transfer',
        payment_terms: 'Payment is due within 14 calendar days from the invoice date.',
        vat_exemption_text: 'THIS TRANSACTION IS EXEMPT FROM VAT UNDER Article 21.1 of the Spanish Value Added Tax Law 37/1992 of December 28.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {!isAddingNew ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-card-foreground">Método de pago</Label>
            <Select onValueChange={(value) => {
              if (value === 'transferencia') {
                const bankTransfer: PaymentInstruction = {
                  id: 'default-bank',
                  account_holder: 'Adrián Rocafull Berbel',
                  iban: 'ES91 2100 0418 4502 0005 1332',
                  payment_method: 'Transferencia bancaria',
                  payment_terms: 'Payment is due within 14 calendar days from the invoice date.',
                  vat_exemption_text: 'THIS TRANSACTION IS EXEMPT FROM VAT UNDER Article 21.1 of the Spanish Value Added Tax Law 37/1992 of December 28.'
                };
                handlePaymentSelect(bankTransfer);
              }
            }}>
              <SelectTrigger className="bg-input border-border text-card-foreground">
                <SelectValue placeholder="Selecciona método de pago" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="transferencia" className="text-popover-foreground">
                  Transferencia bancaria
                </SelectItem>
                <SelectItem value="paypal" className="text-popover-foreground">
                  PayPal
                </SelectItem>
                <SelectItem value="stripe" className="text-popover-foreground">
                  Tarjeta de crédito
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedPayment && (
            <div className="space-y-2">
              <Label htmlFor="cuentaBancaria" className="text-card-foreground">
                Cuenta bancaria (IBAN)
              </Label>
              <Input
                id="cuentaBancaria"
                value={selectedPayment.iban}
                onChange={(e) => setSelectedPayment({...selectedPayment, iban: e.target.value})}
                placeholder="ES91 2100 0418 4502 0005 1332"
                className="bg-input border-border text-card-foreground"
              />
            </div>
          )}

          <Button variant="outline" onClick={() => setIsAddingNew(true)} className="w-full">
            + Crear nuevas instrucciones de pago
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
                placeholder="Adrián Rocafull Berbel"
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
                placeholder="ES0931182064032757012974"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-card-foreground">Método de pago</Label>
              <Select value={newPayment.payment_method} onValueChange={(value) => setNewPayment({...newPayment, payment_method: value})}>
                <SelectTrigger className="bg-input border-border text-card-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Bank transfer" className="text-popover-foreground">Bank transfer</SelectItem>
                  <SelectItem value="PayPal" className="text-popover-foreground">PayPal</SelectItem>
                  <SelectItem value="Credit Card" className="text-popover-foreground">Credit Card</SelectItem>
                  <SelectItem value="Cash" className="text-popover-foreground">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-card-foreground">Plazo de pago</Label>
              <Select value={newPayment.payment_terms} onValueChange={(value) => setNewPayment({...newPayment, payment_terms: value})}>
                <SelectTrigger className="bg-input border-border text-card-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Payment is due within 14 calendar days from the invoice date." className="text-popover-foreground">
                    14 días
                  </SelectItem>
                  <SelectItem value="Payment is due within 30 calendar days from the invoice date." className="text-popover-foreground">
                    30 días
                  </SelectItem>
                  <SelectItem value="Payment is due immediately upon receipt of this invoice." className="text-popover-foreground">
                    Inmediato
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="vatExemption" className="text-card-foreground">
                Texto de exención de IVA
              </Label>
              <Textarea
                id="vatExemption"
                value={newPayment.vat_exemption_text}
                onChange={(e) => setNewPayment({...newPayment, vat_exemption_text: e.target.value})}
                className="bg-input border-border text-card-foreground h-20"
                placeholder="THIS TRANSACTION IS EXEMPT FROM VAT UNDER Article 21.1 of the Spanish Value Added Tax Law 37/1992 of December 28."
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleAddNew}
              className="flex-1"
              disabled={!newPayment.account_holder || !newPayment.iban || !newPayment.payment_method || 
                       !newPayment.payment_terms || !newPayment.vat_exemption_text}
            >
              Guardar instrucciones
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
            <p><span className="font-medium">Exención IVA:</span> {selectedPayment.vat_exemption_text}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 