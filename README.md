# Invoicer - Sistema de Facturación Moderno

Una aplicación de facturación moderna construida con React, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- **Autenticación completa** con Supabase Auth
- **Dashboard moderno** con navegación lateral
- **Wizard de creación de facturas** en 5 pasos
- **Exportación a CSV** y **generación de PDF**
- **Diseño responsive** con Tailwind CSS
- **Estado global** con Zustand
- **Tipado estricto** con TypeScript

## 🛠️ Tecnologías

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Estado**: Zustand
- **Rutas**: React Router DOM v6
- **Backend**: Supabase (Auth + Database)
- **PDF**: pdf-lib
- **Iconos**: Lucide React
- **Build**: Vite

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd invoicer
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App principal y providers
│   ├── providers.tsx
│   └── router.tsx
├── components/             # Componentes reutilizables
│   ├── Autocomplete.tsx
│   ├── DatePicker.tsx
│   ├── DashboardLayout.tsx
│   ├── PDFButton.tsx
│   ├── RequireAuth.tsx
│   └── Stepper.tsx
├── hooks/                  # Hooks personalizados
│   ├── useAuth.ts
│   └── useWizardNav.ts
├── lib/                    # Utilidades y configuración
│   ├── csv.ts
│   ├── helpers.ts
│   ├── pdf.ts
│   ├── stores.ts
│   └── supabase.ts
├── pages/                  # Páginas de la aplicación
│   ├── login/
│   ├── invoices/
│   │   ├── index.tsx
│   │   └── Wizard/
│   │       ├── index.tsx
│   │       ├── StepConsultant.tsx
│   │       ├── StepClient.tsx
│   │       ├── StepDates.tsx
│   │       ├── StepDetails.tsx
│   │       └── StepPayment.tsx
│   └── settings/
└── types/                  # Definiciones de tipos
    └── index.ts
```

## 🎨 Paleta de Colores

```css
primary: #7F5AF0
background: #0D0D0D
accent: #654DD4
text: #FFFFFF
textMedium: #A1A1AA
surface: #FFFFFF14
```

## 🔧 Funcionalidades

### Autenticación
- Login/Registro con email y contraseña
- Protección de rutas con `RequireAuth`
- Gestión de sesión con Supabase

### Dashboard
- Navegación lateral con sidebar
- Vista de facturas con tabla responsive
- Búsqueda y filtrado de facturas
- Exportación a CSV

### Wizard de Facturas
1. **Consultor**: Selección con autocompletado
2. **Cliente**: Selección con autocompletado
3. **Fechas**: Período de trabajo
4. **Detalles**: Descripción y total
5. **Pago**: Instrucciones de pago

### Generación de PDF
- Diseño personalizado con la paleta de colores
- Información completa de la factura
- Descarga automática

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- **Desktop**: Layout completo con sidebar
- **Tablet**: Sidebar colapsable
- **Mobile**: Navegación adaptada

## 🚀 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run lint` - Linting del código
- `npm run preview` - Preview del build

## 🔮 Próximas Características

- [ ] Integración completa con Supabase
- [ ] Plantillas de facturas personalizables
- [ ] Notificaciones por email
- [ ] Dashboard con estadísticas
- [ ] API REST para integraciones
- [ ] Modo offline
- [ ] Multiidioma

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles.
