import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Trip } from '@/types';
import styles from './index.module.scss';

interface TripCardProps {
  data: Trip;
  variant?: 'horizontal' | 'vertical';
  onClick?: () => void;
  className?: string;
}

const TripCard: React.FC<TripCardProps> = ({
  data,
  variant = 'vertical',
  onClick,
  className,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    else Taro.navigateTo({ url: `/pages/trip-detail/index?id=${data.id}` });
  };

  if (variant === 'horizontal') {
    return (
      <View
        className={classnames(styles.hCard, className)}
        onClick={handleClick}
      >
        <Image className={styles.hCover} src={data.coverUrl} mode="aspectFill" />
        <View className={styles.hBody}>
          <Text className={styles.hTitle}>{data.title}</Text>
          <View className={styles.hMetaRow}>
            <Text className={styles.hMeta}>📅 {data.dateRangeStr}</Text>
          </View>
          <View className={styles.hMetaRow}>
            <Text className={styles.hMeta}>📍 {data.locationSummary}</Text>
          </View>
          <View className={styles.hStats}>
            <View className={styles.hStatItem}>
              <Text className={styles.hStatNum}>{data.speciesCount}</Text>
              <Text className={styles.hStatLabel}>鸟种</Text>
            </View>
            <View className={styles.hStatDivider} />
            <View className={styles.hStatItem}>
              <Text className={styles.hStatNum}>{data.observationCount}</Text>
              <Text className={styles.hStatLabel}>记录</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      className={classnames(styles.vCard, className)}
      onClick={handleClick}
    >
      <Image className={styles.vCover} src={data.coverUrl} mode="aspectFill" />
      <View className={styles.vBody}>
        <Text className={styles.vTitle}>{data.title}</Text>
        <View className={styles.vStats}>
          <View className={styles.vStatItem}>
            <Text className={styles.vStatNum}>{data.speciesCount}</Text>
            <Text className={styles.vStatLabel}>鸟种</Text>
          </View>
          <View className={styles.vStatDivider} />
          <View className={styles.vStatItem}>
            <Text className={styles.vStatNum}>{data.observationCount}</Text>
            <Text className={styles.vStatLabel}>记录</Text>
          </View>
        </View>
        <View className={styles.vMetaRow}>
          <Text className={styles.vMeta}>📅 {data.dateRangeStr}</Text>
        </View>
        <View className={styles.vMetaRow}>
          <Text className={styles.vMeta}>📍 {data.locationSummary}</Text>
        </View>
      </View>
    </View>
  );
};

export default TripCard;
