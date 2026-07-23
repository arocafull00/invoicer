import { UserButton } from '@clerk/react';
import {
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function SidebarUserButton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserButton
          showName
          appearance={{
            elements: {
              rootBox: 'w-full',
              userButtonTrigger:
                '!w-full !justify-between rounded-md px-2 py-1.5 hover:bg-sidebar-accent',
              userButtonBox: '!w-full flex-row-reverse !justify-between gap-2',
              userButtonOuterIdentifier:
                'truncate text-left text-sm text-sidebar-foreground',
              avatarBox: 'size-8 shrink-0',
              userButtonPopoverRootBox: 'pointer-events-auto',
            },
          }}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
