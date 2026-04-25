import { PUBLIC_CARD_IMAGE_BASE_URL } from '$env/static/public';

export function cardImageUrl(image: string): string {
  return PUBLIC_CARD_IMAGE_BASE_URL
    ? `${PUBLIC_CARD_IMAGE_BASE_URL}/${image}`
    : `/assets/cards_img/${image}`;
}
