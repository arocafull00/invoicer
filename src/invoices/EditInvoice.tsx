import React, { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useInvoiceStore } from "@/shared/lib/stores";
import { useInvoiceFormStore } from "@/invoices/store/useInvoicesStore";
import { updateInvoice } from "@/shared/api/services/invoices";
import { queryClient } from "@/shared/api/queryClient";
import { InvoiceHeader } from "@/invoices/components/InvoiceHeader";
import { InvoiceBasicInfo } from "@/invoices/components/InvoiceBasicInfo";
import { ConsultantSection } from "@/invoices/components/ConsultantSection";
import { ClientSection } from "@/invoices/components/ClientSection";
import { LineItemsSection } from "@/invoices/components/LineItemsSection";
import { PaymentMethodSection } from "@/invoices/components/PaymentMethodSection";

export const EditInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { consultants, clients, payment_instructions, invoices } =
    useInvoiceStore();
  const {
    form,
    setForm,
    setCurrentLineItem,
    addLineItem,
    removeLineItem,
    updateLineItem,
    isFormValid,
    getSelectedConsultant,
    getSelectedClient,
    getSelectedPayment,
    setDialog,
    setNewConsultant,
    setNewClient,
    setNewPayment,
    getLineItemTotal,
    getSubtotal,
    getVatAmount,
    getTotalAmount,
  } = useInvoiceFormStore();

  const invoice = useMemo(
    () => invoices.find((inv) => inv.id === id),
    [invoices, id]
  );

  useEffect(() => {
    if (!invoice) {
      router.replace("/invoices");
      return;
    }
    
    // Handle line items - check if invoice has line_items array or use legacy description
    let lineItems: Array<
      Omit<import("@/shared/types").LineItem, "id" | "total"> & {
        clientKey: string;
      }
    > = [];

    if (invoice.line_items && invoice.line_items.length > 0) {
      lineItems = invoice.line_items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        includeVat: item.includeVat ?? !invoice.vat_exempt,
        clientKey: item.id || crypto.randomUUID(),
      }));
    } else if (invoice.description) {
      const desc = invoice.description.replace(/\s*\(Cant\.[^)]*\)$/u, "");
      lineItems = [
        {
          description: desc || invoice.description,
          quantity: 1,
          rate: invoice.total,
          includeVat: !invoice.vat_exempt,
          clientKey: crypto.randomUUID(),
        },
      ];
    }
    
    setForm({
      invoiceNumber: invoice.number,
      issueDate: invoice.start_date,
      dueDate: invoice.end_date,
      selectedConsultantId: invoice.consultant.id,
      selectedClientId: invoice.client.id,
      selectedPaymentId: invoice.payment_instructions.id,
      lineItems,
      currentLineItem: { description: "", quantity: 1, rate: 0, includeVat: false },
      includeVat: !invoice.vat_exempt,
      vatRate: invoice.vat_rate || 21,
    });
  }, [invoice, router, setForm]);

  if (!invoice) return null;

  const handleSave = async () => {
    const selectedConsultant = getSelectedConsultant();
    const selectedClient = getSelectedClient();
    const selectedPayment = getSelectedPayment();
    if (
      !isFormValid() ||
      !selectedConsultant ||
      !selectedClient ||
      !selectedPayment
    ) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    try {
      const lineItemsWithIds = form.lineItems.map((item, index) => ({
        id: `line-${index + 1}`,
        ...item,
        total: getLineItemTotal(item),
      }));

      const subtotal = getSubtotal();
      const vatAmount = getVatAmount();
      const total = getTotalAmount();

      // Check if any line item has VAT applied
      const hasVatItems = form.lineItems.some(item => item.includeVat);

      const payload = {
        number: form.invoiceNumber,
        start_date: form.issueDate,
        end_date: form.dueDate,
        consultant: selectedConsultant,
        client: selectedClient,
        description: lineItemsWithIds.map(item => item.description).join(", "), // Keep for backward compatibility
        line_items: lineItemsWithIds,
        subtotal,
        vat_rate: hasVatItems ? form.vatRate : 0,
        vat_amount: vatAmount,
        total,
        payment_instructions: selectedPayment,
        vat_exempt: !hasVatItems,
        status: invoice.status,
      } as const;

      const updated = await updateInvoice(invoice.id, payload);
      const current = useInvoiceStore.getState().invoices;
      const next = current.map((inv) =>
        inv.id === updated.id ? updated : inv
      );
      useInvoiceStore.getState().setInvoices(next);
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Factura actualizada exitosamente");
      router.push("/invoices");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la factura");
    }
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <InvoiceHeader
        title="Editar factura"
        subtitle={`Modificar factura #${invoice.number}`}
        actionLabel="Guardar cambios"
        onAction={handleSave}
        actionDisabled={!isFormValid()}
      />

      <InvoiceBasicInfo
        invoiceNumber={form.invoiceNumber}
        issueDate={form.issueDate}
        dueDate={form.dueDate}
        onInvoiceNumberChange={(value) => setForm({ invoiceNumber: value })}
        onIssueDateChange={(value) => setForm({ issueDate: value })}
        onDueDateChange={(value) => setForm({ dueDate: value })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsultantSection
          consultants={consultants}
          selectedConsultantId={form.selectedConsultantId}
          selectedConsultant={getSelectedConsultant()}
          openDialog={form.openNewConsultant}
          newConsultant={form.newConsultant}
          onSelectConsultant={(id) => setForm({ selectedConsultantId: id })}
          onDialogChange={(open) => setDialog("consultant", open)}
          onNewConsultantChange={setNewConsultant}
          onCreateConsultant={async () => {
            await useInvoiceFormStore.getState().createNewConsultant();
          }}
        />

        <ClientSection
          clients={clients}
          selectedClientId={form.selectedClientId}
          selectedClient={getSelectedClient()}
          openDialog={form.openNewClient}
          newClient={form.newClient}
          onSelectClient={(id) => setForm({ selectedClientId: id })}
          onDialogChange={(open) => setDialog("client", open)}
          onNewClientChange={setNewClient}
          onCreateClient={async () => {
            await useInvoiceFormStore.getState().createNewClient();
          }}
        />
      </div>

      <LineItemsSection
        lineItems={form.lineItems}
        issueDate={form.issueDate}
        currentLineItem={form.currentLineItem}
        vatRate={form.vatRate}
        onUpdateLineItem={updateLineItem}
        onRemoveLineItem={removeLineItem}
        onSetCurrentLineItem={setCurrentLineItem}
        onAddLineItem={addLineItem}
        getLineItemTotal={getLineItemTotal}
        getSubtotal={getSubtotal}
        getVatAmount={getVatAmount}
        getTotalAmount={getTotalAmount}
      />

      <PaymentMethodSection
        paymentInstructions={payment_instructions}
        selectedPaymentId={form.selectedPaymentId}
        selectedPayment={getSelectedPayment()}
        openDialog={form.openNewPayment}
        newPayment={form.newPayment}
        onSelectPayment={(id) => setForm({ selectedPaymentId: id })}
        onDialogChange={(open) => setDialog("payment", open)}
        onNewPaymentChange={setNewPayment}
        onCreatePayment={async () => {
          await useInvoiceFormStore.getState().createNewPayment();
        }}
      />
    </div>
  );
};
