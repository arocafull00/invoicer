import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../lib/stores';

export const useWizardNav = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { wizardDraft, setWizardDraft } = useInvoiceStore();
  const navigate = useNavigate();

  const totalSteps = 5;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const canGoNext = (step: number) => {
    switch (step) {
      case 1:
        return !!wizardDraft.consultant_id;
      case 2:
        return !!wizardDraft.client_id;
      case 3:
        return !!wizardDraft.start_date && !!wizardDraft.end_date;
      case 4:
        return !!wizardDraft.description && !!wizardDraft.total;
      case 5:
        return !!wizardDraft.payment_instructions;
      default:
        return false;
    }
  };

  const canGoPrev = (step: number) => {
    return step > 1;
  };

  const resetWizard = () => {
    setCurrentStep(1);
    navigate('/invoices');
  };

  return {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    canGoNext,
    canGoPrev,
    resetWizard,
  };
}; 