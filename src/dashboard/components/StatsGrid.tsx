import React from 'react';
import { FileText, Euro, TrendingUp, Calendar } from "lucide-react";
import { useInvoiceStore, useSettingsStore } from '@/shared/lib/stores';
import { useExpensesStore } from '@/expenses/store/useExpensesStore';
import { calculateDashboardStats } from '@/shared/lib/dashboardUtils';
import { formatCurrency } from '@/shared/lib/helpers';
import { StatCard } from './StatCard';

export const StatsGrid: React.FC = () => {
  const invoices = useInvoiceStore((s) => s.invoices);
  const expenses = useExpensesStore((s) => s.expenses);
  const irpfRate = useSettingsStore((s) => s.settings?.irpf_rate);
  const currency = useSettingsStore((s) => s.settings?.default_currency);
  const stats = calculateDashboardStats(invoices, expenses, irpfRate);

  const statsData = [
    {
      title: "Neto estimado este mes",
      value: formatCurrency(stats.netThisMonth, currency),
      change: stats.monthlyChange.net,
      icon: FileText,
    },
    {
      title: "Ingresos totales",
      value: formatCurrency(stats.totalRevenue, currency),
      change: stats.monthlyChange.revenue,
      icon: Euro,
    },
    {
      title: "Facturas pendientes",
      value: stats.pendingInvoices.toString(),
      change: stats.monthlyChange.pending,
      lowerIsBetter: true,
      icon: Calendar,
    },
    {
      title: "Facturado este mes",
      value: formatCurrency(stats.billedThisMonth, currency),
      change: stats.monthlyChange.billed,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
