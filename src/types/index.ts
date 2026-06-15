// 观察记录相关
export interface ObservationPhoto {
  id: string;
  url: string;
}

export interface ObservationAudio {
  id: string;
  url: string;
  duration: number;
}

export type BehaviorTag = '觅食' | '繁殖' | '栖息' | '迁徙' | '鸣唱' | '育雏' | '争斗' | '其他';

export interface Observation {
  id: string;
  speciesId: string;
  speciesName: string;
  speciesThumb?: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  weather: '晴' | '多云' | '阴' | '小雨' | '大雨' | '雪' | '雾';
  location: {
    lat: number;
    lng: number;
    name: string;
    address?: string;
  };
  count: number;
  behaviors: BehaviorTag[];
  photos: ObservationPhoto[];
  audios: ObservationAudio[];
  notes: string;
  isDraft: boolean;
  needsCompletion: boolean;
  tripId?: string;
  createdAt: number;
}

// 物种相关
export interface Species {
  id: string;
  commonName: string;
  latinName: string;
  category: '鸣禽' | '猛禽' | '涉禽' | '游禽' | '攀禽' | '陆禽' | '走禽' | '其他';
  family: string;
  size: '极小' | '小' | '中' | '大' | '极大';
  description: string;
  appearance: string[];
  habitat: string;
  diet: string;
  distribution: string;
  bestSeason: number[];
  thumbUrl: string;
  gallery: string[];
  conservationStatus: '无危' | '近危' | '易危' | '濒危' | '极危';
  callDescription?: string;
  similarSpeciesIds: string[];
}

// 行程包
export interface Trip {
  id: string;
  title: string;
  coverUrl: string;
  startTimestamp: number;
  endTimestamp: number;
  dateRangeStr: string;
  locationSummary: string;
  observationIds: string[];
  speciesCount: number;
  observationCount: number;
  notes: string;
  createdAt: number;
}

// 个人统计
export interface MonthlyStats {
  year: number;
  month: number;
  totalObservations: number;
  totalSpecies: number;
  totalTrips: number;
  topSpecies: { speciesId: string; name: string; count: number }[];
  weeklyDistribution: number[];
  newSpecies: string[];
  locations: { name: string; count: number }[];
}

// 待观察清单
export interface WishlistItem {
  speciesId: string;
  speciesName: string;
  speciesThumb: string;
  addedAt: number;
  priority: '高' | '中' | '低';
  notes?: string;
  observed: boolean;
  observedAt?: number;
}

// 用户数据
export interface UserProfile {
  nickname: string;
  avatar?: string;
  birdingSince: string;
  level: '入门' | '进阶' | '资深' | '专家';
  totalObservations: number;
  totalSpecies: number;
  totalTrips: number;
}
