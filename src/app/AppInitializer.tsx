import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAppData } from '@/shared/hooks/useAppData';
import { router } from './router';

export const AppInitializer: React.FC = () => {
  const { isLoading } = useAppData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-white text-lg">Cargando datos...</div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};