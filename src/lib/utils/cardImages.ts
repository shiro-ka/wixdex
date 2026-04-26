export function cardImageUrl(image: string): string {
  const base = import.meta.env.VITE_CARD_IMAGE_BASE_URL as string | undefined;
  if (typeof window !== 'undefined' && !(window as unknown as { __wixdex_logged?: boolean }).__wixdex_logged) {
    (window as unknown as { __wixdex_logged?: boolean }).__wixdex_logged = true;
    console.log('[wixdex debug] import.meta.env =', import.meta.env);
    console.log('[wixdex debug] VITE_CARD_IMAGE_BASE_URL =', base);
  }
  return base ? `${base}/${image}` : `/assets/cards_img/${image}`;
}
