import type { PaymentInstruction } from "@/shared/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentInstructionForm({
  value,
  onChange,
}: {
  value: Partial<PaymentInstruction>;
  onChange: (v: Partial<PaymentInstruction>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="account_holder">Titular de la cuenta</Label>
        <Input
          id="account_holder"
          value={value.account_holder || ""}
          onChange={(e) =>
            onChange({ ...value, account_holder: e.target.value })
          }
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="iban">IBAN</Label>
        <Input
          id="iban"
          value={value.iban || ""}
          onChange={(e) => onChange({ ...value, iban: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment_method">Método de pago</Label>
        <Input
          id="payment_method"
          value={value.payment_method || ""}
          onChange={(e) =>
            onChange({ ...value, payment_method: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment_terms">Términos de pago</Label>
        <Input
          id="payment_terms"
          value={value.payment_terms || ""}
          onChange={(e) =>
            onChange({ ...value, payment_terms: e.target.value })
          }
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="additional_data">Datos adicionales</Label>
        <Input
          id="additional_data"
          value={value.additional_data || ""}
          onChange={(e) =>
            onChange({ ...value, additional_data: e.target.value })
          }
        />
      </div>
    </div>
  );
}


