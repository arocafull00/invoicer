import Papa from "papaparse";

export interface ParsedInvoiceRow {
  id: string;
  number: string | null;
  invoiceDate: string | null;
  serviceDate: string;
  concept: string;
  clientName: string;
  nif: string | null;
  price: number;
  irpfRate: number | null;
  irpfAmount: number | null;
  total: number;
  paymentMethod: string;
}

const FIELD_KEYS = [
  "number",
  "invoiceDate",
  "serviceDate",
  "concept",
  "clientName",
  "nif",
  "price",
  "irpfRate",
  "irpfAmount",
  "total",
  "paymentMethod",
] as const;

const HEADER_ALIASES: Record<string, string> = {
  "nº factura": "number",
  "n° factura": "number",
  "no factura": "number",
  "numero factura": "number",
  "número factura": "number",
  "fecha factura": "invoiceDate",
  "fecha servicio": "serviceDate",
  concepto: "concept",
  cliente: "clientName",
  nif: "nif",
  precio: "price",
  "% irpf": "irpfRate",
  irpf: "irpfRate",
  "importe irpf": "irpfAmount",
  "total cobro": "total",
  "forma de pago": "paymentMethod",
};

function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function createHeaderMapper() {
  let emptyIndex = 0;

  return (header: string): string => {
    if (FIELD_KEYS.includes(header as (typeof FIELD_KEYS)[number])) {
      return header;
    }

    const normalized = normalizeHeader(header);
    if (!normalized) {
      emptyIndex += 1;
      return `__empty_${emptyIndex}`;
    }
    return HEADER_ALIASES[normalized] ?? normalized;
  };
}

export function parseSpanishNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const cleaned = raw
    .replace(/%/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

export function parseSpanishDate(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function getField(
  row: Record<string, string>,
  key: string
): string {
  return (row[key] ?? "").trim();
}

function isValidRow(row: {
  serviceDate: string | null;
  concept: string;
  clientName: string;
  price: number | null;
}): boolean {
  if (!row.serviceDate) return false;
  if (!row.concept) return false;
  if (!row.clientName) return false;
  if (row.price === null || row.price <= 0) return false;
  return true;
}

export function parseIngresosCsv(text: string): ParsedInvoiceRow[] {
  const mapHeader = createHeaderMapper();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: mapHeader,
  });

  const rows: ParsedInvoiceRow[] = [];
  let index = 0;

  for (const raw of parsed.data) {
    const serviceDate = parseSpanishDate(getField(raw, "serviceDate"));
    const concept = getField(raw, "concept");
    const clientName = getField(raw, "clientName");
    const price = parseSpanishNumber(getField(raw, "price"));

    if (!isValidRow({ serviceDate, concept, clientName, price })) continue;

    const invoiceDate = parseSpanishDate(getField(raw, "invoiceDate"));
    const totalRaw = parseSpanishNumber(getField(raw, "total"));
    const irpfRate = parseSpanishNumber(getField(raw, "irpfRate"));
    const irpfAmount = parseSpanishNumber(getField(raw, "irpfAmount"));
    const numberRaw = getField(raw, "number");
    const paymentMethod = getField(raw, "paymentMethod") || "Sin especificar";
    const nifRaw = getField(raw, "nif");

    index += 1;
    rows.push({
      id: `import-row-${index}`,
      number: numberRaw || null,
      invoiceDate,
      serviceDate: serviceDate!,
      concept,
      clientName,
      nif: nifRaw || null,
      price: price!,
      irpfRate,
      irpfAmount,
      total: totalRaw ?? price!,
      paymentMethod,
    });
  }

  return rows;
}
