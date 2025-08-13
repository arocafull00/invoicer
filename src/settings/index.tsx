import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-[#A1A1AA]">Gestiona la configuración de tu cuenta y preferencias</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil */}
        <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
          <h2 className="text-xl font-semibold text-white mb-4">Perfil</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-white">Nombre</Label>
              <Input
                id="profile-name"
                defaultValue="Adrián Rocafull"
                className="bg-[#0D0D0D] border-[#FFFFFF14] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email" className="text-white">Email</Label>
              <Input
                id="profile-email"
                type="email"
                defaultValue="adrianrocafull@gmail.com"
                className="bg-[#0D0D0D] border-[#FFFFFF14] text-white"
              />
            </div>
            <Button className="w-full bg-[#7F5AF0] text-white hover:bg-[#654DD4]">
              Guardar cambios
            </Button>
          </div>
        </Card>

        {/* Seguridad */}
        <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
          <h2 className="text-xl font-semibold text-white mb-4">Seguridad</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-white">Contraseña actual</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                className="bg-[#0D0D0D] border-[#FFFFFF14] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-white">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                className="bg-[#0D0D0D] border-[#FFFFFF14] text-white"
              />
            </div>
            <Button className="w-full bg-[#7F5AF0] text-white hover:bg-[#654DD4]">
              Cambiar contraseña
            </Button>
          </div>
        </Card>

        {/* Notificaciones */}
        <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
          <h2 className="text-xl font-semibold text-white mb-4">Notificaciones</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white">Notificaciones por email</Label>
                <p className="text-sm text-[#A1A1AA]">Recibe notificaciones sobre tus facturas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white">Recordatorios de pago</Label>
                <p className="text-sm text-[#A1A1AA]">Notificaciones sobre facturas pendientes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="w-full bg-[#7F5AF0] text-white hover:bg-[#654DD4]">
              Guardar preferencias
            </Button>
          </div>
        </Card>

        {/* Facturación */}
        <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
          <h2 className="text-xl font-semibold text-white mb-4">Facturación</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-currency" className="text-white">Moneda por defecto</Label>
              <Select defaultValue="eur">
                <SelectTrigger className="bg-[#0D0D0D] border-[#FFFFFF14] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0D0D0D] border-[#FFFFFF14]">
                  <SelectItem value="eur" className="text-white hover:bg-[#FFFFFF14]">EUR (€)</SelectItem>
                  <SelectItem value="usd" className="text-white hover:bg-[#FFFFFF14]">USD ($)</SelectItem>
                  <SelectItem value="gbp" className="text-white hover:bg-[#FFFFFF14]">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-format" className="text-white">Formato de fecha</Label>
              <Select defaultValue="dd/mm/yyyy">
                <SelectTrigger className="bg-[#0D0D0D] border-[#FFFFFF14] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0D0D0D] border-[#FFFFFF14]">
                  <SelectItem value="dd/mm/yyyy" className="text-white hover:bg-[#FFFFFF14]">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm/dd/yyyy" className="text-white hover:bg-[#FFFFFF14]">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd" className="text-white hover:bg-[#FFFFFF14]">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-[#7F5AF0] text-white hover:bg-[#654DD4]">
              Guardar configuración
            </Button>
          </div>
        </Card>

        {/* Exportación */}
        <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
          <h2 className="text-xl font-semibold text-white mb-4">Exportación</h2>
          <div className="space-y-4">
            <Button variant="outline" className="w-full bg-[#0D0D0D] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]">
              Exportar todos los datos
            </Button>
            <Button variant="outline" className="w-full bg-[#0D0D0D] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]">
              Descargar plantillas
            </Button>
            <Button variant="outline" className="w-full bg-[#0D0D0D] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]">
              Configurar backup automático
            </Button>
          </div>
        </Card>

        {/* API */}
        <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
          <h2 className="text-xl font-semibold text-white mb-4">API</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">API Key</Label>
              <div className="flex gap-2">
                <Input
                  value="sk_live_••••••••••••••••"
                  readOnly
                  className="bg-[#0D0D0D] border-[#FFFFFF14] text-white"
                />
                <Button variant="outline" className="bg-[#0D0D0D] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]">
                  Regenerar
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-[#0D0D0D] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]">
              Ver documentación
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}; 