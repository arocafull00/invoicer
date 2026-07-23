import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/shared/lib/helpers";
import type { Expense } from "@/shared/types";

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
      <TableCell>{expense.invoice_number || "—"}</TableCell>
      <TableCell>{expense.provider}</TableCell>
      <TableCell>{expense.concept}</TableCell>
      <TableCell>{formatCurrency(expense.base_amount)}</TableCell>
      <TableCell>{formatCurrency(expense.vat_amount)}</TableCell>
      <TableCell>{formatCurrency(expense.total)}</TableCell>
      <TableCell>{expense.expense_type?.name || "—"}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          onClick={() => onDelete(expense)}
          aria-label="Eliminar gasto"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
