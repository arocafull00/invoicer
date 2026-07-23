'use client';

import type { ReactNode } from 'react';
import { RedirectWhenConsultantsExist } from '@/onboarding/RequireConsultant';
import { AppLayout } from '@/shared/components/AppLayout';

export function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <AppLayout>
      <RedirectWhenConsultantsExist>{children}</RedirectWhenConsultantsExist>
    </AppLayout>
  );
}
