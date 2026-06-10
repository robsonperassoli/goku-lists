import { ListPalettes } from '@/constants/theme';

const EMOJIS = ['✦', '◈', '◎', '❋', '✺', '◉', '✧', '◆', '⬡', '◐', '❖', '✿'];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getListPalette(listId: string) {
  return ListPalettes[hashString(listId) % ListPalettes.length];
}

export function getListEmoji(listId: string, image?: string | null): string {
  if (image && image.length <= 4) return image;
  return EMOJIS[hashString(listId) % EMOJIS.length];
}

export function getCardHeight(index: number): number {
  const heights = [160, 172, 148, 168, 156];
  return heights[index % heights.length];
}
