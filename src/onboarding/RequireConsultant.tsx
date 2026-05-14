import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useInvoiceStore } from '@/shared/lib/stores';

export const CONSULTANT_ONBOARDING_PATH = '/onboarding/consultant';

export function RedirectWhenConsultantsExist({ children }: { children: ReactNode }) {
  const consultants = useInvoiceStore((s) => s.consultants);

  if (consultants.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function RequireConsultant({ children }: { children: ReactNode }) {
  const consultants = useInvoiceStore((s) => s.consultants);
  const location = useLocation();

  if (consultants.length === 0 && location.pathname !== CONSULTANT_ONBOARDING_PATH) {
    return <Navigate to={CONSULTANT_ONBOARDING_PATH} replace />;
  }

  return <>{children}</>;
}
