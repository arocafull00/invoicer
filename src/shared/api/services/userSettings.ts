import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/stores';
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

async function getRequiredUserId(): Promise<string> {
  const { user } = useAuthStore.getState();
  if (!user?.id) throw new Error('User not authenticated');
  return user.id;
}

function mapRowToSettings(row: {
  id: string;
  user_id: string;
  default_currency: SupportedCurrency;
  date_format: SupportedDateFormat;
  pdf_color_palette?: PdfColorPalette | null;
}): UserSettings {
  const localPalette = getStoredPdfColorPalette();
  const palette = isPdfColorPalette(row?.pdf_color_palette)
    ? row.pdf_color_palette
    : localPalette;
  setStoredPdfColorPalette(palette);
  return {
    id: row?.id,
    user_id: row?.user_id,
    default_currency: row?.default_currency ?? 'eur',
    date_format: row?.date_format ?? 'dd/mm/yyyy',
    pdf_color_palette: palette,
  };
}

export async function getUserSettings(): Promise<UserSettings> {
  const userId = await getRequiredUserId();
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user settings: ${error.message}`);
  }

  if (!data) {
    const defaults = { default_currency: 'eur', date_format: 'dd/mm/yyyy' } as const;
    const { data: inserted, error: insertError } = await supabase
      .from('user_settings')
      .insert({ ...defaults, user_id: userId })
      .select('*')
      .single();

    if (insertError) {
      throw new Error(`Failed to initialize user settings: ${insertError.message}`);
    }
    return mapRowToSettings(inserted);
  }

  return mapRowToSettings(data);
}

export async function updateUserSettings(partial: Partial<Pick<UserSettings, 'default_currency' | 'date_format' | 'pdf_color_palette'>>): Promise<UserSettings> {
  if (partial.pdf_color_palette) {
    setStoredPdfColorPalette(partial.pdf_color_palette);
  }

  const { pdf_color_palette, ...dbPartial } = partial;
  if (Object.keys(dbPartial).length === 0) {
    const current = await getUserSettings();
    return { ...current, pdf_color_palette: pdf_color_palette ?? current.pdf_color_palette };
  }

  const userId = await getRequiredUserId();
  const { data, error } = await supabase
    .from('user_settings')
    .update(dbPartial)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update user settings: ${error.message}`);
  }

  return mapRowToSettings(data);
}


