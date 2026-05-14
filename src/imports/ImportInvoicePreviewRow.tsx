import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { FacturaImportRow } from "@/imports/ingresosAiResponseSchema";

function fieldHint(
  fe: Record<string, string> | undefined,
  key: string,
): string | undefined {
  if (!fe) return undefined;
  return fe[key];
}

type Props = {
  idx: number;
  item: FacturaImportRow;
  onPatch: (idx: number, patch: Record<string, unknown>) => void;
  onRemove: (idx: number) => void;
};

export function ImportInvoicePreviewRow({
  idx,
  item,
  onPatch,
  onRemove,
}: Props) {
  const invDateHint = fieldHint(item.field_errors, "invoice_date");
  const svcDateHint = fieldHint(item.field_errors, "service_date");
  const numHint = fieldHint(item.field_errors, "number");
  const clientHint = fieldHint(item.field_errors, "client_name");
  const conceptHint = fieldHint(item.field_errors, "concept");
  const baseHint = fieldHint(item.field_errors, "base_amount");
  const nifHint = fieldHint(item.field_errors, "client_nif");
  const irpfPHint = fieldHint(item.field_errors, "irpf_percent");
  const irpfAHint = fieldHint(item.field_errors, "irpf_amount");

  return (
    <TableRow className="border-b border-border align-top">
      <TableCell className="py-3 px-2">Factura</TableCell>
      <TableCell className="py-3 px-2 min-w-[280px]">
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Fecha factura"
            value={item.invoice_date}
            onChange={(e) => onPatch(idx, { invoice_date: e.target.value })}
            className="bg-card border-border text-foreground"
          />
          <Input
            placeholder="Fecha servicio"
            value={item.service_date}
            onChange={(e) => onPatch(idx, { service_date: e.target.value })}
            className="bg-card border-border text-foreground"
          />
          {invDateHint ? (
            <p className="text-xs text-destructive">{invDateHint}</p>
          ) : null}
          {svcDateHint ? (
            <p className="text-xs text-destructive">{svcDateHint}</p>
          ) : null}
        </div>
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
      <TableCell className="py-3 px-2 min-w-[140px]">
        <Input
          value={item.concept}
          onChange={(e) => onPatch(idx, { concept: e.target.value })}
          className="bg-card border-border text-foreground"
        />
        {conceptHint ? (
          <p className="text-xs text-destructive mt-1">{conceptHint}</p>
        ) : null}
      </TableCell>
      <TableCell className="py-3 px-2 min-w-[260px]">
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Nº"
            value={item.number}
            onChange={(e) => onPatch(idx, { number: e.target.value })}
            className="bg-card border-border text-foreground"
          />
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Base"
            value={String(item.base_amount)}
            onChange={(e) => {
              const n = Number(e.target.value.replace(",", "."));
              onPatch(idx, {
                base_amount: Number.isFinite(n) ? n : 0,
              });
            }}
            className="bg-card border-border text-foreground"
          />
          <Input
            placeholder="NIF"
            value={item.client_nif ?? ""}
            onChange={(e) =>
              onPatch(idx, {
                client_nif: e.target.value.trim() || null,
              })
            }
            className="bg-card border-border text-foreground"
          />
          <Input
            type="text"
            inputMode="decimal"
            placeholder="IRPF %"
            value={item.irpf_percent == null ? "" : String(item.irpf_percent)}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (!raw) {
                onPatch(idx, { irpf_percent: null });
                return;
              }
              const n = Number(raw.replace(",", "."));
              if (Number.isFinite(n)) onPatch(idx, { irpf_percent: n });
            }}
            className="bg-card border-border text-foreground"
          />
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Importe IRPF"
            value={item.irpf_amount == null ? "" : String(item.irpf_amount)}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (!raw) {
                onPatch(idx, { irpf_amount: null });
                return;
              }
              const n = Number(raw.replace(",", "."));
              if (Number.isFinite(n)) onPatch(idx, { irpf_amount: n });
            }}
            className="bg-card border-border text-foreground"
          />
          <Input
            placeholder="Forma de pago (texto)"
            value={item.payment_method_raw ?? ""}
            onChange={(e) =>
              onPatch(idx, {
                payment_method_raw:
                  e.target.value.trim() || null,
              })
            }
            className="bg-card border-border text-foreground"
          />
          {numHint ? (
            <p className="text-xs text-destructive">{numHint}</p>
          ) : null}
          {baseHint ? (
            <p className="text-xs text-destructive">{baseHint}</p>
          ) : null}
          {nifHint ? (
            <p className="text-xs text-destructive">{nifHint}</p>
          ) : null}
          {irpfPHint ? (
            <p className="text-xs text-destructive">{irpfPHint}</p>
          ) : null}
          {irpfAHint ? (
            <p className="text-xs text-destructive">{irpfAHint}</p>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="py-3 px-2 text-right">
        <Button variant="destructive" size="sm" onClick={() => onRemove(idx)}>
          Eliminar
        </Button>
      </TableCell>
    </TableRow>
  );
}
