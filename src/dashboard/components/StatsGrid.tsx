import React from 'react';
import { FileText, Euro, TrendingUp, Calendar } from "lucide-react";
import { useInvoiceStore } from '@/shared/lib/stores';
import { calculateDashboardStats, formatCurrency, formatPercentage } from '@/shared/lib/dashboardUtils';
import { StatCard } from './StatCard';

export const StatsGrid: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const stats = calculateDashboardStats(invoices);

  const statsData = [
    {
      title: "Facturas este mes",
      value: stats.invoicesThisMonth.toString(),
      change: formatPercentage(stats.monthlyChange.invoices),
      changeType: stats.monthlyChange.invoices >= 0 ? "positive" as const : "negative" as const,
      icon: FileText,
    },
    {
      title: "Ingresos totales",
      value: formatCurrency(stats.totalRevenue),
      change: formatPercentage(stats.monthlyChange.revenue),
      changeType: stats.monthlyChange.revenue >= 0 ? "positive" as const : "negative" as const,
      icon: Euro,
    },
    {
      title: "Facturas pendientes",
      value: stats.pendingInvoices.toString(),
      change: formatPercentage(stats.monthlyChange.pending),
      changeType: stats.monthlyChange.pending <= 0 ? "positive" as const : "negative" as const,
      icon: Calendar,
    },
    {
      title: "Tasa de cobro",
      value: `${stats.collectionRate.toFixed(1)}%`,
      change: formatPercentage(stats.monthlyChange.collectionRate),
      changeType: stats.monthlyChange.collectionRate >= 0 ? "positive" as const : "negative" as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};
