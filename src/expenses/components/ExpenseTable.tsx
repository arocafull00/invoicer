import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/shared/components/Spinner";
import {
  deleteExpense,
  getExpenses,
  getExpenseTypes,
} from "@/shared/api/services/expenses";
import { useExpensesStore } from "@/expenses/store/useExpensesStore";
import { useSettingsStore } from "@/shared/lib/stores";
import { ExpenseTableRow } from "@/expenses/components/ExpenseTableRow";
import type { Expense } from "@/shared/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ExpenseTable() {
  const {
    expenses,
    isLoaded,
    setExpenses,
    setExpenseTypes,
    removeExpense,
    setLoaded,
  } = useExpensesStore();
  useSettingsStore((s) => s.settings);
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  useEffect(() => {
    if (isLoaded) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const [expensesData, typesData] = await Promise.all([
          getExpenses(),
          getExpenseTypes(),
        ]);
        if (cancelled) return;
        setExpenses(expensesData);
        setExpenseTypes(typesData);
        setLoaded(true);
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error("No se pudieron cargar los gastos");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, setExpenses, setExpenseTypes, setLoaded]);

  const handleConfirmDelete = useCallback(async () => {
    if (!expenseToDelete) return;
    setDeletingId(expenseToDelete.id);
    try {
      await deleteExpense(expenseToDelete.id);
      removeExpense(expenseToDelete.id);
      toast.success("Gasto eliminado");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el gasto");
    } finally {
      setDeletingId(null);
      setExpenseToDelete(null);
    }
  }, [expenseToDelete, removeExpense]);

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Spinner />
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card className="py-12 text-center text-muted-foreground">
        No hay gastos todavía. Importa un CSV para empezar.
      </Card>
    );
  }

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nº Factura</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Base</TableHead>
              <TableHead>IVA</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <ExpenseTableRow
                key={expense.id}
                expense={expense}
                isDeleting={deletingId === expense.id}
                onDelete={setExpenseToDelete}
              />
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog
        open={Boolean(expenseToDelete)}
        onOpenChange={(open) => {
          if (!open) setExpenseToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar gasto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres eliminar este gasto? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
