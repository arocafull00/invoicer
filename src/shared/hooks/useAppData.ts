import { useCallback, useEffect, useRef, useState } from 'react';
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
};

export const useAppData = ({ enabled = true }: UseAppDataOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const cancelledRef = useRef(false);
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

  const loadAppData = useCallback(async () => {
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
      ] = await Promise.all([
        getInvoices(),
        getConsultants(),
        getClients(),
        getPaymentInstructions(),
        getExpenses(),
        getExpenseTypes(),
      ]);

      await loadSettings();

      const templates = await getLineItemTemplates();

      if (cancelledRef.current) return;

      setInvoices(invoices);
      setConsultants(consultants);
      setClients(clients);
      setPaymentInstructions(paymentInstructions);
      setLineItemTemplates(templates);
      setExpenses(expenses);
      setExpenseTypes(expenseTypes);
      setExpensesLoaded(true);
      setDataReady(true);
      setIsInitialized(true);
    } catch (error) {
      if (cancelledRef.current) return;
      console.error('Error loading app data:', error);
      setLoadError(true);
      setDataReady(false);
      toast.error('No se pudieron cargar los datos. Inténtalo de nuevo.');
    } finally {
      if (!cancelledRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    loadSettings,
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
    cancelledRef.current = false;

    if (!enabled) return;
    if (isInitialized) return;

    const timeoutId = window.setTimeout(() => {
      void loadAppData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      cancelledRef.current = true;
    };
  }, [enabled, isInitialized, loadAppData]);

  const retry = useCallback(() => {
    setIsInitialized(false);
    setLoadError(false);
  }, []);

  return { isLoading, isInitialized, loadError, retry };
};
