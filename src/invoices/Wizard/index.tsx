import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizardNav } from '@/shared/hooks/useWizardNav';
import { useInvoiceStore } from '@/shared/lib/stores';
import { Stepper } from '@/shared/components/Stepper';
import { StepConsultant } from './StepConsultant';
import { StepClient } from './StepClient';
import { StepDates } from './StepDates';
import { StepDetails } from './StepDetails';
import { StepPayment } from './StepPayment';
import { generateInvoiceNumber } from '@/shared/lib/helpers';
import { Button } from '@/shared/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card';
import type { Invoice } from '@/shared/types';

const steps = [
  { id: 1, name: "Consultor", title: "Seleccionar Consultor", component: StepConsultant },
  { id: 2, name: "Cliente", title: "Seleccionar Cliente", component: StepClient },
  { id: 3, name: "Fechas", title: "Fechas de Facturación", component: StepDates },
  { id: 4, name: "Detalles", title: "Detalles del Servicio", component: StepDetails },
  { id: 5, name: "Pago", title: "Información de Pago", component: StepPayment },
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

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return "Elige un consultor existente o añade uno nuevo";
      case 2: return "Elige un cliente existente o añade uno nuevo";
      case 3: return "Establece las fechas de emisión y vencimiento";
      case 4: return "Describe el servicio y establece el monto total";
      case 5: return "Configura la información de pago";
      default: return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Crear Nueva Factura</h1>
        <p className="text-muted-foreground">Completa los pasos para generar tu factura</p>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground text-xl">{steps[currentStep - 1].title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {getStepDescription(currentStep)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CurrentStepComponent />
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={goPrevious}
              disabled={!canGoPrevious}
            >
              Anterior
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/invoices')}
              >
                Cancelar
              </Button>
              {currentStep === steps.length ? (
                <Button 
                  onClick={handleCreateInvoice}
                >
                  Crear Factura
                </Button>
              ) : (
                <Button 
                  onClick={goNext} 
                  disabled={!canGoNext}
                >
                  Siguiente
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 