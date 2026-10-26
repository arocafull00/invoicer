import { useEffect } from 'react';
import { create } from 'zustand';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaInstallState {
  installPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isIos: boolean;
  setInstallPrompt: (event: BeforeInstallPromptEvent | null) => void;
  setInstalled: (installed: boolean) => void;
  setIos: (isIos: boolean) => void;
}

export const usePwaInstallStore = create<PwaInstallState>((set) => ({
  installPrompt: null,
  isInstalled: false,
  isIos: false,
  setInstallPrompt: (installPrompt) => set({ installPrompt }),
  setInstalled: (isInstalled) => set({ isInstalled }),
  setIos: (isIos) => set({ isIos }),
}));

export function useRegisterPwa() {
  useEffect(() => {
    const { setInstallPrompt, setInstalled, setIos } = usePwaInstallStore.getState();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    setInstalled(window.matchMedia('(display-mode: standalone)').matches);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);
}

export function usePwaInstall() {
  const { installPrompt, isInstalled, isIos, setInstallPrompt } = usePwaInstallStore();

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return { canInstall: !!installPrompt, isInstalled, isIos, install };
}
