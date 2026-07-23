import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { useAppData } from '@/shared/hooks/useAppData';
import { setTokenProvider } from '@/shared/api/client';
import { router } from './router';
import { Spinner } from '@/shared/components/Spinner';
import { Button } from '@/components/ui/button';

export const AppInitializer: React.FC = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);

  const { isLoading, loadError, retry } = useAppData({
    enabled: isLoaded && !!isSignedIn,
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return <RouterProvider router={router} />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-foreground text-center">
          No se pudieron cargar los datos de la aplicación.
        </p>
        <Button onClick={retry} disabled={isLoading}>
          {isLoading ? 'Reintentando...' : 'Reintentar'}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <RouterProvider router={router} />;
};
