/**
 * 花园模块：12月份花种数据
 */

export const FLOWERS = [
  { month: 1,  name: '梅花',    emoji: '🌸', color: '#ffb7c5', meaning: '坚强、高雅',    season: '冬', unlocked: false },
  { month: 2,  name: '迎春花',  emoji: '🌼', color: '#ffd700', meaning: '希望、活力',    season: '冬', unlocked: false },
  { month: 3,  name: '桃花',    emoji: '🌺', color: '#ff6b8a', meaning: '爱情、美好',    season: '春', unlocked: false },
  { month: 4,  name: '樱花',    emoji: '🌸', color: '#ffb7c5', meaning: '生命、绚烂',    season: '春', unlocked: false },
  { month: 5,  name: '牡丹',    emoji: '🌺', color: '#e84393', meaning: '富贵、荣华',    season: '春', unlocked: false },
  { month: 6,  name: '荷花',    emoji: '🪷', color: '#ff9ec4', meaning: '纯洁、清廉',    season: '夏', unlocked: false },
  { month: 7,  name: '茉莉花',  emoji: '🤍', color: '#ffffff', meaning: '纯洁、忠贞',    season: '夏', unlocked: false },
  { month: 8,  name: '向日葵',  emoji: '🌻', color: '#ffd32a', meaning: '忠诚、阳光',    season: '夏', unlocked: false },
  { month: 9,  name: '桂花',    emoji: '🌼', color: '#f0c040', meaning: '丰收、吉祥',    season: '秋', unlocked: false },
  { month: 10, name: '菊花',    emoji: '🌼', color: '#ffa502', meaning: '高洁、长寿',    season: '秋', unlocked: false },
  { month: 11, name: '山茶花',  emoji: '🌺', color: '#e74c3c', meaning: '谦逊、理想',    season: '秋', unlocked: false },
  { month: 12, name: '水仙花',  emoji: '🌼', color: '#dfe6e9', meaning: '自恋、陶醉',    season: '冬', unlocked: false },
];

/**
 * 根据月份获取花种
 */
export function getFlowerByMonth(month) {
  return FLOWERS.find(f => f.month === month) || null;
}

/**
 * 解锁当月花种（通过完成任务获得）
 */
export function unlockFlower(month) {
  const flower = getFlowerByMonth(month);
  if (flower) flower.unlocked = true;
  return flower;
}
