import type { Expense, Invoice } from '@/shared/types';

const DEFAULT_IRPF_RATE_PERCENT = 20;

function getLocalDateParts(
  dateString: string
): { year: number; month: number; day: number } | null {
  const iso = dateString.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return {
      year: Number(iso[1]),
      month: Number(iso[2]) - 1,
      day: Number(iso[3]),
    };
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

function isDateInPeriod(dateString: string, period: QuarterlyPeriod): boolean {
  const parts = getLocalDateParts(dateString);
  if (!parts) return false;

  const date = new Date(parts.year, parts.month, parts.day);
  return date >= period.startDate && date <= period.endDate;
}

function findPeriodMonth(dateString: string, period: QuarterlyPeriod) {
  const parts = getLocalDateParts(dateString);
  if (!parts) return null;

  return (
    period.months.find(
      (month) => month.month === parts.month && month.year === parts.year
    ) ?? null
  );
}

function getInvoiceRetention(invoice: Invoice): number {
  if (invoice.irpf_amount != null) return Number(invoice.irpf_amount) || 0;
  if (invoice.irpf_rate == null) return 0;
  return Number(invoice.subtotal) * (Number(invoice.irpf_rate) / 100);
}

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

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const getRecentInvoices = (invoices: Invoice[], limit: number = 5): Invoice[] => {
  return invoices
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
    .slice(0, limit);
};

export interface ClientRanking {
  clientId: string;
  clientName: string;
  invoiceCount: number;
  totalSpent: number;
}

function aggregateClients(invoices: Invoice[]): ClientRanking[] {
  const byClient = new Map<string, ClientRanking>();

  invoices.forEach((invoice) => {
    if (!invoice.client?.id) return;

    const existing = byClient.get(invoice.client.id);
    if (!existing) {
      byClient.set(invoice.client.id, {
        clientId: invoice.client.id,
        clientName: invoice.client.name,
        invoiceCount: 1,
        totalSpent: Number(invoice.total) || 0,
      });
      return;
    }

    byClient.set(invoice.client.id, {
      ...existing,
      invoiceCount: existing.invoiceCount + 1,
      totalSpent: existing.totalSpent + (Number(invoice.total) || 0),
    });
  });

  return Array.from(byClient.values());
}

export const getTopClientsByVisits = (
  invoices: Invoice[],
  limit: number = 5
): ClientRanking[] => {
  return aggregateClients(invoices)
    .sort((a, b) => {
      if (b.invoiceCount !== a.invoiceCount) return b.invoiceCount - a.invoiceCount;
      return b.totalSpent - a.totalSpent;
    })
    .slice(0, limit);
};

export const getTopClientsBySpend = (
  invoices: Invoice[],
  limit: number = 5
): ClientRanking[] => {
  return aggregateClients(invoices)
    .sort((a, b) => {
      if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
      return b.invoiceCount - a.invoiceCount;
    })
    .slice(0, limit);
};

export interface QuarterlyPeriod {
  startDate: Date;
  endDate: Date;
  paymentMonth: string;
  label: string;
  quarter: number;
  year: number;
  months: Array<{ name: string; month: number; year: number }>;
}

const PAYMENT_MONTHS = ['Abril', 'Julio', 'Octubre', 'Enero'] as const;
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export const getQuarterlyPeriod = (offset = 0): QuarterlyPeriod => {
  const now = new Date();
  const currentQuarterIndex = Math.floor(now.getMonth() / 3);
  const absoluteQuarter = now.getFullYear() * 4 + currentQuarterIndex + offset;
  const year = Math.floor(absoluteQuarter / 4);
  const quarterIndex = ((absoluteQuarter % 4) + 4) % 4;
  const quarter = quarterIndex + 1;
  const startMonth = quarterIndex * 3;

  const paymentMonthName = PAYMENT_MONTHS[quarterIndex];
  const paymentMonth =
    quarterIndex === 3
      ? `${paymentMonthName} ${year + 1}`
      : paymentMonthName;

  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0);
  endDate.setHours(23, 59, 59, 999);

  const months = [
    { name: MONTH_NAMES[startMonth], month: startMonth, year },
    { name: MONTH_NAMES[startMonth + 1], month: startMonth + 1, year },
    { name: MONTH_NAMES[startMonth + 2], month: startMonth + 2, year },
  ];

  return {
    startDate,
    endDate,
    paymentMonth,
    label: `T${quarter} ${year}`,
    quarter,
    year,
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

type MonthlyTaxAccumulator = {
  income: number;
  expenseBase: number;
  retention: number;
  vatCharged: number;
  vatPaid: number;
};

export const calculateQuarterlyTaxes = (
  invoices: Invoice[],
  period: QuarterlyPeriod,
  expenses: Expense[] = [],
  irpfRatePercent: number = DEFAULT_IRPF_RATE_PERCENT
): QuarterlyTaxesResult => {
  const ratePercent = Number.isFinite(irpfRatePercent)
    ? Math.min(100, Math.max(0, irpfRatePercent))
    : DEFAULT_IRPF_RATE_PERCENT;
  const irpfRate = ratePercent / 100;

  const periodInvoices = invoices.filter((invoice) =>
    isDateInPeriod(invoice.created_date, period)
  );
  const periodExpenses = expenses.filter((expense) =>
    isDateInPeriod(expense.date, period)
  );

  const monthlyData = new Map<string, MonthlyTaxAccumulator>();

  period.months.forEach(({ name }) => {
    monthlyData.set(name, {
      income: 0,
      expenseBase: 0,
      retention: 0,
      vatCharged: 0,
      vatPaid: 0,
    });
  });

  periodInvoices.forEach((invoice) => {
    const monthInfo = findPeriodMonth(invoice.created_date, period);
    if (!monthInfo) return;

    const current = monthlyData.get(monthInfo.name);
    if (!current) return;

    monthlyData.set(monthInfo.name, {
      ...current,
      income: current.income + (Number(invoice.subtotal) || 0),
      retention: current.retention + getInvoiceRetention(invoice),
      vatCharged: current.vatCharged + (Number(invoice.vat_amount) || 0),
    });
  });

  periodExpenses.forEach((expense) => {
    const monthInfo = findPeriodMonth(expense.date, period);
    if (!monthInfo) return;

    const current = monthlyData.get(monthInfo.name);
    if (!current) return;

    monthlyData.set(monthInfo.name, {
      ...current,
      expenseBase: current.expenseBase + (Number(expense.base_amount) || 0),
      vatPaid: current.vatPaid + (Number(expense.vat_amount) || 0),
    });
  });

  const monthlyBreakdown: MonthlyTaxBreakdown[] = period.months.map(({ name }) => {
    const data = monthlyData.get(name) || {
      income: 0,
      expenseBase: 0,
      retention: 0,
      vatCharged: 0,
      vatPaid: 0,
    };
    const profit = data.income - data.expenseBase;
    const irpf = Number((profit * irpfRate - data.retention).toFixed(2));
    const iva = Number((data.vatCharged - data.vatPaid).toFixed(2));

    return {
      month: name,
      irpf,
      iva,
    };
  });

  const totalIncome = periodInvoices.reduce(
    (sum, invoice) => sum + (Number(invoice.subtotal) || 0),
    0
  );
  const totalExpenseBase = periodExpenses.reduce(
    (sum, expense) => sum + (Number(expense.base_amount) || 0),
    0
  );
  const totalRetention = periodInvoices.reduce(
    (sum, invoice) => sum + getInvoiceRetention(invoice),
    0
  );
  const totalVatCharged = periodInvoices.reduce(
    (sum, invoice) => sum + (Number(invoice.vat_amount) || 0),
    0
  );
  const totalVatPaid = periodExpenses.reduce(
    (sum, expense) => sum + (Number(expense.vat_amount) || 0),
    0
  );

  const totalIrpf = Math.max(
    0,
    Number(
      ((totalIncome - totalExpenseBase) * irpfRate - totalRetention).toFixed(2)
    )
  );
  const totalIva = Number((totalVatCharged - totalVatPaid).toFixed(2));
  const totalTaxes = Number((totalIrpf + totalIva).toFixed(2));
  const totalInvoiced = periodInvoices.reduce(
    (sum, invoice) => sum + (Number(invoice.total) || 0),
    0
  );

  return {
    monthlyBreakdown,
    totalIrpf,
    totalIva,
    totalTaxes,
    totalInvoiced,
  };
};