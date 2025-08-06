import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreHorizontal, Download, Eye, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvoiceStore } from '@/lib/stores';
import { formatDate, formatCurrency } from '@/lib/helpers';

interface Invoice {
  id: string;
  number: string;
  created_date: string;
  consultant: {
    name: string;
    email: string;
  };
  client: {
    name: string;
    city: string;
    country: string;
  };
  start_date: string;
  end_date: string;
  total: number;
  status?: "paid" | "pending" | "overdue";
}

const statusConfig = {
  paid: { label: "Pagada", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  pending: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  overdue: { label: "Vencida", color: "bg-red-500/20 text-red-400 border-red-500/30" }
};

export function InvoiceTable() {
  const { invoices } = useInvoiceStore();

  // Mock status for demonstration - in real app this would come from the invoice data
  const invoicesWithStatus = invoices.map(invoice => ({
    ...invoice,
    status: 'paid' as const // Default to paid for demo
  }));

  return (
    <Card className="bg-[#0D0D0D] border-[#FFFFFF14]">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFFFFF14]">
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">NÚMERO</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">FECHA</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">CONSULTOR</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">CLIENTE</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">PERÍODO</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">TOTAL</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">ESTADO</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {invoicesWithStatus.map((invoice) => (
                <tr key={invoice.id} className="border-b border-[#FFFFFF14] hover:bg-[#FFFFFF14]/30 transition-colors">
                  <td className="py-4 px-2">
                    <span className="font-medium text-white">{invoice.number}</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-[#A1A1AA]">{formatDate(invoice.created_date)}</span>
                  </td>
                  <td className="py-4 px-2">
                    <div>
                      <p className="font-medium text-white">{invoice.consultant.name}</p>
                      <p className="text-sm text-[#A1A1AA]">{invoice.consultant.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div>
                      <p className="font-medium text-white">{invoice.client.name}</p>
                      <p className="text-sm text-[#A1A1AA]">{invoice.client.city}, {invoice.client.country}</p>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-[#A1A1AA]">{formatDate(invoice.start_date)} - {formatDate(invoice.end_date)}</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="font-semibold text-white">{formatCurrency(invoice.total)}</span>
                  </td>
                  <td className="py-4 px-2">
                    <Badge className={statusConfig[invoice.status].color}>
                      {statusConfig[invoice.status].label}
                    </Badge>
                  </td>
                  <td className="py-4 px-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-[#A1A1AA] hover:text-white hover:bg-[#FFFFFF14]">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0D0D0D] border-[#FFFFFF14]">
                        <DropdownMenuItem className="text-white hover:bg-[#FFFFFF14] focus:bg-[#FFFFFF14] focus:text-white">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-[#FFFFFF14] focus:bg-[#FFFFFF14] focus:text-white">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-[#FFFFFF14] focus:bg-[#FFFFFF14] focus:text-white">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}