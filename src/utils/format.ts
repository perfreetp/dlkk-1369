export const padNumber = (n: number, width: number = 2): string => {
  return String(n).padStart(width, '0');
};

export const formatCount = (n: number): string => {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

export const weatherToText = (w: string): string => {
  const map: Record<string, string> = {
    '晴': '☀️ 晴',
    '多云': '⛅ 多云',
    '阴': '☁️ 阴',
    '小雨': '🌦️ 小雨',
    '大雨': '🌧️ 大雨',
    '雪': '❄️ 雪',
    '雾': '🌫️ 雾',
  };
  return map[w] || w;
};

export const categoryToIcon = (c: string): string => {
  const map: Record<string, string> = {
    '鸣禽': '🎵',
    '猛禽': '🦅',
    '涉禽': '🦩',
    '游禽': '🦆',
    '攀禽': '🐦',
    '陆禽': '🐔',
    '走禽': '🦃',
    '其他': '🐤',
  };
  return map[c] || '🐦';
};
