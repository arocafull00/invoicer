import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import { useInvoiceStore, useSettingsStore } from '@/shared/lib/stores';
import { useExpensesStore } from '@/expenses/store/useExpensesStore';
import {
  getInvoices,
  getConsultants,
  getClients,
  getPaymentInstructions
} from '@/shared/api/services';
import { getExpenses, getExpenseTypes } from '@/shared/api/services/expenses';
import { getLineItemTemplates } from '@/shared/api/services/lineItemTemplates';
import { cacheAppData, useAppCache } from '@/shared/lib/appCache';

type UseAppDataOptions = {
  enabled?: boolean;
  userId?: string | null;
};

export const useAppData = ({ enabled = true, userId }: UseAppDataOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [initializedUserId, setInitializedUserId] = useState<string | null>(null);
  const isInitialized = Boolean(userId && initializedUserId === userId);
  const [loadError, setLoadError] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const {
    setInvoices,
    setConsultants,
    setClients,
    setPaymentInstructions,
    setLineItemTemplates,
    setDataReady,
  } = useInvoiceStore(useShallow((state) => ({
    setInvoices: state.setInvoices, setConsultants: state.setConsultants, setClients: state.setClients,
    setPaymentInstructions: state.setPaymentInstructions, setLineItemTemplates: state.setLineItemTemplates, setDataReady: state.setDataReady,
  })));
  const { setExpenses, setExpenseTypes, setLoaded: setExpensesLoaded } =
    useExpensesStore(useShallow((state) => ({ setExpenses: state.setExpenses, setExpenseTypes: state.setExpenseTypes, setLoaded: state.setLoaded })));
  const loadSettings = useSettingsStore((state) => state.load);

  const loadAppData = useCallback(async (signal: AbortSignal) => {
    const generation = useAppCache.getState().generation;
    setIsLoading(true);
    setLoadError(false);

    try {
      const [
        invoices,
        consultants,
        clients,
        paymentInstructions,
        expenses,
        expenseTypes,
        templates,
      ] = await Promise.all([
        getInvoices(),
        getConsultants(),
        getClients(),
        getPaymentInstructions(),
        getExpenses(),
        getExpenseTypes(),
        getLineItemTemplates(),
        userId ? loadSettings(userId) : Promise.resolve(),
      ]);

      if (signal.aborted || generation !== useAppCache.getState().generation) return;

      const setIfChanged = <T,>(current: T, next: T, setter: (value: T) => void) => { if (JSON.stringify(current) !== JSON.stringify(next)) setter(next); };
      const current = useInvoiceStore.getState();
      const expenseState = useExpensesStore.getState();
      setIfChanged(current.invoices, invoices, setInvoices);
      setIfChanged(current.consultants, consultants, setConsultants);
      setIfChanged(current.clients, clients, setClients);
      setIfChanged(current.payment_instructions, paymentInstructions, setPaymentInstructions);
      setIfChanged(current.line_item_templates, templates, setLineItemTemplates);
      setIfChanged(expenseState.expenses, expenses, setExpenses);
      setIfChanged(expenseState.expenseTypes, expenseTypes, setExpenseTypes);
      setExpensesLoaded(true);
      setDataReady(true);
      setInitializedUserId(userId ?? null);
      if (userId) cacheAppData(userId);
    } catch (error) {
      if (signal.aborted) return;
      console.error('Error loading app data:', error);
      setLoadError(true);
      if (!useAppCache.getState().hasData) setDataReady(false);
      toast.error('No se pudieron cargar los datos. Inténtalo de nuevo.');
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [
    loadSettings,
    userId,
    setInvoices,
    setConsultants,
    setClients,
    setPaymentInstructions,
    setLineItemTemplates,
    setExpenses,
    setExpenseTypes,
    setExpensesLoaded,
    setDataReady,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (isInitialized) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void loadAppData(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [enabled, isInitialized, loadAppData, refreshVersion]);

  const retry = useCallback(() => {
    setInitializedUserId(null);
    setLoadError(false);
    setRefreshVersion((value) => value + 1);
  }, []);

  return { isLoading, isInitialized, loadError, retry };
};
