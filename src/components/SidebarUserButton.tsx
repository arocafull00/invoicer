import { useClerk, useUser } from '@clerk/react';
import { ChevronsUpDown, LogOut, UserRound } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SidebarUserMenuAction } from '@/components/SidebarUserMenuAction';

export function SidebarUserButton() {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();

  if (!user) return null;

  const name = user.fullName ?? user.firstName ?? 'Usuario';
  const email = user.primaryEmailAddress?.emailAddress;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <img
                src={user.imageUrl}
                alt={name}
                className="size-8 shrink-0 rounded-full object-cover"
              />
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                {email ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                ) : null}
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="w-(--radix-popover-trigger-width) p-1"
          >
            <SidebarUserMenuAction
              label="Cuenta"
              icon={UserRound}
              onClick={() => openUserProfile()}
            />
            <SidebarUserMenuAction
              label="Cerrar sesión"
              icon={LogOut}
              onClick={() => signOut({ redirectUrl: '/login' })}
            />
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
