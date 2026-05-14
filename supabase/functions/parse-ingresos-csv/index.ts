import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import Papa from "https://esm.sh/papaparse@5.4.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_MAX_CSV_CHARS = 90_000;

const MONTH_LABELS = new Set([
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]);

type IncomeOut = {
  kind: "income";
  date: string;
  concept: string;
  amount: number;
  payment_method: "cash" | "transfer" | "bizum";
  client_name: string;
};

type InvoiceOut = {
  kind: "invoice";
  number: string;
  invoice_date: string;
  service_date: string;
  concept: string;
  client_name: string;
  client_nif: string | null;
  base_amount: number;
  irpf_percent: number | null;
  irpf_amount: number | null;
  payment_method_raw: string | null;
};

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v !== "string" || !v.trim()) return null;
  let s = v.trim().replace(/\s/g, "");
  s = s.replace(/^(?:eur|€)/i, "").replace(/(?:eur|€)$/i, "").trim();
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(/\./g, "").replace(",", ".");
  }
  const n = Number(s);
  if (Number.isFinite(n)) return n;
  return null;
}

function str(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function normalizeIncomePayment(raw: string): IncomeOut["payment_method"] | null {
  const s = raw.toLowerCase().trim();
  if (!s) return null;
  if (s === "bizum" || s.includes("bizum")) return "bizum";
  if (s === "cash" || s === "efectivo" || s.includes("efectivo")) {
    return "cash";
  }
  if (s === "transfer" || s === "transferencia" || s.includes("transfer")) {
    return "transfer";
  }
  return null;
}

type FieldErrors = Record<string, string>;

type IncomeRow = IncomeOut & { field_errors?: FieldErrors };
type InvoiceRow = InvoiceOut & { field_errors?: FieldErrors };

function setFieldError(
  errors: FieldErrors,
  field: string,
  message: string,
): void {
  if (!errors[field]) errors[field] = message;
}

function normalizeHeaderKey(s: string): string {
  return String(s ?? "")
    .replace(/[º°]/g, "o")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/%/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function isInvoiceNumberColumnNorm(norm: string): boolean {
  if (norm === "nofactura" || norm === "nfactura" || norm === "numerofactura") {
    return true;
  }
  if (norm.includes("fecha")) return false;
  if (!norm.includes("factura")) return false;
  return /^n|^num/.test(norm);
}

type CsvColumnKeys = {
  invoiceNo: string | undefined;
  invoiceDate: string | undefined;
  serviceDate: string | undefined;
  concept: string | undefined;
  client: string | undefined;
  nif: string | undefined;
  price: string | undefined;
  totalCobro: string | undefined;
  irpfPercent: string | undefined;
  irpfAmount: string | undefined;
  payment: string | undefined;
};

function resolveCsvColumnKeys(fields: string[] | undefined): CsvColumnKeys {
  const norms = (fields || []).map((raw) => ({
    raw: raw.trim(),
    norm: normalizeHeaderKey(raw),
  }));
  const out: CsvColumnKeys = {
    invoiceNo: undefined,
    invoiceDate: undefined,
    serviceDate: undefined,
    concept: undefined,
    client: undefined,
    nif: undefined,
    price: undefined,
    totalCobro: undefined,
    irpfPercent: undefined,
    irpfAmount: undefined,
    payment: undefined,
  };
  for (const { raw, norm } of norms) {
    if (!out.invoiceNo && isInvoiceNumberColumnNorm(norm)) out.invoiceNo = raw;
    if (!out.invoiceDate && norm === "fechafactura") out.invoiceDate = raw;
    if (!out.serviceDate && norm === "fechaservicio") out.serviceDate = raw;
    if (!out.concept && norm === "concepto") out.concept = raw;
    if (!out.client && norm === "cliente") out.client = raw;
    if (!out.nif && norm === "nif") out.nif = raw;
    if (!out.price && norm === "precio") out.price = raw;
    if (!out.totalCobro && norm.includes("total") && norm.includes("cobro")) {
      out.totalCobro = raw;
    }
    if (!out.irpfPercent && norm.includes("irpf") && !norm.includes("importe")) {
      out.irpfPercent = raw;
    }
    if (!out.irpfAmount && norm.includes("importe") && norm.includes("irpf")) {
      out.irpfAmount = raw;
    }
    if (!out.payment && norm.includes("forma") && norm.includes("pago")) {
      out.payment = raw;
    }
  }
  return out;
}

function parseDMYToISO(value: unknown): string {
  const raw = str(value);
  if (!raw) return "";
  if (ISO_DATE.test(raw)) return raw;
  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!slash) return "";
  const day = Number(slash[1]);
  const month = Number(slash[2]);
  const year = Number(slash[3].length === 2 ? `20${slash[3]}` : slash[3]);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return "";
  }
  const y = String(year);
  const m = month < 10 ? `0${month}` : String(month);
  const d = day < 10 ? `0${day}` : String(day);
  return `${y}-${m}-${d}`;
}

function parseIrpfPercent(v: unknown): number | null {
  const s = str(v).replace(/%/g, "").trim();
  if (!s) return null;
  return num(s);
}

function normalizedMonthLabel(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function isMonthOnlyInvoiceCell(raw: string): boolean {
  const t = normalizedMonthLabel(raw);
  return MONTH_LABELS.has(t);
}

function isLikelyInvoiceNumber(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (isMonthOnlyInvoiceCell(s)) return false;
  if (/^total\b/i.test(s)) return false;
  if (/^\d+$/.test(s)) return true;
  return /[a-z]/i.test(s) && /\d/.test(s);
}

function summarizeFieldErrors(items: IncomeRow[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const fe = items[i]?.field_errors;
    if (!fe || typeof fe !== "object") continue;
    const keys = Object.keys(fe);
    if (keys.length === 0) continue;
    out.push(`ingreso[${i}]: ${keys.join(", ")}`);
  }
  return out;
}

function summarizeInvoiceFieldErrors(items: InvoiceRow[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const fe = items[i]?.field_errors;
    if (!fe || typeof fe !== "object") continue;
    const keys = Object.keys(fe);
    if (keys.length === 0) continue;
    out.push(`factura[${i}]: ${keys.join(", ")}`);
  }
  return out;
}

function incomeFromRow(
  row: Record<string, unknown>,
  cols: CsvColumnKeys,
): IncomeRow | null {
  if (!cols.concept || !cols.client) return null;
  const invoiceCell = cols.invoiceNo ? str(row[cols.invoiceNo]) : "";
  if (isLikelyInvoiceNumber(invoiceCell)) return null;
  if (invoiceCell && isMonthOnlyInvoiceCell(invoiceCell)) return null;

  const concept = cols.concept ? str(row[cols.concept]) : "";
  const client_name = cols.client ? str(row[cols.client]) : "";

  let dateSource = cols.serviceDate ? str(row[cols.serviceDate]) : "";
  if (!dateSource && cols.invoiceDate) dateSource = str(row[cols.invoiceDate]);

  let date = dateSource;
  if (!ISO_DATE.test(date)) date = parseDMYToISO(dateSource);

  const field_errors: FieldErrors = {};

  if (!concept) setFieldError(field_errors, "concept", "missing");
  if (!client_name) setFieldError(field_errors, "client_name", "missing");
  if (!ISO_DATE.test(date)) {
    date = "";
    setFieldError(field_errors, "date", "invalid date");
  }

  const totalPick = cols.totalCobro ? num(row[cols.totalCobro]) : null;
  const precioPick = cols.price ? num(row[cols.price]) : null;
  let amount = totalPick ?? precioPick;
  if (amount === null) {
    amount = 0;
    setFieldError(field_errors, "amount", "missing");
  }

  if (concept && /^total\b/i.test(concept.trim())) return null;
  if (!concept.trim() || !client_name.trim()) return null;

  const pmRaw = cols.payment ? str(row[cols.payment]) : "";
  let pm = normalizeIncomePayment(pmRaw);
  if (!pm) {
    pm = "transfer";
    setFieldError(
      field_errors,
      "payment_method",
      `invalid (${pmRaw || "empty"})`,
    );
  }

  const entry: IncomeRow = {
    kind: "income",
    date,
    concept,
    amount,
    payment_method: pm,
    client_name,
  };
  if (Object.keys(field_errors).length > 0) {
    entry.field_errors = field_errors;
  }
  return entry;
}

function invoiceFromRow(
  row: Record<string, unknown>,
  cols: CsvColumnKeys,
): InvoiceRow | null {
  if (!cols.invoiceNo) return null;
  const invNo = str(row[cols.invoiceNo]);
  if (!isLikelyInvoiceNumber(invNo)) return null;

  const field_errors: FieldErrors = {};

  const client_name = cols.client ? str(row[cols.client]) : "";
  if (!client_name) setFieldError(field_errors, "client_name", "missing");

  const concept = cols.concept ? str(row[cols.concept]) : "";
  if (!concept) setFieldError(field_errors, "concept", "missing");

  const base_amount = cols.price ? num(row[cols.price]) : null;
  if (base_amount === null) {
    setFieldError(field_errors, "base_amount", "missing");
  }

  let invoice_date = cols.invoiceDate ? parseDMYToISO(row[cols.invoiceDate]) : "";
  let service_date = cols.serviceDate ? parseDMYToISO(row[cols.serviceDate]) : "";
  if (!service_date && invoice_date) service_date = invoice_date;
  if (!invoice_date && service_date) invoice_date = service_date;
  if (!ISO_DATE.test(invoice_date)) {
    setFieldError(field_errors, "invoice_date", "invalid date");
  }
  if (!ISO_DATE.test(service_date)) {
    setFieldError(field_errors, "service_date", "invalid date");
  }

  if (!client_name.trim() || !concept.trim()) return null;
  if (base_amount === null) return null;
  if (!ISO_DATE.test(invoice_date) || !ISO_DATE.test(service_date)) return null;

  const nifRaw = cols.nif ? str(row[cols.nif]) : "";
  const irpf_p = cols.irpfPercent ? parseIrpfPercent(row[cols.irpfPercent]) : null;
  const irpf_a = cols.irpfAmount ? num(row[cols.irpfAmount]) : null;
  const pmRaw = cols.payment ? str(row[cols.payment]) : "";

  const entry: InvoiceRow = {
    kind: "invoice",
    number: invNo,
    invoice_date,
    service_date,
    concept,
    client_name,
    client_nif: nifRaw || null,
    base_amount,
    irpf_percent: irpf_p,
    irpf_amount: irpf_a,
    payment_method_raw: pmRaw || null,
  };
  if (Object.keys(field_errors).length > 0) {
    entry.field_errors = field_errors;
  }
  return entry;
}

function parseDeterministic(csvText: string): {
  ingresos: IncomeRow[];
  facturas: InvoiceRow[];
  error: string | null;
} {
  const parsed = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h: string) => h.trim(),
  });

  const cols = resolveCsvColumnKeys(parsed.meta.fields);
  const failMsg = (): string => {
    if (!cols.invoiceNo) return "missing column: Nº factura";
    if (!cols.concept) return "missing column: concepto";
    if (!cols.client) return "missing column: cliente";
    return "";
  };
  const pre = failMsg();
  if (pre) return { ingresos: [], facturas: [], error: pre };

  const ingresos: IncomeRow[] = [];
  const facturas: InvoiceRow[] = [];

  for (const row of parsed.data) {
    if (!row || typeof row !== "object") continue;

    let anyValue = false;
    for (const v of Object.values(row)) {
      if (str(v)) {
        anyValue = true;
        break;
      }
    }
    if (!anyValue) continue;

    const invRaw = cols.invoiceNo ? str(row[cols.invoiceNo]) : "";

    if (isLikelyInvoiceNumber(invRaw)) {
      const inv = invoiceFromRow(row, cols);
      if (!inv) continue;
      facturas.push(inv);
      continue;
    }

    const inc = incomeFromRow(row, cols);
    if (!inc) continue;
    ingresos.push(inc);
  }

  ingresos.sort((a, b) => a.date.localeCompare(b.date));
  facturas.sort((a, b) => a.service_date.localeCompare(b.service_date));

  const warnings = [
    ...summarizeFieldErrors(ingresos),
    ...summarizeInvoiceFieldErrors(facturas),
  ];
  const error =
    warnings.length > 0 ? warnings.slice(0, 24).join("; ") : null;

  return { ingresos, facturas, error };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => null)) as {
      csv?: string;
    } | null;
    const csv = typeof body?.csv === "string" ? body.csv : "";
    if (!csv.trim()) {
      return new Response(JSON.stringify({ error: "Missing csv" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const maxCharsEnv = Number(Deno.env.get("PARSE_INGRESOS_MAX_CSV_CHARS"));
    const maxChars = Number.isFinite(maxCharsEnv)
      ? Math.min(Math.max(Math.floor(maxCharsEnv), 10_000), 90_000)
      : DEFAULT_MAX_CSV_CHARS;
    const csvSlice = csv.length > maxChars ? csv.slice(0, maxChars) : csv;

    const { ingresos, facturas, error } = parseDeterministic(csvSlice);

    if (ingresos.length === 0 && facturas.length === 0) {
      return new Response(
        JSON.stringify({
          ingresos: [],
          facturas: [],
          error: error ?? "No se detectaron filas válidas",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ ingresos, facturas, error }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
