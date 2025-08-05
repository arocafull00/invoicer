import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Configuración</h1>
        <p className="text-textMedium">
          Gestiona la configuración de tu cuenta y aplicación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Perfil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Nombre
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                className="input-field w-full"
                placeholder="tu@email.com"
              />
            </div>
            <button className="btn-primary">
              Guardar cambios
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Seguridad</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Contraseña actual
              </label>
              <input
                type="password"
                className="input-field w-full"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Nueva contraseña
              </label>
              <input
                type="password"
                className="input-field w-full"
                placeholder="••••••••"
              />
            </div>
            <button className="btn-primary">
              Cambiar contraseña
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Notificaciones</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text">Notificaciones por email</span>
              <input
                type="checkbox"
                className="w-4 h-4 text-primary bg-surface border-surface rounded focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text">Recordatorios de pago</span>
              <input
                type="checkbox"
                className="w-4 h-4 text-primary bg-surface border-surface rounded focus:ring-primary"
              />
            </div>
            <button className="btn-primary">
              Guardar preferencias
            </button>
          </div>
        </div>

        {/* Billing Section */}
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Facturación</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Moneda por defecto
              </label>
              <select className="input-field w-full">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Formato de fecha
              </label>
              <select className="input-field w-full">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <button className="btn-primary">
              Guardar configuración
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Exportación</h2>
          <div className="space-y-4">
            <button className="btn-secondary w-full">
              Exportar todos los datos
            </button>
            <button className="btn-secondary w-full">
              Descargar plantillas
            </button>
            <button className="btn-secondary w-full">
              Configurar backup automático
            </button>
          </div>
        </div>

        {/* API Section */}
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text mb-4">API</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                API Key
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="sk_..."
                readOnly
              />
            </div>
            <button className="btn-primary">
              Regenerar API Key
            </button>
            <button className="btn-secondary w-full">
              Ver documentación
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-textMedium">
          🚧 Esta sección está en desarrollo. Próximamente más opciones de configuración.
        </p>
      </div>
    </div>
  );
}; 