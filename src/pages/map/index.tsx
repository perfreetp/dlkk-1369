import React, { useMemo, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import SectionHeader from '@/components/SectionHeader';
import styles from './index.module.scss';

const MapPage: React.FC = () => {
  const { observations } = useBirdingStore();
  const [filter, setFilter] = useState<string>('全部');

  useDidShow(() => {
    console.log('[Map] 页面显示');
  });

  const locationStats = useMemo(() => {
    const map = new Map<string, {
      name: string;
      lat: number;
      lng: number;
      count: number;
      speciesCount: number;
      observations: typeof observations;
      pos: { x: string; y: string };
    }>();

    const positions = [
      { x: '25%', y: '30%' },
      { x: '65%', y: '20%' },
      { x: '45%', y: '55%' },
      { x: '75%', y: '65%' },
      { x: '30%', y: '75%' },
      { x: '58%', y: '40%' },
      { x: '15%', y: '50%' },
      { x: '80%', y: '30%' },
    ];

    let idx = 0;
    observations.forEach(o => {
      const key = o.location.name;
      if (!map.has(key)) {
        const pos = positions[idx % positions.length];
        idx++;
        map.set(key, {
          name: key,
          lat: o.location.lat,
          lng: o.location.lng,
          count: 0,
          speciesCount: 0,
          observations: [],
          pos,
        });
      }
      const entry = map.get(key)!;
      entry.count++;
      entry.observations.push(o);
    });

    map.forEach(v => {
      v.speciesCount = new Set(v.observations.map(o => o.speciesId)).size;
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [observations]);

  const stats = useMemo(() => ({
    totalLocations: locationStats.length,
    totalObservations: observations.filter(o => !o.isDraft).length,
    totalSpecies: new Set(observations.map(o => o.speciesId)).size,
  }), [locationStats, observations]);

  const filterOptions = ['全部', '鸣禽', '猛禽', '涉禽', '游禽'];

  return (
    <View className={styles.page}>
      {/* 地图占位 */}
      <View className={styles.mapPlaceholder}>
        <View className={styles.pinDots}>
          {locationStats.slice(0, 8).map((loc, i) => (
            <View
              key={loc.name}
              className={`${styles.pinDot} ${i === 0 ? styles.pinDotActive : ''}`}
              style={{ left: loc.pos.x, top: loc.pos.y }}
              data-count={String(loc.count)}
            />
          ))}
        </View>
        <View className={styles.mapHint}>
          <Text className={styles.mapIcon}>🗺️</Text>
          <Text className={styles.mapTitle}>你的观鸟足迹</Text>
          <Text className={styles.mapSub}>
            已记录 {stats.totalLocations} 个地点，{stats.totalObservations} 次观察
          </Text>
        </View>
      </View>

      {/* 筛选面板 */}
      <View className={styles.filterPanel}>
        <View className={styles.filterCard}>
          {filterOptions.map(opt => (
            <View
              key={opt}
              className={`${styles.filterTag} ${filter === opt ? styles.filterTagActive : ''}`}
              onClick={() => setFilter(opt)}
            >
              {opt}
            </View>
          ))}
        </View>
      </View>

      {/* 统计卡片 */}
      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.totalLocations}</Text>
          <Text className={styles.statLabel}>观察地点</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.totalSpecies}</Text>
          <Text className={styles.statLabel}>鸟种覆盖</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{Math.round(stats.totalSpecies / Math.max(stats.totalLocations, 1) * 10) / 10}</Text>
          <Text className={styles.statLabel}>平均鸟种/地</Text>
        </View>
      </View>

      {/* 地点列表 */}
      <View className={styles.locationSection}>
        <SectionHeader
          title="热门观察点"
          subtitle="按记录次数排序"
          actionText="热力图"
          onAction={() => Taro.showToast({ title: '热力图功能开发中', icon: 'none' })}
        />
        <View className={styles.locationList}>
          {locationStats.slice(0, 5).map(loc => (
            <View
              key={loc.name}
              className={styles.locationCard}
              onClick={() => Taro.switchTab({ url: '/pages/record/index' })}
            >
              <View className={styles.locationInfo}>
                <Text className={styles.locationName}>📍 {loc.name}</Text>
                <View className={styles.locationMeta}>
                  <Text className={styles.locationMetaItem}>🐦 {loc.speciesCount} 种</Text>
                  <Text className={styles.locationMetaItem}>📝 {loc.count} 次记录</Text>
                </View>
                {loc.observations.slice(0, 4).some(o => o.photos.length > 0) && (
                  <View className={styles.obsPreview}>
                    {loc.observations
                      .filter(o => o.photos.length > 0)
                      .slice(0, 4)
                      .map(o => (
                        <Image
                          key={o.id}
                          className={styles.obsThumb}
                          src={o.photos[0].url}
                          mode="aspectFill"
                        />
                      ))}
                  </View>
                )}
              </View>
              <Text className={styles.locationBadge}>TOP {locationStats.indexOf(loc) + 1}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MapPage;
