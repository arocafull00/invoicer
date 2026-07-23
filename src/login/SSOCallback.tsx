'use client';

import { useEffect, useRef, useState } from 'react';
import { useClerk, useSignIn, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/shared/components/Spinner';

export function SSOCallback() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const hasRun = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clerk.loaded || hasRun.current) return;
    hasRun.current = true;

    const navigateToDashboard = async ({
      session,
      decorateUrl,
    }: {
      session: { currentTask?: unknown } | null;
      decorateUrl: (url: string) => string;
    }) => {
      if (session?.currentTask) {
        router.replace('/login');
        return;
      }

      const url = decorateUrl('/dashboard');
      if (url.startsWith('http')) {
        window.location.href = url;
      } else {
        router.replace(url);
      }
    };

    const finalizeSignIn = () =>
      signIn.finalize({ navigate: navigateToDashboard });
    const finalizeSignUp = () =>
      signUp.finalize({ navigate: navigateToDashboard });

    void (async () => {
      try {
        if (signIn.status === 'complete') {
          await finalizeSignIn();
          return;
        }

        if (signUp.isTransferable) {
          await signIn.create({ transfer: true });
          const signInStatus =
            signIn.status as typeof signIn.status | 'complete';
          if (signInStatus === 'complete') {
            await finalizeSignIn();
            return;
          }
        }

        if (signIn.isTransferable) {
          await signUp.create({ transfer: true });
          if (signUp.status === 'complete') {
            await finalizeSignUp();
            return;
          }
        }

        if (signUp.status === 'complete') {
          await finalizeSignUp();
          return;
        }

        const sessionId =
          signIn.existingSession?.sessionId ??
          signUp.existingSession?.sessionId;

        if (sessionId) {
          await clerk.setActive({
            session: sessionId,
            navigate: navigateToDashboard,
          });
          return;
        }

        setError('No se pudo completar el inicio de sesión.');
      } catch {
        setError('No se pudo completar el inicio de sesión.');
      }
    })();
  }, [clerk, router, signIn, signUp]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <div id="clerk-captcha" />
      {error ? (
        <>
          <p className="text-center text-destructive">{error}</p>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => router.replace('/login')}
          >
            Volver al inicio de sesión
          </button>
        </>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
