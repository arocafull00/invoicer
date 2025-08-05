import { create } from 'zustand';
import type { AuthState, InvoiceState, Consultant, Client, PaymentInstruction, Invoice } from '@/types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
}));

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [
    {
      id: '1',
      number: 'INVOICE № 1',
      created_date: '2025-07-31',
      start_date: '2025-07-01',
      end_date: '2025-07-31',
      consultant: {
        id: '1',
        name: 'Adrián Rocafull Berbel',
        email: 'adrianrocafull1@gmail.com',
        address: 'Avenida Rey Juan Carlos I, 12, 16',
        city: 'Torrent, Valencia',
        country: 'Spain',
        nif: '53882287A'
      },
      client: {
        id: '1',
        name: 'ViralRankers Ltd',
        email: 'info@viralrankers.com',
        address: 'Victoria House, Office D, Suite 21/22, 26 Main Street',
        city: 'Gibraltar',
        country: 'GX11 1AA',
        company_number: '125275'
      },
      description: 'Full stack development and consulting services',
      total: 2880.00,
      payment_instructions: {
        id: '1',
        account_holder: 'Adrián Rocafull Berbel',
        iban: 'ES0931182064032757012974',
        payment_method: 'Bank transfer',
        payment_terms: 'Payment is due within 14 calendar days from the invoice date.',
        vat_exemption_text: 'THIS TRANSACTION IS EXEMPT FROM VAT UNDER Article 21.1 of the Spanish Value Added Tax Law 37/1992 of December 28.'
      },
      vat_exempt: true
    }
  ],
  consultants: [
    {
      id: '1',
      name: 'Adrián Rocafull Berbel',
      email: 'adrianrocafull1@gmail.com',
      address: 'Avenida Rey Juan Carlos I, 12, 16',
      city: 'Torrent, Valencia',
      country: 'Spain',
      nif: '53882287A'
    },
    {
      id: '2',
      name: 'María García López',
      email: 'maria.garcia@consulting.com',
      address: 'Calle Mayor, 45, 3º',
      city: 'Madrid',
      country: 'Spain',
      nif: '12345678A'
    }
  ],
  clients: [
    {
      id: '1',
      name: 'ViralRankers Ltd',
      email: 'info@viralrankers.com',
      address: 'Victoria House, Office D, Suite 21/22, 26 Main Street',
      city: 'Gibraltar',
      country: 'GX11 1AA',
      company_number: '125275'
    },
    {
      id: '2',
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      address: 'Business Park, Unit 15',
      city: 'London',
      country: 'UK',
      company_number: '98765432'
    }
  ],
  payment_instructions: [
    {
      id: '1',
      account_holder: 'Adrián Rocafull Berbel',
      iban: 'ES0931182064032757012974',
      payment_method: 'Bank transfer',
      payment_terms: 'Payment is due within 14 calendar days from the invoice date.',
      vat_exemption_text: 'THIS TRANSACTION IS EXEMPT FROM VAT UNDER Article 21.1 of the Spanish Value Added Tax Law 37/1992 of December 28.'
    },
    {
      id: '2',
      account_holder: 'María García López',
      iban: 'ES9121000418450200051332',
      payment_method: 'Bank transfer',
      payment_terms: 'Payment is due within 30 calendar days from the invoice date.',
      vat_exemption_text: 'THIS TRANSACTION IS EXEMPT FROM VAT UNDER Article 21.1 of the Spanish Value Added Tax Law 37/1992 of December 28.'
    }
  ],
  wizardDraft: {},
})); 