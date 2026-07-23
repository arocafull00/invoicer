import { Check } from "lucide-react";

export function AutosaveStatus() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      <Check className="size-3.5" aria-hidden />
      <span>Guardado automáticamente</span>
    </div>
  );
}
