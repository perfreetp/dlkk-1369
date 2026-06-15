import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Observation } from '@/types';
import { weatherToText } from '@/utils/format';
import { relativeTime } from '@/utils/date';
import TagBadge from '@/components/TagBadge';
import styles from './index.module.scss';

interface ObservationCardProps {
  data: Observation;
  variant?: 'compact' | 'full';
  onClick?: () => void;
  className?: string;
}

const ObservationCard: React.FC<ObservationCardProps> = ({
  data,
  variant = 'compact',
  onClick,
  className,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/observation-detail/index?id=${data.id}` });
    }
  };

  return (
    <View
      className={classnames(
        styles.card,
        variant === 'full' && styles.cardFull,
        className,
      )}
      onClick={handleClick}
    >
      {variant === 'full' && data.photos.length > 0 && (
        <Image
          className={styles.heroImage}
          src={data.photos[0].url}
          mode="aspectFill"
        />
      )}
      <View className={styles.cardBody}>
        <View className={styles.topRow}>
          <View className={styles.speciesInfo}>
            {data.speciesThumb && (
              <Image
                className={styles.thumb}
                src={data.speciesThumb}
                mode="aspectFill"
              />
            )}
            <View className={styles.speciesText}>
              <Text className={styles.speciesName}>{data.speciesName}</Text>
              <View className={styles.metaRow}>
                <Text className={styles.metaText}>{data.dateStr}</Text>
                <Text className={styles.metaDot}>·</Text>
                <Text className={styles.metaText}>{data.timeStr}</Text>
                <Text className={styles.metaDot}>·</Text>
                <Text className={styles.metaText}>{weatherToText(data.weather)}</Text>
              </View>
            </View>
          </View>
          <View className={styles.countBadge}>
            <Text className={styles.countText}>×{data.count}</Text>
          </View>
        </View>

        {variant === 'full' && (
          <View className={styles.locationRow}>
            <Text className={styles.locationIcon}>📍</Text>
            <Text className={styles.locationText}>{data.location.name}</Text>
          </View>
        )}

        {data.behaviors.length > 0 && (
          <View className={styles.tagsWrap}>
            {data.behaviors.map(b => (
              <TagBadge key={b} text={b} variant="primary" />
            ))}
            {data.photos.length > 0 && <TagBadge text={`📷 ${data.photos.length}`} variant="ghost" />}
            {data.audios.length > 0 && <TagBadge text={`🎵 ${data.audios.length}`} variant="ghost" />}
          </View>
        )}

        {variant === 'full' && data.notes && (
          <Text className={styles.notes}>
            {data.notes.length > 60 ? data.notes.slice(0, 60) + '...' : data.notes}
          </Text>
        )}

        {data.needsCompletion && (
          <View className={styles.alertRow}>
            <TagBadge text="⚠️ 请补全信息" variant="warning" />
          </View>
        )}
        {data.isDraft && (
          <View className={styles.alertRow}>
            <TagBadge text="📝 草稿" variant="accent" />
            <Text className={styles.relativeTime}>{relativeTime(data.createdAt)}</Text>
          </View>
        )}

        {!data.isDraft && variant === 'compact' && (
          <Text className={styles.relativeTime}>{relativeTime(data.createdAt)}</Text>
        )}
      </View>
    </View>
  );
};

export default ObservationCard;
