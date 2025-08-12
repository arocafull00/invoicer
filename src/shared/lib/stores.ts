import { create } from 'zustand';
import { supabase } from './supabase';
import type { AuthState, WizardDraft, Invoice, Consultant, Client, PaymentInstruction } from '@/shared/types';

export const useAuthStore = create<AuthState>((set) => {
  // Inicializar sesión automáticamente
  const initializeAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }
      set({ 
        session, 
        user: session?.user ?? null, 
        loading: false 
      });
    } catch (error) {
      console.error('Error in getSession:', error);
      set({ loading: false });
    }
  };

  // Ejecutar inicialización
  initializeAuth();

  // Escuchar cambios de autenticación
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    set({ 
      session, 
      user: session?.user ?? null, 
      loading: false 
    });
  });

  return {
    user: null,
    session: null,
    loading: true,
  };
});

interface InvoiceStoreState {
  invoices: Invoice[];
  consultants: Consultant[];
  clients: Client[];
  payment_instructions: PaymentInstruction[];
  wizardDraft: WizardDraft;
  setInvoices: (invoices: Invoice[]) => void;
  setConsultants: (consultants: Consultant[]) => void;
  setClients: (clients: Client[]) => void;
  setPaymentInstructions: (paymentInstructions: PaymentInstruction[]) => void;
  setWizardDraft: (draft: WizardDraft) => void;
  addInvoice: (invoice: Invoice) => void;
  addConsultant: (consultant: Consultant) => void;
  addClient: (client: Client) => void;
  addPaymentInstruction: (paymentInstruction: PaymentInstruction) => void;
}

export const useInvoiceStore = create<InvoiceStoreState>((set) => ({
  invoices: [],
  consultants: [],
  clients: [],
  payment_instructions: [],
  wizardDraft: {},
  setInvoices: (invoices) => set({ invoices }),
  setConsultants: (consultants) => set({ consultants }),
  setClients: (clients) => set({ clients }),
  setPaymentInstructions: (paymentInstructions) => set({ payment_instructions: paymentInstructions }),
  setWizardDraft: (draft) => set({ wizardDraft: draft }),
  addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
  addConsultant: (consultant) => set((state) => ({ consultants: [...state.consultants, consultant] })),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  addPaymentInstruction: (paymentInstruction) => set((state) => ({ payment_instructions: [...state.payment_instructions, paymentInstruction] })),
})); 