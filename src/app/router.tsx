import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@/login/components/RequireAuth';
import { AppLayout } from '@/shared/components/AppLayout';
import { LoginPage } from '@/login';
import { DashboardPage } from '@/dashboard';
import Invoices from '@/invoices';
import { InvoiceWizard } from '@/invoices/Wizard';
import { EditInvoice } from '@/invoices/EditInvoice';
import { ViewInvoice } from '@/invoices/ViewInvoice';
import { SettingsPage } from '@/settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RequireAuth><AppLayout><DashboardPage /></AppLayout></RequireAuth>,
  },
  {
    path: '/dashboard',
    element: <RequireAuth><AppLayout><DashboardPage /></AppLayout></RequireAuth>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/invoices',
    element: <RequireAuth><AppLayout><Invoices /></AppLayout></RequireAuth>,
  },
  {
    path: '/invoices/new',
    element: <RequireAuth><AppLayout><InvoiceWizard /></AppLayout></RequireAuth>,
  },
  {
    path: '/invoices/edit/:id',
    element: <RequireAuth><AppLayout><EditInvoice /></AppLayout></RequireAuth>,
  },
  {
    path: '/invoices/view/:id',
    element: <RequireAuth><AppLayout><ViewInvoice /></AppLayout></RequireAuth>,
  },
  {
    path: '/settings',
    element: <RequireAuth><AppLayout><SettingsPage /></AppLayout></RequireAuth>,
  },
]); 