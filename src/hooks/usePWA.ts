import { useCallback, useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { getCharacterAssetUrls } from '../config/animations';
import { getPlayableCharacterIds } from '../config/characterRegistry';
import { STAGES } from '../config/stages';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.matchMedia?.('(display-mode: fullscreen)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(Boolean(isStandalone));

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
    return outcome;
  }, [deferredPrompt]);

  return {
    canPromptInstall: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    promptInstall,
  };
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return isOnline;
}

export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateFn, setUpdateFn] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    try {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onOfflineReady() {
          setOfflineReady(true);
        },
      });
      setUpdateFn(() => updateSW);
    } catch {
      // Service worker registration skipped if unsupported
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    if (updateFn) {
      await updateFn(true);
    } else {
      window.location.reload();
    }
  }, [updateFn]);

  return { needRefresh, offlineReady, applyUpdate };
}

export interface OfflineCacheStatus {
  supported: boolean;
  cachedAssetsCount: number;
  estimatedUsageMb: number | null;
}

export async function inspectOfflineCacheStatus(): Promise<OfflineCacheStatus> {
  if (typeof caches === 'undefined') {
    return { supported: false, cachedAssetsCount: 0, estimatedUsageMb: null };
  }
  try {
    const names = await caches.keys();
    let count = 0;
    for (const name of names) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      count += keys.length;
    }
    let estimatedUsageMb: number | null = null;
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      if (typeof est.usage === 'number') {
        estimatedUsageMb = Math.round((est.usage / (1024 * 1024)) * 10) / 10;
      }
    }
    return { supported: true, cachedAssetsCount: count, estimatedUsageMb };
  } catch {
    return { supported: false, cachedAssetsCount: 0, estimatedUsageMb: null };
  }
}

export async function precacheOfflineSinglePlayerAssets(
  onProgress?: (loaded: number, total: number) => void,
): Promise<{ cached: number; total: number }> {
  const urls = Array.from(
    new Set([
      '/assets/brand/logo-39-bharat-nagar.png',
      '/pwa-192x192.png',
      '/pwa-512x512.png',
      ...STAGES.map((s) => s.backgroundUrl),
      ...getPlayableCharacterIds().flatMap((id) => getCharacterAssetUrls(id)),
    ]),
  );

  if (typeof caches === 'undefined') {
    return { cached: 0, total: urls.length };
  }

  const cache = await caches.open('bharat-nagar-sprites-v1');
  let cached = 0;
  const total = urls.length;
  const concurrency = 10;
  let cursor = 0;

  const worker = async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      try {
        const existing = await cache.match(url);
        if (!existing) {
          await cache.add(url);
        }
        cached++;
      } catch {
        // Continue caching remaining assets
      }
      onProgress?.(cached, total);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { cached, total };
}
