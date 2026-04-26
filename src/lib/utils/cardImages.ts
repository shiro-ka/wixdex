import { env } from '$env/dynamic/public';

export function cardImageUrl(image: string): string {
  return env.PUBLIC_CARD_IMAGE_BASE_URL
    ? `${env.PUBLIC_CARD_IMAGE_BASE_URL}/${image}`
    : `/assets/cards_img/${image}`;
}
