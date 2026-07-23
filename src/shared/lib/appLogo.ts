export const APP_LOGO_URL = '/mi-logo.png';

export function resolveLogoUrl(logoUrl?: string | null): string {
  if (!logoUrl) return APP_LOGO_URL;
  return logoUrl;
}
