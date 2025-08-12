import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import {
  ArrowLeft,
  Download,
  Edit,
  User,
  Building2,
  CalendarDays,
  FileText,
  Banknote,
  CreditCard,
} from "lucide-react";
import { useInvoiceStore } from "@/shared/lib/stores";
import { formatDate, formatCurrency } from "@/shared/lib/helpers";
import { downloadInvoicePDF } from "@/shared/lib/pdf";
import { useState } from "react";

export const ViewInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices } = useInvoiceStore();
  const [loadingPdf, setLoadingPdf] = useState(false);

  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text mb-4">
            Factura no encontrada
          </h1>
          <Button onClick={() => navigate("/invoices")} className="btn-primary">
            Volver a facturas
          </Button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    setLoadingPdf(true);
    try {
      await downloadInvoicePDF(invoice);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/invoices")}
              className="text-[#A1A1AA] hover:text-white hover:bg-[#FFFFFF14]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
          <div className="flex flex-col gap-2 justify-center items-center text-center flex-1 lg:flex-none">
            <h1 className="text-2xl lg:text-3xl font-bold text-text">
              Factura {invoice.number}
            </h1>
            <p className="text-textMedium">
              Creada el {formatDate(invoice.created_date)}
            </p>
          </div>
          <div className="flex gap-2 justify-center lg:justify-end">
            <Button
              onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={loadingPdf}
              className="btn-primary flex items-center gap-2"
            >
              {loadingPdf ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Descargar PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        {/* Consultor */}
        <Card className="bg-[#0D0D0D] border-[#FFFFFF14] p-6 md:col-span-3 group hover:border-[#FFFFFF22] transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-md bg-[#7F5AF0]/10 text-[#7F5AF0]">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-[#7F5AF0]">Consultor</h2>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">{invoice.consultant.name}</p>
            <p className="text-[#A1A1AA] text-sm">{invoice.consultant.email}</p>
            <p className="text-[#A1A1AA] text-sm">{invoice.consultant.address}</p>
            <p className="text-[#A1A1AA] text-sm">
              {invoice.consultant.city}, {invoice.consultant.country}
            </p>
            <p className="text-[#A1A1AA] text-sm">NIF: {invoice.consultant.nif}</p>
          </div>
        </Card>

        {/* Cliente */}
        <Card className="bg-[#0D0D0D] border-[#FFFFFF14] p-6 md:col-span-3 group hover:border-[#FFFFFF22] transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-md bg-[#7F5AF0]/10 text-[#7F5AF0]">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-[#7F5AF0]">Cliente</h2>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">{invoice.client.name}</p>
            <p className="text-[#A1A1AA] text-sm">{invoice.client.email}</p>
            <p className="text-[#A1A1AA] text-sm">{invoice.client.address}</p>
            <p className="text-[#A1A1AA] text-sm">
              {invoice.client.city}, {invoice.client.country}
            </p>
            {invoice.client.company_number && (
              <p className="text-[#A1A1AA] text-sm">
                Número de empresa: {invoice.client.company_number}
              </p>
            )}
          </div>
        </Card>

        {/* Período */}
        <Card className="bg-[#0D0D0D] border-[#FFFFFF14] p-6 md:col-span-2 group hover:border-[#FFFFFF22] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-md bg-[#7F5AF0]/10 text-[#7F5AF0]">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-[#A1A1AA]">Período de trabajo</h3>
          </div>
          <p className="text-white">
            {formatDate(invoice.start_date)} - {formatDate(invoice.end_date)}
          </p>
        </Card>

        {/* Total */}
        <Card className="bg-[#0D0D0D] border-[#FFFFFF14] p-6 md:col-span-2 group hover:border-[#FFFFFF22] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-md bg-[#7F5AF0]/10 text-[#7F5AF0]">
              <Banknote className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-[#A1A1AA]">Total</h3>
          </div>
          <p className="text-white text-2xl font-bold">{formatCurrency(invoice.total)}</p>
        </Card>

        {/* Descripción */}
        <Card className="bg-[#0D0D0D] border-[#FFFFFF14] p-6 md:col-span-2 group hover:border-[#FFFFFF22] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-md bg-[#7F5AF0]/10 text-[#7F5AF0]">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-[#A1A1AA]">Descripción</h3>
          </div>
          <p className="text-white">{invoice.description}</p>
        </Card>
      </div>

      {/* Instrucciones de pago */}
      <Card className="max-w-4xl mx-auto bg-[#0D0D0D] border-[#FFFFFF14] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-md bg-[#7F5AF0]/10 text-[#7F5AF0]">
            <CreditCard className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold text-[#7F5AF0]">Instrucciones de Pago</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[#A1A1AA] text-sm mb-1">Titular de la cuenta</p>
            <p className="text-white">
              {invoice.payment_instructions.account_holder}
            </p>
          </div>
          <div>
            <p className="text-[#A1A1AA] text-sm mb-1">IBAN</p>
            <p className="text-white font-mono">
              {invoice.payment_instructions.iban}
            </p>
          </div>
          <div>
            <p className="text-[#A1A1AA] text-sm mb-1">Método de pago</p>
            <p className="text-white">
              {invoice.payment_instructions.payment_method}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-[#A1A1AA] text-sm mb-1">Términos de pago</p>
          <p className="text-white">
            {invoice.payment_instructions.payment_terms}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-[#A1A1AA] text-sm mb-1">Exención de IVA</p>
          <p className="text-[#A1A1AA] text-sm">
            {invoice.payment_instructions.vat_exemption_text}
          </p>
        </div>
      </Card>
    </div>
  );
};
