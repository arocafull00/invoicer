import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { useInvoiceStore } from '@/shared/lib/stores';

export const CONSULTANT_ONBOARDING_PATH = '/onboarding/consultant';

export function RedirectWhenConsultantsExist({ children }: { children: ReactNode }) {
  const consultants = useInvoiceStore((s) => s.consultants);

  if (consultants.length > 0) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}

export function RequireConsultant({ children }: { children: ReactNode }) {
  const consultants = useInvoiceStore((s) => s.consultants);

  if (consultants.length === 0) {
    redirect(CONSULTANT_ONBOARDING_PATH);
  }

  return <>{children}</>;
}
