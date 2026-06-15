import type { Observation, BehaviorTag } from '@/types';
import { getSpeciesById } from './mockSpecies';

const photoIds = [237, 659, 718, 783, 1025, 219, 200, 1074, 1062, 1050, 1040, 1033, 1019, 1003, 998];
const makeImg = (id: number) => `https://picsum.photos/id/${id}/600/450`;
const makeThumb = (id: number) => `https://picsum.photos/id/${id}/200/200`;

const weathers: Observation['weather'][] = ['晴', '多云', '阴', '小雨', '雾'];
const locations = [
  { lat: 39.9042, lng: 116.4074, name: '奥林匹克森林公园', address: '北京市朝阳区科荟路33号' },
  { lat: 39.9929, lng: 116.3046, name: '颐和园', address: '北京市海淀区新建宫门路19号' },
  { lat: 40.0343, lng: 116.3603, name: '圆明园遗址公园', address: '北京市海淀区清华西路28号' },
  { lat: 39.9626, lng: 116.4333, name: '北京动物园', address: '北京市西城区西直门外大街137号' },
  { lat: 40.0037, lng: 116.3252, name: '海淀公园', address: '北京市海淀区新建宫门路2号' },
  { lat: 39.9950, lng: 116.4675, name: '朝阳公园', address: '北京市朝阳区朝阳公园南路1号' },
  { lat: 39.9488, lng: 116.4675, name: '红领巾公园', address: '北京市朝阳区后八里庄5号' },
  { lat: 39.8755, lng: 116.4580, name: '天坛公园', address: '北京市东城区天坛东路1号' },
];

const speciesIds = ['sp-001', 'sp-004', 'sp-006', 'sp-008', 'sp-010', 'sp-013', 'sp-014', 'sp-015', 'sp-018', 'sp-020', 'sp-005', 'sp-011', 'sp-016', 'sp-017', 'sp-003'];
const behaviors: BehaviorTag[] = ['觅食', '繁殖', '栖息', '迁徙', '鸣唱', '育雏', '争斗'];

const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDatePast = (daysBack: number) => Date.now() - randomInt(0, daysBack) * 86400000 - randomInt(0, 86400) * 1000;

export const mockObservations: Observation[] = Array.from({ length: 18 }).map((_, i) => {
  const ts = randomDatePast(60);
  const spId = speciesIds[i % speciesIds.length];
  const sp = getSpeciesById(spId);
  const d = new Date(ts);
  const loc = locations[i % locations.length];
  const behCount = randomInt(1, 3);
  const behs: BehaviorTag[] = [];
  for (let b = 0; b < behCount; b++) {
    const bh = randomPick(behaviors);
    if (!behs.includes(bh)) behs.push(bh);
  }
  const photoCount = randomInt(0, 3);
  const photos = photoCount > 0 ? Array.from({ length: photoCount }).map((_, pi) => ({
    id: `ph-${i}-${pi}`,
    url: makeImg(photoIds[(i + pi) % photoIds.length]),
  })) : [];
  const hasAudio = Math.random() > 0.6;
  const audios = hasAudio ? [{ id: `au-${i}`, url: '', duration: randomInt(5, 45) }] : [];

  const isDraft = i >= 16;
  const needsCompletion = !isDraft && (photos.length === 0 || behs.length === 0);

  return {
    id: `obs-${String(i + 1).padStart(3, '0')}`,
    speciesId: spId,
    speciesName: sp?.commonName || '未知鸟种',
    speciesThumb: sp?.thumbUrl || makeThumb(photoIds[i % photoIds.length]),
    timestamp: ts,
    dateStr: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`,
    timeStr: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    weather: randomPick(weathers),
    location: loc,
    count: randomInt(1, 12),
    behaviors: behs,
    photos,
    audios,
    notes: i % 4 === 0 ? '在靠近湖边的灌丛中发现，成鸟带着两只幼鸟觅食。姿态轻盈，羽色鲜亮。' : (i % 3 === 0 ? '飞行姿态优美，停留枝头鸣唱约10分钟。' : ''),
    isDraft,
    needsCompletion,
    tripId: i < 6 ? (i < 3 ? 'trip-001' : 'trip-002') : undefined,
    createdAt: ts,
  };
});

export const getObservationsByTrip = (tripId: string): Observation[] => {
  return mockObservations.filter(o => o.tripId === tripId);
};

export const getDraftObservations = (): Observation[] => {
  return mockObservations.filter(o => o.isDraft);
};

export const getIncompleteObservations = (): Observation[] => {
  return mockObservations.filter(o => o.needsCompletion);
};
