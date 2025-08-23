import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIncomes } from '@/shared/api/hooks/useIncomes';
import { formatCurrency } from '@/shared/lib/dashboardUtils';
import type { Income } from '@/shared/types';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getRecentIncomes = (incomes: Income[], limit: number = 5): Income[] => {
  return incomes
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const RecentIncomes: React.FC = () => {
  const { data: incomes = [], isLoading } = useIncomes();
  const recentIncomes = getRecentIncomes(incomes, 5);

  if (isLoading) {
    return (
      <Card className="p-6  ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Ingresos Recientes</h2>
          <div className="h-9" />
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-white/10 rounded" />
          <div className="h-6 bg-white/10 rounded" />
          <div className="h-6 bg-white/10 rounded" />
        </div>
      </Card>
    );
  }

  if (recentIncomes.length === 0) {
    return (
      <Card className="p-6  ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Ingresos Recientes</h2>
          <Button variant="ghost" asChild className="text-[#7F5AF0] hover:bg-[#7F5AF0]/10">
            <Link to="/incomes">Ver todos</Link>
          </Button>
        </div>
        <div className="text-center py-8 text-[#A1A1AA]">
          <p>No hay ingresos recientes</p>
          <Button asChild className="mt-4">
            <Link to="/incomes">Añadir ingreso</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6  ">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Ingresos Recientes</h2>
        <Button variant="ghost" asChild className="text-[#7F5AF0] hover:bg-[#7F5AF0]/10">
          <Link to="/incomes">Ver todos</Link>
        </Button>
      </div>
      <div className="space-y-4">
        {recentIncomes.map((income) => (
          <div key={income.id} className="flex items-center justify-between py-3 border-b border-[#FFFFFF14] last:border-0">
            <div className="flex-1">
              <p className="font-medium text-white">{income.concept}</p>
              <p className="text-sm text-[#A1A1AA]">{income.client?.name}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">{formatCurrency(income.amount)}</p>
              <p className="text-sm text-[#A1A1AA]">{formatDate(income.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};


