import type { MonthlyStats, WishlistItem, UserProfile } from '@/types';
import { mockSpeciesList } from './mockSpecies';

export const mockMonthlyStats: MonthlyStats = {
  year: 2026,
  month: 6,
  totalObservations: 18,
  totalSpecies: 15,
  totalTrips: 4,
  topSpecies: [
    { speciesId: 'sp-001', name: '麻雀', count: 5 },
    { speciesId: 'sp-004', name: '白头鹎', count: 4 },
    { speciesId: 'sp-010', name: '白鹭', count: 3 },
    { speciesId: 'sp-006', name: '珠颈斑鸠', count: 3 },
    { speciesId: 'sp-008', name: '喜鹊', count: 3 },
  ],
  weeklyDistribution: [4, 3, 5, 6],
  newSpecies: ['sp-014', 'sp-018', 'sp-016'],
  locations: [
    { name: '奥林匹克森林公园', count: 5 },
    { name: '颐和园', count: 4 },
    { name: '圆明园遗址公园', count: 4 },
    { name: '天坛公园', count: 3 },
    { name: '其他', count: 2 },
  ],
};

export const mockWishlist: WishlistItem[] = [
  {
    speciesId: 'sp-013',
    speciesName: '翠鸟',
    speciesThumb: mockSpeciesList.find(s => s.id === 'sp-013')?.thumbUrl || '',
    addedAt: Date.now() - 30 * 86400000,
    priority: '高',
    notes: '想要在溪流边拍到',
    observed: false,
  },
  {
    speciesId: 'sp-014',
    speciesName: '戴胜',
    speciesThumb: mockSpeciesList.find(s => s.id === 'sp-014')?.thumbUrl || '',
    addedAt: Date.now() - 45 * 86400000,
    priority: '高',
    observed: true,
    observedAt: Date.now() - 10 * 86400000,
  },
  {
    speciesId: 'sp-015',
    speciesName: '黑耳鸢',
    speciesThumb: mockSpeciesList.find(s => s.id === 'sp-015')?.thumbUrl || '',
    addedAt: Date.now() - 20 * 86400000,
    priority: '中',
    observed: true,
    observedAt: Date.now() - 5 * 86400000,
  },
  {
    speciesId: 'sp-018',
    speciesName: '鸳鸯',
    speciesThumb: mockSpeciesList.find(s => s.id === 'sp-018')?.thumbUrl || '',
    addedAt: Date.now() - 60 * 86400000,
    priority: '中',
    notes: '春季繁殖期去山地水域',
    observed: false,
  },
  {
    speciesId: 'sp-012',
    speciesName: '大白鹭',
    speciesThumb: mockSpeciesList.find(s => s.id === 'sp-012')?.thumbUrl || '',
    addedAt: Date.now() - 10 * 86400000,
    priority: '低',
    observed: false,
  },
  {
    speciesId: 'sp-003',
    speciesName: '山麻雀',
    speciesThumb: mockSpeciesList.find(s => s.id === 'sp-003')?.thumbUrl || '',
    addedAt: Date.now() - 25 * 86400000,
    priority: '低',
    observed: false,
  },
];

export const mockUserProfile: UserProfile = {
  nickname: '林间观鸟人',
  avatar: `https://picsum.photos/id/1005/200/200`,
  birdingSince: '2024.03',
  level: '进阶',
  totalObservations: 287,
  totalSpecies: 86,
  totalTrips: 42,
};
