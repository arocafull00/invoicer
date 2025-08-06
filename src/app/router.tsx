import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@/components/RequireAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import Invoices from '@/pages/invoices';
import { InvoiceWizard } from '@/pages/invoices/Wizard';
import { SettingsPage } from '@/pages/settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RequireAuth><DashboardLayout><DashboardPage /></DashboardLayout></RequireAuth>,
  },
  {
    path: '/dashboard',
    element: <RequireAuth><DashboardLayout><DashboardPage /></DashboardLayout></RequireAuth>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/invoices',
    element: <RequireAuth><DashboardLayout><Invoices /></DashboardLayout></RequireAuth>,
  },
  {
    path: '/invoices/new',
    element: <RequireAuth><DashboardLayout><InvoiceWizard /></DashboardLayout></RequireAuth>,
  },
  {
    path: '/settings',
    element: <RequireAuth><DashboardLayout><SettingsPage /></DashboardLayout></RequireAuth>,
  },
]); 