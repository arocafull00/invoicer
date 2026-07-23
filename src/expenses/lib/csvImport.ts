import Papa from "papaparse";
import {
  normalizeCsvHeader,
  parseSpanishDate,
  parseSpanishNumber,
} from "@/shared/lib/csvParse";

export interface ParsedExpenseRow {
  id: string;
  date: string;
  invoiceNumber: string;
  provider: string;
  concept: string;
  baseAmount: number;
  vatAmount: number;
  total: number;
  expenseTypeName: string;
}

const FIELD_KEYS = [
  "date",
  "invoiceNumber",
  "provider",
  "concept",
  "baseAmount",
  "vatAmount",
  "total",
  "expenseTypeName",
] as const;

const HEADER_ALIASES: Record<string, string> = {
  fecha: "date",
  "nº factura": "invoiceNumber",
  "n° factura": "invoiceNumber",
  "no factura": "invoiceNumber",
  "numero factura": "invoiceNumber",
  "número factura": "invoiceNumber",
  proveedor: "provider",
  concepto: "concept",
  "base imponible (€)": "baseAmount",
  "base imponible": "baseAmount",
  "iva (€)": "vatAmount",
  iva: "vatAmount",
  "total (€)": "total",
  total: "total",
  "tipo de gasto": "expenseTypeName",
};

function createHeaderMapper() {
  let emptyIndex = 0;

  return (header: string): string => {
    if (FIELD_KEYS.includes(header as (typeof FIELD_KEYS)[number])) {
      return header;
    }

    const normalized = normalizeCsvHeader(header);
    if (!normalized) {
      emptyIndex += 1;
      return `__empty_${emptyIndex}`;
    }
    return HEADER_ALIASES[normalized] ?? normalized;
  };
}

function getField(row: Record<string, string>, key: string): string {
  return (row[key] ?? "").trim();
}

export function parseGastosCsv(text: string): ParsedExpenseRow[] {
  const mapHeader = createHeaderMapper();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: mapHeader,
  });

  const rows: ParsedExpenseRow[] = [];
  let index = 0;

  for (const raw of parsed.data) {
    const date = parseSpanishDate(getField(raw, "date"));
    const provider = getField(raw, "provider");
    const concept = getField(raw, "concept");
    const total = parseSpanishNumber(getField(raw, "total"));
    const baseAmount = parseSpanishNumber(getField(raw, "baseAmount"));
    const vatAmount = parseSpanishNumber(getField(raw, "vatAmount"));

    if (!date) continue;
    if (!provider) continue;
    if (!concept) continue;
    if (total === null || total <= 0) continue;

    index += 1;
    rows.push({
      id: `expense-row-${index}`,
      date,
      invoiceNumber: getField(raw, "invoiceNumber"),
      provider,
      concept,
      baseAmount: baseAmount ?? total,
      vatAmount: vatAmount ?? 0,
      total,
      expenseTypeName: getField(raw, "expenseTypeName") || "Sin categorizar",
    });
  }

  return rows;
}
