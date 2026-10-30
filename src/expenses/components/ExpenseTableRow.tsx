import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/shared/lib/helpers";
import type { Expense } from "@/shared/types";
import { EditExpenseDialog } from './EditExpenseDialog';

interface ExpenseTableRowProps {
  expense: Expense;
  onDelete: (expense: Expense) => void;
  isDeleting: boolean;
}

export function ExpenseTableRow({
  expense,
  onDelete,
  isDeleting,
}: ExpenseTableRowProps) {
  return (
    <TableRow>
      <TableCell>{formatDate(expense.date)}</TableCell>
      <TableCell>{(() => { const date = expense.fiscal_date ?? expense.date; return `T${Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1} ${date.slice(0, 4)}`; })()}</TableCell>
      <TableCell>{expense.invoice_number || "—"}</TableCell>
      <TableCell>{expense.provider}</TableCell>
      <TableCell>{expense.concept}</TableCell>
      <TableCell>{formatCurrency(expense.base_amount)}</TableCell>
      <TableCell>{formatCurrency(expense.vat_amount)}</TableCell>
      <TableCell>{formatCurrency(expense.total)}</TableCell>
      <TableCell>{expense.expense_type?.name || "—"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
        {expense.document_name ? <Button variant="outline" size="sm" asChild><a href={`/api/expenses/${expense.id}/document`}>PDF</a></Button> : null}
        <EditExpenseDialog expense={expense} />
        <Button
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          onClick={() => onDelete(expense)}
          aria-label="Eliminar gasto"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
