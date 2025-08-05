import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Stepper } from '../../../components/Stepper';
import { useWizardNav } from '../../../hooks/useWizardNav';
import { useInvoiceStore } from '../../../lib/stores';
import { StepConsultant } from './StepConsultant';
import { StepClient } from './StepClient';
import { StepDates } from './StepDates';
import { StepDetails } from './StepDetails';
import { StepPayment } from './StepPayment';

const steps = ['Consultor', 'Cliente', 'Fechas', 'Detalles', 'Pago'];

export const InvoiceWizard: React.FC = () => {
  const navigate = useNavigate();
  const { wizardDraft, clearWizardDraft } = useInvoiceStore();
  const {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    canGoNext,
    canGoPrev,
    resetWizard,
  } = useWizardNav();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simular guardado en Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En producción, aquí se insertaría en Supabase
      console.log('Factura creada:', wizardDraft);
      
      // Limpiar wizard y redirigir
      clearWizardDraft();
      navigate('/invoices');
    } catch (error) {
      console.error('Error al crear factura:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepConsultant />;
      case 2:
        return <StepClient />;
      case 3:
        return <StepDates />;
      case 4:
        return <StepDetails />;
      case 5:
        return <StepPayment />;
      default:
        return <StepConsultant />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center space-x-2 text-textMedium hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a facturas</span>
        </button>
        
        <h1 className="text-3xl font-bold text-text mb-2">Crear Nueva Factura</h1>
        <p className="text-textMedium">
          Completa los pasos para generar tu factura
        </p>
      </div>

      {/* Stepper */}
      <Stepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        steps={steps}
        onStepClick={goToStep}
      />

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-surface/20">
        <button
          onClick={prevStep}
          disabled={!canGoPrev(currentStep)}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center space-x-3">
          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canGoNext(currentStep)}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canGoNext(currentStep)}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Crear Factura</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 text-center text-sm text-textMedium">
        Paso {currentStep} de {totalSteps}
      </div>
    </div>
  );
}; 