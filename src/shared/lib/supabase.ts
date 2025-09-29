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
  // Detectar si estamos en localhost - versión más simple y directa
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // Debug para ver qué está pasando
  console.log('🔍 getRedirectUrl debug:', {
    hostname,
    origin: window.location.origin,
    isLocalhost,
    siteUrlFromEnv,
    path
  });
  
  // FORZAR localhost si estamos en desarrollo local
  if (isLocalhost) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${window.location.origin}${normalizedPath}`;
    console.log('✅ Using localhost URL:', url);
    return url;
  }
  
  // Solo usar producción si NO estamos en localhost
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `https://invoicer-sooty.vercel.app${normalizedPath}`;
  console.log('🌐 Using production URL:', url);
  return url;
}