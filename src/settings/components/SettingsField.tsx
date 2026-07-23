import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface SettingsFieldProps {
  id: string;
  label: string;
  description?: string;
  children: ReactNode;
}

export function SettingsField({
  id,
  label,
  description,
  children,
}: SettingsFieldProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium text-card-foreground">
          {label}
        </Label>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
