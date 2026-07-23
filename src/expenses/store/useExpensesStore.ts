import { create } from "zustand";
import type { Expense, ExpenseType } from "@/shared/types";

interface ExpensesStoreState {
  expenses: Expense[];
  expenseTypes: ExpenseType[];
  isLoaded: boolean;
  setExpenses: (expenses: Expense[]) => void;
  setExpenseTypes: (types: ExpenseType[]) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  addExpenseType: (type: ExpenseType) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useExpensesStore = create<ExpensesStoreState>((set) => ({
  expenses: [],
  expenseTypes: [],
  isLoaded: false,
  setExpenses: (expenses) => set({ expenses }),
  setExpenseTypes: (expenseTypes) => set({ expenseTypes }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),
  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id),
    })),
  addExpenseType: (type) =>
    set((state) => ({ expenseTypes: [...state.expenseTypes, type] })),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
}));
