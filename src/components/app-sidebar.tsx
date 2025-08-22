import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Home, LogOut, Settings, UserCog, Users, CreditCard, Banknote } from 'lucide-react';
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
import { useAuthStore } from '@/shared/lib/stores';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type NavItem = {
  title: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { title: 'Dashboard', to: '/dashboard', icon: Home },
  { title: 'Facturas', to: '/invoices', icon: FileText },
  { title: 'Pagos', to: '/payments', icon: CreditCard },
  { title: 'Ingresos', to: '/incomes', icon: Banknote },
  { title: 'Consultores', to: '/consultants', icon: UserCog },
  { title: 'Clientes', to: '/clients', icon: Users },
  { title: 'Configuración', to: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { signOut } = useAuth();

  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleConfirmSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1.5">
          <img src="/logo.png" alt="Invoicer logo" className="size-8" />
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
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md bg-sidebar-accent px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.email || 'Usuario'}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowConfirm(true)}
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            title="Cerrar sesión"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar sesión</AlertDialogTitle>
            <AlertDialogDescription>¿Seguro que deseas cerrar la sesión?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSignOut}>Cerrar sesión</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}

export default AppSidebar;


