import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { generateInvoiceNumber } from "@/shared/lib/helpers";
import {
  createInvoice,
  createClient,
  createConsultant,
  createPaymentInstruction,
} from "@/shared/api/services";
import type {
  Client,
  Consultant,
  PaymentInstruction,
  Invoice,
} from "@/shared/types";

type LineItem = {
  description: string;
  quantity: number;
  rate: number;
};

const initialLineItem: LineItem = {
  description: "",
  quantity: 1,
  rate: 0,
};

export default function NewInvoice() {
  const navigate = useNavigate();
  const {
    consultants,
    clients,
    payment_instructions,
    addInvoice,
    addConsultant,
    addClient,
    addPaymentInstruction,
  } = useInvoiceStore();

  const [invoiceNumber] = useState<string>(generateInvoiceNumber());
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState<string>("");

  const [selectedConsultantId, setSelectedConsultantId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");

  const selectedConsultant = useMemo<Consultant | undefined>(
    () => consultants.find((c) => c.id === selectedConsultantId),
    [consultants, selectedConsultantId]
  );
  const selectedClient = useMemo<Client | undefined>(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId]
  );
  const selectedPayment = useMemo<PaymentInstruction | undefined>(
    () => payment_instructions.find((p) => p.id === selectedPaymentId),
    [payment_instructions, selectedPaymentId]
  );

  const [lineItem, setLineItem] = useState<LineItem>(initialLineItem);
  const lineTotal = useMemo<number>(
    () => Number(((lineItem.quantity || 0) * (lineItem.rate || 0)).toFixed(2)),
    [lineItem.quantity, lineItem.rate]
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Dialog state for creating new related entities
  const [openNewConsultant, setOpenNewConsultant] = useState<boolean>(false);
  const [openNewClient, setOpenNewClient] = useState<boolean>(false);
  const [openNewPayment, setOpenNewPayment] = useState<boolean>(false);

  const [newConsultant, setNewConsultant] = useState<Partial<Consultant>>({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    nif: "",
  });
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    company_number: "",
  });
  const [newPayment, setNewPayment] = useState<Partial<PaymentInstruction>>({
    account_holder: "",
    iban: "",
    payment_method: "Transferencia bancaria",
    payment_terms:
      "El pago debe realizarse dentro de los 14 días naturales desde la fecha de la factura.",
    additional_data:
      "ESTA OPERACIÓN ESTÁ EXENTA DE IVA en virtud del artículo 21.1 de la Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido.",
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isFormValid = (): boolean => {
    return Boolean(
      selectedConsultant &&
        selectedClient &&
        selectedPayment &&
        issueDate &&
        dueDate &&
        lineItem.description &&
        lineTotal > 0
    );
  };

  const handleSave = async () => {
    if (
      !isFormValid() ||
      !selectedConsultant ||
      !selectedClient ||
      !selectedPayment
    ) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Omit<Invoice, "id"> = {
        number: invoiceNumber,
        created_date: new Date().toISOString().split("T")[0],
        start_date: issueDate,
        end_date: dueDate,
        consultant: selectedConsultant,
        client: selectedClient,
        description: `${lineItem.description} (Cant.: ${
          lineItem.quantity
        } × Tarifa: ${lineItem.rate.toFixed(2)})`,
        total: lineTotal,
        payment_instructions: selectedPayment,
        vat_exempt: true,
      };

      const created = await createInvoice(payload);
      addInvoice(created);
      toast.success("Factura creada exitosamente");
      navigate("/invoices");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la factura");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateConsultant = async () => {
    if (
      !newConsultant.name ||
      !newConsultant.email ||
      !newConsultant.address ||
      !newConsultant.city ||
      !newConsultant.country ||
      !newConsultant.nif
    ) {
      toast.error("Completa todos los campos del consultor");
      return;
    }
    try {
      const created = await createConsultant({
        name: newConsultant.name,
        email: newConsultant.email,
        address: newConsultant.address,
        city: newConsultant.city,
        country: newConsultant.country,
        nif: newConsultant.nif,
      });
      addConsultant(created);
      setOpenNewConsultant(false);
      setSelectedConsultantId(created.id);
      toast.success("Consultor creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el consultor");
    }
  };

  const handleCreateClient = async () => {
    if (
      !newClient.name ||
      !newClient.email ||
      !newClient.address ||
      !newClient.city ||
      !newClient.country
    ) {
      toast.error("Completa todos los campos del cliente");
      return;
    }
    try {
      const created = await createClient({
        name: newClient.name,
        email: newClient.email,
        address: newClient.address,
        city: newClient.city,
        country: newClient.country,
        company_number: newClient.company_number,
      });
      addClient(created);
      setOpenNewClient(false);
      setSelectedClientId(created.id);
      toast.success("Cliente creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el cliente");
    }
  };

  const handleCreatePayment = async () => {
    if (
      !newPayment.account_holder ||
      !newPayment.iban ||
      !newPayment.payment_method ||
      !newPayment.payment_terms ||
      !newPayment.additional_data
    ) {
      toast.error("Completa todos los campos del pago");
      return;
    }
    try {
      const created = await createPaymentInstruction({
        account_holder: newPayment.account_holder,
        iban: newPayment.iban,
        payment_method: newPayment.payment_method,
        payment_terms: newPayment.payment_terms,
        additional_data: newPayment.additional_data,
      });
      addPaymentInstruction(created);
      setOpenNewPayment(false);
      setSelectedPaymentId(created.id);
      toast.success("Método de pago creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el método de pago");
    }
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Facturas</h1>
          <p className="text-[#A1A1AA] mt-1">
            Crear nueva factura con vista previa
          </p>
        </div>
        <Button onClick={handleSave} disabled={!isFormValid() || isSaving}>
          {isSaving ? "Guardando..." : "Crear factura"}
        </Button>
      </div>

      <Card className="bg-[#FFFFFF14] border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Número de factura</Label>
                <Input
                  value={invoiceNumber}
                  readOnly
                  className="bg-input border-border text-card-foreground"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Fecha de emisión</Label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="bg-input border-border text-card-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Fecha de vencimiento</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
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
                {logoPreview ? (
                  <img
                    src={logoPreview}
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
        <Card className="bg-[#FFFFFF14] border-border">
          <CardHeader>
            <CardTitle className="text-white">Emitido por</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  value={selectedConsultantId}
                  onValueChange={setSelectedConsultantId}
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
                open={openNewConsultant}
                onOpenChange={setOpenNewConsultant}
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
                        value={newConsultant.name || ""}
                        onChange={(e) =>
                          setNewConsultant({
                            ...newConsultant,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Email</Label>
                      <Input
                        type="email"
                        className="bg-input border-border text-card-foreground"
                        value={newConsultant.email || ""}
                        onChange={(e) =>
                          setNewConsultant({
                            ...newConsultant,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">Dirección</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={newConsultant.address || ""}
                        onChange={(e) =>
                          setNewConsultant({
                            ...newConsultant,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Ciudad</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={newConsultant.city || ""}
                        onChange={(e) =>
                          setNewConsultant({
                            ...newConsultant,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">País</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={newConsultant.country || ""}
                        onChange={(e) =>
                          setNewConsultant({
                            ...newConsultant,
                            country: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">NIF</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={newConsultant.nif || ""}
                        onChange={(e) =>
                          setNewConsultant({
                            ...newConsultant,
                            nif: e.target.value,
                          })
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

            {selectedConsultant && (
              <div className="text-sm text-[#A1A1AA] leading-6">
                <div className="font-semibold text-white">
                  {selectedConsultant.name}
                </div>
                <div>{selectedConsultant.address}</div>
                <div>
                  {selectedConsultant.city}, {selectedConsultant.country}
                </div>
                <div>{selectedConsultant.email}</div>
                <div>NIF: {selectedConsultant.nif}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bill To - Client */}
        <Card className="bg-[#FFFFFF14] border-border">
          <CardHeader>
            <CardTitle className="text-white">Facturar a</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
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
              <Dialog open={openNewClient} onOpenChange={setOpenNewClient}>
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
                        value={newClient.name || ""}
                        onChange={(e) =>
                          setNewClient({ ...newClient, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Email</Label>
                      <Input
                        type="email"
                        className="bg-input border-border text-card-foreground"
                        value={newClient.email || ""}
                        onChange={(e) =>
                          setNewClient({ ...newClient, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">Dirección</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={newClient.address || ""}
                        onChange={(e) =>
                          setNewClient({
                            ...newClient,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Ciudad</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={newClient.city || ""}
                        onChange={(e) =>
                          setNewClient({ ...newClient, city: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">País</Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={newClient.country || ""}
                        onChange={(e) =>
                          setNewClient({
                            ...newClient,
                            country: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-card-foreground">
                        Número de empresa (opcional)
                      </Label>
                      <Input
                        className="bg-input border-border text-card-foreground"
                        value={newClient.company_number || ""}
                        onChange={(e) =>
                          setNewClient({
                            ...newClient,
                            company_number: e.target.value,
                          })
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

            {selectedClient && (
              <div className="text-sm text-[#A1A1AA] leading-6">
                <div className="font-semibold text-white">
                  {selectedClient.name}
                </div>
                <div>{selectedClient.address}</div>
                <div>
                  {selectedClient.city}, {selectedClient.country}
                </div>
                {selectedClient.company_number && (
                  <div>Número de empresa: {selectedClient.company_number}</div>
                )}
                <div>{selectedClient.email}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line item and totals */}
      <Card className="bg-[#FFFFFF14] border-border">
        <CardHeader>
          <CardTitle className="text-white">Conceptos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-card-foreground">Descripción</Label>
              <Input
                className="bg-input border-border text-card-foreground"
                value={lineItem.description}
                onChange={(e) =>
                  setLineItem({ ...lineItem, description: e.target.value })
                }
                placeholder="Descripción del servicio"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Cantidad</Label>
              <Input
                type="number"
                min="0"
                step="1"
                className="bg-input border-border text-card-foreground"
                value={lineItem.quantity}
                onChange={(e) =>
                  setLineItem({ ...lineItem, quantity: Number(e.target.value) })
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
                value={lineItem.rate}
                onChange={(e) =>
                  setLineItem({ ...lineItem, rate: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="flex justify-end text-white">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#A1A1AA]">Subtotal</span>
                <span>€ {lineTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card className="bg-[#FFFFFF14] border-border">
        <CardHeader>
          <CardTitle className="text-white">Método de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Select
                value={selectedPaymentId}
                onValueChange={setSelectedPaymentId}
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
            <Dialog open={openNewPayment} onOpenChange={setOpenNewPayment}>
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
                      value={newPayment.account_holder || ""}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          account_holder: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">IBAN</Label>
                    <Input
                      className="bg-input border-border text-card-foreground"
                      value={newPayment.iban || ""}
                      onChange={(e) =>
                        setNewPayment({ ...newPayment, iban: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Método</Label>
                    <Select
                      value={newPayment.payment_method || ""}
                      onValueChange={(v: string) =>
                        setNewPayment({ ...newPayment, payment_method: v })
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
                      value={newPayment.payment_terms || ""}
                      onValueChange={(v: string) =>
                        setNewPayment({ ...newPayment, payment_terms: v })
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
                      value={newPayment.additional_data || ""}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          additional_data: e.target.value,
                        })
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

          {selectedPayment && (
            <div className="text-sm text-[#A1A1AA] leading-6">
              <div className="font-semibold text-white">
                {selectedPayment.account_holder} —{" "}
                {selectedPayment.payment_method}
              </div>
              <div>IBAN: {selectedPayment.iban}</div>
              <div>{selectedPayment.payment_terms}</div>
              <div className="text-xs opacity-80">
                {selectedPayment.additional_data}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
