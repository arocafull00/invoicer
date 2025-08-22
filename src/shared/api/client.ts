import { supabase } from "../lib/supabase";
import { useAuthStore } from "../lib/stores";
import type { Client, Consultant, Invoice, PaymentInstruction, Income } from "../types";

export class SupabaseApiClient {
  private async getCurrentUserId(): Promise<string> {
    const { user } = useAuthStore.getState();
    if (!user?.id) throw new Error("User not authenticated");
    return user.id;
  }

  async getConsultants() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("consultants")
      .select("*")
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to fetch consultants: ${error.message}`);
    return data;
  }

  async getClients() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to fetch clients: ${error.message}`);
    return data;
  }

  async getPaymentInstructions() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("payment_instructions")
      .select("*")
      .eq("user_id", userId);

    if (error)
      throw new Error(`Failed to fetch payment instructions: ${error.message}`);
    return data;
  }

  async getInvoices() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions(*)
      `
      )
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);
    return data;
  }

  async getIncomes() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("incomes")
      .select(
        `
        *,
        client:clients(*)
      `
      )
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw new Error(`Failed to fetch incomes: ${error.message}`);
    return data as unknown as Income[];
  }

  async createConsultant(consultant: Omit<Consultant, "id" | "user_id">) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("consultants")
      .insert({ ...consultant, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(`Failed to create consultant: ${error.message}`);
    return data;
  }

  async updateConsultant(
    id: string,
    consultant: Partial<Omit<Consultant, "id" | "user_id">>
  ) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("consultants")
      .update(consultant)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update consultant: ${error.message}`);
    return data;
  }

  async deleteConsultant(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from("consultants")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to delete consultant: ${error.message}`);
  }

  async createClient(client: Omit<Client, "id" | "user_id">) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("clients")
      .insert({ ...client, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(`Failed to create client: ${error.message}`);
    return data;
  }

  async updateClient(
    id: string,
    client: Partial<Omit<Client, "id" | "user_id">>
  ) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("clients")
      .update(client)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update client: ${error.message}`);
    return data;
  }

  async deleteClient(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to delete client: ${error.message}`);
  }

  async createPaymentInstruction(
    paymentInstruction: Omit<PaymentInstruction, "id" | "user_id">
  ) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("payment_instructions")
      .insert({ ...paymentInstruction, user_id: userId })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create payment instruction: ${error.message}`);
    return data;
  }

  async updatePaymentInstruction(
    id: string,
    paymentInstruction: Partial<Omit<PaymentInstruction, "id" | "user_id">>
  ) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("payment_instructions")
      .update(paymentInstruction)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update payment instruction: ${error.message}`);
    return data;
  }

  async deletePaymentInstruction(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from("payment_instructions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error)
      throw new Error(`Failed to delete payment instruction: ${error.message}`);
  }

  async createInvoice(invoice: Omit<Invoice, "id" | "user_id">) {
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
      .from("invoices")
      .insert(insertPayload)
      .select(
        `
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions:payment_instructions(*)
      `
      )
      .single();

    if (error) throw new Error(`Failed to create invoice: ${error.message}`);
    return data;
  }

  async createIncome(income: Omit<Income, "id" | "user_id">) {
    const userId = await this.getCurrentUserId();
    const insertPayload = {
      date: income.date,
      concept: income.concept,
      amount: income.amount,
      payment_method: income.payment_method,
      client_id: income.client.id,
      user_id: userId,
    } as const;

    const { data, error } = await supabase
      .from("incomes")
      .insert(insertPayload)
      .select(
        `
        *,
        client:clients(*)
      `
      )
      .single();

    if (error) throw new Error(`Failed to create income: ${error.message}`);
    return data as unknown as Income;
  }

  async updateIncome(
    id: string,
    income: Partial<Omit<Income, "id" | "user_id">>
  ) {
    const userId = await this.getCurrentUserId();
    const updatePayload: Record<string, unknown> = {};
    if (income.date !== undefined) updatePayload.date = income.date;
    if (income.concept !== undefined) updatePayload.concept = income.concept;
    if (income.amount !== undefined) updatePayload.amount = income.amount;
    if (income.payment_method !== undefined) updatePayload.payment_method = income.payment_method;
    if (income.client?.id) updatePayload.client_id = income.client.id;

    const { data, error } = await supabase
      .from("incomes")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select(
        `
        *,
        client:clients(*)
      `
      )
      .single();

    if (error) throw new Error(`Failed to update income: ${error.message}`);
    return data as unknown as Income;
  }

  async deleteIncome(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from("incomes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to delete income: ${error.message}`);
  }

  async getNextInvoiceNumber(): Promise<string> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("invoices")
      .select("number", { count: "exact" })
      .eq("user_id", userId);

    if (error)
      throw new Error(`Failed to fetch invoice numbers: ${error.message}`);

    const next = data.length + 1;
    return next.toString();
  }
}

export const apiClient = new SupabaseApiClient();
