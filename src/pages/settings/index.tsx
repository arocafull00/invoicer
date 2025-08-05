import React from 'react';
import { Settings, User, Shield, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text">Configuración</h1>
        <p className="text-textMedium mt-1">
          Gestiona las preferencias de tu cuenta
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="bg-surface rounded-lg border border-surface/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-medium text-text">Perfil</h3>
          </div>
          <p className="text-textMedium mb-4">
            Gestiona tu información personal y preferencias de perfil
          </p>
          <button className="btn-secondary w-full">
            Configurar perfil
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-surface rounded-lg border border-surface/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-medium text-text">Seguridad</h3>
          </div>
          <p className="text-textMedium mb-4">
            Cambia tu contraseña y configura la autenticación de dos factores
          </p>
          <button className="btn-secondary w-full">
            Configurar seguridad
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-surface rounded-lg border border-surface/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-medium text-text">Notificaciones</h3>
          </div>
          <p className="text-textMedium mb-4">
            Configura cómo y cuándo recibir notificaciones
          </p>
          <button className="btn-secondary w-full">
            Configurar notificaciones
          </button>
        </div>

        {/* Invoice Settings */}
        <div className="bg-surface rounded-lg border border-surface/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-medium text-text">Facturación</h3>
          </div>
          <p className="text-textMedium mb-4">
            Configura plantillas, numeración y formato de facturas
          </p>
          <button className="btn-secondary w-full">
            Configurar facturación
          </button>
        </div>

        {/* Data Export */}
        <div className="bg-surface rounded-lg border border-surface/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-medium text-text">Exportación</h3>
          </div>
          <p className="text-textMedium mb-4">
            Exporta tus datos y configuración
          </p>
          <button className="btn-secondary w-full">
            Exportar datos
          </button>
        </div>

        {/* API Settings */}
        <div className="bg-surface rounded-lg border border-surface/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-medium text-text">API</h3>
          </div>
          <p className="text-textMedium mb-4">
            Gestiona claves de API y webhooks
          </p>
          <button className="btn-secondary w-full">
            Configurar API
          </button>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-text mb-2">
          🚧 Configuración en desarrollo
        </h3>
        <p className="text-textMedium">
          Esta sección estará disponible próximamente. Por ahora, puedes gestionar tus facturas desde la página principal.
        </p>
      </div>
    </div>
  );
}; 