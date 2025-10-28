import { create } from "zustand";
import type {
  Consultant,
  Client,
  PaymentInstruction,
  Invoice,
  LineItem,
} from "@/shared/types";
import {
  createInvoice,
  createClient,
  createConsultant,
  createPaymentInstruction,
  getNextInvoiceNumber,
} from "@/shared/api/services";
import { useInvoiceStore } from "@/shared/lib/stores";

interface NewInvoiceFormState {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  selectedConsultantId: string;
  selectedClientId: string;
  selectedPaymentId: string;
  lineItems: Omit<LineItem, 'id' | 'total'>[];
  currentLineItem: Omit<LineItem, 'id' | 'total'>;
  includeVat: boolean;
  vatRate: number;
  logoPreview: string | null;
  isSaving: boolean;
  // dialogs
  openNewConsultant: boolean;
  openNewClient: boolean;
  openNewPayment: boolean;
  // temp entities
  newConsultant: Partial<Consultant>;
  newClient: Partial<Client>;
  newPayment: Partial<PaymentInstruction>;
}

interface InvoiceFormStoreState {
  form: NewInvoiceFormState;
  // setters
  setForm: (updater: Partial<NewInvoiceFormState>) => void;
  setCurrentLineItem: (updater: Partial<Omit<LineItem, 'id' | 'total'>>) => void;
  addLineItem: () => void;
  removeLineItem: (index: number) => void;
  updateLineItem: (index: number, updater: Partial<Omit<LineItem, 'id' | 'total'>>) => void;
  setLogoFromFile: (file: File) => void;
  setDialog: (
    which: "consultant" | "client" | "payment",
    open: boolean
  ) => void;
  setNewConsultant: (updater: Partial<Consultant>) => void;
  setNewClient: (updater: Partial<Client>) => void;
  setNewPayment: (updater: Partial<PaymentInstruction>) => void;
  resetForm: () => void;
  // derived
  getSelectedConsultant: () => Consultant | undefined;
  getSelectedClient: () => Client | undefined;
  getSelectedPayment: () => PaymentInstruction;
  getLineItemTotal: (item: Omit<LineItem, 'id' | 'total'>) => number;
  getSubtotal: () => number;
  getVatAmount: () => number;
  getTotalAmount: () => number;
  isFormValid: () => boolean;
  // async actions
  fetchNextInvoiceNumber: () => Promise<void>;
  saveInvoice: () => Promise<Invoice>;
  createNewConsultant: () => Promise<Consultant>;
  createNewClient: () => Promise<Client>;
  createNewPayment: () => Promise<PaymentInstruction>;
}

const today = new Date().toISOString().slice(0, 10);
const twoWeeksFromToday = new Date(
  new Date().setDate(new Date().getDate() + 14)
).toISOString().slice(0, 10);

const initialFormState = (): NewInvoiceFormState => ({
  invoiceNumber: "",
  issueDate: today,
  dueDate: twoWeeksFromToday,
  selectedConsultantId: "",
  selectedClientId: "",
  selectedPaymentId: "",
  lineItems: [],
  currentLineItem: { description: "", quantity: 1, rate: 0, includeVat: false },
  includeVat: false,
  vatRate: 21,
  logoPreview: null,
  isSaving: false,
  openNewConsultant: false,
  openNewClient: false,
  openNewPayment: false,
  newConsultant: {
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    nif: "",
  },
  newClient: {
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    company_number: "",
  },
  newPayment: {
    account_holder: "",
    iban: "",
    payment_method: "Transferencia bancaria",
    payment_terms:
      "El pago debe realizarse dentro de los 14 días naturales desde la fecha de la factura.",
    additional_data:
      "ESTA OPERACIÓN ESTÁ EXENTA DE IVA en virtud del artículo 21.1 de la Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido.",
  },
});

export const useInvoiceFormStore = create<InvoiceFormStoreState>(
  (set, get) => ({
    form: initialFormState(),

    // setters
    setForm: (updater) =>
      set((state) => ({ form: { ...state.form, ...updater } })),
    setCurrentLineItem: (updater) =>
      set((state) => ({
        form: {
          ...state.form,
          currentLineItem: { ...state.form.currentLineItem, ...updater },
        },
      })),
    addLineItem: () =>
      set((state) => {
        const { currentLineItem } = state.form;
        if (!currentLineItem.description || currentLineItem.quantity <= 0 || currentLineItem.rate <= 0) {
          return state;
        }
        return {
          form: {
            ...state.form,
            lineItems: [...state.form.lineItems, { ...currentLineItem }],
            currentLineItem: { description: "", quantity: 1, rate: 0, includeVat: false },
          },
        };
      }),
    removeLineItem: (index) =>
      set((state) => ({
        form: {
          ...state.form,
          lineItems: state.form.lineItems.filter((_, i) => i !== index),
        },
      })),
    updateLineItem: (index, updater) =>
      set((state) => ({
        form: {
          ...state.form,
          lineItems: state.form.lineItems.map((item, i) =>
            i === index ? { ...item, ...updater } : item
          ),
        },
      })),
    setLogoFromFile: (file) => {
      const reader = new FileReader();
      reader.onload = () =>
        set((state) => ({
          form: { ...state.form, logoPreview: reader.result as string },
        }));
      reader.readAsDataURL(file);
    },
    setDialog: (which, open) =>
      set((state) => ({
        form: {
          ...state.form,
          openNewConsultant:
            which === "consultant" ? open : state.form.openNewConsultant,
          openNewClient: which === "client" ? open : state.form.openNewClient,
          openNewPayment:
            which === "payment" ? open : state.form.openNewPayment,
        },
      })),
    setNewConsultant: (updater) =>
      set((state) => ({
        form: {
          ...state.form,
          newConsultant: { ...state.form.newConsultant, ...updater },
        },
      })),
    setNewClient: (updater) =>
      set((state) => ({
        form: {
          ...state.form,
          newClient: { ...state.form.newClient, ...updater },
        },
      })),
    setNewPayment: (updater) =>
      set((state) => ({
        form: {
          ...state.form,
          newPayment: { ...state.form.newPayment, ...updater },
        },
      })),
    resetForm: () => set({ form: initialFormState() }),

    // derived
    getSelectedConsultant: () => {
      const { selectedConsultantId } = get().form;
      return useInvoiceStore
        .getState()
        .consultants.find((c) => c.id === selectedConsultantId);
    },
    getSelectedClient: () => {
      const { selectedClientId } = get().form;
      return useInvoiceStore
        .getState()
        .clients.find((c) => c.id === selectedClientId);
    },
    getSelectedPayment: () => {
      const { selectedPaymentId } = get().form;
      return (
        useInvoiceStore
          .getState()
          .payment_instructions.find((p) => p.id === selectedPaymentId) ??
        useInvoiceStore.getState().payment_instructions[0]
      );
    },
    getLineItemTotal: (item) => {
      return Number(((item.quantity || 0) * (item.rate || 0)).toFixed(2));
    },
    getSubtotal: () => {
      const { lineItems } = get().form;
      return Number(
        lineItems
          .reduce((total, item) => total + (item.quantity || 0) * (item.rate || 0), 0)
          .toFixed(2)
      );
    },
    getVatAmount: () => {
      const { lineItems, vatRate } = get().form;
      // Calculate VAT only for items that have includeVat set to true
      const vatableAmount = lineItems
        .filter(item => item.includeVat)
        .reduce((total, item) => total + (item.quantity || 0) * (item.rate || 0), 0);
      return Number((vatableAmount * (vatRate / 100)).toFixed(2));
    },
    getTotalAmount: () => {
      const subtotal = get().getSubtotal();
      const vatAmount = get().getVatAmount();
      return Number((subtotal + vatAmount).toFixed(2));
    },
    isFormValid: () => {
      const s = get();
      const {
        issueDate,
        dueDate,
        lineItems,
        selectedClientId,
        selectedConsultantId,
        selectedPaymentId,
      } = s.form;
      return Boolean(
        selectedConsultantId &&
          selectedClientId &&
          selectedPaymentId &&
          issueDate &&
          dueDate &&
          lineItems.length > 0 &&
          s.getTotalAmount() > 0
      );
    },

    // async actions
    fetchNextInvoiceNumber: async () => {
      const next = await getNextInvoiceNumber();
      set((state) => ({ form: { ...state.form, invoiceNumber: next } }));
    },

    saveInvoice: async () => {
      const s = get();
      if (!s.isFormValid()) throw new Error("Invalid form");

      const consultant = s.getSelectedConsultant();
      const client = s.getSelectedClient();
      const payment = s.getSelectedPayment();
      if (!consultant || !client || !payment)
        throw new Error("Missing entities");

      set((state) => ({ form: { ...state.form, isSaving: true } }));
      try {
        const lineItemsWithIds: LineItem[] = s.form.lineItems.map((item, index) => ({
          id: `line-${index + 1}`,
          ...item,
          total: s.getLineItemTotal(item),
        }));

        const subtotal = s.getSubtotal();
        const vatAmount = s.getVatAmount();
        const total = s.getTotalAmount();
        
        // Check if any line item has VAT applied
        const hasVatItems = s.form.lineItems.some(item => item.includeVat);

        const payload: Omit<Invoice, "id"> = {
          number: s.form.invoiceNumber,
          created_date: new Date().toISOString().split("T")[0],
          start_date: s.form.issueDate,
          end_date: s.form.dueDate,
          consultant,
          client,
          description: lineItemsWithIds.map(item => item.description).join(", "), // Keep for backward compatibility
          line_items: lineItemsWithIds,
          subtotal,
          vat_rate: hasVatItems ? s.form.vatRate : 0,
          vat_amount: vatAmount,
          total,
          payment_instructions: payment,
          vat_exempt: !hasVatItems,
          status: "pending",
        };
        const created = await createInvoice(payload);
        useInvoiceStore.getState().addInvoice(created);
        return created;
      } finally {
        set((state) => ({ form: { ...state.form, isSaving: false } }));
      }
    },

    createNewConsultant: async () => {
      const { newConsultant } = get().form;
      if (
        !newConsultant.name ||
        !newConsultant.email ||
        !newConsultant.address ||
        !newConsultant.city ||
        !newConsultant.country ||
        !newConsultant.nif
      ) {
        throw new Error("Completa todos los campos del consultor");
      }
      const created = await createConsultant({
        name: newConsultant.name,
        email: newConsultant.email,
        address: newConsultant.address,
        city: newConsultant.city,
        country: newConsultant.country,
        nif: newConsultant.nif,
      });
      useInvoiceStore.getState().addConsultant(created);
      set((state) => ({
        form: {
          ...state.form,
          selectedConsultantId: created.id,
          openNewConsultant: false,
        },
      }));
      return created;
    },

    createNewClient: async () => {
      const { newClient } = get().form;
      if (
        !newClient.name ||
        !newClient.email ||
        !newClient.address ||
        !newClient.city ||
        !newClient.country
      ) {
        throw new Error("Completa todos los campos del cliente");
      }
      const created = await createClient({
        name: newClient.name,
        email: newClient.email,
        address: newClient.address,
        city: newClient.city,
        country: newClient.country,
        company_number: newClient.company_number,
      });
      useInvoiceStore.getState().addClient(created);
      set((state) => ({
        form: {
          ...state.form,
          selectedClientId: created.id,
          openNewClient: false,
        },
      }));
      return created;
    },

    createNewPayment: async () => {
      const { newPayment } = get().form;
      if (
        !newPayment.account_holder ||
        !newPayment.iban ||
        !newPayment.payment_method ||
        !newPayment.payment_terms ||
        !newPayment.additional_data
      ) {
        throw new Error("Completa todos los campos del pago");
      }
      const created = await createPaymentInstruction({
        account_holder: newPayment.account_holder,
        iban: newPayment.iban,
        payment_method: newPayment.payment_method,
        payment_terms: newPayment.payment_terms,
        additional_data: newPayment.additional_data,
      });
      useInvoiceStore.getState().addPaymentInstruction(created);
      set((state) => ({
        form: {
          ...state.form,
          selectedPaymentId: created.id,
          openNewPayment: false,
        },
      }));
      return created;
    },
  })
);

export type { InvoiceFormStoreState };
