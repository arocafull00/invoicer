import { supabase } from "../lib/supabase";
import { useAuthStore } from "../lib/stores";
import type { Client, Consultant, Invoice, PaymentInstruction, Income, Expense, ExpenseType, LineItemTemplate } from "../types";

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
        payment_instructions(*),
        line_items:invoice_line_items(*)
      `
      )
      .eq("user_id", userId)
      .neq("deleted", true);

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
      subtotal: invoice.subtotal,
      vat_rate: invoice.vat_rate,
      vat_amount: invoice.vat_amount,
      total: invoice.total,
      vat_exempt: invoice.vat_exempt,
      user_id: userId,
      status: invoice.status,
    } as const;

    // Start a transaction to create invoice and line items
    const { data: invoiceData, error: invoiceError } = await supabase
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

    if (invoiceError) throw new Error(`Failed to create invoice: ${invoiceError.message}`);

    // Create line items if they exist
    if (invoice.line_items && invoice.line_items.length > 0) {
      const lineItemsPayload = invoice.line_items.map((item, index) => ({
        invoice_id: invoiceData.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        total: item.total || item.quantity * item.rate,
        order_index: index,
        user_id: userId,
      }));

      const { error: lineItemsError } = await supabase
        .from("invoice_line_items")
        .insert(lineItemsPayload);

      if (lineItemsError) {
        // If line items fail, we should rollback the invoice creation
        // For now, we'll just log the error and continue
        console.error("Failed to create line items:", lineItemsError.message);
      }
    }

    // Fetch the complete invoice with line items
    const { data: completeInvoice, error: fetchError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions:payment_instructions(*),
        line_items:invoice_line_items(*)
      `
      )
      .eq("id", invoiceData.id)
      .single();

    if (fetchError) throw new Error(`Failed to fetch created invoice: ${fetchError.message}`);
    return completeInvoice;
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
    if (invoice.subtotal !== undefined) updatePayload.subtotal = invoice.subtotal;
    if (invoice.vat_rate !== undefined) updatePayload.vat_rate = invoice.vat_rate;
    if (invoice.vat_amount !== undefined) updatePayload.vat_amount = invoice.vat_amount;
    if (invoice.total !== undefined) updatePayload.total = invoice.total;
    if (invoice.vat_exempt !== undefined)
      updatePayload.vat_exempt = invoice.vat_exempt;
    if (invoice.status !== undefined) updatePayload.status = invoice.status;
    if (invoice.deleted !== undefined) updatePayload.deleted = invoice.deleted;

    // Update the invoice
    const { error: invoiceError } = await supabase
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

    if (invoiceError) throw new Error(`Failed to update invoice: ${invoiceError.message}`);

    // Update line items if they are provided
    if (invoice.line_items !== undefined) {
      // Delete existing line items
      const { error: deleteError } = await supabase
        .from("invoice_line_items")
        .delete()
        .eq("invoice_id", id)
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Failed to delete existing line items:", deleteError.message);
      }

      // Insert new line items if they exist
      if (invoice.line_items.length > 0) {
        const lineItemsPayload = invoice.line_items.map((item, index) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          total: item.total || item.quantity * item.rate,
          order_index: index,
          user_id: userId,
        }));

        const { error: insertError } = await supabase
          .from("invoice_line_items")
          .insert(lineItemsPayload);

        if (insertError) {
          console.error("Failed to create new line items:", insertError.message);
        }
      }
    }

    // Fetch the complete updated invoice with line items
    const { data: completeInvoice, error: fetchError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions:payment_instructions(*),
        line_items:invoice_line_items(*)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(`Failed to fetch updated invoice: ${fetchError.message}`);
    return completeInvoice;
  }

  async softDeleteInvoice(id: string) {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("invoices")
      .update({ deleted: true })
      .eq("id", id)
      .eq("user_id", userId)
      .select(
        `
        *,
        consultant:consultants(*),
        client:clients(*),
        payment_instructions:payment_instructions(*),
        line_items:invoice_line_items(*)
      `
      )
      .single();

    if (error) throw new Error(`Failed to delete invoice: ${error.message}`);
    return data as unknown as Invoice;
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
      .eq("deleted", false)
      .eq("user_id", userId);

    console.log(data);
    if (error)
      throw new Error(`Failed to fetch invoice numbers: ${error.message}`);

    const next = data.length + 1;
    return next.toString();
  }

  // =====================================================
  // LINE ITEM TEMPLATES METHODS
  // =====================================================

  async getLineItemTemplates(): Promise<LineItemTemplate[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("line_item_templates")
      .select("*")
      .eq("user_id", userId)
      .order("usage_count", { ascending: false });

    if (error) throw new Error(`Failed to fetch line item templates: ${error.message}`);
    return data as LineItemTemplate[];
  }

  async createLineItemTemplate(template: Omit<LineItemTemplate, "id" | "user_id" | "usage_count" | "last_used_at" | "created_at" | "updated_at">): Promise<LineItemTemplate> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("line_item_templates")
      .insert({
        ...template,
        user_id: userId,
        usage_count: 0,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to create line item template: ${error.message}`);
    return data as LineItemTemplate;
  }

  async updateLineItemTemplate(id: string, template: Partial<Omit<LineItemTemplate, "id" | "user_id" | "created_at">>): Promise<LineItemTemplate> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("line_item_templates")
      .update(template)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to update line item template: ${error.message}`);
    return data as LineItemTemplate;
  }

  async deleteLineItemTemplate(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from("line_item_templates")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to delete line item template: ${error.message}`);
  }

  async updateTemplateUsage(id: string): Promise<void> {
    const { error } = await supabase.rpc('update_template_usage', { template_uuid: id });
    if (error) {
      console.error("Failed to update template usage:", error.message);
    }
  }

  async createDefaultTemplatesForUser(): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase.rpc('create_default_templates_for_user', { user_uuid: userId });
    if (error) {
      console.error("Failed to create default templates:", error.message);
    }
  }
}

export const apiClient = new SupabaseApiClient();
