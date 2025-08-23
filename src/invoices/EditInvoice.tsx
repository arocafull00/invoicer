import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useInvoiceStore } from "@/shared/lib/stores";
import { useInvoiceFormStore } from "@/invoices/store/useInvoicesStore";
import { useSettingsStore } from "@/shared/lib/stores";
import { uploadUserLogo } from "@/shared/api/services/logos";
import { updateInvoice } from "@/shared/api/services/invoices";

export const EditInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { consultants, clients, payment_instructions, invoices } = useInvoiceStore();
  const { settings, load: loadSettings, setLogoUrl } = useSettingsStore();
  const {
    form,
    setForm,
    setLineItem,
    setLogoFromFile,
    isFormValid,
    getSelectedConsultant,
    getSelectedClient,
    getSelectedPayment,
    setDialog,
    setNewConsultant,
    setNewClient,
    setNewPayment,
    getLineTotal,
  } = useInvoiceFormStore();

  const invoice = useMemo(() => invoices.find((inv) => inv.id === id), [invoices, id]);

  useEffect(() => {
    if (!invoice) {
      navigate("/invoices");
      return;
    }
    const desc = invoice.description.replace(/\s*\(Cant\.[^)]*\)$/u, "");
    setForm({
      invoiceNumber: invoice.number,
      issueDate: invoice.start_date,
      dueDate: invoice.end_date,
      selectedConsultantId: invoice.consultant.id,
      selectedClientId: invoice.client.id,
      selectedPaymentId: invoice.payment_instructions.id,
      logoPreview: form.logoPreview ?? null,
    });
    setLineItem({ description: desc || invoice.description, quantity: 1, rate: invoice.total });
  }, [invoice, navigate, setForm, setLineItem, form.logoPreview]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings?.logo_url && !form.logoPreview) {
      setForm({ logoPreview: settings.logo_url });
    }
  }, [settings?.logo_url, form.logoPreview, setForm]);

  if (!invoice) return null;

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFromFile(file);
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
    if (!isFormValid() || !selectedConsultant || !selectedClient || !selectedPayment) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    try {
      const payload = {
        number: form.invoiceNumber,
        start_date: form.issueDate,
        end_date: form.dueDate,
        consultant: selectedConsultant,
        client: selectedClient,
        description: `${form.lineItem.description} (Cant.: ${form.lineItem.quantity} × Tarifa: ${form.lineItem.rate.toFixed(2)})`,
        total: getLineTotal(),
        payment_instructions: selectedPayment,
        vat_exempt: true,
        status: invoice.status,
      } as const;

      const updated = await updateInvoice(invoice.id, payload);
      const current = useInvoiceStore.getState().invoices;
      const next = current.map((inv) => (inv.id === updated.id ? updated : inv));
      useInvoiceStore.getState().setInvoices(next);
      toast.success("Factura actualizada exitosamente");
      navigate("/invoices");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la factura");
    }
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Editar factura</h1>
          <p className="text-[#A1A1AA] mt-1">Modificar factura #{invoice.number}</p>
        </div>
        <Button onClick={handleSave} disabled={!isFormValid()}>
          Guardar cambios
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Número de factura</Label>
                <Input
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ invoiceNumber: e.target.value })}
                  className="bg-input border-border text-card-foreground"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Fecha de emisión</Label>
                  <Input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ issueDate: e.target.value })}
                    className="bg-input border-border text-card-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Fecha de vencimiento</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ dueDate: e.target.value })}
                    className="bg-input border-border text-card-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <label className="w-full h-40 rounded-xl border-2 border-dashed border-[#654DD4] bg-[#FFFFFF14]/50 flex items-center justify-center cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                {form.logoPreview ? (
                  <img src={form.logoPreview} alt="Logo" className="max-h-36 object-contain" />
                ) : (
                  <span className="text-[#A1A1AA]">Añadir logo</span>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Emitido por</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Select value={form.selectedConsultantId} onValueChange={(v) => setForm({ selectedConsultantId: v })}>
                  <SelectTrigger className="bg-input border-border text-card-foreground">
                    <SelectValue placeholder="Seleccionar consultor" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {consultants.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-popover-foreground">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={form.openNewConsultant} onOpenChange={(o) => setDialog("consultant", o)}>
                <DialogTrigger asChild>
                  <Button variant="outline">Nuevo</Button>
                </DialogTrigger>
                <DialogContent className="bg-popover border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">Crear consultor</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Nombre</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newConsultant.name || ""} onChange={(e) => setNewConsultant({ name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Email</Label>
                      <Input type="email" className="bg-input border-border text-card-foreground" value={form.newConsultant.email || ""} onChange={(e) => setNewConsultant({ email: e.target.value })} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">Dirección</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newConsultant.address || ""} onChange={(e) => setNewConsultant({ address: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Ciudad</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newConsultant.city || ""} onChange={(e) => setNewConsultant({ city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">País</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newConsultant.country || ""} onChange={(e) => setNewConsultant({ country: e.target.value })} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">NIF</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newConsultant.nif || ""} onChange={(e) => setNewConsultant({ nif: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={async () => {
                      try { await useInvoiceFormStore.getState().createNewConsultant(); toast.success("Consultor creado"); } catch (e) { console.error(e); toast.error("No se pudo crear el consultor"); }
                    }}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {getSelectedConsultant() && (
              <div className="text-sm text-[#A1A1AA] leading-6">
                <div className="font-semibold text-white">{getSelectedConsultant()!.name}</div>
                <div>{getSelectedConsultant()!.address}</div>
                <div>
                  {getSelectedConsultant()!.city}, {getSelectedConsultant()!.country}
                </div>
                <div>{getSelectedConsultant()!.email}</div>
                <div>NIF: {getSelectedConsultant()!.nif}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Facturar a</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Select value={form.selectedClientId} onValueChange={(v) => setForm({ selectedClientId: v })}>
                  <SelectTrigger className="bg-input border-border text-card-foreground">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-popover-foreground">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={form.openNewClient} onOpenChange={(o) => setDialog("client", o)}>
                <DialogTrigger asChild>
                  <Button variant="outline">Nuevo</Button>
                </DialogTrigger>
                <DialogContent className="bg-popover border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">Crear cliente</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Nombre</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newClient.name || ""} onChange={(e) => setNewClient({ name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Email</Label>
                      <Input type="email" className="bg-input border-border text-card-foreground" value={form.newClient.email || ""} onChange={(e) => setNewClient({ email: e.target.value })} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">Dirección</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newClient.address || ""} onChange={(e) => setNewClient({ address: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Ciudad</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newClient.city || ""} onChange={(e) => setNewClient({ city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">País</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newClient.country || ""} onChange={(e) => setNewClient({ country: e.target.value })} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">Número de empresa (opcional)</Label>
                      <Input className="bg-input border-border text-card-foreground" value={form.newClient.company_number || ""} onChange={(e) => setNewClient({ company_number: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={async () => { try { await useInvoiceFormStore.getState().createNewClient(); toast.success("Cliente creado"); } catch (e) { console.error(e); toast.error("No se pudo crear el cliente"); } }}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {getSelectedClient() && (
              <div className="text-sm text-[#A1A1AA] leading-6">
                <div className="font-semibold text-white">{getSelectedClient()!.name}</div>
                <div>{getSelectedClient()!.address}</div>
                <div>
                  {getSelectedClient()!.city}, {getSelectedClient()!.country}
                </div>
                {getSelectedClient()!.company_number && (
                  <div>Número de empresa: {getSelectedClient()!.company_number}</div>
                )}
                <div>{getSelectedClient()!.email}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Conceptos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-card-foreground">Descripción</Label>
              <Input className="bg-input border-border text-card-foreground" value={form.lineItem.description} onChange={(e) => setLineItem({ description: e.target.value })} placeholder="Descripción del servicio" />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Cantidad</Label>
              <Input type="number" min="0" step="1" className="bg-input border-border text-card-foreground" value={form.lineItem.quantity} onChange={(e) => setLineItem({ quantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Tarifa (€)</Label>
              <Input type="number" min="0" step="0.01" className="bg-input border-border text-card-foreground" value={form.lineItem.rate} onChange={(e) => setLineItem({ rate: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end text-white">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#A1A1AA]">Subtotal</span>
                <span>€ {getLineTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Método de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Select value={form.selectedPaymentId} onValueChange={(v) => setForm({ selectedPaymentId: v })}>
                <SelectTrigger className="bg-input border-border text-card-foreground">
                  <SelectValue placeholder="Seleccionar método de pago" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {payment_instructions.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-popover-foreground">
                      {p.account_holder} - {p.payment_method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={form.openNewPayment} onOpenChange={(o) => setDialog("payment", o)}>
              <DialogTrigger asChild>
                <Button variant="outline">Nuevo</Button>
              </DialogTrigger>
              <DialogContent className="bg-popover border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">Crear método de pago</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Titular</Label>
                    <Input className="bg-input border-border text-card-foreground" value={form.newPayment.account_holder || ""} onChange={(e) => setNewPayment({ account_holder: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">IBAN</Label>
                    <Input className="bg-input border-border text-card-foreground" value={form.newPayment.iban || ""} onChange={(e) => setNewPayment({ iban: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Método</Label>
                    <Select value={form.newPayment.payment_method || ""} onValueChange={(v: string) => setNewPayment({ payment_method: v })}>
                      <SelectTrigger className="bg-input border-border text-card-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="Transferencia bancaria" className="text-popover-foreground">Transferencia bancaria</SelectItem>
                        <SelectItem value="PayPal" className="text-popover-foreground">PayPal</SelectItem>
                        <SelectItem value="Tarjeta de crédito" className="text-popover-foreground">Tarjeta de crédito</SelectItem>
                        <SelectItem value="Efectivo" className="text-popover-foreground">Efectivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Plazo</Label>
                    <Select value={form.newPayment.payment_terms || ""} onValueChange={(v: string) => setNewPayment({ payment_terms: v })}>
                      <SelectTrigger className="bg-input border-border text-card-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="El pago debe realizarse dentro de los 14 días naturales desde la fecha de la factura." className="text-popover-foreground">14 días</SelectItem>
                        <SelectItem value="El pago debe realizarse dentro de los 30 días naturales desde la fecha de la factura." className="text-popover-foreground">30 días</SelectItem>
                        <SelectItem value="El pago debe realizarse de forma inmediata a la recepción de esta factura." className="text-popover-foreground">Inmediato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-card-foreground">Datos adicionales</Label>
                    <Textarea className="bg-input border-border text-card-foreground h-24" value={form.newPayment.additional_data || ""} onChange={(e) => setNewPayment({ additional_data: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={async () => { try { await useInvoiceFormStore.getState().createNewPayment(); toast.success("Método de pago creado"); } catch (e) { console.error(e); toast.error("No se pudo crear el método de pago"); } }}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {getSelectedPayment() && (
            <div className="text-sm text-[#A1A1AA] leading-6">
              <div className="font-semibold text-white">
                {getSelectedPayment().account_holder} — {getSelectedPayment().payment_method}
              </div>
              <div>IBAN: {getSelectedPayment().iban}</div>
              <div>{getSelectedPayment().payment_terms}</div>
              <div className="text-xs opacity-80">{getSelectedPayment()!.additional_data}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


