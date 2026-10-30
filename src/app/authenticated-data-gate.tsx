'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { setTokenProvider } from '@/shared/api/client';
import { Spinner } from '@/shared/components/Spinner';
import { useAppData } from '@/shared/hooks/useAppData';
import { useInvoiceStore } from '@/shared/lib/stores';
import { useExpensesStore } from '@/expenses/store/useExpensesStore';
import { restoreAppCache, cacheAppData, clearAppCache, useAppCache } from '@/shared/lib/appCache';

export function AuthenticatedDataGate({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const cache = useAppCache();

  useEffect(() => { restoreAppCache(); }, []);

  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !cache.hydrated) return;
    if (!isSignedIn || (cache.owner && cache.owner !== userId)) clearAppCache();
  }, [isLoaded, isSignedIn, userId, cache.hydrated, cache.owner]);

  useEffect(() => {
    const clear = () => { clearAppCache(); void signOut({ redirectUrl: '/login' }); };
    window.addEventListener('invoicer:unauthorized', clear);
    return () => window.removeEventListener('invoicer:unauthorized', clear);
  }, [signOut]);

  useEffect(() => {
    if (!userId || !cache.hydrated || !isSignedIn || cache.owner !== userId) return;
    const generation = cache.generation;
    let timer: ReturnType<typeof setTimeout>;
    const save = () => { clearTimeout(timer); timer = setTimeout(() => { if (generation === useAppCache.getState().generation && useAppCache.getState().owner === userId) cacheAppData(userId); }, 100); };
    const stopInvoices = useInvoiceStore.subscribe(save);
    const stopExpenses = useExpensesStore.subscribe(save);
    return () => { clearTimeout(timer); stopInvoices(); stopExpenses(); };
  }, [userId, isSignedIn, cache.hydrated, cache.owner, cache.generation]);

  const { isLoading, loadError, retry } = useAppData({
    enabled: cache.hydrated && isLoaded && Boolean(isSignedIn) && (!cache.owner || cache.owner === userId),
    userId,
  });

  const cachedDisplay = cache.hasData && (!isLoaded || (isSignedIn && cache.owner === userId));
  if (!cachedDisplay && !loadError && (!cache.hydrated || !isLoaded || !isSignedIn || (cache.owner !== null && cache.owner !== userId) || isLoading || !useInvoiceStore.getState().isDataReady)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (loadError && !cachedDisplay) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-center text-foreground">
          No se pudieron cargar los datos de la aplicación.
        </p>
        <Button onClick={retry} disabled={isLoading}>
          {isLoading ? 'Reintentando...' : 'Reintentar'}
        </Button>
      </div>
    );
  }

  return children;
}
