import { create } from 'zustand';
import { toast } from 'sonner';
import type { Invoice, Consultant, Client, PaymentInstruction, UserSettings, LineItemTemplate } from '@/shared/types';
import {
  getUserSettings,
  removeUserLogo,
  updateUserSettings,
  uploadUserLogo,
  readCachedSettings,
  cacheSettings,
  clearSettingsCache,
} from '@/shared/api/services/userSettings';

interface InvoiceStoreState {
  invoices: Invoice[];
  consultants: Consultant[];
  clients: Client[];
  payment_instructions: PaymentInstruction[];
  line_item_templates: LineItemTemplate[];
  isDataReady: boolean;
  setInvoices: (invoices: Invoice[]) => void;
  setConsultants: (consultants: Consultant[]) => void;
  setClients: (clients: Client[]) => void;
  setPaymentInstructions: (paymentInstructions: PaymentInstruction[]) => void;
  setLineItemTemplates: (templates: LineItemTemplate[]) => void;
  setDataReady: (ready: boolean) => void;
  addInvoice: (invoice: Invoice) => void;
  addConsultant: (consultant: Consultant) => void;
  patchConsultant: (id: string, patch: Partial<Consultant>) => void;
  removeConsultant: (id: string) => void;
  addClient: (client: Client) => void;
  patchClient: (id: string, patch: Partial<Client>) => void;
  removeClient: (id: string) => void;
  addPaymentInstruction: (paymentInstruction: PaymentInstruction) => void;
  patchPaymentInstruction: (id: string, patch: Partial<PaymentInstruction>) => void;
  removePaymentInstruction: (id: string) => void;
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
  isDataReady: false,
  setInvoices: (invoices) => set({ invoices }),
  setConsultants: (consultants) => set({ consultants }),
  setClients: (clients) => set({ clients }),
  setPaymentInstructions: (paymentInstructions) => set({ payment_instructions: paymentInstructions }),
  setLineItemTemplates: (templates) => set({ line_item_templates: templates }),
  setDataReady: (ready) => set({ isDataReady: ready }),
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
  patchClient: (id, patch) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
  removeClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    })),
  addPaymentInstruction: (paymentInstruction) =>
    set((state) => ({
      payment_instructions: [...state.payment_instructions, paymentInstruction],
    })),
  patchPaymentInstruction: (id, patch) =>
    set((state) => ({
      payment_instructions: state.payment_instructions.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })),
  removePaymentInstruction: (id) =>
    set((state) => ({
      payment_instructions: state.payment_instructions.filter((p) => p.id !== id),
    })),
  addLineItemTemplate: (template) => set((state) => ({ line_item_templates: [...state.line_item_templates, template] })),
  updateLineItemTemplate: (id, updatedTemplate) => set((state) => ({
    line_item_templates: state.line_item_templates.map(t => t.id === id ? { ...t, ...updatedTemplate } : t)
  })),
  removeLineItemTemplate: (id) => set((state) => ({
    line_item_templates: state.line_item_templates.filter(t => t.id !== id)
  })),
}));

interface SettingsStoreState {
  userId: string | null;
  settings: UserSettings | null;
  isLoaded: boolean;
  loading: boolean;
  load: (userId?: string) => Promise<void>;
  reset: () => void;
  update: (
    partial: Partial<
      Pick<
        UserSettings,
        'default_currency' | 'date_format' | 'pdf_color_palette' | 'irpf_rate' | 'working_hours'
      >
    >
  ) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
  removeLogo: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  userId: null,
  settings: null,
  isLoaded: false,
  loading: false,
  reset: () => {
    clearSettingsCache();
    set({ userId: null, settings: null, isLoaded: false, loading: false });
  },
  load: async (userId = get().userId ?? undefined) => {
    if (!userId) return;
    if (get().userId === userId && (get().isLoaded || get().loading)) return;
    set({ userId, settings: readCachedSettings(userId), loading: true, isLoaded: false });
    try {
      const settings = await getUserSettings();
      if (get().userId !== userId) return;
      set({ settings, isLoaded: true });
      cacheSettings(userId, settings);
    } catch (error) {
      if (get().userId !== userId) return;
      if (error instanceof Error && error.message === 'Unauthorized') get().reset();
      console.error('Error loading user settings:', error);
      toast.error('No se pudieron cargar los ajustes');
    } finally {
      if (get().userId === userId) set({ loading: false });
    }
  },
  update: async (partial) => {
    const userId = get().userId;
    try {
      const updated = await updateUserSettings(partial);
      if (get().userId !== userId) return;
      // Concurrent preference updates must not replace unrelated, newer settings.
      const settings = { ...(get().settings ?? updated) };
      for (const key of Object.keys(partial) as (keyof typeof partial)[]) {
        Object.assign(settings, { [key]: updated[key] });
      }
      set({ settings });
      if (userId) cacheSettings(userId, settings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      toast.error('No se pudieron guardar los ajustes');
      throw error;
    }
  },
  uploadLogo: async (file) => {
    const userId = get().userId;
    try {
      const updated = await uploadUserLogo(file);
      if (get().userId !== userId) return;
      const settings = { ...(get().settings ?? updated), logo_url: updated.logo_url };
      set({ settings });
      if (userId) cacheSettings(userId, settings);
      toast.success('Logo actualizado');
    } catch (error) {
      console.error('Error uploading logo:', error);
      const message =
        error instanceof Error ? error.message : 'No se pudo subir el logo';
      toast.error(message);
      throw error;
    }
  },
  removeLogo: async () => {
    const userId = get().userId;
    try {
      const updated = await removeUserLogo();
      if (get().userId !== userId) return;
      const settings = { ...(get().settings ?? updated), logo_url: updated.logo_url };
      set({ settings });
      if (userId) cacheSettings(userId, settings);
      toast.success('Logo eliminado');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('No se pudo eliminar el logo');
      throw error;
    }
  },
}));
