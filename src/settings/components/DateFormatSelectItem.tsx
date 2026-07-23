import { SelectItem } from "@/components/ui/select";
import type { SupportedDateFormat } from "@/shared/types";

interface DateFormatSelectItemProps {
  value: SupportedDateFormat;
  label: string;
}

export function DateFormatSelectItem({
  value,
  label,
}: DateFormatSelectItemProps) {
  return (
    <SelectItem value={value} className="text-popover-foreground">
      {label}
    </SelectItem>
  );
}
