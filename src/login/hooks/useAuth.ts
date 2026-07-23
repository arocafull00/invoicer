import { useAuth as useClerkAuth, useSignIn } from '@clerk/react';

export const useAuth = () => {
  const { isLoaded } = useClerkAuth();
  const { signIn } = useSignIn();

  const signInWithGoogle = async () => {
    if (!isLoaded || !signIn) {
      return { error: new Error('Auth not ready') };
    }

    try {
      await signIn.sso({
        strategy: 'oauth_google',
        redirectUrl: '/dashboard',
        redirectCallbackUrl: '/sso-callback',
      });
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Sign in failed'),
      };
    }
  };

  const signInWithGithub = async () => {
    if (!isLoaded || !signIn) {
      return { error: new Error('Auth not ready') };
    }

    try {
      await signIn.sso({
        strategy: 'oauth_github',
        redirectUrl: '/dashboard',
        redirectCallbackUrl: '/sso-callback',
      });
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Sign in failed'),
      };
    }
  };

  return {
    isLoaded,
    signInWithGoogle,
    signInWithGithub,
  };
};
