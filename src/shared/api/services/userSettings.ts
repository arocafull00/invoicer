import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/stores';
import type { SupportedCurrency, SupportedDateFormat, UserSettings } from '@/shared/types';

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
}): UserSettings {
  return {
    id: row?.id,
    user_id: row?.user_id,
    default_currency: row?.default_currency ?? 'eur',
    date_format: row?.date_format ?? 'dd/mm/yyyy',
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
    // Create default settings if none exist
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

export async function updateUserSettings(partial: Partial<Pick<UserSettings, 'default_currency' | 'date_format'>>): Promise<UserSettings> {
  const userId = await getRequiredUserId();
  const { data, error } = await supabase
    .from('user_settings')
    .update(partial)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update user settings: ${error.message}`);
  }

  return mapRowToSettings(data);
}


