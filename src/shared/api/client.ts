import { supabase } from '../lib/supabase';
import type { Client, Consultant, Invoice, PaymentInstruction } from '../types';

export class SupabaseApiClient {
  async getConsultants() {
    const { data, error } = await supabase
      .from('consultants')
      .select('*');
    
    if (error) throw new Error(`Failed to fetch consultants: ${error.message}`);
    return data;
  }

  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) throw new Error(`Failed to fetch clients: ${error.message}`);
    return data;
  }

  async getPaymentInstructions() {
    const { data, error } = await supabase
      .from('payment_instructions')
      .select('*');
    
    if (error) throw new Error(`Failed to fetch payment instructions: ${error.message}`);
    return data;
  }

  async getInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions(*)
      `);
    
    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);
    return data;
  }

  async createConsultant(consultant: Omit<Consultant, 'id'>) {
    const { data, error } = await supabase
      .from('consultants')
      .insert(consultant)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create consultant: ${error.message}`);
    return data;
  }

  async createClient(client: Omit<Client, 'id'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create client: ${error.message}`);
    return data;
  }

  async createPaymentInstruction(paymentInstruction: Omit<PaymentInstruction, 'id'>) {
    const { data, error } = await supabase
      .from('payment_instructions')
      .insert(paymentInstruction)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create payment instruction: ${error.message}`);
    return data;
  }

  async createInvoice(invoice: Omit<Invoice, 'id'>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select(`
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions(*)
      `)
      .single();
    
    if (error) throw new Error(`Failed to create invoice: ${error.message}`);
    return data;
  }
}

export const apiClient = new SupabaseApiClient();