import { useState, useEffect } from 'react';

/**
 * メディアクエリの状態を監視するカスタムフック
 * @param query - メディアクエリ文字列（例: '(min-width: 1024px)'）
 * @returns メディアクエリにマッチするかどうか
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    // 初期値を設定
    setMatches(mediaQuery.matches);

    // リスナーを登録
    mediaQuery.addEventListener('change', handleChange);

    // クリーンアップ
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};
