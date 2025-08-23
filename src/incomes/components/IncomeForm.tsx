import type { Client, Income, IncomePaymentMethod } from "@/shared/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type IncomeFormValue = Partial<Omit<Income, "id" | "user_id">> & {
  client?: Client;
};

export function IncomeForm({
  value,
  onChange,
  clients,
}: {
  value: IncomeFormValue;
  onChange: (v: IncomeFormValue) => void;
  clients: Client[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          type="date"
          value={value.date || ""}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Precio</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={value.amount?.toString() || ""}
          onChange={(e) =>
            onChange({ ...value, amount: Number(e.target.value) })
          }
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input
          id="concept"
          value={value.concept || ""}
          onChange={(e) => onChange({ ...value, concept: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Cliente</Label>
        <Select
          value={value.client?.id || ""}
          onValueChange={(id) =>
            onChange({ ...value, client: clients.find((c) => c.id === id) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Forma de pago</Label>
        <Select
          value={(value.payment_method as string) || ""}
          onValueChange={(v: IncomePaymentMethod) =>
            onChange({ ...value, payment_method: v })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona forma de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="bizum">Bizum</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
