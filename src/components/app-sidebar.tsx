import Link from 'next/link';
import { FileText, Home, Settings, UserCog, Users, CreditCard, Receipt } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { SidebarNavSection } from '@/components/SidebarNavSection';
import { SidebarUserButton } from '@/components/SidebarUserButton';
import { APP_LOGO_URL } from '@/shared/lib/appLogo';

type NavItem = {
  title: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: 'General',
    items: [{ title: 'Dashboard', to: '/dashboard', icon: Home }],
  },
  {
    label: 'Facturación',
    items: [
      { title: 'Facturas', to: '/invoices', icon: FileText },
      { title: 'Gastos', to: '/expenses', icon: Receipt },
      { title: 'Datos de facturación', to: '/consultants', icon: UserCog },
      { title: 'Métodos de pago', to: '/payments', icon: CreditCard },
      { title: 'Clientes', to: '/clients', icon: Users },
    ],
  },
  {
    label: 'Cuenta',
    items: [{ title: 'Configuración', to: '/settings', icon: Settings }],
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1.5">
          <img src={APP_LOGO_URL} alt="Invoicer logo" className="size-8 object-contain" />
          <h1 className="text-xl font-semibold text-sidebar-primary">Invoicer</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navSections.map((section) => (
          <SidebarNavSection
            key={section.label}
            label={section.label}
            items={section.items}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
