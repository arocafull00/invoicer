import React from 'react';
import { Background } from '@/shared/components/Background';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Background>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center gap-2 p-4">
            <SidebarTrigger />
          </div>
          <main className="min-h-screen p-4 md:p-6 space-y-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Background>
  );
};