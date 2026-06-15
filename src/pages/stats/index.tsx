import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import { getSpeciesById } from '@/data/mockSpecies';
import CustomTabBar from '@/components/CustomTabBar';
import StatCard from '@/components/StatCard';
import SectionHeader from '@/components/SectionHeader';
import SpeciesCard from '@/components/SpeciesCard';
import styles from './index.module.scss';

const StatsPage: React.FC = () => {
  const { user, monthlyStats, wishlist, observations } = useBirdingStore();

  useDidShow(() => {
    console.log('[Stats] 页面显示');
  });

  const topSpecies = useMemo(() => {
    const countMap: Record<string, number> = {};
    observations.forEach(obs => {
      countMap[obs.speciesId] = (countMap[obs.speciesId] || 0) + obs.count;
    });
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ species: getSpeciesById(id), count }))
      .filter(item => item.species);
  }, [observations]);

  const observedWishlist = wishlist.filter(w => w.observed).length;

  return (
    <View className={styles.page}>
      <ScrollView className={styles.scrollView} scrollY enhanced showScrollbar={false}>
        <View className={styles.container}>
          {/* 头部 */}
          <View className={styles.header}>
            <View className={styles.profileRow}>
              <Image className={styles.avatar} src={user.avatar || ''} mode="aspectFill" />
              <View className={styles.profileInfo}>
                <Text className={styles.nickname}>{user.nickname}</Text>
                <Text className={styles.levelBadge}>{user.level}观鸟人 · 自 {user.birdingSince}</Text>
              </View>
            </View>
          </View>

          {/* 累计统计 */}
          <View className={styles.statsGrid}>
            <StatCard
              label="总记录数"
              value={user.totalObservations}
              icon="📝"
              variant="primary"
            />
            <StatCard
              label="识别鸟种"
              value={user.totalSpecies}
              icon="🐦"
              variant="accent"
            />
            <StatCard
              label="完成行程"
              value={user.totalTrips}
              icon="🎒"
              variant="highlight"
            />
          </View>

          {/* 本月统计 */}
          <SectionHeader
            title={`${monthlyStats.year}年${monthlyStats.month}月统计`}
            subtitle="本月观鸟成果"
            actionText="完整数据"
            actionLink="/pages/stats-detail/index"
          />
          <View
            className={styles.monthlyCard}
            onClick={() => Taro.navigateTo({ url: '/pages/stats-detail/index' })}
          >
            <View className={styles.monthlyStats}>
              <View className={styles.msItem}>
                <Text className={styles.msNum}>{monthlyStats.totalObservations}</Text>
                <Text className={styles.msLabel}>记录</Text>
              </View>
              <View className={styles.msItem}>
                <Text className={styles.msNum}>{monthlyStats.totalSpecies}</Text>
                <Text className={styles.msLabel}>鸟种</Text>
              </View>
              <View className={styles.msItem}>
                <Text className={styles.msNum}>{monthlyStats.totalTrips}</Text>
                <Text className={styles.msLabel}>行程</Text>
              </View>
              <View className={styles.msItem}>
                <Text className={styles.msNum}>{observedWishlist}</Text>
                <Text className={styles.msLabel}>心愿达成</Text>
              </View>
            </View>
            <View className={styles.monthlyNew}>
              <Text className={styles.newLabel}>✨ 本月新增鸟种</Text>
              <View className={styles.newTags}>
                {monthlyStats.newSpecies.slice(0, 4).map(id => {
                  const sp = getSpeciesById(id);
                  return sp ? (
                    <Text key={id} className={styles.newTag}>+ {sp.commonName}</Text>
                  ) : null;
                })}
              </View>
            </View>
          </View>

          {/* 常见鸟种排行 */}
          <SectionHeader title="常见鸟种 TOP5" subtitle="你最常遇到的" />
          <View className={styles.topList}>
            {topSpecies.map((item, index) => (
              <View key={item.species!.id} className={styles.topItem}>
                <View className={`${styles.topRank} ${styles[`rank${index + 1}`]}`}>
                  {index + 1}
                </View>
                <View className={styles.topContent} onClick={() => Taro.navigateTo({ url: `/pages/species-detail/index?id=${item.species!.id}` })}>
                  <SpeciesCard data={item.species!} variant="list" />
                </View>
                <View className={styles.topCount}>
                  <Text className={styles.topCountNum}>{item.count}</Text>
                  <Text className={styles.topCountLabel}>次</Text>
                </View>
              </View>
            ))}
          </View>

          {/* 快捷入口 */}
          <SectionHeader title="更多数据" subtitle="深度复盘你的观鸟记录" />
          <View className={styles.quickGrid}>
            <View
              className={styles.quickItem}
              onClick={() => Taro.navigateTo({ url: '/pages/wishlist/index' })}
            >
              <View className={styles.quickIcon}>⭐</View>
              <View className={styles.quickInfo}>
                <Text className={styles.quickTitle}>待观察清单</Text>
                <Text className={styles.quickDesc}>{observedWishlist}/{wishlist.length} 已观察</Text>
              </View>
              <Text className={styles.quickArrow}>›</Text>
            </View>
            <View
              className={styles.quickItem}
              onClick={() => Taro.showToast({ title: '导出功能开发中', icon: 'none' })}
            >
              <View className={styles.quickIcon}>📤</View>
              <View className={styles.quickInfo}>
                <Text className={styles.quickTitle}>导出分享简报</Text>
                <Text className={styles.quickDesc}>生成精美图文</Text>
              </View>
              <Text className={styles.quickArrow}>›</Text>
            </View>
          </View>
        </View>
        <View className={styles.bottomSpacer} />
      </ScrollView>
      <CustomTabBar current="stats" />
    </View>
  );
};

export default StatsPage;
