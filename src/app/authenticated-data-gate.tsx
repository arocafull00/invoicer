'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { setTokenProvider } from '@/shared/api/client';
import { Spinner } from '@/shared/components/Spinner';
import { useAppData } from '@/shared/hooks/useAppData';

export function AuthenticatedDataGate({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);

  const { isLoading, loadError, retry } = useAppData({
    enabled: isLoaded && Boolean(isSignedIn),
  });

  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-center text-foreground">
          No se pudieron cargar los datos de la aplicación.
        </p>
        <Button onClick={retry} disabled={isLoading}>
          {isLoading ? 'Reintentando...' : 'Reintentar'}
        </Button>
      </div>
    );
  }

  return children;
}
