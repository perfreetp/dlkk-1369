import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import { getCurrentSeason } from '@/utils/date';
import { getSeasonalSpecies } from '@/data/mockSpecies';
import SectionHeader from '@/components/SectionHeader';
import SpeciesCard from '@/components/SpeciesCard';
import ObservationCard from '@/components/ObservationCard';
import CustomTabBar from '@/components/CustomTabBar';
import styles from './index.module.scss';

const DiscoverPage: React.FC = () => {
  const { observations, wishlist, user } = useBirdingStore();

  useDidShow(() => {
    console.log('[Discover] 页面显示');
  });

  const season = getCurrentSeason();
  const seasonTextMap = { '春': '春季迁徙季', '夏': '夏季繁殖季', '秋': '秋季迁徙季', '冬': '冬季越冬期' };
  const seasonEmoji = { '春': '🌸', '夏': '🌿', '秋': '🍂', '冬': '❄️' };

  const seasonalSpecies = useMemo(() => getSeasonalSpecies(season).slice(0, 6), [season]);

  const recentObservations = useMemo(() => {
    return [...observations]
      .filter(o => !o.isDraft)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
  }, [observations]);

  const incompleteCount = useMemo(() => {
    return observations.filter(o => o.needsCompletion).length;
  }, [observations]);

  const wishlistObserved = wishlist.filter(w => w.observed).length;
  const wishlistProgress = wishlist.length > 0 ? Math.round(wishlistObserved / wishlist.length * 100) : 0;

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new':
        Taro.navigateTo({ url: '/pages/new-record/index' });
        break;
      case 'wishlist':
        Taro.navigateTo({ url: '/pages/wishlist/index' });
        break;
      case 'newTrip':
        Taro.navigateTo({ url: '/pages/new-trip/index' });
        break;
      case 'compare':
        Taro.navigateTo({ url: '/pages/species-compare/index' });
        break;
    }
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView} enhanced showScrollbar={false}>
        <View className={styles.container}>
        {/* Hero 问候区 */}
        <View className={styles.hero}>
          <Text className={styles.heroGreeting}>你好，{user.nickname}</Text>
          <Text className={styles.heroTitle}>
            {seasonEmoji[season]} 今天适合出门观鸟
          </Text>
          <Text className={styles.heroSubtitle}>
            {seasonTextMap[season]} · 附近可能出现 {seasonalSpecies.length} 种特色鸟种
          </Text>
        </View>

        {/* 快速入口 */}
        <View className={styles.quickActions}>
          <View className={styles.quickItem} onClick={() => handleQuickAction('new')}>
            <View className={styles.quickIcon} style={{ background: '$color-primary-soft' }}>📝</View>
            <Text className={styles.quickLabel}>新记录</Text>
          </View>
          <View className={styles.quickItem} onClick={() => handleQuickAction('wishlist')}>
            <View className={styles.quickIcon} style={{ background: '$color-highlight-soft' }}>⭐</View>
            <Text className={styles.quickLabel}>待观察</Text>
          </View>
          <View className={styles.quickItem} onClick={() => handleQuickAction('newTrip')}>
            <View className={styles.quickIcon} style={{ background: 'rgba(166,123,91,0.12)' }}>🎒</View>
            <Text className={styles.quickLabel}>新行程</Text>
          </View>
          <View className={styles.quickItem} onClick={() => handleQuickAction('compare')}>
            <View className={styles.quickIcon} style={{ background: 'rgba(212,168,67,0.12)' }}>🔍</View>
            <Text className={styles.quickLabel}>对比识别</Text>
          </View>
        </View>

        {/* 当季推荐 */}
        <View className={styles.seasonSection}>
          <View className={styles.seasonHeader}>
            <View className={styles.seasonTag}>
              <Text>{seasonEmoji[season]}</Text>
              <Text className={styles.seasonTagText}>{seasonTextMap[season]} · 推荐</Text>
            </View>
            <Text
              className={styles.action}
              onClick={() => Taro.redirectTo({ url: '/pages/species/index' })}
              style={{ fontSize: '24rpx', color: '#2F6B4F', fontWeight: 500 }}
            >
              查看全部 →
            </Text>
          </View>
          <ScrollView scrollX className={styles.featuredScroll} enhanced showScrollbar={false}>
            {seasonalSpecies.map(sp => (
              <View className={styles.featuredItem} key={sp.id}>
                <SpeciesCard
                  data={sp}
                  variant="featured"
                  inWishlist={wishlist.some(w => w.speciesId === sp.id)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 待观察清单进度 */}
        <View className={styles.wishlistCard}>
          <View className={styles.wishlistTop}>
            <Text className={styles.wishlistTitle}>⭐ 待观察清单</Text>
            <Text
              onClick={() => Taro.navigateTo({ url: '/pages/wishlist/index' })}
              style={{ fontSize: '24rpx', color: '#2F6B4F', fontWeight: 500 }}
            >
              管理 →
            </Text>
          </View>
          <View className={styles.wishlistProgress}>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${wishlistProgress}%` }} />
            </View>
            <Text className={styles.progressText}>
              {wishlistObserved}/{wishlist.length}
            </Text>
          </View>
          {wishlist.length > 0 && (
            <View className={styles.wishlistGrid}>
              {wishlist.slice(0, 6).map(item => (
                <View
                  key={item.speciesId}
                  className={`${styles.wishlistItem} ${item.observed ? styles.wishlistObserved : ''}`}
                  onClick={() => Taro.navigateTo({ url: `/pages/species-detail/index?id=${item.speciesId}` })}
                >
                  <Image className={styles.wishlistThumb} src={item.speciesThumb} mode="aspectFill" />
                  <Text className={styles.wishlistName}>{item.speciesName}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 待补全提醒 */}
        {incompleteCount > 0 && (
          <View className={styles.reminderSection}>
            <View
              className={styles.reminderCard}
              onClick={() => Taro.redirectTo({ url: '/pages/record/index' })}
            >
              <View className={styles.reminderTop}>
                <Text className={styles.reminderTitle}>
                  ⚠️ 记录待补全
                </Text>
                <Text className={styles.reminderCount}>{incompleteCount}条</Text>
              </View>
              <Text className={styles.reminderDesc}>
                有 {incompleteCount} 条重复拍摄的观察记录尚未补全行为、照片等信息，建议完善后可提升统计精度。
              </Text>
            </View>
          </View>
        )}

        {/* 最近观察 */}
        <View className={styles.recentSection}>
          <SectionHeader
            title="最近的观察"
            subtitle="你最新的记录"
            actionText="全部"
            onAction={() => Taro.redirectTo({ url: '/pages/record/index' })}
          />
          <View className={styles.recentList}>
            {recentObservations.map(obs => (
              <ObservationCard key={obs.id} data={obs} variant="compact" />
            ))}
          </View>
        </View>
        <View className={styles.bottomSpacer} />
        </View>
      </ScrollView>
      <CustomTabBar current="discover" />
    </View>
  );
};

export default DiscoverPage;
