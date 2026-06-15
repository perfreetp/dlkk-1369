import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import { getSpeciesById } from '@/data/mockSpecies';
import StatCard from '@/components/StatCard';
import TripCard from '@/components/TripCard';
import SectionHeader from '@/components/SectionHeader';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { user, trips, monthlyStats, wishlist } = useBirdingStore();

  useDidShow(() => {
    console.log('[Mine] 页面显示');
  });

  const newSpeciesNames = useMemo(() => {
    return monthlyStats.newSpecies
      .map(id => getSpeciesById(id)?.commonName)
      .filter(Boolean) as string[];
  }, [monthlyStats.newSpecies]);

  const menuItems = [
    { icon: '⭐', text: '待观察清单', bg: 'rgba(212,168,67,0.15)', link: '/pages/wishlist/index' },
    { icon: '📊', text: '完整统计数据', bg: 'rgba(47,107,79,0.12)', link: '/pages/stats-detail/index' },
    { icon: '📦', text: '新建行程包', bg: 'rgba(166,123,91,0.15)', link: '/pages/new-trip/index' },
    { icon: '📤', text: '导出分享简报', bg: 'rgba(47,107,79,0.12)', onClick: () => Taro.showToast({ title: '导出功能开发中', icon: 'none' }) },
    { icon: '⚙️', text: '设置与偏好', bg: 'rgba(0,0,0,0.06)', onClick: () => Taro.showToast({ title: '设置开发中', icon: 'none' }) },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.onClick) item.onClick();
    else if (item.link) Taro.navigateTo({ url: item.link });
  };

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        {/* 个人信息 */}
        <View className={styles.profileHeader}>
          <Image className={styles.avatar} src={user.avatar || ''} mode="aspectFill" />
          <View className={styles.profileInfo}>
            <Text className={styles.nickname}>{user.nickname}</Text>
            <View className={styles.birdingMeta}>
              <Text className={styles.levelBadge}>{user.level}观鸟人</Text>
              <Text className={styles.sinceText}>自 {user.birdingSince} 起</Text>
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

        {/* 本月统计卡片 */}
        <SectionHeader
          title="月度概览"
          subtitle={`${monthlyStats.year}年${monthlyStats.month}月`}
          actionText="详情"
          actionLink="/pages/stats-detail/index"
        />
        <View
          className={styles.monthlyCard}
          onClick={() => Taro.navigateTo({ url: '/pages/stats-detail/index' })}
        >
          <View className={styles.monthlyHeader}>
            <Text className={styles.monthlyLabel}>本月成果</Text>
            <Text className={styles.monthlySub}>待观察完成 {wishlist.filter(w => w.observed).length}/{wishlist.length}</Text>
          </View>
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
          </View>
          {newSpeciesNames.length > 0 && (
            <View className={styles.monthlyNew}>
              <Text className={styles.newLabel}>✨ 本月新增鸟种</Text>
              <View className={styles.newNames}>
                {newSpeciesNames.map(name => (
                  <Text key={name} className={styles.newTag}>+ {name}</Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 行程包 */}
        <SectionHeader
          title="行程包"
          subtitle="整理多次记录的故事"
          actionText="全部"
          onAction={() => Taro.showToast({ title: '行程列表开发中', icon: 'none' })}
        />
        <View className={styles.tripList}>
          {trips.slice(0, 2).map(trip => (
            <TripCard key={trip.id} data={trip} variant="horizontal" />
          ))}
        </View>

        {/* 功能菜单 */}
        <View className={styles.menuSection}>
          {menuItems.map(item => (
            <View
              key={item.text}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item)}
            >
              <View className={styles.menuIcon} style={{ background: item.bg }}>
                {item.icon}
              </View>
              <Text className={styles.menuText}>{item.text}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MinePage;
