import { SelectItem } from "@/components/ui/select";
import type { Consultant } from "@/shared/types";

interface ConsultantSelectOptionProps {
  consultant: Consultant;
}

export function ConsultantSelectOption({
  consultant,
}: ConsultantSelectOptionProps) {
  return (
    <SelectItem value={consultant.id}>{consultant.name}</SelectItem>
  );
}
