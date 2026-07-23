import type {
  Client,
  Consultant,
  Invoice,
  LineItemTemplate,
  PaymentInstruction,
} from '../types';

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenProvider ? await tokenProvider() : null;

  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export class ApiClient {
  getConsultants() {
    return request<Consultant[]>('/consultants');
  }

  createConsultant(consultant: Omit<Consultant, 'id'>) {
    return request<Consultant>('/consultants', {
      method: 'POST',
      body: JSON.stringify(consultant),
    });
  }

  updateConsultant(id: string, consultant: Partial<Omit<Consultant, 'id'>>) {
    return request<Consultant>(`/consultants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(consultant),
    });
  }

  deleteConsultant(id: string) {
    return request<void>(`/consultants/${id}`, { method: 'DELETE' });
  }

  getClients() {
    return request<Client[]>('/clients');
  }

  createClient(client: Partial<Omit<Client, 'id'>>) {
    return request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  updateClient(id: string, client: Partial<Omit<Client, 'id'>>) {
    return request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  deleteClient(id: string) {
    return request<void>(`/clients/${id}`, { method: 'DELETE' });
  }

  getPaymentInstructions() {
    return request<PaymentInstruction[]>('/payment-instructions');
  }

  createPaymentInstruction(
    paymentInstruction: Omit<PaymentInstruction, 'id'>
  ) {
    return request<PaymentInstruction>('/payment-instructions', {
      method: 'POST',
      body: JSON.stringify(paymentInstruction),
    });
  }

  updatePaymentInstruction(
    id: string,
    paymentInstruction: Partial<Omit<PaymentInstruction, 'id'>>
  ) {
    return request<PaymentInstruction>(`/payment-instructions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentInstruction),
    });
  }

  deletePaymentInstruction(id: string) {
    return request<void>(`/payment-instructions/${id}`, { method: 'DELETE' });
  }

  getInvoices() {
    return request<Invoice[]>('/invoices');
  }

  createInvoice(invoice: Omit<Invoice, 'id'>) {
    return request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  }

  updateInvoice(id: string, invoice: Partial<Omit<Invoice, 'id'>>) {
    return request<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
  }

  softDeleteInvoice(id: string) {
    return request<Invoice>(`/invoices/${id}/soft-delete`, {
      method: 'PATCH',
    });
  }

  getNextInvoiceNumber() {
    return request<{ number: string }>('/invoices/next-number').then(
      (result) => result.number
    );
  }

  getLineItemTemplates() {
    return request<LineItemTemplate[]>('/line-item-templates');
  }

  createLineItemTemplate(
    template: Omit<
      LineItemTemplate,
      'id' | 'usage_count' | 'last_used_at' | 'created_at' | 'updated_at'
    >
  ) {
    return request<LineItemTemplate>('/line-item-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  updateLineItemTemplate(
    id: string,
    template: Partial<Omit<LineItemTemplate, 'id' | 'created_at'>>
  ) {
    return request<LineItemTemplate>(`/line-item-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  deleteLineItemTemplate(id: string) {
    return request<void>(`/line-item-templates/${id}`, { method: 'DELETE' });
  }

  updateTemplateUsage(id: string) {
    return request<void>(`/line-item-templates/${id}/usage`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
