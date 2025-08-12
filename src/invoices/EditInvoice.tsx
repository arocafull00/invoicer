import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWizardNav } from '@/shared/hooks/useWizardNav';
import { useInvoiceStore } from '@/shared/lib/stores';
import { Stepper } from '@/shared/components/Stepper';
import { StepConsultant } from './Wizard/StepConsultant';
import { StepClient } from './Wizard/StepClient';
import { StepDates } from './Wizard/StepDates';
import { StepDetails } from './Wizard/StepDetails';
import { StepPayment } from './Wizard/StepPayment';
import type { Invoice } from '@/shared/types';

const steps = [
  { id: 1, title: 'Consultor', component: StepConsultant },
  { id: 2, title: 'Cliente', component: StepClient },
  { id: 3, title: 'Fechas', component: StepDates },
  { id: 4, title: 'Detalles', component: StepDetails },
  { id: 5, title: 'Pago', component: StepPayment },
];

export const EditInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentStep, canGoNext, canGoPrevious, goNext, goPrevious } = useWizardNav(steps.length);
  const { invoices, wizardDraft, setWizardDraft } = useInvoiceStore();

  const invoice = invoices.find(inv => inv.id === id);

  useEffect(() => {
    if (!invoice) {
      navigate('/invoices');
      return;
    }

    // Cargar los datos de la factura en el draft del wizard
    setWizardDraft({
      consultant: invoice.consultant,
      client: invoice.client,
      start_date: invoice.start_date,
      end_date: invoice.end_date,
      description: invoice.description,
      total: invoice.total,
      payment_instructions: invoice.payment_instructions,
    });
  }, [invoice, navigate, setWizardDraft]);

  const handleUpdateInvoice = async () => {
    if (!invoice || !wizardDraft.consultant || !wizardDraft.client || !wizardDraft.start_date || 
        !wizardDraft.end_date || !wizardDraft.description || !wizardDraft.total || 
        !wizardDraft.payment_instructions) {
      alert('Por favor completa todos los campos');
      return;
    }

    const updatedInvoice: Invoice = {
      ...invoice,
      start_date: wizardDraft.start_date,
      end_date: wizardDraft.end_date,
      consultant: wizardDraft.consultant,
      client: wizardDraft.client,
      description: wizardDraft.description,
      total: wizardDraft.total,
      payment_instructions: wizardDraft.payment_instructions,
    };

    // Actualizar la factura en el store
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? updatedInvoice : inv
    );

    useInvoiceStore.setState({
      invoices: updatedInvoices,
      wizardDraft: {}
    });

    // Simular actualización en Supabase
    console.log('Actualizando factura en Supabase:', updatedInvoice);
    
    // Redirigir a la lista de facturas
    navigate('/invoices');
  };

  if (!invoice) {
    return null;
  }

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Editar Factura {invoice.number}</h1>
        <p className="text-textMedium">Modifica los campos necesarios</p>
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
          <button
            onClick={() => navigate('/invoices')}
            className="btn-secondary"
          >
            Cancelar
          </button>
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
              onClick={handleUpdateInvoice}
              className="btn-primary"
            >
              Actualizar Factura
            </button>
          )}
        </div>
      </div>
    </div>
  );
};