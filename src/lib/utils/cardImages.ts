export function cardImageUrl(image: string): string {
  const base = import.meta.env.VITE_CARD_IMAGE_BASE_URL as string | undefined;
  return base ? `${base}/${image}` : `/assets/cards_img/${image}`;
}
