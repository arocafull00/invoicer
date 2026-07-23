import type { PdfColorPalette, SupportedCurrency, SupportedDateFormat, UserSettings } from '@/shared/types';

const PDF_COLOR_PALETTE_STORAGE_KEY = 'invoice.pdf.color_palette';
export const DEFAULT_PDF_COLOR_PALETTE: PdfColorPalette = 'violet';
const PDF_COLOR_PALETTES: PdfColorPalette[] = ['violet', 'blue', 'emerald', 'rose'];

function isPdfColorPalette(value: unknown): value is PdfColorPalette {
  return typeof value === 'string' && PDF_COLOR_PALETTES.includes(value as PdfColorPalette);
}

export function getStoredPdfColorPalette(): PdfColorPalette {
  if (typeof window === 'undefined') return DEFAULT_PDF_COLOR_PALETTE;
  const storedValue = window.localStorage.getItem(PDF_COLOR_PALETTE_STORAGE_KEY);
  if (!isPdfColorPalette(storedValue)) return DEFAULT_PDF_COLOR_PALETTE;
  return storedValue;
}

export function setStoredPdfColorPalette(palette: PdfColorPalette): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PDF_COLOR_PALETTE_STORAGE_KEY, palette);
}

const DEFAULT_IRPF_RATE = 20;

function mapIrpfRate(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_IRPF_RATE;
  if (parsed < 0 || parsed > 100) return DEFAULT_IRPF_RATE;
  return Number(parsed.toFixed(2));
}

function mapRowToSettings(row: {
  id: string;
  default_currency: SupportedCurrency;
  date_format: SupportedDateFormat;
  pdf_color_palette?: PdfColorPalette | null;
  logo_url?: string | null;
  irpf_rate?: number | string | null;
}): UserSettings {
  const localPalette = getStoredPdfColorPalette();
  const palette = isPdfColorPalette(row?.pdf_color_palette)
    ? row.pdf_color_palette
    : localPalette;
  setStoredPdfColorPalette(palette);
  return {
    id: row?.id,
    default_currency: row?.default_currency ?? 'eur',
    date_format: row?.date_format ?? 'dd/mm/yyyy',
    pdf_color_palette: palette,
    logo_url: row?.logo_url ?? null,
    irpf_rate: mapIrpfRate(row?.irpf_rate),
  };
}

export async function getUserSettings(): Promise<UserSettings> {
  const response = await fetch('/api/settings');
  if (!response.ok) {
    throw new Error('Failed to fetch user settings');
  }
  const data = await response.json();
  return mapRowToSettings(data);
}

export async function updateUserSettings(
  partial: Partial<
    Pick<
      UserSettings,
      'default_currency' | 'date_format' | 'pdf_color_palette' | 'irpf_rate'
    >
  >
): Promise<UserSettings> {
  if (partial.pdf_color_palette) {
    setStoredPdfColorPalette(partial.pdf_color_palette);
  }

  const { pdf_color_palette, ...dbPartial } = partial;
  if (Object.keys(dbPartial).length === 0) {
    const current = await getUserSettings();
    return {
      ...current,
      pdf_color_palette: pdf_color_palette ?? current.pdf_color_palette,
    };
  }

  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dbPartial),
  });

  if (!response.ok) {
    throw new Error('Failed to update user settings');
  }

  const data = await response.json();
  return mapRowToSettings(data);
}

export async function uploadUserLogo(file: File): Promise<UserSettings> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/settings/logo', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : 'Failed to upload logo';
    throw new Error(message);
  }

  const data = await response.json();
  return mapRowToSettings(data);
}

export async function removeUserLogo(): Promise<UserSettings> {
  const response = await fetch('/api/settings/logo', {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to remove logo');
  }

  const data = await response.json();
  return mapRowToSettings(data);
}
