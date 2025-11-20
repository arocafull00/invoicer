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

export interface QuarterlyPeriod {
  startDate: Date;
  endDate: Date;
  paymentMonth: string;
  months: Array<{ name: string; month: number; year: number }>;
}

export const getNextQuarterlyPeriod = (): QuarterlyPeriod => {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11 (Jan = 0, Dec = 11)
  const currentYear = now.getFullYear();

  let startMonth: number;
  let startYear: number;
  let paymentMonth: string;

  if (currentMonth >= 0 && currentMonth <= 2) {
    startMonth = 0; // January
    startYear = currentYear;
    paymentMonth = 'Abril';
  } else if (currentMonth >= 3 && currentMonth <= 5) {
    startMonth = 3; // April
    startYear = currentYear;
    paymentMonth = 'Julio';
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    startMonth = 6; // July
    startYear = currentYear;
    paymentMonth = 'Octubre';
  } else {
    startMonth = 9; // October
    startYear = currentYear;
    paymentMonth = 'Enero';
  }

  const startDate = new Date(startYear, startMonth, 1);
  const endMonth = startMonth + 2;
  const endDate = new Date(startYear, endMonth + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const months = [
    { name: monthNames[startMonth], month: startMonth, year: startYear },
    { name: monthNames[startMonth + 1], month: startMonth + 1, year: startYear },
    { name: monthNames[startMonth + 2], month: startMonth + 2, year: startYear },
  ];

  return {
    startDate,
    endDate,
    paymentMonth,
    months,
  };
};

export interface MonthlyTaxBreakdown {
  month: string;
  irpf: number;
  iva: number;
}

export interface QuarterlyTaxesResult {
  monthlyBreakdown: MonthlyTaxBreakdown[];
  totalIrpf: number;
  totalIva: number;
  totalTaxes: number;
  totalInvoiced: number;
}

export const calculateQuarterlyTaxes = (
  invoices: Invoice[],
  period: QuarterlyPeriod
): QuarterlyTaxesResult => {
  const periodInvoices = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.created_date);
    return invoiceDate >= period.startDate && invoiceDate <= period.endDate;
  });
console.log(periodInvoices)
  const monthlyData: Map<string, { irpf: number; iva: number }> = new Map();
  
  period.months.forEach(({ name }) => {
    monthlyData.set(name, { irpf: 0, iva: 0 });
  });

  // Calculate taxes per invoice
  periodInvoices.forEach((invoice) => {
    const invoiceDate = new Date(invoice.start_date);
    const invoiceMonth = invoiceDate.getMonth();
    const invoiceYear = invoiceDate.getFullYear();
    
    // Find which month in the period this invoice belongs to
    const monthInfo = period.months.find(
      (m) => m.month === invoiceMonth && m.year === invoiceYear
    );

    if (monthInfo) {
      const current = monthlyData.get(monthInfo.name) || { irpf: 0, iva: 0 };
      
      // IRPF: 20% of subtotal
      const irpf = invoice.subtotal * 0.20;
      
      // IVA: vat_amount from invoice
      const iva = invoice.vat_amount || 0;
      
      monthlyData.set(monthInfo.name, {
        irpf: current.irpf + irpf,
        iva: current.iva + iva,
      });
    }
  });

  // Convert to array format
  const monthlyBreakdown: MonthlyTaxBreakdown[] = period.months.map(({ name }) => {
    const data = monthlyData.get(name) || { irpf: 0, iva: 0 };
    return {
      month: name,
      irpf: data.irpf,
      iva: data.iva,
    };
  });

  // Calculate totals
  const totalIrpf = monthlyBreakdown.reduce((sum, m) => sum + m.irpf, 0);
  const totalIva = monthlyBreakdown.reduce((sum, m) => sum + m.iva, 0);
  const totalTaxes = totalIrpf + totalIva;
  const totalInvoiced = periodInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  return {
    monthlyBreakdown,
    totalIrpf,
    totalIva,
    totalTaxes,
    totalInvoiced,
  };
};