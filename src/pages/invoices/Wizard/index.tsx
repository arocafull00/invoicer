import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizardNav } from '@/hooks/useWizardNav';
import { useInvoiceStore } from '@/lib/stores';
import { Stepper } from '@/components/Stepper';
import { StepConsultant } from './StepConsultant';
import { StepClient } from './StepClient';
import { StepDates } from './StepDates';
import { StepDetails } from './StepDetails';
import { StepPayment } from './StepPayment';
import { generateInvoiceNumber } from '@/lib/helpers';
import type { Invoice } from '@/types';

const steps = [
  { id: 1, title: 'Consultor', component: StepConsultant },
  { id: 2, title: 'Cliente', component: StepClient },
  { id: 3, title: 'Fechas', component: StepDates },
  { id: 4, title: 'Detalles', component: StepDetails },
  { id: 5, title: 'Pago', component: StepPayment },
];

export const InvoiceWizard: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, canGoNext, canGoPrevious, goNext, goPrevious } = useWizardNav(steps.length);
  const { wizardDraft, invoices } = useInvoiceStore();

  const handleCreateInvoice = async () => {
    if (!wizardDraft.consultant || !wizardDraft.client || !wizardDraft.start_date || 
        !wizardDraft.end_date || !wizardDraft.description || !wizardDraft.total || 
        !wizardDraft.payment_instructions) {
      alert('Por favor completa todos los campos');
      return;
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      number: generateInvoiceNumber(),
      created_date: new Date().toISOString().split('T')[0],
      start_date: wizardDraft.start_date,
      end_date: wizardDraft.end_date,
      consultant: wizardDraft.consultant,
      client: wizardDraft.client,
      description: wizardDraft.description,
      total: wizardDraft.total,
      payment_instructions: wizardDraft.payment_instructions,
      vat_exempt: true
    };

    // Añadir la nueva factura al store
    useInvoiceStore.setState({
      invoices: [...invoices, newInvoice],
      wizardDraft: {}
    });

    // Simular guardado en Supabase
    console.log('Guardando factura en Supabase:', newInvoice);
    
    // Redirigir a la lista de facturas
    navigate('/invoices');
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Crear Nueva Factura</h1>
        <p className="text-textMedium">Completa los pasos para generar tu factura</p>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <div className="mt-8">
        <CurrentStepComponent />
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={goPrevious}
          disabled={!canGoPrevious}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        <div className="flex gap-3">
          {currentStep < steps.length ? (
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleCreateInvoice}
              className="btn-primary"
            >
              Crear Factura
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 