import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ImportSetupSelectOption = {
  value: string;
  label: string;
};

type ImportSetupSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: ImportSetupSelectOption[];
  actionLabel: string;
  actionTo: string;
  emptyMessage: string;
};

export function ImportSetupSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  actionLabel,
  actionTo,
  emptyMessage,
}: ImportSetupSelectProps) {
  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card/20 p-4">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger className="bg-card border-border text-foreground">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" asChild className="w-full shrink-0 sm:w-auto">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      </div>
      {options.length === 0 ? (
        <p className="text-xs text-destructive">{emptyMessage}</p>
      ) : null}
    </div>
  );
}
