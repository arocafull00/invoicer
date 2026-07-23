"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createExpense,
  createExpenseType,
  getExpenseTypes,
} from "@/shared/api/services/expenses";
import { useExpensesStore } from "@/expenses/store/useExpensesStore";
import {
  emptyExpenseForm,
  ExpenseForm,
  parseAmount,
  type ExpenseFormValues,
} from "@/expenses/components/ExpenseForm";

export function CreateExpenseDialog() {
  const { expenseTypes, setExpenseTypes, addExpense, addExpenseType } =
    useExpensesStore();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<ExpenseFormValues>(emptyExpenseForm);

  useEffect(() => {
    if (!open) return;
    if (expenseTypes.length > 0) return;

    let cancelled = false;
    const loadTypes = async () => {
      try {
        const types = await getExpenseTypes();
        if (cancelled) return;
        setExpenseTypes(types);
      } catch (error) {
        console.error(error);
      }
    };
    void loadTypes();
    return () => {
      cancelled = true;
    };
  }, [open, expenseTypes.length, setExpenseTypes]);

  const base = parseAmount(form.base_amount);
  const vat = parseAmount(form.vat_amount);
  const total = base + vat;
  const canSubmit =
    Boolean(form.date) &&
    Boolean(form.provider.trim()) &&
    Boolean(form.concept.trim()) &&
    total > 0;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) return;
    setForm(emptyExpenseForm());
  };

  const resolveExpenseTypeId = async (): Promise<string | null> => {
    const newTypeName = form.new_expense_type.trim();
    if (newTypeName) {
      const existing = expenseTypes.find(
        (type) => type.name.trim().toLowerCase() === newTypeName.toLowerCase()
      );
      if (existing) return existing.id;

      const created = await createExpenseType({ name: newTypeName });
      addExpenseType(created);
      return created.id;
    }

    if (form.expense_type_id) return form.expense_type_id;
    return null;
  };

  const handleCreate = async () => {
    if (!canSubmit) return;
    setPending(true);
    try {
      const expenseTypeId = await resolveExpenseTypeId();
      const created = await createExpense({
        date: form.date,
        invoice_number: form.invoice_number.trim(),
        provider: form.provider.trim(),
        concept: form.concept.trim(),
        base_amount: base,
        vat_amount: vat,
        total,
        expense_type_id: expenseTypeId,
      });
      addExpense(created);
      toast.success("Gasto creado");
      setOpen(false);
      setForm(emptyExpenseForm());
    } catch (error) {
      console.error(error);
      toast.error("No se pudo crear el gasto");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setForm(emptyExpenseForm())}>
          <Plus className="w-4 h-4" />
          Añadir gasto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo gasto</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          value={form}
          onChange={setForm}
          expenseTypes={expenseTypes}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!canSubmit || pending}>
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
