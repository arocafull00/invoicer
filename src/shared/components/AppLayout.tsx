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
          <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-4 md:p-4">
            <div className="flex items-center">
              <SidebarTrigger />
            </div>
            <div id="page-title" className="min-w-0" />
            <div id="page-actions" className="flex items-center justify-end gap-2" />
          </header>
          <main className="min-h-screen px-3 py-4 md:p-6 space-y-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Background>
  );
};