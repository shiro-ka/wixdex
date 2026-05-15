export function cardImageUrl(image: string): string {
  return `${import.meta.env.VITE_CARD_IMAGE_BASE_URL}/${image}`;
}
