import { create } from 'zustand';
import { supabase } from './supabase';
import type { AuthState, WizardDraft } from '@/shared/types';

export const useAuthStore = create<AuthState>((set) => {
  // Inicializar sesión automáticamente
  const initializeAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }
      set({ 
        session, 
        user: session?.user ?? null, 
        loading: false 
      });
    } catch (error) {
      console.error('Error in getSession:', error);
      set({ loading: false });
    }
  };

  // Ejecutar inicialización
  initializeAuth();

  // Escuchar cambios de autenticación
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    set({ 
      session, 
      user: session?.user ?? null, 
      loading: false 
    });
  });

  return {
    user: null,
    session: null,
    loading: true,
  };
});

export const useInvoiceStore = create<{ wizardDraft: WizardDraft; setWizardDraft: (draft: WizardDraft) => void }>((set) => ({
  wizardDraft: {},
  setWizardDraft: (draft) => set({ wizardDraft: draft }),
})); 