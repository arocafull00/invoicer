import type { Session } from "@supabase/supabase-js";

export interface User {
  id: string;
  email?: string;
  created_at?: string;
}

export interface Consultant {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  nif: string;
}

export interface Client {
  id: string;
  user_id?: string;
  name: string;
  email?: string | null;
  address?: string;
  city?: string;
  country?: string;
  company_number?: string;
}

export interface PaymentInstruction {
  id: string;
  user_id?: string;
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
  user_id?: string;
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
  user_id?: string;
  number: string;
  created_date: string;
  start_date: string;
  end_date: string;
  consultant: Consultant;
  client: Client;
  description?: string; // Keep for backward compatibility
  line_items: LineItem[];
  subtotal: number; // Total without VAT
  vat_rate: number; // VAT percentage (e.g., 21)
  vat_amount: number; // Calculated VAT amount
  total: number; // Total including VAT
  payment_instructions: PaymentInstruction;
  vat_exempt: boolean;
  status: "paid" | "pending" | "overdue";
  deleted?: boolean;
}

export interface WizardDraft {
  consultant?: Consultant;
  client?: Client;
  start_date?: string;
  end_date?: string;
  description?: string;
  total?: number;
  payment_instructions?: PaymentInstruction;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
} 

export type SupportedCurrency = 'eur' | 'usd' | 'gbp';
export type SupportedDateFormat = 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';

export interface UserSettings {
  id?: string;
  user_id?: string;
  default_currency: SupportedCurrency;
  date_format: SupportedDateFormat;
  logo_url?: string | null;
}

export type IncomePaymentMethod = 'cash' | 'transfer' | 'bizum';

export interface Income {
  id: string;
  user_id?: string;
  date: string;
  concept: string;
  amount: number;
  payment_method: IncomePaymentMethod;
  client: Client;
}

export interface ExpenseType {
  id: string;
  user_id?: string;
  name: string;
}

export interface Expense {
  id: string;
  user_id?: string;
  date: string;
  invoice_number: string;
  provider: string;
  concept: string;
  base_amount: number;
  vat_amount: number;
  total: number;
  expense_type: ExpenseType;
}