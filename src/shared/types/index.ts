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
  address: string;
  city: string;
  country: string;
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

export interface Invoice {
  id: string;
  user_id?: string;
  number: string;
  created_date: string;
  start_date: string;
  end_date: string;
  consultant: Consultant;
  client: Client;
  description: string;
  total: number;
  payment_instructions: PaymentInstruction;
  vat_exempt: boolean;
  status: "paid" | "pending" | "overdue";
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
  // Not persisted in DB; convenience field loaded from storage
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