import React from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="ml-72">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}; 