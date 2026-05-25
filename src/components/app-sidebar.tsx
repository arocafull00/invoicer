import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FileText, Home, Settings, UserCog, Users, CreditCard } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { APP_LOGO_URL } from '@/shared/lib/appLogo';

type NavItem = {
  title: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { title: 'Dashboard', to: '/dashboard', icon: Home },
  { title: 'Facturas', to: '/invoices', icon: FileText },
  { title: 'Prestadores del servicio', to: '/consultants', icon: UserCog },
  { title: 'Metodos de pago', to: '/payments', icon: CreditCard },
  { title: 'Clientes', to: '/clients', icon: Users },
  { title: 'Configuración', to: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1.5">
          <img src={APP_LOGO_URL} alt="Invoicer logo" className="size-8 object-contain" />
          <h1 className="text-xl font-semibold text-sidebar-primary">Invoicer</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Aplicación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.to} className="flex items-center gap-2">
                        <Icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
