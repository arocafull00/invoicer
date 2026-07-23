import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { BillingSettingsCard } from "@/settings/components/BillingSettingsCard";
import { IdentitySettingsCard } from "@/settings/components/IdentitySettingsCard";

export const SettingsPage: React.FC = () => {
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
        <IdentitySettingsCard />
        <BillingSettingsCard />
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
                <SelectTrigger id="theme-select" className="w-full bg-input border-border text-foreground">
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
