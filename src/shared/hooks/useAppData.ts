import { useEffect, useState } from 'react';
import { useInvoiceStore, useAuthStore, useSettingsStore } from '@/shared/lib/stores';
import { 
  getInvoices, 
  getConsultants, 
  getClients, 
  getPaymentInstructions 
} from '@/shared/api/services';
import { getLineItemTemplates } from '@/shared/api/services/lineItemTemplates';

export const useAppData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuthStore();
  const { 
    setInvoices, 
    setConsultants, 
    setClients, 
    setPaymentInstructions,
    setLineItemTemplates
  } = useInvoiceStore();
  const { load: loadSettings } = useSettingsStore();

  const loadAppData = async () => {
    if (!user || isInitialized) return;
    
    setIsLoading(true);
    
    try {
      // Load settings first (no dependency, but we only need to do it once per session)
      const [invoices, consultants, clients, paymentInstructions] = await Promise.all([
        getInvoices(),
        getConsultants(),
        getClients(),
        getPaymentInstructions()
      ]);

      await loadSettings();

      const templates = await getLineItemTemplates();

      setInvoices(invoices);
      setConsultants(consultants);
      setClients(clients);
      setPaymentInstructions(paymentInstructions);
      setLineItemTemplates(templates);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isInitialized) {
      loadAppData();
    }
  }, [user, isInitialized]);

  return { isLoading, isInitialized };
};