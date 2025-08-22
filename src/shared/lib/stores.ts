import { create } from 'zustand';
import { supabase } from './supabase';
import type { AuthState, WizardDraft, Invoice, Consultant, Client, PaymentInstruction, UserSettings } from '@/shared/types';
import { getUserSettings, updateUserSettings } from '@/shared/api/services/userSettings';
import { getUserLogoUrl } from '@/shared/api/services/logos';

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
  invoiceNumber: string;
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
  invoiceNumber: "",
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

interface SettingsStoreState {
  settings: UserSettings | null;
  isLoaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<Pick<UserSettings, 'default_currency' | 'date_format'>>) => Promise<void>;
  setLogoUrl: (url: string | null) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: null,
  isLoaded: false,
  loading: false,
  load: async () => {
    if (get().isLoaded || get().loading) return;
    set({ loading: true });
    try {
      const base = await getUserSettings();
      const logoUrl = await getUserLogoUrl();
      set({ settings: { ...base, logo_url: logoUrl ?? null }, isLoaded: true });
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      set({ loading: false });
    }
  },
  update: async (partial) => {
    try {
      const updated = await updateUserSettings(partial);
      const current = get().settings;
      set({ settings: { ...updated, logo_url: current?.logo_url ?? null } });
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  },
  setLogoUrl: (url) => {
    const current = get().settings;
    if (!current) return;
    set({ settings: { ...current, logo_url: url } });
  },
}));