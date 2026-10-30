import type { ExpenseInput } from './expenseValidation';

export type PdfExpenseDraft = {
  id: string;
  file: File;
  hash: string;
  status: 'queued' | 'reading' | 'ready' | 'error' | 'saved';
  data: Partial<ExpenseInput>;
  warnings: string[];
  error?: string;
  reviewed: boolean;
};

const DB_NAME = 'invoicer.expense-import.v1';
let epoch = 0;
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readPdfDrafts(userId: string): Promise<PdfExpenseDraft[]> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('drafts').objectStore('drafts').get(userId);
      request.onsuccess = () => resolve((request.result ?? []).map((row: PdfExpenseDraft) => ({ ...row, status: row.status === 'reading' ? 'queued' : row.status })));
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function savePdfDrafts(userId: string, rows: PdfExpenseDraft[]) {
  const startedAt = epoch;
  const db = await openDb();
  try {
    if (startedAt !== epoch) return;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('drafts', 'readwrite');
      if (rows.length) tx.objectStore('drafts').put(rows, userId);
      else tx.objectStore('drafts').delete(userId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

export async function clearPdfDrafts() {
  epoch++;
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('drafts', 'readwrite');
      tx.objectStore('drafts').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}
