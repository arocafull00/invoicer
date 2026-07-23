import { SelectItem } from "@/components/ui/select";
import type { ExpenseType } from "@/shared/types";

export function ExpenseTypeSelectItem({ type }: { type: ExpenseType }) {
  return (
    <SelectItem
      value={type.id}
      className="text-popover-foreground"
    >
      {type.name}
    </SelectItem>
  );
}
