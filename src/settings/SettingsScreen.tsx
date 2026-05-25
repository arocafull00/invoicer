import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/shared/lib/stores";
import { useTheme } from "next-themes";
import { APP_LOGO_URL } from "@/shared/lib/appLogo";

export const SettingsPage: React.FC = () => {
  const { settings, update } = useSettingsStore();
  const { theme, setTheme, systemTheme } = useTheme();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu cuenta y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Identidad</h2>
          <div className="space-y-2">
            <Label className="text-card-foreground">Logo</Label>
            <div className="flex items-center justify-center w-full h-40 rounded-xl border border-border bg-accent/50 p-4">
              <img src={APP_LOGO_URL} alt="Logo" className="max-h-36 object-contain" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Facturación</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-currency" className="text-card-foreground">
                Moneda por defecto
              </Label>
              <Select defaultValue={settings?.default_currency ?? "eur"} onValueChange={(v: "eur" | "usd" | "gbp") => update({ default_currency: v })}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem
                    value="eur"
                    className="text-popover-foreground"
                  >
                    EUR (€)
                  </SelectItem>
                  <SelectItem
                    value="usd"
                    className="text-popover-foreground"
                  >
                    USD ($)
                  </SelectItem>
                  <SelectItem
                    value="gbp"
                    className="text-popover-foreground"
                  >
                    GBP (£)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-format" className="text-card-foreground">
                Formato de fecha
              </Label>
              <Select defaultValue={settings?.date_format ?? "dd/mm/yyyy"} onValueChange={(v: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd") => update({ date_format: v })}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem
                    value="dd/mm/yyyy"
                    className="text-popover-foreground"
                  >
                    DD/MM/YYYY
                  </SelectItem>
                  <SelectItem
                    value="mm/dd/yyyy"
                    className="text-popover-foreground"
                  >
                    MM/DD/YYYY
                  </SelectItem>
                  <SelectItem
                    value="yyyy-mm-dd"
                    className="text-popover-foreground"
                  >
                    YYYY-MM-DD
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-palette" className="text-card-foreground">
                Paleta del PDF
              </Label>
              <Select
                defaultValue={settings?.pdf_color_palette ?? "violet"}
                onValueChange={(v: "violet" | "blue" | "emerald" | "rose") =>
                  update({ pdf_color_palette: v })
                }
              >
                <SelectTrigger id="invoice-palette" className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="violet" className="text-popover-foreground">Violeta</SelectItem>
                  <SelectItem value="blue" className="text-popover-foreground">Azul</SelectItem>
                  <SelectItem value="emerald" className="text-popover-foreground">Esmeralda</SelectItem>
                  <SelectItem value="rose" className="text-popover-foreground">Rosa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled>
              Guardado automáticamente
            </Button>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Apariencia</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme-switch" className="text-card-foreground">Modo oscuro</Label>
                <p className="text-sm text-muted-foreground">Activa el modo oscuro o usa el sistema</p>
              </div>
              <Switch
                id="theme-switch"
                checked={(theme ?? systemTheme) === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-select" className="text-card-foreground">Preferencia de tema</Label>
              <Select
                value={theme ?? "system"}
                onValueChange={(v: "light" | "dark" | "system") => setTheme(v)}
              >
                <SelectTrigger id="theme-select" className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="light" className="text-popover-foreground">Claro</SelectItem>
                  <SelectItem value="dark" className="text-popover-foreground">Oscuro</SelectItem>
                  <SelectItem value="system" className="text-popover-foreground">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
