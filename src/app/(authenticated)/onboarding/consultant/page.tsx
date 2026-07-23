'use client';

import ConsultantOnboardingScreen from '@/onboarding/ConsultantOnboardingScreen';
import { OnboardingShell } from './onboarding-shell';

export default function ConsultantOnboardingPage() {
  return (
    <OnboardingShell>
      <ConsultantOnboardingScreen />
    </OnboardingShell>
  );
}
