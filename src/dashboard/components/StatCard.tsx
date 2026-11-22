import React from 'react';
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { formatPercentage } from '@/shared/lib/dashboardUtils';

interface StatCardProps {
  title: string;
  value: string;
  change: number | null;
  lowerIsBetter?: boolean;
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  lowerIsBetter = false,
  icon: Icon 
}) => {
  const changeColor = change === null
    ? 'text-muted-foreground'
    : (lowerIsBetter ? change <= 0 : change >= 0) ? 'text-green-400' : 'text-red-400';

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
          <p className={`text-sm mt-1 ${changeColor}`}>
            {change === null ? 'Mes anterior en cero' : `${formatPercentage(change)} desde el mes pasado`}
          </p>
        </div>
        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
};
