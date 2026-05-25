import { create } from 'zustand';
import type { WizardDraft, Invoice, Consultant, Client, PaymentInstruction, UserSettings, LineItemTemplate } from '@/shared/types';
import { getUserSettings, updateUserSettings } from '@/shared/api/services/userSettings';

interface InvoiceStoreState {
  invoices: Invoice[];
  consultants: Consultant[];
  clients: Client[];
  payment_instructions: PaymentInstruction[];
  line_item_templates: LineItemTemplate[];
  wizardDraft: WizardDraft;
  invoiceNumber: string;
  setInvoices: (invoices: Invoice[]) => void;
  setConsultants: (consultants: Consultant[]) => void;
  setClients: (clients: Client[]) => void;
  setPaymentInstructions: (paymentInstructions: PaymentInstruction[]) => void;
  setLineItemTemplates: (templates: LineItemTemplate[]) => void;
  setWizardDraft: (draft: WizardDraft) => void;
  addInvoice: (invoice: Invoice) => void;
  addConsultant: (consultant: Consultant) => void;
  patchConsultant: (id: string, patch: Partial<Consultant>) => void;
  removeConsultant: (id: string) => void;
  addClient: (client: Client) => void;
  addPaymentInstruction: (paymentInstruction: PaymentInstruction) => void;
  addLineItemTemplate: (template: LineItemTemplate) => void;
  updateLineItemTemplate: (id: string, template: Partial<LineItemTemplate>) => void;
  removeLineItemTemplate: (id: string) => void;
}

export const useInvoiceStore = create<InvoiceStoreState>((set) => ({
  invoices: [],
  consultants: [],
  clients: [],
  payment_instructions: [],
  line_item_templates: [],
  wizardDraft: {},
  invoiceNumber: "",
  setInvoices: (invoices) => set({ invoices }),
  setConsultants: (consultants) => set({ consultants }),
  setClients: (clients) => set({ clients }),
  setPaymentInstructions: (paymentInstructions) => set({ payment_instructions: paymentInstructions }),
  setLineItemTemplates: (templates) => set({ line_item_templates: templates }),
  setWizardDraft: (draft) => set({ wizardDraft: draft }),
  addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
  addConsultant: (consultant) => set((state) => ({ consultants: [...state.consultants, consultant] })),
  patchConsultant: (id, patch) =>
    set((state) => ({
      consultants: state.consultants.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
  removeConsultant: (id) =>
    set((state) => ({
      consultants: state.consultants.filter((c) => c.id !== id),
    })),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  addPaymentInstruction: (paymentInstruction) => set((state) => ({ payment_instructions: [...state.payment_instructions, paymentInstruction] })),
  addLineItemTemplate: (template) => set((state) => ({ line_item_templates: [...state.line_item_templates, template] })),
  updateLineItemTemplate: (id, updatedTemplate) => set((state) => ({
    line_item_templates: state.line_item_templates.map(t => t.id === id ? { ...t, ...updatedTemplate } : t)
  })),
  removeLineItemTemplate: (id) => set((state) => ({
    line_item_templates: state.line_item_templates.filter(t => t.id !== id)
  })),
}));

interface SettingsStoreState {
  settings: UserSettings | null;
  isLoaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<Pick<UserSettings, 'default_currency' | 'date_format' | 'pdf_color_palette'>>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: null,
  isLoaded: false,
  loading: false,
  load: async () => {
    if (get().isLoaded || get().loading) return;
    set({ loading: true });
    try {
      const settings = await getUserSettings();
      set({ settings, isLoaded: true });
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      set({ loading: false });
    }
  },
  update: async (partial) => {
    try {
      const updated = await updateUserSettings(partial);
      set({ settings: updated });
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  },
}));
