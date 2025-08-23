import { supabase } from "../lib/supabase";
import { useAuthStore } from "../lib/stores";
import type { Client, Consultant, Invoice, PaymentInstruction, Income, Expense, ExpenseType } from "../types";

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

  async getExpenseTypes() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("expense_types")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to fetch expense types: ${error.message}`);
    return data as unknown as ExpenseType[];
  }

  async createExpenseType(expenseType: Omit<ExpenseType, "id" | "user_id">) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("expense_types")
      .insert({ ...expenseType, user_id: userId })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to create expense type: ${error.message}`);
    return data as unknown as ExpenseType;
  }

  async updateExpenseType(id: string, expenseType: Partial<Omit<ExpenseType, "id" | "user_id">>) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("expense_types")
      .update(expenseType)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to update expense type: ${error.message}`);
    return data as unknown as ExpenseType;
  }

  async deleteExpenseType(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from("expense_types")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to delete expense type: ${error.message}`);
  }

  async getExpenses() {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
        *,
        expense_type:expense_types(*)
      `
      )
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);
    return data as unknown as Expense[];
  }

  async createExpense(expense: Omit<Expense, "id" | "user_id">) {
    const userId = await this.getCurrentUserId();
    const insertPayload = {
      date: expense.date,
      invoice_number: expense.invoice_number,
      provider: expense.provider,
      concept: expense.concept,
      base_amount: expense.base_amount,
      vat_amount: expense.vat_amount,
      total: expense.total,
      expense_type_id: expense.expense_type.id,
      user_id: userId,
    } as const;

    const { data, error } = await supabase
      .from("expenses")
      .insert(insertPayload)
      .select(
        `
        *,
        expense_type:expense_types(*)
      `
      )
      .single();

    if (error) throw new Error(`Failed to create expense: ${error.message}`);
    return data as unknown as Expense;
  }

  async updateExpense(id: string, expense: Partial<Omit<Expense, "id" | "user_id">>) {
    const userId = await this.getCurrentUserId();
    const updatePayload: Record<string, unknown> = {};
    if (expense.date !== undefined) updatePayload.date = expense.date;
    if (expense.invoice_number !== undefined) updatePayload.invoice_number = expense.invoice_number;
    if (expense.provider !== undefined) updatePayload.provider = expense.provider;
    if (expense.concept !== undefined) updatePayload.concept = expense.concept;
    if (expense.base_amount !== undefined) updatePayload.base_amount = expense.base_amount;
    if (expense.vat_amount !== undefined) updatePayload.vat_amount = expense.vat_amount;
    if (expense.total !== undefined) updatePayload.total = expense.total;
    if (expense.expense_type?.id) updatePayload.expense_type_id = expense.expense_type.id;

    const { data, error } = await supabase
      .from("expenses")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select(
        `
        *,
        expense_type:expense_types(*)
      `
      )
      .single();

    if (error) throw new Error(`Failed to update expense: ${error.message}`);
    return data as unknown as Expense;
  }

  async deleteExpense(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to delete expense: ${error.message}`);
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

  async createClient(client: Partial<Omit<Client, "id" | "user_id">>) {
    const userId = await this.getCurrentUserId();
    const insertPayload = {
      name: client.name ?? "",
      email: client.email ?? "",
      address: client.address ?? "",
      city: client.city ?? "",
      country: client.country ?? "",
      company_number: client.company_number ?? null,
      user_id: userId,
    } as const;
    const { data, error } = await supabase
      .from("clients")
      .insert(insertPayload)
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

  async updateInvoice(
    id: string,
    invoice: Partial<Omit<Invoice, "id" | "user_id">>
  ) {
    const userId = await this.getCurrentUserId();
    const updatePayload: Record<string, unknown> = {};
    if (invoice.number !== undefined) updatePayload.number = invoice.number;
    if (invoice.created_date !== undefined)
      updatePayload.created_date = invoice.created_date;
    if (invoice.start_date !== undefined)
      updatePayload.start_date = invoice.start_date;
    if (invoice.end_date !== undefined) updatePayload.end_date = invoice.end_date;
    if (invoice.consultant?.id)
      updatePayload.consultant_id = invoice.consultant.id;
    if (invoice.client?.id) updatePayload.client_id = invoice.client.id;
    if (invoice.payment_instructions?.id)
      updatePayload.payment_instructions_id = invoice.payment_instructions.id;
    if (invoice.description !== undefined)
      updatePayload.description = invoice.description;
    if (invoice.total !== undefined) updatePayload.total = invoice.total;
    if (invoice.vat_exempt !== undefined)
      updatePayload.vat_exempt = invoice.vat_exempt;
    if (invoice.status !== undefined) updatePayload.status = invoice.status;

    const { data, error } = await supabase
      .from("invoices")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select(
        `
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions:payment_instructions(*)
      `
      )
      .single();

    if (error) throw new Error(`Failed to update invoice: ${error.message}`);
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
