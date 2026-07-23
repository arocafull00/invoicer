import { AuthenticateWithRedirectCallback } from '@clerk/react';
import { Spinner } from '@/shared/components/Spinner';

export const SSOCallback = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AuthenticateWithRedirectCallback />
      <Spinner />
    </div>
  );
};
