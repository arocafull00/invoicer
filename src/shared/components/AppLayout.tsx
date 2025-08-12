import React from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { Background } from '@/shared/components/Background';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Background>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="ml-72">
        <main className="min-h-screen p-6 space-y-6">
          {children}
        </main>
      </div>
    </Background>
  );
};