import { useState, useCallback } from 'react';

const STORAGE_KEY = 'rocky_platform';

export function usePlatform() {
  const [platform, setPlatformState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'meta'
  );

  const setPlatform = useCallback((p) => {
    const value = p === 'tiktok' ? 'tiktok' : 'meta';
    setPlatformState(value);
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const togglePlatform = useCallback(() => {
    setPlatform(platform === 'meta' ? 'tiktok' : 'meta');
  }, [platform, setPlatform]);

  return { platform, setPlatform, togglePlatform, isTikTok: platform === 'tiktok', isMeta: platform === 'meta' };
}

export default usePlatform;
