import React from 'react';
import { FileText, Euro, TrendingUp, Calendar } from "lucide-react";
import { StatCard } from './StatCard';

const stats = [
  {
    title: "Facturas este mes",
    value: "12",
    change: "+2.5%",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    title: "Ingresos totales",
    value: "€24,580",
    change: "+15.3%", 
    changeType: "positive" as const,
    icon: Euro,
  },
  {
    title: "Facturas pendientes",
    value: "3",
    change: "-1",
    changeType: "negative" as const,
    icon: Calendar,
  },
  {
    title: "Tasa de cobro",
    value: "94.2%",
    change: "+3.1%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
];

export const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
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
