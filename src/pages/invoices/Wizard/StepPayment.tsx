import React, { useEffect } from 'react';
import { useInvoiceStore } from '../../../lib/stores';
import { PaymentInstruction } from '../../../types';

export const StepPayment: React.FC = () => {
  const { wizardDraft, setWizardDraft, paymentInstructions, setPaymentInstructions } = useInvoiceStore();

  useEffect(() => {
    // Simular carga de instrucciones de pago - en producción esto vendría de Supabase
    const mockInstructions: PaymentInstruction[] = [
      {
        id: '1',
        title: 'Transferencia bancaria',
        instructions: 'Banco: BBVA\nIBAN: ES91 2100 0418 4502 0005 1332\nBIC: CAIXESBBXXX\nConcepto: Factura #{invoice_number}',
        created_at: '2024-01-01',
      },
      {
        id: '2',
        title: 'PayPal',
        instructions: 'PayPal: pagos@empresa.com\nConcepto: Factura #{invoice_number}',
        created_at: '2024-01-01',
      },
      {
        id: '3',
        title: 'Stripe',
        instructions: 'Pago online: https://pagos.empresa.com\nCódigo de factura: #{invoice_number}',
        created_at: '2024-01-01',
      },
    ];
    setPaymentInstructions(mockInstructions);
  }, [setPaymentInstructions]);

  const handleInstructionSelect = (instructionId: string) => {
    const instruction = paymentInstructions.find(i => i.id === instructionId);
    if (instruction) {
      setWizardDraft({ payment_instructions: instruction.instructions });
    }
  };

  const handleCustomInstructions = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWizardDraft({ payment_instructions: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text mb-2">Paso 5: Instrucciones de Pago</h2>
        <p className="text-textMedium">
          Selecciona o personaliza las instrucciones de pago
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text mb-3">
            Seleccionar instrucciones predefinidas
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentInstructions.map((instruction) => (
              <button
                key={instruction.id}
                onClick={() => handleInstructionSelect(instruction.id)}
                className={`p-4 rounded-lg border transition-colors text-left ${
                  wizardDraft.payment_instructions === instruction.instructions
                    ? 'border-primary bg-primary/10'
                    : 'border-surface hover:border-primary/50'
                }`}
              >
                <h4 className="font-medium text-text mb-1">{instruction.title}</h4>
                <p className="text-sm text-textMedium line-clamp-2">
                  {instruction.instructions}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="customInstructions" className="block text-sm font-medium text-text mb-2">
            O personaliza las instrucciones
          </label>
          <textarea
            id="customInstructions"
            value={wizardDraft.payment_instructions || ''}
            onChange={handleCustomInstructions}
            rows={6}
            className="input-field w-full resize-none"
            placeholder="Escribe las instrucciones de pago personalizadas..."
          />
        </div>

        {wizardDraft.payment_instructions && (
          <div className="bg-surface/30 rounded-lg p-4 border border-surface/20">
            <h3 className="font-medium text-text mb-2">Instrucciones de pago:</h3>
            <div className="text-textMedium">
              <pre className="whitespace-pre-wrap font-sans">{wizardDraft.payment_instructions}</pre>
            </div>
          </div>
        )}

        <div className="text-sm text-textMedium">
          <p>💡 Puedes usar #{invoice_number} para que se reemplace automáticamente</p>
          <p>💡 Las instrucciones aparecerán en el PDF de la factura</p>
        </div>
      </div>
    </div>
  );
}; 