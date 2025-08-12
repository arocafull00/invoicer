import { useEffect, useState } from 'react';
import { useInvoiceStore, useAuthStore } from '@/shared/lib/stores';
import { 
  getInvoices, 
  getConsultants, 
  getClients, 
  getPaymentInstructions 
} from '@/shared/api/services';

export const useAppData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuthStore();
  const { 
    setInvoices, 
    setConsultants, 
    setClients, 
    setPaymentInstructions 
  } = useInvoiceStore();

  const loadAppData = async () => {
    if (!user || isInitialized) return;
    
    setIsLoading(true);
    
    try {
      const [invoices, consultants, clients, paymentInstructions] = await Promise.all([
        getInvoices(),
        getConsultants(),
        getClients(),
        getPaymentInstructions()
      ]);

      setInvoices(invoices);
      setConsultants(consultants);
      setClients(clients);
      setPaymentInstructions(paymentInstructions);
      
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