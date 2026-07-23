import { useEffect, useState } from 'react';
import { useInvoiceStore, useSettingsStore } from '@/shared/lib/stores';
import {
  getInvoices,
  getConsultants,
  getClients,
  getPaymentInstructions
} from '@/shared/api/services';
import { getLineItemTemplates } from '@/shared/api/services/lineItemTemplates';

type UseAppDataOptions = {
  enabled?: boolean;
};

export const useAppData = ({ enabled = true }: UseAppDataOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    setInvoices,
    setConsultants,
    setClients,
    setPaymentInstructions,
    setLineItemTemplates
  } = useInvoiceStore();
  const { load: loadSettings } = useSettingsStore();

  useEffect(() => {
    if (!enabled) return;
    if (isInitialized) return;

    let cancelled = false;

    const loadAppData = async () => {
      setIsLoading(true);

      try {
        const [invoices, consultants, clients, paymentInstructions] = await Promise.all([
          getInvoices(),
          getConsultants(),
          getClients(),
          getPaymentInstructions()
        ]);

        await loadSettings();

        const templates = await getLineItemTemplates();

        if (cancelled) return;

        setInvoices(invoices);
        setConsultants(consultants);
        setClients(clients);
        setPaymentInstructions(paymentInstructions);
        setLineItemTemplates(templates);

        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAppData();

    return () => {
      cancelled = true;
    };
  }, [enabled, isInitialized, loadSettings, setInvoices, setConsultants, setClients, setPaymentInstructions, setLineItemTemplates]);

  return { isLoading, isInitialized };
};
