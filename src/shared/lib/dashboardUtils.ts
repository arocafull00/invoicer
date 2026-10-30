import type { Expense, Invoice } from '@/shared/types';
import type { TaxPeriodSettings } from '@/expenses/lib/taxSettings';

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
  
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
  const collectionRate = invoices.length > 0 ? (paidInvoices / invoices.length) * 100 : 0;
  const thisMonthPending = thisMonthInvoices.filter(invoice => invoice.status === 'pending').length;
  const thisMonthPaid = thisMonthInvoices.filter(invoice => invoice.status === 'paid').length;
  const thisMonthCollectionRate = invoicesThisMonth > 0 ? (thisMonthPaid / invoicesThisMonth) * 100 : 0;

  // Calcular cambios respecto al mes anterior
  const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const lastMonthCount = lastMonthInvoices.length;
  const lastMonthPending = lastMonthInvoices.filter(invoice => invoice.status === 'pending').length;
  const lastMonthPaid = lastMonthInvoices.filter(invoice => invoice.status === 'paid').length;
  const lastMonthCollectionRate = lastMonthCount > 0 ? (lastMonthPaid / lastMonthCount) * 100 : 0;

  const invoiceChange = lastMonthCount > 0 ? ((invoicesThisMonth - lastMonthCount) / lastMonthCount) * 100 : 0;
  const revenueChange = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
  const pendingChange = lastMonthPending > 0 ? ((thisMonthPending - lastMonthPending) / lastMonthPending) * 100 : 0;
  const collectionRateChange = lastMonthCollectionRate > 0 ? thisMonthCollectionRate - lastMonthCollectionRate : 0;

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

export interface AnnualRevenue {
  startDate: Date;
  endDate: Date;
  gross: number;
  grossWithoutVat: number;
  net: number;
  expenses: number;
  profit: number;
  irpfRate: number;
  invoiceCount: number;
  clients: Array<{
    clientId: string;
    clientName: string;
    amount: number;
    percentage: number;
  }>;
}

export const calculateAnnualRevenue = (
  invoices: Invoice[],
  irpfRatePercent: number = DEFAULT_IRPF_RATE_PERCENT,
  year: number = new Date().getFullYear(),
  expenses: Expense[] = []
): AnnualRevenue => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const irpfRate = Number.isFinite(irpfRatePercent)
    ? Math.min(100, Math.max(0, irpfRatePercent))
    : DEFAULT_IRPF_RATE_PERCENT;
  const byClient = new Map<
    string,
    { clientId: string; clientName: string; amountCents: number }
  >();
  let baseCents = 0;
  let vatCents = 0;
  let invoiceCount = 0;

  for (const invoice of invoices) {
    if (invoice.status !== 'paid' || invoice.deleted) continue;
    const parts = getLocalDateParts(invoice.created_date);
    if (!parts || parts.year !== year) continue;

    const amountCents = Math.round((Number(invoice.subtotal) || 0) * 100);
    baseCents += amountCents;
    vatCents += Math.round((Number(invoice.vat_amount) || 0) * 100);
    invoiceCount += 1;

    const clientId = invoice.client?.id ?? '';
    const existing = byClient.get(clientId);
    if (existing) {
      existing.amountCents += amountCents;
    } else {
      byClient.set(clientId, {
        clientId,
        clientName: invoice.client?.name?.trim() || 'Sin cliente',
        amountCents,
      });
    }
  }

  const expenseCents = expenses.filter((expense) => Number((expense.fiscal_date ?? expense.date).slice(0, 4)) === year)
    .reduce((sum, expense) => sum + Math.round((Number(expense.base_amount) + Number(expense.vat_amount) * (1 - (expense.deductible_vat_pct ?? 100) / 100)) * (expense.deductible_base_pct ?? 100)), 0);
  const profit = (baseCents - expenseCents) / 100;
  return {
    startDate,
    endDate,
    expenses: expenseCents / 100,
    profit,
    gross: (baseCents + vatCents) / 100,
    grossWithoutVat: baseCents / 100,
    net: Math.round((profit - Math.max(0, profit) * irpfRate / 100) * 100) / 100,
    irpfRate,
    invoiceCount,
    clients: Array.from(byClient.values())
      .sort((a, b) => b.amountCents - a.amountCents || a.clientName.localeCompare(b.clientName, 'es'))
      .map((client) => ({
        clientId: client.clientId,
        clientName: client.clientName,
        amount: client.amountCents / 100,
        percentage: baseCents > 0 ? (client.amountCents / baseCents) * 100 : 0,
      })),
  };
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
  hasActivity: boolean;
}

export interface QuarterlyTaxesResult {
  monthlyBreakdown: MonthlyTaxBreakdown[];
  totalIrpf: number;
  totalIva: number;
  totalTaxes: number;
  totalInvoiced: number;
  income: number;
  expenses: number;
  profit: number;
  vatCharged: number;
  vatDeductible: number;
  vatToCarry: number;
  net: number;
  annualProfit: number;
  supplierRetentions: number;
}

function deductibleCost(expense: Expense) {
  return Math.round((Number(expense.base_amount) + Number(expense.vat_amount) * (1 - (expense.deductible_vat_pct ?? 100) / 100)) * (expense.deductible_base_pct ?? 100)) / 100;
}
function deductibleVat(expense: Expense) {
  return Math.round(Number(expense.vat_amount) * (expense.deductible_vat_pct ?? 100)) / 100;
}
const roundMoney = (n: number) => Math.round(n * 100) / 100;

export const calculateQuarterlyTaxes = (
  invoices: Invoice[], period: QuarterlyPeriod, expenses: Expense[] = [],
  irpfRatePercent: number = DEFAULT_IRPF_RATE_PERCENT,
  options?: Pick<TaxPeriodSettings, 'model130_required' | 'prior_irpf_payments' | 'vat_credit'>,
): QuarterlyTaxesResult => {
  const rate = (Number.isFinite(irpfRatePercent) ? Math.min(100, Math.max(0, irpfRatePercent)) : DEFAULT_IRPF_RATE_PERCENT) / 100;
  // Fiscal estimates follow invoice dates (accrual), independently of collection status.
  const active = invoices.filter((invoice) => !invoice.deleted);
  const periodInvoices = active.filter((invoice) => isDateInPeriod(invoice.created_date, period));
  const periodExpenses = expenses.filter((expense) => isDateInPeriod(expense.fiscal_date ?? expense.date, period));
  const yearPeriod = { ...period, startDate: new Date(period.year, 0, 1) };
  const annualInvoices = active.filter((invoice) => isDateInPeriod(invoice.created_date, yearPeriod));
  const annualExpenses = expenses.filter((expense) => isDateInPeriod(expense.fiscal_date ?? expense.date, yearPeriod));
  const sum = <T,>(items: T[], value: (item: T) => number) => roundMoney(items.reduce((n, item) => n + value(item), 0));
  const income = sum(periodInvoices, (invoice) => Number(invoice.subtotal));
  const deductibleExpenses = sum(periodExpenses, deductibleCost);
  const profit = roundMoney(income - deductibleExpenses);
  const annualProfit = roundMoney(sum(annualInvoices, (invoice) => Number(invoice.subtotal)) - sum(annualExpenses, deductibleCost));
  const annualRetentions = sum(annualInvoices, getInvoiceRetention);
  const totalIrpf = options?.model130_required === false ? 0 : roundMoney(Math.max(0, annualProfit * rate - annualRetentions - (options?.prior_irpf_payments ?? 0)));
  const vatCharged = sum(periodInvoices, (invoice) => Number(invoice.vat_amount));
  const vatDeductible = sum(periodExpenses, deductibleVat);
  const vatBalance = roundMoney(vatCharged - vatDeductible - (options?.vat_credit ?? 0));
  const totalIva = Math.max(0, vatBalance);
  const monthlyBreakdown = period.months.map((month) => {
    const monthInvoices = periodInvoices.filter((invoice) => findPeriodMonth(invoice.created_date, period)?.month === month.month);
    const monthExpenses = periodExpenses.filter((expense) => findPeriodMonth(expense.fiscal_date ?? expense.date, period)?.month === month.month);
    return { month: month.name, irpf: 0, iva: roundMoney(sum(monthInvoices, (i) => Number(i.vat_amount)) - sum(monthExpenses, deductibleVat)), hasActivity: monthInvoices.length > 0 || monthExpenses.length > 0 };
  });
  const supplierRetentions = Math.max(0, sum(periodExpenses, (expense) => Number(expense.retention_amount ?? 0)));
  const totalTaxes = roundMoney(totalIrpf + totalIva + supplierRetentions);
  return {
    monthlyBreakdown, totalIrpf, totalIva, totalTaxes, income, expenses: deductibleExpenses, profit,
    vatCharged, vatDeductible, vatToCarry: Math.max(0, -vatBalance), annualProfit, supplierRetentions,
    // A provisional reserve on this quarter's profit, distinct from the cumulative model 130 payment.
    net: roundMoney(profit - Math.max(0, profit) * rate),
    totalInvoiced: sum(periodInvoices, (invoice) => Number(invoice.total)),
  };
};
