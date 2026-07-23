import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ImportExpenseRowState } from "@/expenses/store/useImportExpensesStore";

interface ImportExpensePreviewRowProps {
  item: ImportExpenseRowState;
}

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${Number(day)}/${Number(month)}/${year}`;
}

function formatMoney(value: number): string {
  return value.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function StatusBadge({ item }: { item: ImportExpenseRowState }) {
  if (item.status === "success") {
    return <Badge variant="default">Importado</Badge>;
  }
  if (item.status === "error") {
    return <Badge variant="destructive">Error</Badge>;
  }
  if (item.status === "importing") {
    return <Badge variant="secondary">Importando...</Badge>;
  }
  return <Badge variant="outline">Pendiente</Badge>;
}

export function ImportExpensePreviewRow({ item }: ImportExpensePreviewRowProps) {
  const { row } = item;

  return (
    <TableRow>
      <TableCell>{formatDisplayDate(row.date)}</TableCell>
      <TableCell>{row.invoiceNumber || "—"}</TableCell>
      <TableCell>{row.provider}</TableCell>
      <TableCell>{row.concept}</TableCell>
      <TableCell>{formatMoney(row.baseAmount)}</TableCell>
      <TableCell>{formatMoney(row.vatAmount)}</TableCell>
      <TableCell>{formatMoney(row.total)}</TableCell>
      <TableCell>{row.expenseTypeName}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <StatusBadge item={item} />
          {item.error ? (
            <span className="text-xs text-destructive max-w-[180px] whitespace-normal">
              {item.error}
            </span>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}
