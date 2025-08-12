import type { Invoice } from '@/shared/types';

export interface DashboardStats {
  invoicesThisMonth: number;
  totalRevenue: number;
  pendingInvoices: number;
  collectionRate: number;
  monthlyChange: {
    invoices: number;
    revenue: number;
    pending: number;
    collectionRate: number;
  };
}

export const calculateDashboardStats = (invoices: Invoice[]): DashboardStats => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Filtrar facturas del mes actual
  const thisMonthInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.created_date);
    return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
  });

  // Filtrar facturas del mes pasado
  const lastMonthInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.created_date);
    return invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === lastMonthYear;
  });

  // Calcular estadísticas del mes actual
  const invoicesThisMonth = thisMonthInvoices.length;
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const thisMonthRevenue = thisMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  
  // Para este ejemplo, asumimos que las facturas están "pendientes" por defecto
  // En una implementación real, tendrías un campo de estado
  const pendingInvoices = Math.floor(invoices.length * 0.2); // 20% pendientes (ejemplo)
  const collectionRate = invoices.length > 0 ? ((invoices.length - pendingInvoices) / invoices.length) * 100 : 0;

  // Calcular cambios respecto al mes anterior
  const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const lastMonthCount = lastMonthInvoices.length;
  const lastMonthPending = Math.floor(lastMonthCount * 0.2);
  const lastMonthCollectionRate = lastMonthCount > 0 ? ((lastMonthCount - lastMonthPending) / lastMonthCount) * 100 : 0;

  const invoiceChange = lastMonthCount > 0 ? ((invoicesThisMonth - lastMonthCount) / lastMonthCount) * 100 : 0;
  const revenueChange = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
  const pendingChange = lastMonthPending > 0 ? ((pendingInvoices - lastMonthPending) / lastMonthPending) * 100 : 0;
  const collectionRateChange = lastMonthCollectionRate > 0 ? collectionRate - lastMonthCollectionRate : 0;

  return {
    invoicesThisMonth,
    totalRevenue,
    pendingInvoices,
    collectionRate,
    monthlyChange: {
      invoices: invoiceChange,
      revenue: revenueChange,
      pending: pendingChange,
      collectionRate: collectionRateChange,
    }
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const getRecentInvoices = (invoices: Invoice[], limit: number = 5): Invoice[] => {
  return invoices
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
    .slice(0, limit);
};