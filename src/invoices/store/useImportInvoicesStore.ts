import { create } from "zustand";
import type {
  Client,
  Consultant,
  Invoice,
  PaymentInstruction,
} from "@/shared/types";
import {
  createClient,
  createInvoice,
  createPaymentInstruction,
  getNextInvoiceNumber,
} from "@/shared/api/services";
import { useInvoiceStore } from "@/shared/lib/stores";
import type { ParsedInvoiceRow } from "@/invoices/lib/csvImport";

export type ImportRowStatus = "pending" | "importing" | "success" | "error";

export interface ImportRowState {
  row: ParsedInvoiceRow;
  status: ImportRowStatus;
  error?: string;
  invoiceNumber?: string;
}

interface ImportInvoicesState {
  rows: ImportRowState[];
  selectedConsultantId: string;
  isImporting: boolean;
  progress: number;
  setRows: (rows: ParsedInvoiceRow[]) => void;
  setSelectedConsultantId: (id: string) => void;
  reset: () => void;
  importAll: () => Promise<{ success: number; failed: number }>;
}

function findClientByName(clients: Client[], name: string): Client | undefined {
  const normalized = name.trim().toLowerCase();
  return clients.find((client) => client.name.trim().toLowerCase() === normalized);
}

function findPaymentByMethod(
  payments: PaymentInstruction[],
  method: string
): PaymentInstruction | undefined {
  const normalized = method.trim().toLowerCase();
  return payments.find(
    (payment) => payment.payment_method.trim().toLowerCase() === normalized
  );
}

async function resolveClient(
  row: ParsedInvoiceRow,
  cache: Map<string, Client>
): Promise<Client> {
  const key = row.clientName.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const existing = findClientByName(useInvoiceStore.getState().clients, row.clientName);
  if (existing) {
    cache.set(key, existing);
    return existing;
  }

  const created = await createClient({
    name: row.clientName,
    email: "",
    address: "",
    city: "",
    country: "",
    company_number: row.nif ?? "",
  });
  useInvoiceStore.getState().addClient(created);
  cache.set(key, created);
  return created;
}

async function resolvePayment(
  method: string,
  consultant: Consultant,
  cache: Map<string, PaymentInstruction>
): Promise<PaymentInstruction> {
  const key = method.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const existing = findPaymentByMethod(
    useInvoiceStore.getState().payment_instructions,
    method
  );
  if (existing) {
    cache.set(key, existing);
    return existing;
  }

  const created = await createPaymentInstruction({
    account_holder: consultant.name,
    iban: "",
    payment_method: method,
    payment_terms: "Pago realizado.",
    additional_data: "Importado desde CSV",
  });
  useInvoiceStore.getState().addPaymentInstruction(created);
  cache.set(key, created);
  return created;
}

function buildInvoicePayload(
  row: ParsedInvoiceRow,
  number: string,
  consultant: Consultant,
  client: Client,
  payment: PaymentInstruction
): Omit<Invoice, "id"> {
  const lineTotal = Number(row.price.toFixed(2));
  return {
    number,
    created_date: row.invoiceDate ?? row.serviceDate,
    start_date: row.serviceDate,
    end_date: row.serviceDate,
    consultant,
    client,
    description: row.concept,
    line_items: [
      {
        id: "line-1",
        description: row.concept,
        quantity: 1,
        rate: lineTotal,
        total: lineTotal,
        includeVat: false,
      },
    ],
    subtotal: lineTotal,
    vat_rate: 0,
    vat_amount: 0,
    total: Number(row.total.toFixed(2)),
    payment_instructions: payment,
    vat_exempt: true,
    status: "paid",
    irpf_rate: row.irpfRate,
    irpf_amount: row.irpfAmount,
  };
}

export const useImportInvoicesStore = create<ImportInvoicesState>((set, get) => ({
  rows: [],
  selectedConsultantId: "",
  isImporting: false,
  progress: 0,

  setRows: (parsedRows) =>
    set({
      rows: parsedRows.map((row) => ({
        row,
        status: "pending" as const,
      })),
      progress: 0,
    }),

  setSelectedConsultantId: (id) => set({ selectedConsultantId: id }),

  reset: () =>
    set({
      rows: [],
      selectedConsultantId: "",
      isImporting: false,
      progress: 0,
    }),

  importAll: async () => {
    const { rows, selectedConsultantId } = get();
    const targets = rows
      .map((item, index) => ({ item, index }))
      .filter(
        ({ item }) => item.status === "pending" || item.status === "error"
      )
      .sort((a, b) => {
        const aHasNumber = Boolean(a.item.row.number?.trim());
        const bHasNumber = Boolean(b.item.row.number?.trim());
        if (aHasNumber === bHasNumber) return 0;
        if (aHasNumber) return -1;
        return 1;
      });
    if (targets.length === 0) return { success: 0, failed: 0 };

    const consultant = useInvoiceStore
      .getState()
      .consultants.find((item) => item.id === selectedConsultantId);
    if (!consultant) throw new Error("Selecciona un consultor");

    set({ isImporting: true, progress: 0 });

    const clientCache = new Map<string, Client>();
    const paymentCache = new Map<string, PaymentInstruction>();

    let nextNumber = Number(await getNextInvoiceNumber());
    if (Number.isNaN(nextNumber) || nextNumber < 1) nextNumber = 1;

    const usedNumbers = new Set(
      useInvoiceStore
        .getState()
        .invoices.map((invoice) => String(invoice.number).trim())
        .filter(Boolean)
    );

    let success = 0;
    let failed = 0;

    for (let t = 0; t < targets.length; t++) {
      const { item: current, index: i } = targets[t];

      set((state) => ({
        rows: state.rows.map((item, index) =>
          index === i
            ? { ...item, status: "importing" as const, error: undefined }
            : item
        ),
      }));

      try {
        let invoiceNumber = current.row.number?.trim() || "";
        if (!invoiceNumber) {
          while (usedNumbers.has(String(nextNumber))) {
            nextNumber += 1;
          }
          invoiceNumber = String(nextNumber);
          nextNumber += 1;
        }

        if (usedNumbers.has(invoiceNumber)) {
          throw new Error(`Número de factura duplicado: ${invoiceNumber}`);
        }

        const client = await resolveClient(current.row, clientCache);
        const payment = await resolvePayment(
          current.row.paymentMethod,
          consultant,
          paymentCache
        );

        const payload = buildInvoicePayload(
          current.row,
          invoiceNumber,
          consultant,
          client,
          payment
        );
        const created = await createInvoice(payload);
        useInvoiceStore.getState().addInvoice(created);
        usedNumbers.add(invoiceNumber);
        success += 1;

        set((state) => ({
          rows: state.rows.map((item, index) =>
            index === i
              ? {
                  ...item,
                  status: "success" as const,
                  invoiceNumber,
                  error: undefined,
                }
              : item
          ),
          progress: Math.round(((t + 1) / targets.length) * 100),
        }));
      } catch (error) {
        failed += 1;
        const message =
          error instanceof Error ? error.message : "Error al importar la factura";
        set((state) => ({
          rows: state.rows.map((item, index) =>
            index === i
              ? { ...item, status: "error" as const, error: message }
              : item
          ),
          progress: Math.round(((t + 1) / targets.length) * 100),
        }));
      }
    }

    set({ isImporting: false });
    return { success, failed };
  },
}));
