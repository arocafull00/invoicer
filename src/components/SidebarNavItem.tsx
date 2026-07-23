import { NavLink, useLocation } from 'react-router-dom';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

type SidebarNavItemProps = {
  title: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function isRouteActive(pathname: string, to: string) {
  if (to === '/dashboard') {
    return pathname === '/' || pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export function SidebarNavItem({ title, to, icon: Icon }: SidebarNavItemProps) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = isRouteActive(location.pathname, to);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <NavLink
          to={to}
          className="flex items-center gap-2"
          onClick={() => {
            if (!isMobile) return;
            setOpenMobile(false);
          }}
        >
          <Icon />
          <span>{title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
