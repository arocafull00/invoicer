import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ImportRowState } from "@/invoices/store/useImportInvoicesStore";

interface ImportPreviewRowProps {
  item: ImportRowState;
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

function StatusBadge({ item }: { item: ImportRowState }) {
  if (item.status === "success") {
    return <Badge variant="default">Importada</Badge>;
  }
  if (item.status === "error") {
    return <Badge variant="destructive">Error</Badge>;
  }
  if (item.status === "importing") {
    return <Badge variant="secondary">Importando...</Badge>;
  }
  return <Badge variant="outline">Pendiente</Badge>;
}

export function ImportPreviewRow({ item }: ImportPreviewRowProps) {
  const { row } = item;

  return (
    <TableRow>
      <TableCell>{item.invoiceNumber ?? row.number ?? "Auto"}</TableCell>
      <TableCell>{formatDisplayDate(row.serviceDate)}</TableCell>
      <TableCell>{row.concept}</TableCell>
      <TableCell>{row.clientName}</TableCell>
      <TableCell>{formatMoney(row.price)}</TableCell>
      <TableCell>
        {row.irpfRate != null && row.irpfRate > 0 ? `${row.irpfRate}%` : "—"}
      </TableCell>
      <TableCell>{formatMoney(row.total)}</TableCell>
      <TableCell>{row.paymentMethod}</TableCell>
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
