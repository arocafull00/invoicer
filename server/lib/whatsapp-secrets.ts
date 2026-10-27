import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { ApiError } from './errors';

export function whatsappServerReady() {
  return /^[a-f\d]{64}$/i.test(process.env.WHATSAPP_ENCRYPTION_KEY ?? '') &&
    Boolean(process.env.CRON_SECRET);
}

function encryptionKey() {
  const key = process.env.WHATSAPP_ENCRYPTION_KEY ?? '';
  if (!/^[a-f\d]{64}$/i.test(key)) {
    throw new ApiError('Falta configurar el cifrado de WhatsApp en el servidor', 503);
  }
  return Buffer.from(key, 'hex');
}

export function encryptWhatsAppKey(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
}

export function decryptWhatsAppKey(value: string) {
  const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
