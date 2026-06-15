import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import CustomTabBar from '@/components/CustomTabBar';
import TripCard from '@/components/TripCard';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const TripsPage: React.FC = () => {
  const { trips } = useBirdingStore();

  useDidShow(() => {
    console.log('[Trips] 页面显示');
  });

  const handleNewTrip = () => {
    Taro.navigateTo({ url: '/pages/new-trip/index' });
  };

  const handleTripClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/trip-detail/index?id=${id}` });
  };

  return (
    <View className={styles.page}>
      <ScrollView className={styles.scrollView} scrollY enhanced showScrollbar={false}>
        <View className={styles.container}>
          <View className={styles.header}>
            <View>
              <Text className={styles.title}>行程包</Text>
              <Text className={styles.subtitle}>把多次记录打包成一次旅行故事</Text>
            </View>
            <View className={styles.newBtn} onClick={handleNewTrip}>
              <Text className={styles.newBtnIcon}>+</Text>
              <Text className={styles.newBtnText}>新建</Text>
            </View>
          </View>

          <SectionHeader title="全部行程" subtitle={`共 ${trips.length} 个行程包`} />

          {trips.length === 0 ? (
            <EmptyState
              icon="🎒"
              title="还没有行程包"
              description="把多次观察记录打包整理，形成完整的观鸟旅行"
              actionText="创建第一个行程"
              onAction={handleNewTrip}
            />
          ) : (
            <View className={styles.tripList}>
              {trips.map(trip => (
                <View key={trip.id} onClick={() => handleTripClick(trip.id)}>
                  <TripCard data={trip} variant="horizontal" />
                </View>
              ))}
            </View>
          )}
        </View>
        <View className={styles.bottomSpacer} />
      </ScrollView>
      <CustomTabBar current="trips" />
    </View>
  );
};

export default TripsPage;
