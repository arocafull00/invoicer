import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutosaveStatus } from "@/settings/components/AutosaveStatus";
import { CurrencySelectItem } from "@/settings/components/CurrencySelectItem";
import { DateFormatSelectItem } from "@/settings/components/DateFormatSelectItem";
import { PdfPaletteOption } from "@/settings/components/PdfPaletteOption";
import { PdfPaletteSelectItem } from "@/settings/components/PdfPaletteSelectItem";
import { SettingsField } from "@/settings/components/SettingsField";
import { useSettingsStore } from "@/shared/lib/stores";
import type {
  PdfColorPalette,
  SupportedCurrency,
  SupportedDateFormat,
} from "@/shared/types";

const CURRENCY_OPTIONS: {
  value: SupportedCurrency;
  label: string;
  symbol: string;
}[] = [
  { value: "eur", label: "EUR", symbol: "€" },
  { value: "usd", label: "USD", symbol: "$" },
  { value: "gbp", label: "GBP", symbol: "£" },
];

const DATE_FORMAT_OPTIONS: {
  value: SupportedDateFormat;
  label: string;
}[] = [
  { value: "dd/mm/yyyy", label: "DD/MM/YYYY" },
  { value: "mm/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "yyyy-mm-dd", label: "YYYY-MM-DD" },
];

const PDF_PALETTE_OPTIONS: {
  value: PdfColorPalette;
  label: string;
}[] = [
  { value: "violet", label: "Violeta" },
  { value: "blue", label: "Azul" },
  { value: "emerald", label: "Esmeralda" },
  { value: "rose", label: "Rosa" },
];

export function BillingSettingsCard() {
  const { settings, update } = useSettingsStore();
  const currency = settings?.default_currency ?? "eur";
  const dateFormat = settings?.date_format ?? "dd/mm/yyyy";
  const pdfPalette = settings?.pdf_color_palette ?? "violet";

  return (
    <Card className="flex h-full flex-col gap-0">
      <CardHeader className="gap-3 border-b border-border/40 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-xl text-card-foreground">
              Facturación
            </CardTitle>
            <CardDescription>
              Preferencias por defecto para tus facturas y PDFs
            </CardDescription>
          </div>
          <AutosaveStatus />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 pt-5">
        <SettingsField
          id="default-currency"
          label="Moneda por defecto"
          description="Se aplicará al crear nuevas facturas"
        >
          <Select
            value={currency}
            onValueChange={(v: SupportedCurrency) =>
              update({ default_currency: v })
            }
          >
            <SelectTrigger
              id="default-currency"
              className="h-11 w-full bg-input/40 border-border text-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {CURRENCY_OPTIONS.map((option) => (
                <CurrencySelectItem
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  symbol={option.symbol}
                />
              ))}
            </SelectContent>
          </Select>
        </SettingsField>

        <SettingsField
          id="date-format"
          label="Formato de fecha"
          description="Cómo se mostrarán las fechas en documentos"
        >
          <Select
            value={dateFormat}
            onValueChange={(v: SupportedDateFormat) =>
              update({ date_format: v })
            }
          >
            <SelectTrigger
              id="date-format"
              className="h-11 w-full bg-input/40 border-border text-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {DATE_FORMAT_OPTIONS.map((option) => (
                <DateFormatSelectItem
                  key={option.value}
                  value={option.value}
                  label={option.label}
                />
              ))}
            </SelectContent>
          </Select>
        </SettingsField>

        <SettingsField
          id="invoice-palette"
          label="Paleta del PDF"
          description="Color principal del documento generado"
        >
          <Select
            value={pdfPalette}
            onValueChange={(v: PdfColorPalette) =>
              update({ pdf_color_palette: v })
            }
          >
            <SelectTrigger
              id="invoice-palette"
              className="h-11 w-full bg-input/40 border-border text-foreground"
            >
              <SelectValue>
                <PdfPaletteOption
                  value={pdfPalette}
                  label={
                    PDF_PALETTE_OPTIONS.find((o) => o.value === pdfPalette)
                      ?.label ?? "Violeta"
                  }
                />
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {PDF_PALETTE_OPTIONS.map((option) => (
                <PdfPaletteSelectItem
                  key={option.value}
                  value={option.value}
                  label={option.label}
                />
              ))}
            </SelectContent>
          </Select>
        </SettingsField>
      </CardContent>
    </Card>
  );
}
