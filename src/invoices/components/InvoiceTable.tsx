import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { Card } from "@/shared/components/card";
import { Download, Eye, Edit } from "lucide-react";
import { useInvoiceStore } from "@/shared/lib/stores";
import { formatDate, formatCurrency } from "@/shared/lib/helpers";
import { downloadInvoicePDF } from "@/shared/lib/pdf";
import type { Invoice } from "@/shared/types";

interface InvoiceWithStatus extends Invoice {
  status?: "paid" | "pending" | "overdue";
}

const statusConfig = {
  paid: {
    label: "Pagada",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  pending: {
    label: "Pendiente",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  overdue: {
    label: "Vencida",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

export function InvoiceTable() {
  const navigate = useNavigate();
  const { invoices } = useInvoiceStore();
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  // Mock status for demonstration - in real app this would come from the invoice data
  const invoicesWithStatus: InvoiceWithStatus[] = invoices.map((invoice) => ({
    ...invoice,
    status: "paid" as const, // Default to paid for demo
  }));

  const handleDownloadPDF = async (invoice: Invoice) => {
    setLoadingPdf(invoice.id);
    try {
      await downloadInvoicePDF(invoice);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setLoadingPdf(null);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    navigate(`/invoices/edit/${invoice.id}`);
  };

  const handleView = (invoice: Invoice) => {
    navigate(`/invoices/view/${invoice.id}`);
  };

  return (
    <Card className="bg-[#FFFFFF14] border-[#FFFFFF14]">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFFFFF14]">
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
                  NÚMERO
                </th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
                  FECHA
                </th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
                  CONSULTOR
                </th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
                  CLIENTE
                </th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
                  PERÍODO
                </th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
                  TOTAL
                </th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
                  ESTADO
                </th>
                <th className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {invoicesWithStatus.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-[#FFFFFF14] hover:bg-[#FFFFFF14]/30 transition-colors"
                >
                  <td className="py-4 px-2">
                    <span className="font-medium text-white">
                      {invoice.number}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-[#A1A1AA]">
                      {formatDate(invoice.created_date)}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div>
                      <p className="font-medium text-white">
                        {invoice.consultant.name}
                      </p>
                      <p className="text-sm text-[#A1A1AA]">
                        {invoice.consultant.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div>
                      <p className="font-medium text-white">
                        {invoice.client.name}
                      </p>
                      <p className="text-sm text-[#A1A1AA]">
                        {invoice.client.city}, {invoice.client.country}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-[#A1A1AA]">
                      {formatDate(invoice.start_date)} -{" "}
                      {formatDate(invoice.end_date)}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="font-semibold text-white">
                      {formatCurrency(invoice.total)}
                    </span>
                  </td>
                  {invoice.status && (
                    <td className="py-4 px-2">
                      <Badge className={statusConfig[invoice.status].color}>
                        {statusConfig[invoice.status].label}
                      </Badge>
                    </td>
                  )}
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#A1A1AA] hover:text-white hover:bg-[#FFFFFF14] p-2"
                        onClick={() => handleView(invoice)}
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#A1A1AA] hover:text-white hover:bg-[#FFFFFF14] p-2"
                        onClick={() => handleEdit(invoice)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#A1A1AA] hover:text-white hover:bg-[#FFFFFF14] p-2"
                        onClick={() => handleDownloadPDF(invoice)}
                        disabled={loadingPdf === invoice.id}
                        title="Descargar"
                      >
                        {loadingPdf === invoice.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
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
