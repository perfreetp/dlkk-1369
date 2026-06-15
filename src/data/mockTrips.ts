import type { Trip } from '@/types';
import { getObservationsByTrip } from './mockObservations';

const makeImg = (id: number) => `https://picsum.photos/id/${id}/750/400`;

export const mockTrips: Trip[] = [
  {
    id: 'trip-001',
    title: '奥森初夏寻鸟',
    coverUrl: makeImg(1015),
    startTimestamp: Date.now() - 15 * 86400000 - 6 * 3600000,
    endTimestamp: Date.now() - 15 * 86400000 + 5 * 3600000,
    dateRangeStr: '6月1日 06:00 - 17:00',
    locationSummary: '奥林匹克森林公园',
    observationIds: [],
    speciesCount: 3,
    observationCount: 3,
    notes: '清晨入园，沿南园湿地步道一路往北，天气凉爽适合观鸟。上午在芦苇荡旁拍到白鹭育雏，是本次最大收获。',
    createdAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'trip-002',
    title: '颐和园皇家园林漫步',
    coverUrl: makeImg(1018),
    startTimestamp: Date.now() - 10 * 86400000 - 5 * 3600000,
    endTimestamp: Date.now() - 10 * 86400000 + 4 * 3600000,
    dateRangeStr: '6月6日 07:00 - 16:00',
    locationSummary: '颐和园',
    observationIds: [],
    speciesCount: 3,
    observationCount: 3,
    notes: '西堤沿线柳树上鸣禽活跃，昆明湖上水鸟众多。下午在谐趣园拍到戴胜，惊喜连连。',
    createdAt: Date.now() - 9 * 86400000,
  },
  {
    id: 'trip-003',
    title: '圆明园湿地探索',
    coverUrl: makeImg(1036),
    startTimestamp: Date.now() - 5 * 86400000 - 6 * 3600000,
    endTimestamp: Date.now() - 5 * 86400000 + 6 * 3600000,
    dateRangeStr: '6月11日 06:00 - 18:00',
    locationSummary: '圆明园遗址公园',
    observationIds: [],
    speciesCount: 5,
    observationCount: 7,
    notes: '福海周边是水鸟天堂，芦苇丛中小䴙䴘筑巢。西洋楼遗址的老树上猛禽盘旋。',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'trip-004',
    title: '天坛古柏林观察',
    coverUrl: makeImg(1039),
    startTimestamp: Date.now() - 2 * 86400000 - 6 * 3600000,
    endTimestamp: Date.now() - 2 * 86400000 + 3 * 3600000,
    dateRangeStr: '6月14日 06:00 - 15:00',
    locationSummary: '天坛公园',
    observationIds: [],
    speciesCount: 4,
    observationCount: 5,
    notes: '古树参天，是城市中心难得的鸟类栖息地。啄木鸟和山雀活跃。',
    createdAt: Date.now() - 86400000,
  },
];

// 关联观察记录到行程
mockTrips.forEach(trip => {
  const obs = getObservationsByTrip(trip.id);
  trip.observationIds = obs.map(o => o.id);
  trip.observationCount = obs.length;
  const uniqueSpecies = new Set(obs.map(o => o.speciesId));
  trip.speciesCount = uniqueSpecies.size;
});
