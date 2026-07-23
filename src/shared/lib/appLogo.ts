export const APP_LOGO_URL = '/logo.png';

export function resolveLogoUrl(logoUrl?: string | null): string {
  if (!logoUrl) return APP_LOGO_URL;
  return logoUrl;
}
