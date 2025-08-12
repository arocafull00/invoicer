import React from 'react';
import { Card } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Link } from "react-router-dom";
import { useInvoiceStore } from '@/shared/lib/stores';
import { getRecentInvoices, formatCurrency } from '@/shared/lib/dashboardUtils';

const getInvoiceStatus = (invoice: any) => {
  // Por ahora, asignamos estados de ejemplo basados en la fecha
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(invoice.created_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceCreated > 30) return 'Pagada';
  if (daysSinceCreated > 14) return 'Pendiente';
  return 'Enviada';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const RecentInvoices: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const recentInvoices = getRecentInvoices(invoices, 5);

  if (recentInvoices.length === 0) {
    return (
      <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Facturas Recientes</h2>
          <Button variant="ghost" asChild className="text-[#7F5AF0] hover:bg-[#7F5AF0]/10">
            <Link to="/invoices">Ver todas</Link>
          </Button>
        </div>
        <div className="text-center py-8 text-[#A1A1AA]">
          <p>No hay facturas recientes</p>
          <Button asChild className="mt-4">
            <Link to="/invoices/wizard">Crear primera factura</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Facturas Recientes</h2>
        <Button variant="ghost" asChild className="text-[#7F5AF0] hover:bg-[#7F5AF0]/10">
          <Link to="/invoices">Ver todas</Link>
        </Button>
      </div>
      <div className="space-y-4">
        {recentInvoices.map((invoice) => {
          const status = getInvoiceStatus(invoice);
          return (
            <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-[#FFFFFF14] last:border-0">
              <div className="flex-1">
                <p className="font-medium text-white">{invoice.number}</p>
                <p className="text-sm text-[#A1A1AA]">{invoice.client.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{formatCurrency(invoice.total)}</p>
                <p className="text-sm text-[#A1A1AA]">{formatDate(invoice.created_date)}</p>
              </div>
              <div className="ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  status === 'Pagada' 
                    ? 'bg-green-500/20 text-green-400' 
                    : status === 'Pendiente'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
