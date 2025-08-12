import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar la navegación del wizard
 */
export const useWizardNav = (totalSteps: number) => {
  const [currentStep, setCurrentStep] = useState(1);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps]);

  const goPrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const canGoNext = currentStep < totalSteps;
  const canGoPrevious = currentStep > 1;

  return {
    currentStep,
    totalSteps,
    goNext,
    goPrevious,
    goToStep,
    canGoNext,
    canGoPrevious,
  };
}; 