import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { useAppData } from '@/shared/hooks/useAppData';
import { setTokenProvider } from '@/shared/api/client';
import { router } from './router';
import { Spinner } from '@/shared/components/Spinner';

export const AppInitializer: React.FC = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);

  const { isLoading } = useAppData({ enabled: isLoaded && !!isSignedIn });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <RouterProvider router={router} />;
};
