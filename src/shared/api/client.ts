import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/stores';
import type { Client, Consultant, Invoice, PaymentInstruction } from '../types';

export class SupabaseApiClient {
  private async getCurrentUserId(): Promise<string> {
    const { user } = useAuthStore.getState();
    if (!user?.id) throw new Error('User not authenticated');
    return user.id;
  }

  async getConsultants() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('consultants')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw new Error(`Failed to fetch consultants: ${error.message}`);
    return data;
  }

  async getClients() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw new Error(`Failed to fetch clients: ${error.message}`);
    return data;
  }

  async getPaymentInstructions() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('payment_instructions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw new Error(`Failed to fetch payment instructions: ${error.message}`);
    return data;
  }

  async getInvoices() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);
    return data;
  }

  async createConsultant(consultant: Omit<Consultant, 'id' | 'user_id'>) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('consultants')
      .insert({ ...consultant, user_id: userId })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create consultant: ${error.message}`);
    return data;
  }

  async createClient(client: Omit<Client, 'id' | 'user_id'>) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...client, user_id: userId })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create client: ${error.message}`);
    return data;
  }

  async createPaymentInstruction(paymentInstruction: Omit<PaymentInstruction, 'id' | 'user_id'>) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('payment_instructions')
      .insert({ ...paymentInstruction, user_id: userId })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create payment instruction: ${error.message}`);
    return data;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'user_id'>) {
    const userId = await this.getCurrentUserId();
    // Transform the invoice object into the DB insert shape using foreign keys
    const insertPayload = {
      number: invoice.number,
      created_date: invoice.created_date,
      start_date: invoice.start_date,
      end_date: invoice.end_date,
      consultant_id: invoice.consultant.id,
      client_id: invoice.client.id,
      payment_instructions_id: invoice.payment_instructions.id,
      description: invoice.description,
      total: invoice.total,
      vat_exempt: invoice.vat_exempt,
      user_id: userId,
    } as const;

    const { data, error } = await supabase
      .from('invoices')
      .insert(insertPayload)
      .select(`
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions:payment_instructions(*)
      `)
      .single();
    
    if (error) throw new Error(`Failed to create invoice: ${error.message}`);
    return data;
  }
}

export const apiClient = new SupabaseApiClient();