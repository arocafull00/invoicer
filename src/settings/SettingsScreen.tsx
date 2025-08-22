import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadUserLogo } from "@/shared/api/services/logos";
import { useSettingsStore } from "@/shared/lib/stores";

export const SettingsPage: React.FC = () => {
  const { settings, update, setLogoUrl } = useSettingsStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadUserLogo(file);
      setLogoUrl(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-[#A1A1AA]">
          Gestiona la configuración de tu cuenta y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Identidad</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-white">Logo</Label>
              <div className="flex items-center justify-center">
                <label className="w-full h-40 rounded-xl border-2 border-dashed border-[#654DD4] bg-[#FFFFFF14]/50 flex items-center justify-center cursor-pointer">
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  {settings?.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="max-h-36 object-contain" />
                  ) : (
                    <span className="text-[#A1A1AA]">Añadir logo</span>
                  )}
                </label>
              </div>
              {isUploading && (
                <p className="text-sm text-[#A1A1AA]">Subiendo...</p>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Facturación</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-currency" className="text-white">
                Moneda por defecto
              </Label>
              <Select defaultValue={settings?.default_currency ?? "eur"} onValueChange={(v: "eur" | "usd" | "gbp") => update({ default_currency: v })}>
                <SelectTrigger className="bg-[#0D0D0D] border-[#FFFFFF14] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0D0D0D] border-[#FFFFFF14]">
                  <SelectItem
                    value="eur"
                    className="text-white hover:bg-[#FFFFFF14]"
                  >
                    EUR (€)
                  </SelectItem>
                  <SelectItem
                    value="usd"
                    className="text-white hover:bg-[#FFFFFF14]"
                  >
                    USD ($)
                  </SelectItem>
                  <SelectItem
                    value="gbp"
                    className="text-white hover:bg-[#FFFFFF14]"
                  >
                    GBP (£)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-format" className="text-white">
                Formato de fecha
              </Label>
              <Select defaultValue={settings?.date_format ?? "dd/mm/yyyy"} onValueChange={(v: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd") => update({ date_format: v })}>
                <SelectTrigger className="bg-[#0D0D0D] border-[#FFFFFF14] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0D0D0D] border-[#FFFFFF14]">
                  <SelectItem
                    value="dd/mm/yyyy"
                    className="text-white hover:bg-[#FFFFFF14]"
                  >
                    DD/MM/YYYY
                  </SelectItem>
                  <SelectItem
                    value="mm/dd/yyyy"
                    className="text-white hover:bg-[#FFFFFF14]"
                  >
                    MM/DD/YYYY
                  </SelectItem>
                  <SelectItem
                    value="yyyy-mm-dd"
                    className="text-white hover:bg-[#FFFFFF14]"
                  >
                    YYYY-MM-DD
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-[#7F5AF0] text-white hover:bg-[#654DD4]" disabled>
              Guardado automáticamente
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
