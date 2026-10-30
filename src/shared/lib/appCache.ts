import { create } from 'zustand';
import { useInvoiceStore, useSettingsStore } from './stores';
import { useExpensesStore } from '@/expenses/store/useExpensesStore';
import { readCachedSettings } from '@/shared/api/services/userSettings';
import { queryClient } from '@/shared/api/queryClient';
import { clearPdfDrafts } from '@/expenses/lib/pdfDrafts';

const KEY = 'invoicer.app.v1';
export const useAppCache = create<{ hydrated: boolean; owner: string | null; hasData: boolean; generation: number }>(() => ({ hydrated: false, owner: null, hasData: false, generation: 0 }));

export function restoreAppCache() {
  if (useAppCache.getState().hydrated) return;
  let owner: string | null = null;
  let hasData = false;
  try {
    const cached = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (cached?.version === 1 && typeof cached.userId === 'string' && Array.isArray(cached.invoices) && Array.isArray(cached.consultants) && cached.consultants.length > 0 && Array.isArray(cached.expenses)) {
      owner = cached.userId;
      useInvoiceStore.setState({ invoices: cached.invoices, consultants: cached.consultants, clients: cached.clients ?? [], payment_instructions: cached.payment_instructions ?? [], line_item_templates: cached.line_item_templates ?? [], isDataReady: true });
      useExpensesStore.setState({ expenses: cached.expenses, expenseTypes: cached.expenseTypes ?? [], isLoaded: true });
      const settings = readCachedSettings(cached.userId);
      if (settings) useSettingsStore.setState({ userId: owner, settings });
      hasData = true;
    }
  } catch { /* A missing or damaged cache falls back to the API. */ }
  useAppCache.setState({ hydrated: true, owner, hasData });
}

export function cacheAppData(userId: string) {
  const invoices = useInvoiceStore.getState();
  const expenses = useExpensesStore.getState();
  if (!invoices.isDataReady) return;
  try {
    const serialized = JSON.stringify({ version: 1, userId, invoices: invoices.invoices, consultants: invoices.consultants, clients: invoices.clients, payment_instructions: invoices.payment_instructions, line_item_templates: invoices.line_item_templates, expenses: expenses.expenses, expenseTypes: expenses.expenseTypes });
    if (localStorage.getItem(KEY) !== serialized) localStorage.setItem(KEY, serialized);
  } catch { /* The app remains usable when storage is unavailable or full. */ }
  const state = useAppCache.getState();
  if (state.owner !== userId || !state.hasData) useAppCache.setState({ owner: userId, hasData: true });
}

export function clearAppCache() {
  useAppCache.setState((state) => ({ owner: null, hasData: false, generation: state.generation + 1 }));
  try { localStorage.removeItem(KEY); localStorage.removeItem('invoicer.tax-periods.v1'); } catch { /* Storage may be disabled. */ }
  queryClient.clear();
  useInvoiceStore.setState({ invoices: [], consultants: [], clients: [], payment_instructions: [], line_item_templates: [], isDataReady: false });
  useExpensesStore.setState({ expenses: [], expenseTypes: [], isLoaded: false });
  useSettingsStore.getState().reset();
  // Imported documents and extracted drafts must not survive a sign-out.
  void clearPdfDrafts().catch(() => {});
  window.dispatchEvent(new Event('invoicer:cache-cleared'));
}
