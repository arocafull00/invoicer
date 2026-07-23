import { useAuth as useClerkAuth, useSignIn } from '@clerk/nextjs';

type OAuthStrategy = 'oauth_google' | 'oauth_github';

export const useAuth = () => {
  const { isLoaded } = useClerkAuth();
  const { signIn } = useSignIn();

  const signInWith = async (strategy: OAuthStrategy) => {
    if (!isLoaded) {
      return { error: new Error('Auth not ready') };
    }

    try {
      const { error } = await signIn.sso({
        strategy,
        redirectUrl: '/dashboard',
        redirectCallbackUrl: '/sso-callback',
      });

      if (error) {
        return { error: new Error(error.message ?? 'Sign in failed') };
      }
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Sign in failed'),
      };
    }
  };

  const signInWithGoogle = () => signInWith('oauth_google');
  const signInWithGithub = () => signInWith('oauth_github');

  return {
    isLoaded,
    signInWithGoogle,
    signInWithGithub,
  };
};
