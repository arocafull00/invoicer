import React from 'react';
import { Card } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Link } from "react-router-dom";

const recentInvoices = [
  {
    id: "INV-001",
    client: "ViralRankers Ltd",
    amount: "€2,880.00",
    status: "Pagada",
    date: "31 Jul 2024",
  },
  {
    id: "INV-002", 
    client: "TechCorp Solutions",
    amount: "€1,450.00",
    status: "Pendiente",
    date: "28 Jul 2024",
  },
  {
    id: "INV-003",
    client: "Digital Agency Pro",
    amount: "€3,200.00", 
    status: "Enviada",
    date: "25 Jul 2024",
  },
];

export const RecentInvoices: React.FC = () => {
  return (
    <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Facturas Recientes</h2>
        <Button variant="ghost" asChild className="text-[#7F5AF0] hover:bg-[#7F5AF0]/10">
          <Link to="/invoices">Ver todas</Link>
        </Button>
      </div>
      <div className="space-y-4">
        {recentInvoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-[#FFFFFF14] last:border-0">
            <div className="flex-1">
              <p className="font-medium text-white">{invoice.id}</p>
              <p className="text-sm text-[#A1A1AA]">{invoice.client}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">{invoice.amount}</p>
              <p className="text-sm text-[#A1A1AA]">{invoice.date}</p>
            </div>
            <div className="ml-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                invoice.status === 'Pagada' 
                  ? 'bg-green-500/20 text-green-400' 
                  : invoice.status === 'Pendiente'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
