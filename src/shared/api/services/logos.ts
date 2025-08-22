import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/stores';

const BUCKET = 'logos';

function getRequiredUserId(): string {
  const { user } = useAuthStore.getState();
  if (!user?.id) throw new Error('User not authenticated');
  return user.id;
}

function getUserLogoPath(userId: string): string {
  return `${userId}/logo`;
}

export async function uploadUserLogo(file: File): Promise<string> {
  const userId = getRequiredUserId();
  const path = getUserLogoPath(userId);

  const { error: uploadError } = await supabase
    .storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/png',
    });

  if (uploadError) {
    throw new Error(`Failed to upload logo: ${uploadError.message}`);
  }

  // Bucket privado: generar URL firmada
  const { data: signedData, error: signedError } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signedError || !signedData?.signedUrl) {
    throw new Error('Failed to resolve logo URL');
  }

  return signedData.signedUrl;
}

export async function getUserLogoUrl(): Promise<string | null> {
  const { user } = useAuthStore.getState();
  if (!user?.id) return null;
  const path = getUserLogoPath(user.id);

  // Bucket privado: intentar generar una URL firmada
  const { data: signedData, error: signedError } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signedError) {
    return null;
  }
  return signedData?.signedUrl ?? null;
}


