'use client';

import type { ReactNode } from 'react';
import { RequireConsultant } from '@/onboarding/RequireConsultant';
import { AppLayout } from '@/shared/components/AppLayout';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RequireConsultant>
      <AppLayout>{children}</AppLayout>
    </RequireConsultant>
  );
}
