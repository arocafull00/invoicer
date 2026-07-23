import { create } from "zustand";
import type { ExpenseType } from "@/shared/types";
import {
  createExpense,
  createExpenseType,
} from "@/shared/api/services/expenses";
import type { ParsedExpenseRow } from "@/expenses/lib/csvImport";
import { useExpensesStore } from "@/expenses/store/useExpensesStore";

export type ImportExpenseRowStatus =
  | "pending"
  | "importing"
  | "success"
  | "error";

export interface ImportExpenseRowState {
  row: ParsedExpenseRow;
  status: ImportExpenseRowStatus;
  error?: string;
}

interface ImportExpensesState {
  rows: ImportExpenseRowState[];
  isImporting: boolean;
  progress: number;
  setRows: (rows: ParsedExpenseRow[]) => void;
  reset: () => void;
  importAll: () => Promise<{ success: number; failed: number }>;
}

function findTypeByName(
  types: ExpenseType[],
  name: string
): ExpenseType | undefined {
  const normalized = name.trim().toLowerCase();
  return types.find((type) => type.name.trim().toLowerCase() === normalized);
}

async function resolveExpenseType(
  name: string,
  cache: Map<string, ExpenseType>
): Promise<ExpenseType> {
  const key = name.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const existing = findTypeByName(
    useExpensesStore.getState().expenseTypes,
    name
  );
  if (existing) {
    cache.set(key, existing);
    return existing;
  }

  const created = await createExpenseType({ name });
  useExpensesStore.getState().addExpenseType(created);
  cache.set(key, created);
  return created;
}

export const useImportExpensesStore = create<ImportExpensesState>((set, get) => ({
  rows: [],
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

  reset: () =>
    set({
      rows: [],
      isImporting: false,
      progress: 0,
    }),

  importAll: async () => {
    const { rows } = get();
    const targets = rows
      .map((item, index) => ({ item, index }))
      .filter(
        ({ item }) => item.status === "pending" || item.status === "error"
      );
    if (targets.length === 0) return { success: 0, failed: 0 };

    set({ isImporting: true, progress: 0 });

    const typeCache = new Map<string, ExpenseType>();
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
        const expenseType = await resolveExpenseType(
          current.row.expenseTypeName,
          typeCache
        );

        const created = await createExpense({
          date: current.row.date,
          invoice_number: current.row.invoiceNumber,
          provider: current.row.provider,
          concept: current.row.concept,
          base_amount: current.row.baseAmount,
          vat_amount: current.row.vatAmount,
          total: current.row.total,
          expense_type_id: expenseType.id,
        });

        useExpensesStore.getState().addExpense(created);
        success += 1;

        set((state) => ({
          rows: state.rows.map((item, index) =>
            index === i
              ? { ...item, status: "success" as const, error: undefined }
              : item
          ),
          progress: Math.round(((t + 1) / targets.length) * 100),
        }));
      } catch (error) {
        failed += 1;
        const message =
          error instanceof Error ? error.message : "Error al importar el gasto";
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
