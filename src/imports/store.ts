import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Invoice } from "@/shared/types";
import type {
  FacturaImportRow,
  IngresoImportRow,
} from "@/imports/ingresosAiResponseSchema";

export type ImportTarget = "invoices" | "incomes" | "expenses";

export interface ParsedFileData {
  headers: string[];
  rows: Record<string, unknown>[];
}

interface ImportDraftState {
  step: number;
  target: ImportTarget;
  fileName: string;
  data: ParsedFileData;
  mapping: Record<string, string>;
  invoiceConsultantId: string;
  invoiceVatExempt: boolean;
  invoiceStatus: Invoice["status"];
  removedIndices: number[];
  incomesCsvParsedMode: boolean;
  pendingCsvText: string;
  parsedIngresos: IngresoImportRow[];
  parsedFacturas: FacturaImportRow[];
  ingresosRemoved: number[];
  facturasRemoved: number[];
  aiInvoicePaymentId: string;
  parseIngresosBulkError: string | null;
}

interface ImportStoreState extends ImportDraftState {
  setImportState: (
    patch:
      | Partial<ImportDraftState>
      | ((state: ImportDraftState) => Partial<ImportDraftState>),
  ) => void;
  setMappingFor: (key: string, header: string) => void;
  addRemovedIndex: (idx: number) => void;
  addIngresoRemoved: (idx: number) => void;
  addFacturaRemoved: (idx: number) => void;
  resetIncomesCsvParseState: () => void;
  resetImportState: () => void;
}

const initialImportState: ImportDraftState = {
  step: 1,
  target: "incomes",
  fileName: "",
  data: { headers: [], rows: [] },
  mapping: {},
  invoiceConsultantId: "",
  invoiceVatExempt: false,
  invoiceStatus: "pending",
  removedIndices: [],
  incomesCsvParsedMode: false,
  pendingCsvText: "",
  parsedIngresos: [],
  parsedFacturas: [],
  ingresosRemoved: [],
  facturasRemoved: [],
  aiInvoicePaymentId: "",
  parseIngresosBulkError: null,
};

const incomesCsvInitialState: Pick<
  ImportDraftState,
  | "incomesCsvParsedMode"
  | "parsedIngresos"
  | "parsedFacturas"
  | "ingresosRemoved"
  | "facturasRemoved"
  | "parseIngresosBulkError"
> = {
  incomesCsvParsedMode: false,
  parsedIngresos: [],
  parsedFacturas: [],
  ingresosRemoved: [],
  facturasRemoved: [],
  parseIngresosBulkError: null,
};

export const useImportStore = create<ImportStoreState>()(
  persist(
    (set) => ({
      ...initialImportState,
      setImportState: (patch) =>
        set((state) => {
          const nextPatch =
            typeof patch === "function" ? patch(state) : patch;
          return { ...state, ...nextPatch };
        }),
      setMappingFor: (key, header) =>
        set((state) => ({
          mapping: { ...state.mapping, [key]: header },
        })),
      addRemovedIndex: (idx) =>
        set((state) => {
          if (state.removedIndices.includes(idx)) return state;
          return { removedIndices: [...state.removedIndices, idx] };
        }),
      addIngresoRemoved: (idx) =>
        set((state) => {
          if (state.ingresosRemoved.includes(idx)) return state;
          return { ingresosRemoved: [...state.ingresosRemoved, idx] };
        }),
      addFacturaRemoved: (idx) =>
        set((state) => {
          if (state.facturasRemoved.includes(idx)) return state;
          return { facturasRemoved: [...state.facturasRemoved, idx] };
        }),
      resetIncomesCsvParseState: () => set(() => ({ ...incomesCsvInitialState })),
      resetImportState: () => set(() => ({ ...initialImportState })),
    }),
    {
      name: "import-screen-store-v1",
      partialize: (state) => ({
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
      }),
    },
  ),
);
