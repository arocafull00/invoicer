import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useInvoiceStore, useSettingsStore } from "@/shared/lib/stores";
import { formatDate, formatCurrency } from "@/shared/lib/helpers";
import { downloadInvoicePDF } from "@/shared/lib/pdf";

export const ViewInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { invoices } = useInvoiceStore();
  useSettingsStore((s) => s.settings);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Factura no encontrada
          </h1>
          <Button onClick={() => router.push("/invoices")}>
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
      toast.error("No se pudo descargar el PDF");
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
              onClick={() => router.push("/invoices")}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
          <div className="flex flex-col gap-2 justify-center items-center text-center flex-1 lg:flex-none">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Factura {invoice.number}
            </h1>
            <p className="text-muted-foreground">
              Creada el {formatDate(invoice.created_date)}
            </p>
          </div>
          <div className="flex gap-2 justify-center lg:justify-end">
            <Button
              variant="secondary"
              onClick={() => router.push(`/invoices/edit/${invoice.id}`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={loadingPdf}
              className="flex items-center gap-2"
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
        {/* Prestador del servicio */}
        <Card className="bg-card border-border p-6 md:col-span-3 group hover:border-border/80 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-primary">Prestador del servicio</h2>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{invoice.consultant.name}</p>
            <p className="text-muted-foreground text-sm">{invoice.consultant.email}</p>
            <p className="text-muted-foreground text-sm">{invoice.consultant.address}</p>
            <p className="text-muted-foreground text-sm">
              {invoice.consultant.city}, {invoice.consultant.country}
            </p>
            <p className="text-muted-foreground text-sm">NIF: {invoice.consultant.nif}</p>
          </div>
        </Card>

        {/* Cliente */}
        <Card className="bg-card border-border p-6 md:col-span-3 group hover:border-border/80 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-primary">Cliente</h2>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{invoice.client.name}</p>
            <p className="text-muted-foreground text-sm">{invoice.client.email}</p>
            <p className="text-muted-foreground text-sm">{invoice.client.address}</p>
            <p className="text-muted-foreground text-sm">
              {invoice.client.city}, {invoice.client.country}
            </p>
            {invoice.client.company_number && (
              <p className="text-muted-foreground text-sm">
                Número de empresa: {invoice.client.company_number}
              </p>
            )}
          </div>
        </Card>

        {/* Período */}
        <Card className="bg-card border-border p-6 md:col-span-2 group hover:border-border/80 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Período de trabajo</h3>
          </div>
          <p className="text-foreground">
            {formatDate(invoice.start_date)} - {formatDate(invoice.end_date)}
          </p>
        </Card>

        {/* Total */}
        <Card className="bg-card border-border p-6 md:col-span-2 group hover:border-border/80 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Banknote className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
          </div>
          <p className="text-foreground text-2xl font-bold">{formatCurrency(invoice.total)}</p>
        </Card>

        {/* Descripción */}
        <Card className="bg-card border-border p-6 md:col-span-2 group hover:border-border/80 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
          </div>
          <p className="text-foreground">{invoice.description}</p>
        </Card>
      </div>

      {/* Instrucciones de pago */}
      <Card className="max-w-4xl mx-auto bg-card border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <CreditCard className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold text-primary">Instrucciones de Pago</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Titular de la cuenta</p>
            <p className="text-foreground">
              {invoice.payment_instructions.account_holder}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-1">IBAN</p>
            <p className="text-foreground font-mono">
              {invoice.payment_instructions.iban}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-1">Método de pago</p>
            <p className="text-foreground">
              {invoice.payment_instructions.payment_method}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-muted-foreground text-sm mb-1">Términos de pago</p>
          <p className="text-foreground">
            {invoice.payment_instructions.payment_terms}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-muted-foreground text-sm mb-1">Datos adicionales</p>
          <p className="text-muted-foreground text-sm">
            {invoice.payment_instructions.additional_data}
          </p>
        </div>
      </Card>
    </div>
  );
};
