import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AppInitializer } from './AppInitializer';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/shared/api/queryClient';

export { queryClient } from '@/shared/api/queryClient';

export const AppProviders: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AppInitializer />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
};
