import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  component: React.ComponentType;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 < currentStep
                    ? 'bg-primary text-white'
                    : index + 1 === currentStep
                    ? 'bg-primary text-white'
                    : 'bg-surface text-textMedium'
                }`}
              >
                {index + 1 < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  index + 1 <= currentStep ? 'text-text' : 'text-textMedium'
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 ${
                  index + 1 < currentStep ? 'bg-primary' : 'bg-surface'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}; 