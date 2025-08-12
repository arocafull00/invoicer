export interface User {
  id: string;
  email?: string;
  created_at?: string;
}

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
  email: string;
  address: string;
  city: string;
  country: string;
  company_number?: string;
}

export interface PaymentInstruction {
  id: string;
  account_holder: string;
  iban: string;
  payment_method: string;
  payment_terms: string;
  vat_exemption_text: string;
}

export interface Invoice {
  id: string;
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
  session: any | null;
  loading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
} 