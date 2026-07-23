import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useInvoiceStore } from "@/shared/lib/stores";
import { useInvoiceFormStore } from "@/invoices/store/useInvoicesStore";
import { InvoiceHeader } from "@/invoices/components/InvoiceHeader";
import { InvoiceBasicInfo } from "@/invoices/components/InvoiceBasicInfo";
import { ConsultantSection } from "@/invoices/components/ConsultantSection";
import { ClientSection } from "@/invoices/components/ClientSection";
import { LineItemsSection } from "@/invoices/components/LineItemsSection";
import { PaymentMethodSection } from "@/invoices/components/PaymentMethodSection";

export default function NewInvoice() {
  const navigate = useNavigate();
  const { consultants, clients, payment_instructions } = useInvoiceStore();
  const {
    form,
    setForm,
    setCurrentLineItem,
    addLineItem,
    removeLineItem,
    updateLineItem,
    fetchNextInvoiceNumber,
    saveInvoice,
    isFormValid,
    getSelectedConsultant,
    getSelectedClient,
    getSelectedPayment,
    setDialog,
    setNewConsultant,
    setNewClient,
    setNewPayment,
    createNewConsultant,
    createNewClient,
    createNewPayment,
    getLineItemTotal,
    getSubtotal,
    getVatAmount,
    getTotalAmount,
  } = useInvoiceFormStore();

  useEffect(() => {
    fetchNextInvoiceNumber();
  }, [fetchNextInvoiceNumber]);

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
      await saveInvoice();
      toast.success("Factura creada exitosamente");
      navigate("/invoices");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la factura");
    }
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <InvoiceHeader
        title="Facturas"
        subtitle="Crear nueva factura con vista previa"
        actionLabel={form.isSaving ? "Guardando..." : "Crear factura"}
        onAction={handleSave}
        actionDisabled={!isFormValid() || form.isSaving}
      />

      <InvoiceBasicInfo
        invoiceNumber={form.invoiceNumber}
        issueDate={form.issueDate}
        dueDate={form.dueDate}
        onIssueDateChange={(value) => setForm({ issueDate: value })}
        onDueDateChange={(value) => setForm({ dueDate: value })}
        readOnlyNumber={true}
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
          onCreateConsultant={async () => { await createNewConsultant(); }}
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
          onCreateClient={async () => { await createNewClient(); }}
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
        onCreatePayment={async () => { await createNewPayment(); }}
      />
    </div>
  );
}
