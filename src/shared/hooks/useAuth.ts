import { useAuthStore } from '@/shared/lib/stores';
import { supabase, getRedirectUrl } from '@/shared/lib/supabase';

export const useAuth = () => {
  const { user, session, loading } = useAuthStore();

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl('/dashboard')
      }
    });
    return { error };
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: getRedirectUrl('/dashboard')
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };
};
