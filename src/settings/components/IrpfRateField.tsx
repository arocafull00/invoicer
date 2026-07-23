import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { SettingsField } from "@/settings/components/SettingsField";
import { useSettingsStore } from "@/shared/lib/stores";

const DEFAULT_IRPF_RATE = 20;

function normalizeIrpfRate(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  if (value < 0 || value > 100) return null;
  return Number(value.toFixed(2));
}

export function IrpfRateField() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const savedRate = settings?.irpf_rate ?? DEFAULT_IRPF_RATE;
  const [value, setValue] = useState(String(savedRate));

  useEffect(() => {
    setValue(String(savedRate));
  }, [savedRate]);

  const persist = async (raw: string) => {
    const parsed = normalizeIrpfRate(Number(raw.replace(",", ".")));
    if (parsed == null) {
      setValue(String(savedRate));
      return;
    }

    setValue(String(parsed));
    if (parsed === savedRate) return;

    try {
      await update({ irpf_rate: parsed });
    } catch {
      setValue(String(savedRate));
    }
  };

  return (
    <SettingsField
      id="irpf-rate"
      label="Tipo IRPF trimestral (%)"
      description="Porcentaje del modelo 130 sobre el beneficio (ingresos − gastos)"
    >
      <div className="relative">
        <Input
          id="irpf-rate"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.01}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => void persist(value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.currentTarget.blur();
          }}
          className="h-11 w-full bg-input/40 border-border text-foreground pr-10"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          %
        </span>
      </div>
    </SettingsField>
  );
}
