import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@/login/components/RequireAuth';
import { RequireConsultant, RedirectWhenConsultantsExist } from '@/onboarding/RequireConsultant';
import { AppLayout } from '@/shared/components/AppLayout';
import { LoginPage } from '@/login';
import { DashboardPage } from '@/dashboard/DashboardScreen';
import Invoices from '@/invoices/InvoicesScreen';
import NewInvoice from '@/invoices/NewInvoice';
import { EditInvoice } from '@/invoices/EditInvoice';
import { ViewInvoice } from '@/invoices/ViewInvoice';
import { SettingsPage } from '@/settings/SettingsScreen';
import ConsultantsPage from '@/consultants';
import ClientsPage from '@/clients';
import PaymentsPage from '@/payments/PaymentsScreen';
import IncomesPage from '@/incomes/IncomesScreen';
import ExpensesPage from '@/expenses/ExpensesScreen';
import { TermsOfServicePage } from '@/legal/Terms';
import { PrivacyPolicyPage } from '@/legal/Privacy';
import ImportPage from '@/imports/ImportScreen';
import ConsultantOnboardingScreen from '@/onboarding/ConsultantOnboardingScreen';

function ProtectedApp({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <RequireConsultant>
        <AppLayout>{children}</AppLayout>
      </RequireConsultant>
    </RequireAuth>
  );
}

function ConsultantOnboardingShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppLayout>
        <RedirectWhenConsultantsExist>{children}</RedirectWhenConsultantsExist>
      </AppLayout>
    </RequireAuth>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedApp>
        <DashboardPage />
      </ProtectedApp>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedApp>
        <DashboardPage />
      </ProtectedApp>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/onboarding/consultant',
    element: (
      <ConsultantOnboardingShell>
        <ConsultantOnboardingScreen />
      </ConsultantOnboardingShell>
    ),
  },
  {
    path: '/invoices',
    element: (
      <ProtectedApp>
        <Invoices />
      </ProtectedApp>
    ),
  },
  {
    path: '/invoices/new',
    element: (
      <ProtectedApp>
        <NewInvoice />
      </ProtectedApp>
    ),
  },
  {
    path: '/invoices/edit/:id',
    element: (
      <ProtectedApp>
        <EditInvoice />
      </ProtectedApp>
    ),
  },
  {
    path: '/invoices/view/:id',
    element: (
      <ProtectedApp>
        <ViewInvoice />
      </ProtectedApp>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedApp>
        <SettingsPage />
      </ProtectedApp>
    ),
  },
  {
    path: '/consultants',
    element: (
      <ProtectedApp>
        <ConsultantsPage />
      </ProtectedApp>
    ),
  },
  {
    path: '/clients',
    element: (
      <ProtectedApp>
        <ClientsPage />
      </ProtectedApp>
    ),
  },
  {
    path: '/payments',
    element: (
      <ProtectedApp>
        <PaymentsPage />
      </ProtectedApp>
    ),
  },
  {
    path: '/incomes',
    element: (
      <ProtectedApp>
        <IncomesPage />
      </ProtectedApp>
    ),
  },
  {
    path: '/expenses',
    element: (
      <ProtectedApp>
        <ExpensesPage />
      </ProtectedApp>
    ),
  },
  {
    path: '/import',
    element: (
      <ProtectedApp>
        <ImportPage />
      </ProtectedApp>
    ),
  },
  {
    path: '/terms',
    element: <TermsOfServicePage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '*',
    element: <LoginPage />,
  },
]);
