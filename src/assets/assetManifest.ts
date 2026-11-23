import { CharacterId, getCharacterAssetUrls } from '../config/animations';
import { getStageById, StageId } from '../config/stages';

export interface LoadProgress {
  loaded: number;
  total: number;
  percent: number;
  currentUrl: string;
}

class AssetManager {
  private cache = new Map<string, HTMLImageElement>();
  private inflight = new Map<string, Promise<HTMLImageElement>>();

  getImage(url: string): HTMLImageElement | null {
    const img = this.cache.get(url);
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
    return null;
  }

  loadImage(url: string): Promise<HTMLImageElement> {
    const existing = this.cache.get(url);
    if (existing && existing.complete && existing.naturalWidth > 0) {
      return Promise.resolve(existing);
    }
    const pending = this.inflight.get(url);
    if (pending) return pending;

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      const timer = window.setTimeout(() => {
        this.inflight.delete(url);
        reject(new Error(`Timed out loading asset: ${url}`));
      }, 6000);
      img.onload = () => {
        window.clearTimeout(timer);
        this.cache.set(url, img);
        this.inflight.delete(url);
        resolve(img);
      };
      img.onerror = () => {
        window.clearTimeout(timer);
        this.inflight.delete(url);
        reject(new Error(`Failed to load asset: ${url}`));
      };
      img.src = url;
    });

    this.inflight.set(url, promise);
    return promise;
  }

  async preloadUrls(
    urls: string[],
    onProgress?: (progress: LoadProgress) => void,
  ): Promise<{ failed: string[] }> {
    const unique = Array.from(new Set(urls));
    const total = unique.length;
    let loaded = 0;
    const failed: string[] = [];

    if (total === 0) {
      onProgress?.({ loaded: 0, total: 0, percent: 100, currentUrl: '' });
      return { failed };
    }

    const concurrency = 16;
    let cursor = 0;

    const worker = async () => {
      while (cursor < unique.length) {
        const idx = cursor++;
        const url = unique[idx];
        try {
          await this.loadImage(url);
        } catch {
          failed.push(url);
        }
        loaded++;
        if (loaded === total || loaded % 5 === 0) {
          onProgress?.({
            loaded,
            total,
            percent: Math.round((loaded / total) * 100),
            currentUrl: url,
          });
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
    await Promise.all(workers);
    return { failed };
  }

  async preloadMatchAssets(
    p1Char: CharacterId,
    p2Char: CharacterId,
    stageId: StageId,
    onProgress?: (progress: LoadProgress) => void,
  ): Promise<{ failed: string[] }> {
    const stage = getStageById(stageId);
    const urls = [
      stage.backgroundUrl,
      ...getCharacterAssetUrls(p1Char),
      ...getCharacterAssetUrls(p2Char),
    ];
    return this.preloadUrls(urls, onProgress);
  }
}

export const assetManager = new AssetManager();
