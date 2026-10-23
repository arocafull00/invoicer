import { SelectItem } from "@/components/ui/select";
import type { Client } from "@/shared/types";

export function ClientSelectItem({ client }: { client: Client }) {
  return (
    <SelectItem value={client.id} className="text-popover-foreground">
      {client.name}
    </SelectItem>
  );
}
