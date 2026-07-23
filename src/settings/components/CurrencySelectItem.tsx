import { SelectItem } from "@/components/ui/select";
import type { SupportedCurrency } from "@/shared/types";

interface CurrencySelectItemProps {
  value: SupportedCurrency;
  label: string;
  symbol: string;
}

export function CurrencySelectItem({
  value,
  label,
  symbol,
}: CurrencySelectItemProps) {
  return (
    <SelectItem value={value} className="text-popover-foreground">
      <span className="flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
          {symbol}
        </span>
        <span>{label}</span>
      </span>
    </SelectItem>
  );
}
