import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import type { IngresoImportRow } from "@/imports/ingresosAiResponseSchema";

type IncomePaymentMethod = IngresoImportRow["payment_method"];

function fieldHint(
  fe: Record<string, string> | undefined,
  key: string,
): string | undefined {
  if (!fe) return undefined;
  return fe[key];
}

type Props = {
  idx: number;
  item: IngresoImportRow;
  onPatch: (idx: number, patch: Record<string, unknown>) => void;
  onRemove: (idx: number) => void;
};

export function ImportIncomePreviewRow({
  idx,
  item,
  onPatch,
  onRemove,
}: Props) {
  const dateHint = fieldHint(item.field_errors, "date");
  const clientHint = fieldHint(item.field_errors, "client_name");
  const conceptHint = fieldHint(item.field_errors, "concept");
  const amountHint = fieldHint(item.field_errors, "amount");
  const pmHint = fieldHint(item.field_errors, "payment_method");

  return (
    <TableRow className="border-b border-border align-top">
      <TableCell className="py-3 px-2">Ingreso</TableCell>
      <TableCell className="py-3 px-2 min-w-[140px]">
        <Input
          value={item.date}
          onChange={(e) => onPatch(idx, { date: e.target.value })}
          className="bg-card border-border text-foreground"
        />
        {dateHint ? (
          <p className="text-xs text-destructive mt-1">{dateHint}</p>
        ) : null}
      </TableCell>
      <TableCell className="py-3 px-2 min-w-[140px]">
        <Input
          value={item.client_name}
          onChange={(e) => onPatch(idx, { client_name: e.target.value })}
          className="bg-card border-border text-foreground"
        />
        {clientHint ? (
          <p className="text-xs text-destructive mt-1">{clientHint}</p>
        ) : null}
      </TableCell>
      <TableCell className="py-3 px-2 min-w-[160px]">
        <Input
          value={item.concept}
          onChange={(e) => onPatch(idx, { concept: e.target.value })}
          className="bg-card border-border text-foreground"
        />
        {conceptHint ? (
          <p className="text-xs text-destructive mt-1">{conceptHint}</p>
        ) : null}
      </TableCell>
      <TableCell className="py-3 px-2 min-w-[120px]">
        <Input
          type="text"
          inputMode="decimal"
          value={String(item.amount)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(",", "."));
            onPatch(idx, { amount: Number.isFinite(n) ? n : 0 });
          }}
          className="bg-card border-border text-foreground"
        />
        {amountHint ? (
          <p className="text-xs text-destructive mt-1">{amountHint}</p>
        ) : null}
      </TableCell>
      <TableCell className="py-3 px-2 min-w-[140px]">
        <Select
          value={item.payment_method}
          onValueChange={(v: IncomePaymentMethod) =>
            onPatch(idx, { payment_method: v })
          }
        >
          <SelectTrigger className="bg-card border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">cash</SelectItem>
            <SelectItem value="transfer">transfer</SelectItem>
            <SelectItem value="bizum">bizum</SelectItem>
          </SelectContent>
        </Select>
        {pmHint ? (
          <p className="text-xs text-destructive mt-1">{pmHint}</p>
        ) : null}
      </TableCell>
      <TableCell className="py-3 px-2 text-right">
        <Button variant="destructive" size="sm" onClick={() => onRemove(idx)}>
          Eliminar
        </Button>
      </TableCell>
    </TableRow>
  );
}
