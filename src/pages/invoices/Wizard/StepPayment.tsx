import React, { useState } from 'react';
import { useInvoiceStore } from '@/lib/stores';
import type { PaymentInstruction } from '@/types';

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
      <div>
        <h2 className="text-2xl font-bold text-text mb-2">Instrucciones de Pago</h2>
        <p className="text-textMedium">Selecciona las instrucciones de pago o crea unas nuevas</p>
      </div>

      {!isAddingNew ? (
        <div className="space-y-4">
          {payment_instructions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-text">Instrucciones guardadas:</h3>
              {payment_instructions.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => handlePaymentSelect(payment)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPayment?.id === payment.id
                      ? 'border-primary bg-primary/10'
                      : 'border-surface hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-text">{payment.account_holder}</h4>
                      <p className="text-sm text-textMedium">{payment.iban}</p>
                      <p className="text-sm text-textMedium">{payment.payment_method}</p>
                    </div>
                    {selectedPayment?.id === payment.id && (
                      <div className="text-primary">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={() => setIsAddingNew(true)}
            className="btn-secondary w-full"
          >
            + Crear nuevas instrucciones de pago
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Titular de la cuenta
              </label>
              <input
                type="text"
                value={newPayment.account_holder}
                onChange={(e) => setNewPayment({...newPayment, account_holder: e.target.value})}
                className="input-field w-full"
                placeholder="Adrián Rocafull Berbel"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                IBAN
              </label>
              <input
                type="text"
                value={newPayment.iban}
                onChange={(e) => setNewPayment({...newPayment, iban: e.target.value})}
                className="input-field w-full"
                placeholder="ES0931182064032757012974"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Método de pago
              </label>
              <select
                value={newPayment.payment_method}
                onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
                className="input-field w-full"
              >
                <option value="Bank transfer">Bank transfer</option>
                <option value="PayPal">PayPal</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Plazo de pago
              </label>
              <select
                value={newPayment.payment_terms}
                onChange={(e) => setNewPayment({...newPayment, payment_terms: e.target.value})}
                className="input-field w-full"
              >
                <option value="Payment is due within 14 calendar days from the invoice date.">
                  14 días
                </option>
                <option value="Payment is due within 30 calendar days from the invoice date.">
                  30 días
                </option>
                <option value="Payment is due immediately upon receipt of this invoice.">
                  Inmediato
                </option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                Texto de exención de IVA
              </label>
              <textarea
                value={newPayment.vat_exemption_text}
                onChange={(e) => setNewPayment({...newPayment, vat_exemption_text: e.target.value})}
                className="input-field w-full h-20 resize-none"
                placeholder="THIS TRANSACTION IS EXEMPT FROM VAT UNDER Article 21.1 of the Spanish Value Added Tax Law 37/1992 of December 28."
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAddNew}
              className="btn-primary flex-1"
              disabled={!newPayment.account_holder || !newPayment.iban || !newPayment.payment_method || 
                       !newPayment.payment_terms || !newPayment.vat_exemption_text}
            >
              Guardar instrucciones
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

      {selectedPayment && (
        <div className="bg-surface p-4 rounded-lg">
          <h3 className="font-semibold text-text mb-2">Instrucciones seleccionadas:</h3>
          <div className="text-sm text-textMedium space-y-1">
            <p><strong>Titular:</strong> {selectedPayment.account_holder}</p>
            <p><strong>IBAN:</strong> {selectedPayment.iban}</p>
            <p><strong>Método:</strong> {selectedPayment.payment_method}</p>
            <p><strong>Plazo:</strong> {selectedPayment.payment_terms}</p>
            <p><strong>Exención IVA:</strong> {selectedPayment.vat_exemption_text}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 