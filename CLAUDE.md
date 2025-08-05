# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

### Database
- Database setup SQL is available in `database-setup.sql`
- Database migrations are stored in `migrations/` directory

## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom color palette
- **State Management**: Zustand stores
- **Routing**: React Router DOM v7
- **Backend**: Supabase (authentication + database)
- **PDF Generation**: pdf-lib
- **Icons**: Lucide React

### Color Palette
The application uses a custom dark theme with these colors:
- Primary: `#7F5AF0` (purple)
- Background: `#0D0D0D` (dark)
- Accent: `#654DD4` (secondary purple)
- Text: `#FFFFFF` (white)
- TextMedium: `#A1A1AA` (gray)
- Surface: `#FFFFFF14` (translucent)

### State Management (Zustand)
- `useAuthStore` - User authentication state and session
- `useInvoiceStore` - Invoice data, wizard draft, and entity lists (consultants, clients, payment instructions)

### Key Components Structure
```
src/
├── app/           # App router and providers
├── components/    # Reusable UI components (Autocomplete, DatePicker, Stepper, etc.)
├── hooks/         # Custom hooks (useAuth, useWizardNav)
├── lib/           # Utilities (supabase, csv export, pdf generation, stores)
├── pages/         # Route components
│   ├── invoices/  # Invoice management
│   │   └── Wizard/ # 5-step invoice creation wizard
│   ├── login/     # Authentication
│   └── settings/  # User settings
└── types/         # TypeScript type definitions
```

### Invoice Creation Wizard
5-step process:
1. **StepConsultant** - Select/create consultant with autocomplete
2. **StepClient** - Select/create client with autocomplete  
3. **StepDates** - Define work period dates
4. **StepDetails** - Service description and total amount
5. **StepPayment** - Payment instructions

### Authentication
- Supports email/password and Google OAuth via Supabase Auth
- Protected routes use `RequireAuth` wrapper component
- Auth state managed in `useAuthStore`

### Data Export
- **CSV**: Mass export of all invoices via `lib/csv.ts`
- **PDF**: Individual invoice PDFs via `lib/pdf.ts` using pdf-lib

### Database Entities
- `consultants` - Service providers
- `clients` - Invoice recipients  
- `payment_instructions` - Payment details and terms
- `invoices` - Main invoice records with relationships

## Development Guidelines

### Code Style
- Always use Tailwind CSS for styling
- Use the custom color palette defined above
- Reuse existing components whenever possible
- Use TypeScript with strict typing from `src/types/`
- Install dependencies with `npm install <package>`, never add to package.json first

### Restrictions
- Never create tests, documentation, or example components
- Never launch/run the project unless explicitly requested
- Always use existing UI patterns and component structure