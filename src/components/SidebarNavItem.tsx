import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = isRouteActive(pathname, to);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          href={to}
          className="flex items-center gap-2"
          onClick={() => {
            if (!isMobile) return;
            setOpenMobile(false);
          }}
        >
          <Icon />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
