import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useInvoiceStore } from "@/shared/lib/stores";
import { useInvoiceFormStore } from "@/invoices/store/useInvoicesStore";
import { useSettingsStore } from "@/shared/lib/stores";
import { uploadUserLogo } from "@/shared/api/services/logos";
import { InvoiceHeader } from "@/incomes/components/InvoiceHeader";
import { InvoiceBasicInfo } from "@/incomes/components/InvoiceBasicInfo";
import { ConsultantSection } from "@/incomes/components/ConsultantSection";
import { ClientSection } from "@/incomes/components/ClientSection";
import { LineItemsSection } from "@/incomes/components/LineItemsSection";
import { PaymentMethodSection } from "@/incomes/components/PaymentMethodSection";

export default function NewInvoice() {
  const navigate = useNavigate();
  const { consultants, clients, payment_instructions } = useInvoiceStore();
  const { settings, load: loadSettings, setLogoUrl } = useSettingsStore();
  const {
    form,
    setForm,
    setCurrentLineItem,
    addLineItem,
    removeLineItem,
    updateLineItem,
    setLogoFromFile,
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

  // Ensure settings are loaded and preload logo from settings as default
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings?.logo_url && !form.logoPreview) {
      setForm({ logoPreview: settings.logo_url });
    }
  }, [settings?.logo_url, form.logoPreview, setForm]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFromFile(file);
    // If user has no logo saved in settings, upload and persist it
    if (!settings?.logo_url) {
      try {
        const url = await uploadUserLogo(file);
        setLogoUrl(url);
        toast.success("Logo guardado en Configuración");
      } catch (err) {
        console.error(err);
        toast.error("No se pudo subir el logo");
      }
    }
  };

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
        logoPreview={form.logoPreview}
        onIssueDateChange={(value) => setForm({ issueDate: value })}
        onDueDateChange={(value) => setForm({ dueDate: value })}
        onLogoChange={handleLogoChange}
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
