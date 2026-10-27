import { useCallback, useEffect, useState } from 'react';
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

type UseAppDataOptions = {
  enabled?: boolean;
  userId?: string | null;
};

export const useAppData = ({ enabled = true, userId }: UseAppDataOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [initializedUserId, setInitializedUserId] = useState<string | null>(null);
  const isInitialized = Boolean(userId && initializedUserId === userId);
  const [loadError, setLoadError] = useState(false);
  const {
    setInvoices,
    setConsultants,
    setClients,
    setPaymentInstructions,
    setLineItemTemplates,
    setDataReady,
  } = useInvoiceStore();
  const { setExpenses, setExpenseTypes, setLoaded: setExpensesLoaded } =
    useExpensesStore();
  const { load: loadSettings } = useSettingsStore();

  const loadAppData = useCallback(async (signal: AbortSignal) => {
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

      if (signal.aborted) return;

      setInvoices(invoices);
      setConsultants(consultants);
      setClients(clients);
      setPaymentInstructions(paymentInstructions);
      setLineItemTemplates(templates);
      setExpenses(expenses);
      setExpenseTypes(expenseTypes);
      setExpensesLoaded(true);
      setDataReady(true);
      setInitializedUserId(userId ?? null);
    } catch (error) {
      if (signal.aborted) return;
      console.error('Error loading app data:', error);
      setLoadError(true);
      setDataReady(false);
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
  }, [enabled, isInitialized, loadAppData]);

  const retry = useCallback(() => {
    setInitializedUserId(null);
    setLoadError(false);
  }, []);

  return { isLoading, isInitialized, loadError, retry };
};
