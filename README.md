# Invoicer - Sistema de Facturación Moderno

Una aplicación web moderna para gestionar facturas de manera profesional, construida con React, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- **Autenticación**: Login con email/password y Google OAuth
- **Gestión de Facturas**: Crear, ver y exportar facturas
- **Wizard Intuitivo**: Proceso paso a paso para crear facturas
- **Exportación**: PDF y CSV con formato profesional
- **Diseño Responsivo**: Funciona en desktop y móvil
- **Tema Oscuro**: Interfaz moderna con tema oscuro por defecto

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS con paleta de colores personalizada
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Backend**: Supabase (Auth + Database)
- **PDF Generation**: pdf-lib
- **Icons**: Lucide React

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone <repository-url>
   cd invoicer
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Configura Supabase**

   ### Configuración de la Base de Datos
   
   En tu proyecto de Supabase, crea las siguientes tablas:

   ```sql
   -- Tabla de usuarios (se crea automáticamente con Supabase Auth)
   -- auth.users

   -- Tabla de consultores
   CREATE TABLE consultants (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     address TEXT NOT NULL,
     city TEXT NOT NULL,
     country TEXT NOT NULL,
     nif TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabla de clientes
   CREATE TABLE clients (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     address TEXT NOT NULL,
     city TEXT NOT NULL,
     country TEXT NOT NULL,
     company_number TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabla de instrucciones de pago
   CREATE TABLE payment_instructions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     account_holder TEXT NOT NULL,
     iban TEXT NOT NULL,
     payment_method TEXT NOT NULL,
     payment_terms TEXT NOT NULL,
     additional_data TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabla de facturas
   CREATE TABLE invoices (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     number TEXT NOT NULL,
     created_date DATE NOT NULL,
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     consultant_id UUID REFERENCES consultants(id),
     client_id UUID REFERENCES clients(id),
     payment_instructions_id UUID REFERENCES payment_instructions(id),
     description TEXT NOT NULL,
     total DECIMAL(10,2) NOT NULL,
     vat_exempt BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   ### Configuración de Google OAuth

   1. Ve a tu proyecto de Supabase Dashboard
   2. Navega a **Authentication** > **Providers**
   3. Habilita **Google**
   4. Configura las credenciales de Google:
      - **Client ID**: Tu Google OAuth Client ID
      - **Client Secret**: Tu Google OAuth Client Secret
   5. Añade las URLs de redirección:
      - `https://tu-proyecto.supabase.co/auth/v1/callback`
      - `http://localhost:5173/auth/callback` (para desarrollo)

   ### Configuración de Google Cloud Console

   1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
   2. Crea un nuevo proyecto o selecciona uno existente
   3. Habilita la API de Google+ 
   4. Ve a **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
   5. Configura las URLs autorizadas:
      - **Authorized JavaScript origins**:
        - `http://localhost:5173` (desarrollo)
        - `https://tu-dominio.com` (producción)
      - **Authorized redirect URIs**:
        - `https://tu-proyecto.supabase.co/auth/v1/callback`

5. **Ejecuta el proyecto**
   ```bash
   npm run dev
   ```

## 🎨 Paleta de Colores

La aplicación usa una paleta de colores personalizada:

- **Primary**: `#7F5AF0` (Morado principal)
- **Background**: `#0D0D0D` (Fondo oscuro)
- **Accent**: `#654DD4` (Morado secundario)
- **Text**: `#FFFFFF` (Texto blanco)
- **TextMedium**: `#A1A1AA` (Texto medio)
- **Surface**: `#FFFFFF14` (Superficies)

## 📁 Estructura del Proyecto

```
src/
├── app/                 # Configuración de la aplicación
│   ├── providers.tsx    # Proveedores de contexto
│   └── router.tsx       # Configuración de rutas
├── components/          # Componentes reutilizables
│   ├── Autocomplete.tsx
│   ├── DashboardLayout.tsx
│   ├── DatePicker.tsx
│   ├── PDFButton.tsx
│   ├── RequireAuth.tsx
│   └── Stepper.tsx
├── hooks/              # Hooks personalizados
│   ├── useAuth.ts      # Hook de autenticación
│   └── useWizardNav.ts # Hook de navegación del wizard
├── lib/                # Utilidades y configuración
│   ├── csv.ts          # Exportación CSV
│   ├── helpers.ts      # Funciones auxiliares
│   ├── pdf.ts          # Generación PDF
│   ├── stores.ts       # Stores de Zustand
│   └── supabase.ts     # Configuración de Supabase
├── pages/              # Páginas de la aplicación
│   ├── invoices/       # Páginas relacionadas con facturas
│   │   ├── index.tsx   # Lista de facturas
│   │   └── Wizard/     # Wizard de creación
│   ├── login/          # Página de login
│   └── settings/       # Página de configuración
├── types/              # Definiciones de tipos TypeScript
│   └── index.ts
└── styles/             # Estilos globales
    └── index.css
```

## 🔐 Autenticación

La aplicación soporta dos métodos de autenticación:

1. **Email/Password**: Registro e inicio de sesión tradicional
2. **Google OAuth**: Inicio de sesión con cuenta de Google

### Flujo de Autenticación

1. El usuario accede a `/login`
2. Puede elegir entre:
   - Continuar con Google (OAuth)
   - Registrarse con email/password
   - Iniciar sesión con email/password
3. Después de la autenticación exitosa, es redirigido a `/invoices`

## 📄 Gestión de Facturas

### Crear Factura

1. Navega a `/invoices/new`
2. Completa el wizard de 5 pasos:
   - **Paso 1**: Seleccionar/Crear consultor
   - **Paso 2**: Seleccionar/Crear cliente
   - **Paso 3**: Definir fechas de trabajo
   - **Paso 4**: Detalles del servicio y monto
   - **Paso 5**: Instrucciones de pago
3. La factura se guarda automáticamente

### Exportar Facturas

- **PDF**: Descarga individual por factura
- **CSV**: Exportación masiva de todas las facturas

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Deploy automático en cada push

### Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. Build command: `npm run build`
4. Publish directory: `dist`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de Supabase
2. Verifica que las variables de entorno estén configuradas correctamente
3. Asegúrate de que Google OAuth esté configurado en Supabase
4. Abre un issue en el repositorio

---

Desarrollado con ❤️ usando tecnologías modernas
