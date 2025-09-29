import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { X, Plus, Trash2 } from "lucide-react";
import { LineItemTemplateSelector } from "@/shared/components/LineItemTemplateSelector";

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

  const handleCreateConsultant = async () => {
    try {
      await createNewConsultant();
      toast.success("Consultor creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el consultor");
    }
  };

  const handleCreateClient = async () => {
    try {
      await createNewClient();
      toast.success("Cliente creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el cliente");
    }
  };

  const handleCreatePayment = async () => {
    try {
      await createNewPayment();
      toast.success("Método de pago creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el método de pago");
    }
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <Button className="fixed top-4 right-4" variant="ghost" onClick={() => navigate("/invoices")}>
        <X className="w-4 h-4" />
      </Button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Facturas</h1>
          <p className="text-[#A1A1AA] mt-1">
            Crear nueva factura con vista previa
          </p>
        </div>
        <Button onClick={handleSave} disabled={!isFormValid() || form.isSaving}>
          {form.isSaving ? "Guardando..." : "Crear factura"}
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
                  readOnly
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                {form.logoPreview ? (
                  <img
                    src={form.logoPreview}
                    alt="Logo"
                    className="max-h-36 object-contain"
                  />
                ) : (
                  <span className="text-[#A1A1AA]">Añadir logo</span>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bill From - Consultant */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Emitido por</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  value={form.selectedConsultantId}
                  onValueChange={(v) => setForm({ selectedConsultantId: v })}
                >
                  <SelectTrigger className="bg-input border-border text-card-foreground">
                    <SelectValue placeholder="Seleccionar consultor" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {consultants.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="text-popover-foreground"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog
                open={form.openNewConsultant}
                onOpenChange={(o) => setDialog("consultant", o)}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Nuevo</Button>
                </DialogTrigger>
                <DialogContent className="bg-popover border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                      Crear consultor
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Nombre</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newConsultant.name || ""}
                        onChange={(e) =>
                          setNewConsultant({ name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Email</Label>
                      <Input
                        type="email"
                        className="bg-input border-border text-card-foreground"
                        value={form.newConsultant.email || ""}
                        onChange={(e) =>
                          setNewConsultant({ email: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">Dirección</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newConsultant.address || ""}
                        onChange={(e) =>
                          setNewConsultant({ address: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Ciudad</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newConsultant.city || ""}
                        onChange={(e) =>
                          setNewConsultant({ city: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">País</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newConsultant.country || ""}
                        onChange={(e) =>
                          setNewConsultant({ country: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">NIF</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newConsultant.nif || ""}
                        onChange={(e) =>
                          setNewConsultant({ nif: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateConsultant}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {getSelectedConsultant() && (
              <div className="text-sm text-[#A1A1AA] leading-6">
                <div className="font-semibold text-white">
                  {getSelectedConsultant()!.name}
                </div>
                <div>{getSelectedConsultant()!.address}</div>
                <div>
                  {getSelectedConsultant()!.city},{" "}
                  {getSelectedConsultant()!.country}
                </div>
                <div>{getSelectedConsultant()!.email}</div>
                <div>NIF: {getSelectedConsultant()!.nif}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bill To - Client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Facturar a</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  value={form.selectedClientId}
                  onValueChange={(v) => setForm({ selectedClientId: v })}
                >
                  <SelectTrigger className="bg-input border-border text-card-foreground">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {clients.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="text-popover-foreground"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog
                open={form.openNewClient}
                onOpenChange={(o) => setDialog("client", o)}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Nuevo</Button>
                </DialogTrigger>
                <DialogContent className="bg-popover border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                      Crear cliente
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Nombre</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newClient.name || ""}
                        onChange={(e) => setNewClient({ name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Email</Label>
                      <Input
                        type="email"
                        className="bg-input border-border text-card-foreground"
                        value={form.newClient.email || ""}
                        onChange={(e) =>
                          setNewClient({ email: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">Dirección</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newClient.address || ""}
                        onChange={(e) =>
                          setNewClient({ address: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Ciudad</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newClient.city || ""}
                        onChange={(e) => setNewClient({ city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">País</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newClient.country || ""}
                        onChange={(e) =>
                          setNewClient({ country: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">
                        Número de empresa (opcional)
                      </Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={form.newClient.company_number || ""}
                        onChange={(e) =>
                          setNewClient({ company_number: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateClient}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {getSelectedClient() && (
              <div className="text-sm text-[#A1A1AA] leading-6">
                <div className="font-semibold text-white">
                  {getSelectedClient()!.name}
                </div>
                <div>{getSelectedClient()!.address}</div>
                <div>
                  {getSelectedClient()!.city}, {getSelectedClient()!.country}
                </div>
                {getSelectedClient()!.company_number && (
                  <div>
                    Número de empresa: {getSelectedClient()!.company_number}
                  </div>
                )}
                <div>{getSelectedClient()!.email}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Conceptos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing line items */}
          {form.lineItems.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center px-4 pb-2">
                <div className="md:col-span-2">
                  <Label className="text-[#A1A1AA] text-sm">Descripción</Label>
                </div>
                <div>
                  <Label className="text-[#A1A1AA] text-sm">Cantidad</Label>
                </div>
                <div>
                  <Label className="text-[#A1A1AA] text-sm">Tarifa (€)</Label>
                </div>
                <div>
                  <Label className="text-[#A1A1AA] text-sm">Total</Label>
                </div>
              </div>
              {form.lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center p-4 bg-[#FFFFFF14]/30 rounded-lg">
                  <div className="md:col-span-2">
                    <Input
                      className="bg-input border-border text-card-foreground"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, { description: e.target.value })}
                      placeholder="Descripción del servicio"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      className="bg-input border-border text-card-foreground"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, { quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-input border-border text-card-foreground"
                      value={item.rate}
                      onChange={(e) => updateLineItem(index, { rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">€ {getLineItemTotal(item).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new line item form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <LineItemTemplateSelector
                onSelectTemplate={(template) => {
                  setCurrentLineItem({
                    description: template.description,
                    quantity: template.default_quantity,
                    rate: template.default_rate,
                  });
                }}
                currentDescription={form.currentLineItem.description}
                currentQuantity={form.currentLineItem.quantity}
                currentRate={form.currentLineItem.rate}
                onDescriptionChange={(description) => 
                  setCurrentLineItem({ description })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Cantidad</Label>
              <Input
                type="number"
                min="0"
                step="1"
                className="bg-input border-border text-card-foreground"
                value={form.currentLineItem.quantity}
                onChange={(e) =>
                  setCurrentLineItem({ quantity: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Tarifa (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="bg-input border-border text-card-foreground"
                value={form.currentLineItem.rate}
                onChange={(e) => setCurrentLineItem({ rate: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={addLineItem}
              disabled={
                !form.currentLineItem.description ||
                form.currentLineItem.quantity <= 0 ||
                form.currentLineItem.rate <= 0
              }
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir concepto
            </Button>
            <div className="text-white min-w-[200px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">Subtotal</span>
                  <span>€ {getSubtotal().toFixed(2)}</span>
                </div>
                {form.includeVat && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#A1A1AA]">IVA ({form.vatRate}%)</span>
                    <span>€ {getVatAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-semibold">€ {getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* VAT Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-vat"
                  checked={form.includeVat}
                  onCheckedChange={(checked) => setForm({ includeVat: checked })}
                />
                <Label htmlFor="include-vat" className="text-card-foreground">
                  Incluir IVA ({form.vatRate}%)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {form.includeVat 
                  ? "La factura incluirá IVA en el total"
                  : "Esta operación está exenta de IVA"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Método de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Select
                value={form.selectedPaymentId}
                onValueChange={(v) => setForm({ selectedPaymentId: v })}
              >
                <SelectTrigger className="bg-input border-border text-card-foreground">
                  <SelectValue placeholder="Seleccionar método de pago" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {payment_instructions.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      className="text-popover-foreground"
                    >
                      {p.account_holder} - {p.payment_method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog
              open={form.openNewPayment}
              onOpenChange={(o) => setDialog("payment", o)}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Nuevo</Button>
              </DialogTrigger>
              <DialogContent className="bg-popover border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">
                    Crear método de pago
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Titular</Label>
                    <Input
                      className="bg-input border-border text-card-foreground"
                      value={form.newPayment.account_holder || ""}
                      onChange={(e) =>
                        setNewPayment({ account_holder: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">IBAN</Label>
                    <Input
                      className="bg-input border-border text-card-foreground"
                      value={form.newPayment.iban || ""}
                      onChange={(e) => setNewPayment({ iban: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Método</Label>
                    <Select
                      value={form.newPayment.payment_method || ""}
                      onValueChange={(v: string) =>
                        setNewPayment({ payment_method: v })
                      }
                    >
                      <SelectTrigger className="bg-input border-border text-card-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem
                          value="Transferencia bancaria"
                          className="text-popover-foreground"
                        >
                          Transferencia bancaria
                        </SelectItem>
                        <SelectItem
                          value="PayPal"
                          className="text-popover-foreground"
                        >
                          PayPal
                        </SelectItem>
                        <SelectItem
                          value="Tarjeta de crédito"
                          className="text-popover-foreground"
                        >
                          Tarjeta de crédito
                        </SelectItem>
                        <SelectItem
                          value="Efectivo"
                          className="text-popover-foreground"
                        >
                          Efectivo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Plazo</Label>
                    <Select
                      value={form.newPayment.payment_terms || ""}
                      onValueChange={(v: string) =>
                        setNewPayment({ payment_terms: v })
                      }
                    >
                      <SelectTrigger className="bg-input border-border text-card-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem
                          value="El pago debe realizarse dentro de los 14 días naturales desde la fecha de la factura."
                          className="text-popover-foreground"
                        >
                          14 días
                        </SelectItem>
                        <SelectItem
                          value="El pago debe realizarse dentro de los 30 días naturales desde la fecha de la factura."
                          className="text-popover-foreground"
                        >
                          30 días
                        </SelectItem>
                        <SelectItem
                          value="El pago debe realizarse de forma inmediata a la recepción de esta factura."
                          className="text-popover-foreground"
                        >
                          Inmediato
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-card-foreground">
                      Datos adicionales
                    </Label>
                    <Textarea
                      className="bg-input border-border text-card-foreground h-24"
                      value={form.newPayment.additional_data || ""}
                      onChange={(e) =>
                        setNewPayment({ additional_data: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreatePayment}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {getSelectedPayment() && (
            <div className="text-sm text-[#A1A1AA] leading-6">
              <div className="font-semibold text-white">
                {getSelectedPayment().account_holder} —{" "}
                {getSelectedPayment().payment_method}
              </div>
              <div>IBAN: {getSelectedPayment().iban}</div>
              <div>{getSelectedPayment().payment_terms}</div>
              <div className="text-xs opacity-80">
                {getSelectedPayment()!.additional_data}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
