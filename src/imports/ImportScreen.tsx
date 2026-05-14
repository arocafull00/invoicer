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
  useUpdateClient,
} from "@/shared/api/hooks";
import type {
  Client,
  Expense,
  ExpenseType,
  Income,
  Invoice,
  LineItem,
  PaymentInstruction,
} from "@/shared/types";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import {
  parseIngresosCsvResponseSchema,
  type FacturaImportRow,
  type IngresoImportRow,
} from "@/imports/ingresosAiResponseSchema";
import { ImportIncomePreviewRow } from "@/imports/ImportIncomePreviewRow";
import { ImportInvoicePreviewRow } from "@/imports/ImportInvoicePreviewRow";
import { ImportSetupSelect } from "@/imports/ImportSetupSelect";
import { useImportStore, type ImportTarget } from "@/imports/store";
import { useShallow } from "zustand/react/shallow";

type FieldDef = {
  key: string;
  label: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "date";
};

const FIELD_DEFS: Record<ImportTarget, FieldDef[]> = {
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

function previewFieldsForTarget(t: ImportTarget): FieldDef[] {
  if (t === "invoices") {
    return [
      {
        key: "consultant_name",
        label: "Prestador del servicio",
      },
      ...FIELD_DEFS.invoices,
      { key: "vat_exempt", label: "Exento IVA" },
      { key: "status", label: "Estado" },
    ];
  }
  return FIELD_DEFS[t];
}

function formatInvoicePreviewCell(key: string, data: InvoicePreview): string {
  if (key === "vat_exempt") return data.vat_exempt ? "Sí" : "No";
  if (key === "status") {
    const s = data.status as Invoice["status"];
    if (s === "paid") return "Pagado";
    if (s === "overdue") return "Vencido";
    return "Pendiente";
  }
  const v = (data as Record<string, unknown>)[key];
  return String(v ?? "");
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

const ISO_AI_DATE = /^\d{4}-\d{2}-\d{2}$/;

function incomeImportRowReady(item: IngresoImportRow): boolean {
  if (!ISO_AI_DATE.test(item.date)) return false;
  if (!item.client_name.trim()) return false;
  if (!item.concept.trim()) return false;
  if (!Number.isFinite(item.amount)) return false;
  return true;
}

function facturaImportRowReady(item: FacturaImportRow): boolean {
  if (!ISO_AI_DATE.test(item.invoice_date)) return false;
  if (!ISO_AI_DATE.test(item.service_date)) return false;
  if (!item.number.trim()) return false;
  if (!item.client_name.trim()) return false;
  if (!item.concept.trim()) return false;
  if (!Number.isFinite(item.base_amount)) return false;
  return true;
}

export default function ImportPage() {
  const {
    step,
    target,
    fileName,
    data,
    mapping,
    invoiceConsultantId,
    invoiceVatExempt,
    invoiceStatus,
    removedIndices,
    incomesCsvParsedMode,
    pendingCsvText,
    parsedIngresos,
    parsedFacturas,
    ingresosRemoved,
    facturasRemoved,
    aiInvoicePaymentId,
    parseIngresosBulkError,
    setImportState,
    addRemovedIndex,
    addIngresoRemoved,
    addFacturaRemoved,
    resetIncomesCsvParseState,
    resetImportState,
  } = useImportStore(useShallow((state) => ({
    step: state.step,
    target: state.target,
    fileName: state.fileName,
    data: state.data,
    mapping: state.mapping,
    invoiceConsultantId: state.invoiceConsultantId,
    invoiceVatExempt: state.invoiceVatExempt,
    invoiceStatus: state.invoiceStatus,
    removedIndices: state.removedIndices,
    incomesCsvParsedMode: state.incomesCsvParsedMode,
    pendingCsvText: state.pendingCsvText,
    parsedIngresos: state.parsedIngresos,
    parsedFacturas: state.parsedFacturas,
    ingresosRemoved: state.ingresosRemoved,
    facturasRemoved: state.facturasRemoved,
    aiInvoicePaymentId: state.aiInvoicePaymentId,
    parseIngresosBulkError: state.parseIngresosBulkError,
    setImportState: state.setImportState,
    addRemovedIndex: state.addRemovedIndex,
    addIngresoRemoved: state.addIngresoRemoved,
    addFacturaRemoved: state.addFacturaRemoved,
    resetIncomesCsvParseState: state.resetIncomesCsvParseState,
    resetImportState: state.resetImportState,
  })));
  const [saving, setSaving] = useState<boolean>(false);
  const [parseIngresosLoading, setParseIngresosLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const setStep = (value: number) => setImportState({ step: value });
  const setTarget = (value: ImportTarget) => setImportState({ target: value });
  const setFileName = (value: string) => setImportState({ fileName: value });
  const setData = (value: { headers: string[]; rows: Record<string, unknown>[] }) =>
    setImportState({ data: value });
  const setPendingCsvText = (value: string) =>
    setImportState({ pendingCsvText: value });
  const setIncomesCsvParsedMode = (value: boolean) =>
    setImportState({ incomesCsvParsedMode: value });
  const setParsedIngresos = (
    value:
      | IngresoImportRow[]
      | ((prev: IngresoImportRow[]) => IngresoImportRow[]),
  ) =>
    setImportState((state) => ({
      parsedIngresos:
        typeof value === "function" ? value(state.parsedIngresos) : value,
    }));
  const setParsedFacturas = (
    value:
      | FacturaImportRow[]
      | ((prev: FacturaImportRow[]) => FacturaImportRow[]),
  ) =>
    setImportState((state) => ({
      parsedFacturas:
        typeof value === "function" ? value(state.parsedFacturas) : value,
    }));
  const setRemovedIndices = (
    value: Set<number> | ((prev: Set<number>) => Set<number>),
  ) =>
    setImportState((state) => {
      const prevSet = new Set(state.removedIndices);
      const nextSet = typeof value === "function" ? value(prevSet) : value;
      return { removedIndices: Array.from(nextSet) };
    });
  const setIngresosRemoved = (
    value: Set<number> | ((prev: Set<number>) => Set<number>),
  ) =>
    setImportState((state) => {
      const prevSet = new Set(state.ingresosRemoved);
      const nextSet = typeof value === "function" ? value(prevSet) : value;
      return { ingresosRemoved: Array.from(nextSet) };
    });
  const setFacturasRemoved = (
    value: Set<number> | ((prev: Set<number>) => Set<number>),
  ) =>
    setImportState((state) => {
      const prevSet = new Set(state.facturasRemoved);
      const nextSet = typeof value === "function" ? value(prevSet) : value;
      return { facturasRemoved: Array.from(nextSet) };
    });
  const setInvoiceConsultantId = (value: string) =>
    setImportState({ invoiceConsultantId: value });
  const setInvoiceVatExempt = (value: boolean) =>
    setImportState({ invoiceVatExempt: value });
  const setInvoiceStatus = (value: Invoice["status"]) =>
    setImportState({ invoiceStatus: value });
  const setAiInvoicePaymentId = (value: string) =>
    setImportState({ aiInvoicePaymentId: value });
  const setParseIngresosBulkError = (value: string | null) =>
    setImportState({ parseIngresosBulkError: value });
  const setMapping = (
    value:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) =>
    setImportState((state) => ({
      mapping: typeof value === "function" ? value(state.mapping) : value,
    }));

  const queryClient = useQueryClient();
  const { data: clients = [] } = useClients();
  const { data: consultants = [] } = useConsultants();
  const { data: paymentInstructions = [] } = usePaymentInstructions();
  const { data: expenseTypes = [] } = useExpenseTypes();
  const createIncome = useCreateIncome();
  const createExpense = useCreateExpense();
  const createInvoice = useCreateInvoice();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const isIncomesCsv =
    target === "incomes" && fileName.toLowerCase().endsWith(".csv");

  const steps: Array<{
    id: number;
    name: string;
    title: string;
    component: React.ComponentType;
  }> = useMemo(() => {
    if (isIncomesCsv) {
      return [
        {
          id: 1,
          name: "Subir archivo",
          title: "Upload",
          component: () => null,
        },
        { id: 2, name: "Ingresos", title: "Incomes", component: () => null },
        { id: 3, name: "Facturas", title: "Invoices", component: () => null },
      ];
    }
    return [
      { id: 1, name: "Subir archivo", title: "Upload", component: () => null },
      { id: 2, name: "Mapear campos", title: "Mapping", component: () => null },
      {
        id: 3,
        name: "Previsualizar",
        title: "Preview",
        component: () => null,
      },
    ];
  }, [isIncomesCsv]);

  const selectedFields = FIELD_DEFS[target];

  const canContinueFromUpload =
    data.headers.length > 0 &&
    data.rows.length > 0 &&
    !!target &&
    (!isIncomesCsv || pendingCsvText.length > 0);
  const mappingColumnsOk = selectedFields.every(
    (f) => !f.required || mapping[f.key]
  );
  const canContinueFromMapping = mappingColumnsOk;

  const ingresosPreviewList = useMemo(() => {
    if (!incomesCsvParsedMode) {
      return [] as { idx: number; item: IngresoImportRow }[];
    }
    return parsedIngresos
      .map((item, idx) => ({ idx, item }))
      .filter((x) => !ingresosRemoved.includes(x.idx));
  }, [incomesCsvParsedMode, parsedIngresos, ingresosRemoved]);

  const facturasPreviewList = useMemo(() => {
    if (!incomesCsvParsedMode) {
      return [] as { idx: number; item: FacturaImportRow }[];
    }
    return parsedFacturas
      .map((item, idx) => ({ idx, item }))
      .filter((x) => !facturasRemoved.includes(x.idx));
  }, [incomesCsvParsedMode, parsedFacturas, facturasRemoved]);

  const hasParsedFacturaRows = facturasPreviewList.length > 0;

  const mapStepComplete = canContinueFromMapping;
  const incomesIngresosStepReady = !isIncomesCsv || incomesCsvParsedMode;
  const canContinueStep2 = isIncomesCsv
    ? incomesIngresosStepReady
    : mapStepComplete;

  const incomesCsvRowsReady = useMemo(() => {
    const igOk = ingresosPreviewList.every(({ item }) =>
      incomeImportRowReady(item),
    );
    const fcOk = facturasPreviewList.every(({ item }) =>
      facturaImportRowReady(item),
    );
    const anyRow =
      ingresosPreviewList.length > 0 || facturasPreviewList.length > 0;
    return anyRow && igOk && fcOk;
  }, [
    ingresosPreviewList,
    facturasPreviewList,
  ]);

  const consultantSelectOptions = useMemo(
    () =>
      consultants.map((consultant) => ({
        value: consultant.id,
        label: consultant.name,
      })),
    [consultants],
  );

  const paymentInstructionSelectOptions = useMemo(
    () =>
      paymentInstructions.map((instruction) => ({
        value: instruction.id,
        label: instruction.account_holder,
      })),
    [paymentInstructions],
  );

  function patchParsedIngreso(idx: number, patch: Record<string, unknown>) {
    setParsedIngresos((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const next = { ...it, ...patch } as IngresoImportRow;
        const rawFe = next.field_errors;
        if (!rawFe || typeof rawFe !== "object") return next;
        const fe = { ...rawFe };
        for (const k of Object.keys(patch)) {
          delete fe[k];
        }
        if (Object.keys(fe).length === 0) {
          const { field_errors: _, ...rest } = next as IngresoImportRow & {
            field_errors?: Record<string, string>;
          };
          return rest as IngresoImportRow;
        }
        return { ...next, field_errors: fe };
      }),
    );
  }

  function patchParsedFactura(idx: number, patch: Record<string, unknown>) {
    setParsedFacturas((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const next = { ...it, ...patch } as FacturaImportRow;
        const rawFe = next.field_errors;
        if (!rawFe || typeof rawFe !== "object") return next;
        const fe = { ...rawFe };
        for (const k of Object.keys(patch)) {
          delete fe[k];
        }
        if (Object.keys(fe).length === 0) {
          const { field_errors: _, ...rest } = next as FacturaImportRow & {
            field_errors?: Record<string, string>;
          };
          return rest as FacturaImportRow;
        }
        return { ...next, field_errors: fe };
      }),
    );
  }

  async function loadFile(file: File) {
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();
    resetIncomesCsvParseState();
    setAiInvoicePaymentId("");
    if (ext === "csv") {
      const text = await file.text();
      setPendingCsvText(text);
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      const headers: string[] = (result.meta.fields || []).map((h: string) =>
        normalizeHeader(h)
      );
      const rows = (
        result.data as Papa.ParseResult<Record<string, unknown>>["data"]
      ).map((row: Record<string, unknown>) => row);
      setData({ headers, rows });
      if (target === "incomes") {
        setStep(1);
        return;
      }
      setStep(2);
      return;
    }
    setPendingCsvText("");
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
    setStep(2);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadFile(file);
    e.target.value = "";
  }

  async function handleParseIngresosCsv() {
    if (!pendingCsvText.trim()) return;
    setParseIngresosLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "parse-ingresos-csv",
        { body: { csv: pendingCsvText } },
      );
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data || typeof data !== "object") {
        toast.error("Respuesta inválida del servidor");
        return;
      }
      const parsed = parseIngresosCsvResponseSchema.safeParse(data);
      if (!parsed.success) {
        toast.error("Respuesta inválida del servidor");
        return;
      }
      if (
        parsed.data.ingresos.length === 0 &&
        parsed.data.facturas.length === 0
      ) {
        toast.error(parsed.data.error ?? "No se detectaron filas válidas");
        setParseIngresosBulkError(parsed.data.error ?? null);
        return;
      }
      setParseIngresosBulkError(parsed.data.error ?? null);
      if (parsed.data.error) {
        toast.warning(parsed.data.error);
      }
      setParsedIngresos(parsed.data.ingresos);
      setParsedFacturas(parsed.data.facturas);
      setIncomesCsvParsedMode(true);
      setIngresosRemoved(new Set());
      setFacturasRemoved(new Set());
      setRemovedIndices(new Set());
      setStep(2);
    } finally {
      setParseIngresosLoading(false);
    }
  }

  function setMappingFor(key: string, header: string) {
    setMapping((m) => ({ ...m, [key]: header }));
  }

  const previewList = useMemo(() => {
    if (incomesCsvParsedMode) {
      return [] as {
        idx: number;
        data: IncomePreview | ExpensePreview | InvoicePreview;
      }[];
    }
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
      if (removedIndices.includes(idx)) return;
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
      const selectedConsultant = consultants.find(
        (c) => c.id === invoiceConsultantId
      );
      if (!selectedConsultant) return;
      list.push({
        idx,
        data: {
          number: getStringField(row, m.number),
          created_date: parseDateToISO(row[m.created_date]),
          start_date: parseDateToISO(row[m.start_date]),
          end_date: parseDateToISO(row[m.end_date]),
          consultant_name: selectedConsultant.name,
          client_name: getStringField(row, m.client_name),
          payment_account_holder: getStringField(row, m.payment_account_holder),
          description: getStringField(row, m.description),
          total: getNumberField(row, m.total),
          vat_exempt: invoiceVatExempt,
          status: invoiceStatus,
        },
      });
    });
    return list;
  }, [
    mapping,
    canContinueFromMapping,
    data.rows,
    target,
    removedIndices,
    invoiceConsultantId,
    consultants,
    invoiceVatExempt,
    invoiceStatus,
    incomesCsvParsedMode,
  ]);

  const previewRows = useMemo(
    () => previewList.map((x) => x.data),
    [previewList]
  );

  function handleRemoveRow(idx: number) {
    addRemovedIndex(idx);
  }

  function handleRemoveParsedIngreso(idx: number) {
    addIngresoRemoved(idx);
  }

  function handleRemoveParsedFactura(idx: number) {
    addFacturaRemoved(idx);
  }

  function handleBackFromIngresosStep() {
    setStep(1);
    resetIncomesCsvParseState();
    setAiInvoicePaymentId("");
    setInvoiceConsultantId("");
  }

  function showMissingConsultantAlert() {
    toast.error("Selecciona un prestador o créalo antes de continuar");
  }

  function showMissingPaymentInstructionAlert() {
    toast.error("Selecciona una instrucción de pago o créala antes de continuar");
  }

  function handleContinueStep2() {
    if (!canContinueStep2) return;
    if (target === "invoices" && !invoiceConsultantId) {
      showMissingConsultantAlert();
      return;
    }
    setStep(3);
  }

  async function ensureClientWithOptionalNif(
    name: string,
    nif: string | null
  ) {
    let client = resolveClientByName(name);
    if (!client && name) {
      client = await createClient.mutateAsync({
        name,
        company_number: nif || undefined,
      });
      return client;
    }
    if (!client) return undefined;
    if (nif && (client.company_number || "") !== nif) {
      const updated = await updateClient.mutateAsync({
        id: client.id,
        client: { company_number: nif },
      });
      return updated;
    }
    return client;
  }

  function resolveClientByName(name: string) {
    return clients.find(
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
    if (target === "invoices" && !invoiceConsultantId) {
      showMissingConsultantAlert();
      return;
    }
    if (
      target === "incomes" &&
      incomesCsvParsedMode &&
      hasParsedFacturaRows &&
      !invoiceConsultantId
    ) {
      showMissingConsultantAlert();
      return;
    }
    if (
      target === "incomes" &&
      incomesCsvParsedMode &&
      hasParsedFacturaRows &&
      !aiInvoicePaymentId
    ) {
      showMissingPaymentInstructionAlert();
      return;
    }

    setSaving(true);
    try {
      if (target === "incomes" && incomesCsvParsedMode) {
        const consultant = consultants.find((c) => c.id === invoiceConsultantId);
        const pi = paymentInstructions.find((p) => p.id === aiInvoicePaymentId);
        for (const { item } of ingresosPreviewList) {
          if (!incomeImportRowReady(item)) continue;
          let client = resolveClientByName(item.client_name);
          if (!client && item.client_name) {
            client = await createClient.mutateAsync({
              name: item.client_name,
            });
          }
          if (!client) continue;
          const payload: Omit<Income, "id" | "user_id"> = {
            date: item.date,
            concept: item.concept,
            amount: item.amount,
            payment_method: item.payment_method,
            client: client as Client,
          };
          await createIncome.mutateAsync(payload);
        }
        for (const { item } of facturasPreviewList) {
          if (!facturaImportRowReady(item)) continue;
          if (!consultant || !pi) continue;
          const client = await ensureClientWithOptionalNif(
            item.client_name,
            item.client_nif
          );
          if (!client) continue;
          const base = item.base_amount;
          const lineItem: LineItem = {
            id: "line-1",
            description: item.concept,
            quantity: 1,
            rate: base,
            total: base,
            includeVat: false,
          };
          const payload: Omit<Invoice, "id" | "user_id"> = {
            number: item.number,
            created_date: item.invoice_date,
            start_date: item.service_date,
            end_date: item.service_date,
            consultant,
            client: client as Client,
            payment_instructions: pi,
            description: item.concept,
            line_items: [lineItem],
            subtotal: base,
            vat_rate: 0,
            vat_amount: 0,
            total: base,
            vat_exempt: true,
            status: invoiceStatus,
            irpf_rate: item.irpf_percent,
            irpf_amount: item.irpf_amount,
          };
          await createInvoice.mutateAsync(payload);
        }
        await queryClient.invalidateQueries({ queryKey: ["incomes"] });
        await queryClient.invalidateQueries({ queryKey: ["invoices"] });
        await queryClient.invalidateQueries({ queryKey: ["clients"] });
      } else if (target === "incomes") {
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
        const consultant = consultants.find((c) => c.id === invoiceConsultantId);
        if (!consultant) {
          toast.error("Prestador de servicio no encontrado");
          return;
        }
        for (const r of previewRows as Array<InvoicePreview>) {
          let client = resolveClientByName(r.client_name);
          if (!client && r.client_name) {
            client = await createClient.mutateAsync({ name: r.client_name });
          }
          const pi = resolvePaymentInstructionByAccountHolder(
            r.payment_account_holder
          );
          if (!client || !pi) continue;
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
            vat_exempt: invoiceVatExempt,
            status: invoiceStatus,
          } as unknown as Omit<Invoice, "id" | "user_id">;
          await createInvoice.mutateAsync(payload);
        }
        await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      }
      toast.success("Datos guardados correctamente");
      resetImportState();
    } catch (error) {
      toast.error("Error al guardar los datos", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Importar datos</h1>
          <p className="text-muted-foreground mt-1">
            Importa ingresos desde CSV fijo, facturas, gastos u otros Excel con
            mapeo manual
          </p>
        </div>
      </div>

      <Card className="">
        <div className="p-6">
          <Stepper steps={steps} currentStep={step} />
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-center lg:items-start">
                <div className="space-y-2 shrink-0">
                  <label className="text-sm text-muted-foreground">Objetivo</label>
                  <Select
                    value={target}
                    onValueChange={(v: ImportTarget) => {
                      setTarget(v);
                      resetIncomesCsvParseState();
                      setPendingCsvText("");
                      setAiInvoicePaymentId("");
                      setStep(1);
                      if (v !== "invoices") {
                        setInvoiceConsultantId("");
                        setInvoiceVatExempt(false);
                        setInvoiceStatus("pending");
                      }
                    }}
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
                <div
                  className={`space-y-2 flex-1 max-w-xl min-w-0 rounded-lg border-2 border-dashed p-6 transition-colors ${
                    dragOver
                      ? "border-primary bg-[#7F5AF0]/10"
                      : "border-border"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (!f) return;
                    void loadFile(f);
                  }}
                >
                  <label className="text-sm text-muted-foreground">
                    Archivo CSV o Excel
                  </label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="bg-card border-border text-foreground file:text-foreground"
                  />
                  {fileName ? (
                    <p className="text-xs text-muted-foreground">{fileName}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Arrastra un archivo aquí o elige uno con el selector
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {isIncomesCsv ? (
                  <Button
                    type="button"
                    disabled={!canContinueFromUpload || parseIngresosLoading}
                    onClick={() => void handleParseIngresosCsv()}
                  >
                    {parseIngresosLoading ? "Procesando…" : "Siguiente"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={!canContinueFromUpload}
                    onClick={() => setStep(2)}
                  >
                    Siguiente
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {target === "invoices" && (
                <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
                  <ImportSetupSelect
                    label="Prestador del servicio"
                    placeholder="Selecciona prestador"
                    value={invoiceConsultantId}
                    onChange={setInvoiceConsultantId}
                    options={consultantSelectOptions}
                    actionLabel="Crear prestador"
                    actionTo="/consultants"
                    emptyMessage="No hay prestadores. Créalos antes de importar."
                  />
                  <div className="space-y-4 rounded-xl border border-border/60 bg-card/20 p-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        Exento IVA
                      </label>
                      <Select
                        value={invoiceVatExempt ? "yes" : "no"}
                        onValueChange={(v) => setInvoiceVatExempt(v === "yes")}
                      >
                        <SelectTrigger className="bg-card border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Sí</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        Estado
                      </label>
                      <Select
                        value={invoiceStatus}
                        onValueChange={(v) =>
                          setInvoiceStatus(v as Invoice["status"])
                        }
                      >
                        <SelectTrigger className="bg-card border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="paid">Pagado</SelectItem>
                          <SelectItem value="overdue">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              {!(isIncomesCsv && incomesCsvParsedMode) ? (
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
              ) : (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                        Tipo
                      </TableHead>
                      <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                        Fecha
                      </TableHead>
                      <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                        Cliente
                      </TableHead>
                      <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                        Concepto
                      </TableHead>
                      <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                        Importe
                      </TableHead>
                      <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                        Método de pago
                      </TableHead>
                      <TableHead className="text-right py-4 px-2 text-sm font-medium text-muted-foreground">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingresosPreviewList.length === 0 ? (
                      <TableRow className="border-b border-border">
                        <TableCell
                          className="py-6 px-2"
                          colSpan={7}
                        >
                          No hay ingresos en el archivo
                        </TableCell>
                      </TableRow>
                    ) : (
                      ingresosPreviewList.slice(0, 50).map(({ idx, item }) => (
                        <ImportIncomePreviewRow
                          key={`in-${idx}`}
                          idx={idx}
                          item={item}
                          onPatch={patchParsedIngreso}
                          onRemove={handleRemoveParsedIngreso}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              )}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isIncomesCsv && incomesCsvParsedMode) {
                      handleBackFromIngresosStep();
                      return;
                    }
                    setStep(1);
                  }}
                >
                  Atrás
                </Button>
                <Button
                  disabled={!canContinueStep2}
                  onClick={handleContinueStep2}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {incomesCsvParsedMode &&
              isIncomesCsv &&
              parseIngresosBulkError ? (
                <p className="text-sm text-destructive">
                  {parseIngresosBulkError}
                </p>
              ) : null}
              <div className="overflow-x-auto">
                {incomesCsvParsedMode && isIncomesCsv ? (
                <>
                  {hasParsedFacturaRows ? (
                    <div className="mb-6 grid gap-4 lg:grid-cols-[1fr,1fr,0.8fr]">
                      <ImportSetupSelect
                        label="Prestador del servicio (facturas)"
                        placeholder="Selecciona prestador"
                        value={invoiceConsultantId}
                        onChange={setInvoiceConsultantId}
                        options={consultantSelectOptions}
                        actionLabel="Crear prestador"
                        actionTo="/consultants"
                        emptyMessage="No hay prestadores. Créalos antes de importar facturas."
                      />
                      <ImportSetupSelect
                        label="Instrucción de pago (facturas)"
                        placeholder="Selecciona cuenta"
                        value={aiInvoicePaymentId}
                        onChange={setAiInvoicePaymentId}
                        options={paymentInstructionSelectOptions}
                        actionLabel="Añadir instrucción"
                        actionTo="/payments"
                        emptyMessage="No hay instrucciones de pago. Créalas antes de importar facturas."
                      />
                      <div className="space-y-2 rounded-xl border border-border/60 bg-card/20 p-4">
                        <label className="text-sm text-muted-foreground">
                          Estado facturas importadas
                        </label>
                        <Select
                          value={invoiceStatus}
                          onValueChange={(v) =>
                            setInvoiceStatus(v as Invoice["status"])
                          }
                        >
                          <SelectTrigger className="bg-card border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                            <SelectItem value="overdue">Vencido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : null}
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-b border-border">
                        <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                          Tipo
                        </TableHead>
                        <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                          Fechas
                        </TableHead>
                        <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                          Cliente
                        </TableHead>
                        <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                          Concepto
                        </TableHead>
                        <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">
                          Detalle / fiscal
                        </TableHead>
                        <TableHead className="text-right py-4 px-2 text-sm font-medium text-muted-foreground">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facturasPreviewList.length === 0 ? (
                        <TableRow className="border-b border-border">
                          <TableCell
                            className="py-6 px-2"
                            colSpan={6}
                          >
                            No hay facturas en el archivo
                          </TableCell>
                        </TableRow>
                      ) : (
                        facturasPreviewList.slice(0, 50).map(({ idx, item }) => (
                          <ImportInvoicePreviewRow
                            key={`fc-${idx}`}
                            idx={idx}
                            item={item}
                            onPatch={patchParsedFactura}
                            onRemove={handleRemoveParsedFactura}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </>
                ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      {previewFieldsForTarget(target).map((f) => (
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
                          colSpan={previewFieldsForTarget(target).length + 1}
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
                          {previewFieldsForTarget(target).map((f) => (
                            <TableCell
                              key={`c-${idx}-${f.key}`}
                              className="py-3 px-2"
                            >
                              {target === "invoices"
                                ? formatInvoicePreviewCell(
                                    f.key,
                                    item.data as InvoicePreview
                                  )
                                : String(
                                    (
                                      item.data as Record<string, unknown>
                                    )[f.key] ?? ""
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
                )}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Atrás
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      if (isIncomesCsv && incomesCsvParsedMode) {
                        resetIncomesCsvParseState();
                        setAiInvoicePaymentId("");
                        setInvoiceConsultantId("");
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      saving ||
                      (incomesCsvParsedMode && isIncomesCsv
                        ? !incomesCsvRowsReady
                        : previewRows.length === 0)
                    }
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
