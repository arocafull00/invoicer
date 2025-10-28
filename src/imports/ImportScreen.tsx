import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stepper } from "@/shared/components/Stepper";
import { useQueryClient } from "@tanstack/react-query";
import {
  useClients,
  useConsultants,
  usePaymentInstructions,
  useExpenseTypes,
  useCreateExpense,
  useCreateIncome,
  useCreateInvoice,
  useCreateClient,
} from "@/shared/api/hooks";
import type {
  Expense,
  ExpenseType,
  Income,
  Invoice,
  PaymentInstruction,
} from "@/shared/types";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { toast } from "sonner";

type Target = "invoices" | "incomes" | "expenses";

type FieldDef = {
  key: string;
  label: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "date";
};

const FIELD_DEFS: Record<Target, FieldDef[]> = {
  invoices: [
    {
      key: "number",
      label: "Número de factura",
      required: true,
      type: "string",
    },
    {
      key: "created_date",
      label: "Fecha de creación",
      required: true,
      type: "date",
    },
    { key: "start_date", label: "Fecha inicio", required: true, type: "date" },
    { key: "end_date", label: "Fecha fin", required: true, type: "date" },
    {
      key: "consultant_name",
      label: "Consultor (nombre)",
      required: true,
      type: "string",
    },
    {
      key: "client_name",
      label: "Cliente (nombre)",
      required: true,
      type: "string",
    },
    {
      key: "payment_account_holder",
      label: "Titular cuenta pago",
      required: true,
      type: "string",
    },
    {
      key: "description",
      label: "Descripción",
      required: true,
      type: "string",
    },
    { key: "total", label: "Total", required: true, type: "number" },
    {
      key: "vat_exempt",
      label: "Exento IVA (true/false)",
      required: false,
      type: "boolean",
    },
    {
      key: "status",
      label: "Estado (paid/pending/overdue)",
      required: false,
      type: "string",
    },
  ],
  incomes: [
    { key: "date", label: "Fecha", required: true, type: "date" },
    { key: "concept", label: "Concepto", required: true, type: "string" },
    { key: "amount", label: "Importe", required: true, type: "number" },
    {
      key: "payment_method",
      label: "Forma de pago (cash/transfer/bizum)",
      required: true,
      type: "string",
    },
    {
      key: "client_name",
      label: "Cliente (nombre)",
      required: true,
      type: "string",
    },
  ],
  expenses: [
    { key: "date", label: "Fecha", required: true, type: "date" },
    {
      key: "invoice_number",
      label: "Nº Factura",
      required: true,
      type: "string",
    },
    { key: "provider", label: "Proveedor", required: true, type: "string" },
    { key: "concept", label: "Concepto", required: true, type: "string" },
    {
      key: "base_amount",
      label: "Base imponible",
      required: true,
      type: "number",
    },
    { key: "vat_amount", label: "IVA", required: true, type: "number" },
    {
      key: "total",
      label: "Total (opcional, si no se calcula)",
      required: false,
      type: "number",
    },
    {
      key: "expense_type_name",
      label: "Tipo de gasto (nombre)",
      required: true,
      type: "string",
    },
  ],
};

type IncomePreview = {
  date: string;
  concept: string;
  amount: number;
  payment_method: string;
  client_name: string;
};

type ExpensePreview = {
  date: string;
  invoice_number: string;
  provider: string;
  concept: string;
  base_amount: number;
  vat_amount: number;
  total: number;
  expense_type_name: string;
};

type InvoicePreview = {
  number: string;
  created_date: string;
  start_date: string;
  end_date: string;
  consultant_name: string;
  client_name: string;
  payment_account_holder: string;
  description: string;
  total: number;
  vat_exempt: boolean;
  status: Invoice["status"] | string;
};

interface ParsedFileData {
  headers: string[];
  rows: Record<string, unknown>[];
}

function normalizeHeader(header: unknown): string {
  const s = String(header ?? "").trim();
  return s;
}

function toNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(String(value).replace(/,/g, "."));
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value: unknown): boolean | null {
  if (value === undefined || value === null || value === "") return null;
  const s = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "sí", "si"].includes(s)) return true;
  if (["false", "0", "no"].includes(s)) return false;
  return null;
}

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  const s = String(value);
  return s.trim() !== "";
}

function getStringField(row: Record<string, unknown>, key: string): string {
  return String(row[key] ?? "");
}

function getNumberField(row: Record<string, unknown>, key: string): number {
  return toNumber(row[key]) ?? 0;
}

function getBooleanField(row: Record<string, unknown>, key: string): boolean {
  const b = toBoolean(row[key]);
  return b ?? false;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function fromExcelSerialToISO(serial: number): string {
  const excelEpoch = Date.UTC(1899, 11, 30);
  const ms = excelEpoch + Math.round(serial) * 86400000;
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  return `${y}-${m}-${day}`;
}

function parseDateToISO(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") {
    if (value > 30000 && value < 60000) return fromExcelSerialToISO(value);
    const d = new Date(value);
    if (!isNaN(d.getTime()))
      return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(
        d.getUTCDate()
      )}`;
    return "";
  }
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) return raw;
  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const day = Number(slash[1]);
    const month = Number(slash[2]);
    const year = Number(slash[3].length === 2 ? `20${slash[3]}` : slash[3]);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year))
      return `${year}-${pad2(month)}-${pad2(day)}`;
  }
  const dash = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (dash) {
    const day = Number(dash[1]);
    const month = Number(dash[2]);
    const year = Number(dash[3].length === 2 ? `20${dash[3]}` : dash[3]);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year))
      return `${year}-${pad2(month)}-${pad2(day)}`;
  }
  const date = new Date(raw);
  if (!isNaN(date.getTime()))
    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
      date.getUTCDate()
    )}`;
  return "";
}

export default function ImportPage() {
  const [step, setStep] = useState<number>(1);
  const [target, setTarget] = useState<Target>("incomes");
  const [fileName, setFileName] = useState<string>("");
  const [data, setData] = useState<ParsedFileData>({ headers: [], rows: [] });
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [removedIndices, setRemovedIndices] = useState<Set<number>>(new Set());

  const queryClient = useQueryClient();
  const { data: clients = [] } = useClients();
  const { data: consultants = [] } = useConsultants();
  const { data: paymentInstructions = [] } = usePaymentInstructions();
  const { data: expenseTypes = [] } = useExpenseTypes();
  const createIncome = useCreateIncome();
  const createExpense = useCreateExpense();
  const createInvoice = useCreateInvoice();
  const createClient = useCreateClient();

  const steps: Array<{
    id: number;
    name: string;
    title: string;
    component: React.ComponentType;
  }> = [
    { id: 1, name: "Subir archivo", title: "Upload", component: () => null },
    { id: 2, name: "Mapear campos", title: "Mapping", component: () => null },
    { id: 3, name: "Previsualizar", title: "Preview", component: () => null },
  ];

  const selectedFields = FIELD_DEFS[target];

  const canContinueFromUpload =
    data.headers.length > 0 && data.rows.length > 0 && !!target;
  const canContinueFromMapping = selectedFields.every(
    (f) => !f.required || mapping[f.key]
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      const headers: string[] = (result.meta.fields || []).map((h: string) =>
        normalizeHeader(h)
      );
      const rows = (
        result.data as Papa.ParseResult<Record<string, unknown>>["data"]
      ).map((row: Record<string, unknown>) => row);
      setData({ headers, rows });
    } else {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rowsArray = XLSX.utils.sheet_to_json<
        (string | number | boolean | null)[]
      >(sheet, { header: 1, raw: true }) as unknown as unknown[][];
      const [headerRow, ...restRows] = rowsArray;
      const headers = (headerRow || []).map((h: unknown) => normalizeHeader(h));
      const rows = restRows
        .filter(
          (r: unknown[]) =>
            r &&
            r.some(
              (cell) =>
                cell !== undefined &&
                cell !== null &&
                String(cell).trim() !== ""
            )
        )
        .map((r: unknown[]) =>
          Object.fromEntries(
            headers.map((h: string, idx: number) => [h, r[idx] as unknown])
          )
        );
      setData({ headers, rows });
    }
    setStep(2);
  }

  function setMappingFor(key: string, header: string) {
    setMapping((m) => ({ ...m, [key]: header }));
  }

  const previewList = useMemo(() => {
    if (!canContinueFromMapping)
      return [] as {
        idx: number;
        data: IncomePreview | ExpensePreview | InvoicePreview;
      }[];
    const m = mapping;
    const selectedHeaders = Object.values(m).filter((v) => !!v);
    const list: {
      idx: number;
      data: IncomePreview | ExpensePreview | InvoicePreview;
    }[] = [];
    data.rows.forEach((row: Record<string, unknown>, idx: number) => {
      if (removedIndices.has(idx)) return;
      if (
        !selectedHeaders.every((h) =>
          isPresent((row as Record<string, unknown>)[h as string])
        )
      )
        return;
      if (target === "incomes") {
        list.push({
          idx,
          data: {
            date: parseDateToISO(row[m.date]),
            concept: getStringField(row, m.concept),
            amount: getNumberField(row, m.amount),
            payment_method: getStringField(row, m.payment_method),
            client_name: getStringField(row, m.client_name),
          },
        });
        return;
      }
      if (target === "expenses") {
        const base = getNumberField(row, m.base_amount);
        const vat = getNumberField(row, m.vat_amount);
        const total = m.total
          ? getNumberField(row, m.total) || base + vat
          : base + vat;
        list.push({
          idx,
          data: {
            date: parseDateToISO(row[m.date]),
            invoice_number: getStringField(row, m.invoice_number),
            provider: getStringField(row, m.provider),
            concept: getStringField(row, m.concept),
            base_amount: base,
            vat_amount: vat,
            total,
            expense_type_name: getStringField(row, m.expense_type_name),
          },
        });
        return;
      }
      // invoices
      list.push({
        idx,
        data: {
          number: getStringField(row, m.number),
          created_date: parseDateToISO(row[m.created_date]),
          start_date: parseDateToISO(row[m.start_date]),
          end_date: parseDateToISO(row[m.end_date]),
          consultant_name: getStringField(row, m.consultant_name),
          client_name: getStringField(row, m.client_name),
          payment_account_holder: getStringField(row, m.payment_account_holder),
          description: getStringField(row, m.description),
          total: getNumberField(row, m.total),
          vat_exempt: m.vat_exempt ? getBooleanField(row, m.vat_exempt) : false,
          status:
            (getStringField(row, m.status || "status") as
              | Invoice["status"]
              | string) || "pending",
        },
      });
    });
    return list;
  }, [mapping, canContinueFromMapping, data.rows, target, removedIndices]);

  const previewRows = useMemo(
    () => previewList.map((x) => x.data),
    [previewList]
  );

  function handleRemoveRow(idx: number) {
    setRemovedIndices((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }

  function resolveClientByName(name: string) {
    return clients.find(
      (c) =>
        (c.name || "").trim().toLowerCase() ===
        (name || "").trim().toLowerCase()
    );
  }
  function resolveConsultantByName(name: string) {
    return consultants.find(
      (c) =>
        (c.name || "").trim().toLowerCase() ===
        (name || "").trim().toLowerCase()
    );
  }
  function resolvePaymentInstructionByAccountHolder(
    holder: string
  ): PaymentInstruction | undefined {
    return paymentInstructions.find(
      (p) =>
        (p.account_holder || "").trim().toLowerCase() ===
        (holder || "").trim().toLowerCase()
    );
  }
  function resolveExpenseTypeByName(name: string): ExpenseType | undefined {
    return expenseTypes.find(
      (t) =>
        (t.name || "").trim().toLowerCase() ===
        (name || "").trim().toLowerCase()
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (target === "incomes") {
        for (const r of previewRows as Array<IncomePreview>) {
          let client = resolveClientByName(r.client_name);
          if (!client && r.client_name) {
            client = await createClient.mutateAsync({ name: r.client_name });
          }
          if (!client) continue;
          const payload: Omit<Income, "id" | "user_id"> = {
            date: r.date,
            concept: r.concept,
            amount: Number(r.amount) || 0,
            payment_method: r.payment_method as Income["payment_method"],
            client,
          } as unknown as Omit<Income, "id" | "user_id">;
          await createIncome.mutateAsync(payload);
        }
        await queryClient.invalidateQueries({ queryKey: ["incomes"] });
      } else if (target === "expenses") {
        for (const r of previewRows as Array<ExpensePreview>) {
          const expenseType = resolveExpenseTypeByName(r.expense_type_name);
          if (!expenseType) continue;
          const payload: Omit<Expense, "id" | "user_id"> = {
            date: r.date,
            invoice_number: r.invoice_number,
            provider: r.provider,
            concept: r.concept,
            base_amount: Number(r.base_amount) || 0,
            vat_amount: Number(r.vat_amount) || 0,
            total:
              Number(r.total) ||
              (Number(r.base_amount) || 0) + (Number(r.vat_amount) || 0),
            expense_type: expenseType,
          } as unknown as Omit<Expense, "id" | "user_id">;
          await createExpense.mutateAsync(payload);
        }
        await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      } else {
        for (const r of previewRows as Array<InvoicePreview>) {
          const consultant = resolveConsultantByName(r.consultant_name);
          let client = resolveClientByName(r.client_name);
          if (!client && r.client_name) {
            client = await createClient.mutateAsync({ name: r.client_name });
          }
          const pi = resolvePaymentInstructionByAccountHolder(
            r.payment_account_holder
          );
          if (!consultant || !client || !pi) continue;
          const payload: Omit<Invoice, "id" | "user_id"> = {
            number: r.number,
            created_date: r.created_date,
            start_date: r.start_date,
            end_date: r.end_date,
            consultant,
            client,
            payment_instructions: pi,
            description: r.description,
            total: Number(r.total) || 0,
            vat_exempt: !!r.vat_exempt,
            status: (r.status as Invoice["status"]) || "pending",
          } as unknown as Omit<Invoice, "id" | "user_id">;
          await createInvoice.mutateAsync(payload);
        }
        await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      }
      setStep(1);
      setFileName("");
      setData({ headers: [], rows: [] });
      setMapping({});
    } catch (error) {
      toast.error("Error al guardar los datos", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      toast.success("Datos guardados correctamente");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Importar datos</h1>
          <p className="text-muted-foreground mt-1">
            Sube un archivo CSV o Excel y mapea los campos
          </p>
        </div>
      </div>

      <Card className="">
        <div className="p-6">
          <Stepper steps={steps} currentStep={step} />
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex justify-center gap-4 items-center">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Objetivo</label>
                  <Select
                    value={target}
                    onValueChange={(v: Target) => setTarget(v)}
                  >
                    <SelectTrigger className="bg-card border-border text-foreground">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoices">Facturas</SelectItem>
                      <SelectItem value="incomes">Ingresos</SelectItem>
                      <SelectItem value="expenses">Gastos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-muted-foreground">
                    Archivo CSV o Excel
                  </label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="bg-card border-border text-foreground file:text-foreground"
                  />
                  {fileName && (
                    <p className="text-xs text-muted-foreground">{fileName}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={!canContinueFromUpload}
                  onClick={() => setStep(2)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                        Propiedad
                      </TableHead>
                      <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                        Nombre del campo (header)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedFields.map((f) => (
                      <TableRow
                        key={f.key}
                        className="border-b border-border"
                      >
                        <TableCell className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground">{f.label}</span>
                            {f.required ? (
                              <span className="text-xs text-primary">
                                (requerido)
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                (opcional)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-2">
                          <Select
                            value={mapping[f.key] || ""}
                            onValueChange={(v) => setMappingFor(f.key, v)}
                          >
                            <SelectTrigger className="bg-card border-border text-foreground">
                              <SelectValue placeholder="Selecciona columna" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                new Set(
                                  data.headers.filter(
                                    (h: string) => String(h || "").trim() !== ""
                                  )
                                )
                              ).map((h: string) => (
                                <SelectItem key={`${f.key}-${h}`} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button
                  disabled={!canContinueFromMapping}
                  onClick={() => setStep(3)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      {FIELD_DEFS[target].map((f) => (
                        <TableHead
                          key={`h-${f.key}`}
                          className="text-left py-4 px-2 text-sm font-medium text-muted-foreground"
                        >
                          {f.label}
                        </TableHead>
                      ))}
                      <TableHead className="text-right py-4 px-2 text-sm font-medium text-muted-foreground">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.length === 0 ? (
                      <TableRow className="border-b border-border">
                        <TableCell
                          className="py-6 px-2"
                          colSpan={FIELD_DEFS[target].length + 1}
                        >
                          No hay filas para previsualizar. Revisa el mapeo.
                        </TableCell>
                      </TableRow>
                    ) : (
                      previewList.slice(0, 50).map((item, idx) => (
                        <TableRow
                          key={`r-${idx}`}
                          className="border-b border-border"
                        >
                          {FIELD_DEFS[target].map((f) => (
                            <TableCell
                              key={`c-${idx}-${f.key}`}
                              className="py-3 px-2"
                            >
                              {String(
                                (item.data as Record<string, unknown>)[f.key] ??
                                  ""
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="py-3 px-2 text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveRow(item.idx)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Atrás
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || previewRows.length === 0}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
