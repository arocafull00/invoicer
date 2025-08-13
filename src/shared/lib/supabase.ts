import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const siteUrlFromEnv = import.meta.env.VITE_SITE_URL as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const auth = supabase.auth;
export const db = supabase;

// Utilidad para construir URLs de redirección de OAuth de forma consistente
export function getRedirectUrl(path: string): string {
  const base = siteUrlFromEnv && siteUrlFromEnv.length > 0
    ? siteUrlFromEnv.replace(/\/$/, '')
    : (import.meta.env.PROD ? 'https://invoicer-sooty.vercel.app' : window.location.origin);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

// Configuración para OAuth providers (opcional)
export const oAuthConfig = {
  google: {
    redirectTo: getRedirectUrl('/dashboard'),
    scopes: 'email profile'
  }
};