export interface Consultant {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  nif: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  address?: string;
  city?: string;
  country?: string;
  company_number?: string;
}

export interface PaymentInstruction {
  id: string;
  account_holder: string;
  iban: string;
  payment_method: string;
  payment_terms: string;
  additional_data: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
  includeVat: boolean;
}

export interface LineItemTemplate {
  id: string;
  description: string;
  default_quantity: number;
  default_rate: number;
  category?: string;
  usage_count: number;
  last_used_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  number: string;
  created_date: string;
  start_date: string;
  end_date: string;
  consultant: Consultant;
  client: Client;
  description?: string;
  line_items: LineItem[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  payment_instructions: PaymentInstruction;
  vat_exempt: boolean;
  status: "paid" | "pending" | "overdue";
  deleted?: boolean;
  irpf_rate?: number | null;
  irpf_amount?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export type SupportedCurrency = 'eur' | 'usd' | 'gbp';
export type SupportedDateFormat = 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
export type PdfColorPalette = 'violet' | 'blue' | 'emerald' | 'rose';

export interface UserSettings {
  id?: string;
  default_currency: SupportedCurrency;
  date_format: SupportedDateFormat;
  pdf_color_palette: PdfColorPalette;
  logo_url: string | null;
}

export interface ExpenseType {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  date: string;
  invoice_number: string;
  provider: string;
  concept: string;
  base_amount: number;
  vat_amount: number;
  total: number;
  expense_type_id?: string | null;
  expense_type?: ExpenseType | null;
  created_at?: string;
  updated_at?: string;
}
