function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

function hueFromId(listId: string): { hue: number; hash: number } {
  const hash = hashString(listId);
  return { hue: hash % 360, hash };
}

export function getListColor(listId: string): string {
  const { hue, hash } = hueFromId(listId);
  const saturation = 62 + (hash % 14);
  const lightness = 50 + (Math.floor(hash / 360) % 8);
  return hslToHex(hue, saturation, lightness);
}

export function getListGradient(listId: string): readonly [string, string] {
  const { hue, hash } = hueFromId(listId);
  const saturation = 48 + (hash % 16);
  return [
    hslToHex(hue, saturation, 88),
    hslToHex(hue, saturation - 6, 78),
  ];
}

export function getListPillColor(listId: string): string {
  const { hue, hash } = hueFromId(listId);
  const saturation = 36 + (hash % 12);
  return hslToHex(hue, saturation, 94);
}
