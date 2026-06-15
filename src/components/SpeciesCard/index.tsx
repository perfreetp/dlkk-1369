import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Species } from '@/types';
import { categoryToIcon } from '@/utils/format';
import TagBadge from '@/components/TagBadge';
import styles from './index.module.scss';

interface SpeciesCardProps {
  data: Species;
  variant?: 'grid' | 'list' | 'featured';
  inWishlist?: boolean;
  onClick?: () => void;
  className?: string;
}

const SpeciesCard: React.FC<SpeciesCardProps> = ({
  data,
  variant = 'grid',
  inWishlist = false,
  onClick,
  className,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    else Taro.navigateTo({ url: `/pages/species-detail/index?id=${data.id}` });
  };

  if (variant === 'featured') {
    return (
      <View className={classnames(styles.featuredCard, className)} onClick={handleClick}>
        <Image className={styles.featuredImg} src={data.thumbUrl} mode="aspectFill" />
        <View className={styles.featuredOverlay}>
          <View className={styles.featuredContent}>
            <View className={styles.featuredTop}>
              <TagBadge text={categoryToIcon(data.category) + ' ' + data.category} variant="ghost" />
              {inWishlist && <TagBadge text="✓ 已收藏" variant="success" />}
            </View>
            <Text className={styles.featuredName}>{data.commonName}</Text>
            <Text className={styles.featuredLatin}>{data.latinName}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (variant === 'list') {
    return (
      <View className={classnames(styles.listCard, className)} onClick={handleClick}>
        <Image className={styles.listThumb} src={data.thumbUrl} mode="aspectFill" />
        <View className={styles.listBody}>
          <View className={styles.listTop}>
            <Text className={styles.listName}>{data.commonName}</Text>
            <TagBadge text={data.size} variant="default" />
          </View>
          <Text className={styles.listLatin}>{data.latinName}</Text>
          <View className={styles.listBottom}>
            <Text className={styles.listFamily}>{data.family}</Text>
            <TagBadge text={data.conservationStatus} variant={data.conservationStatus === '无危' ? 'default' : 'warning'} size="sm" />
          </View>
        </View>
        {inWishlist && <View className={styles.wishBadge}>★</View>}
      </View>
    );
  }

  return (
    <View className={classnames(styles.gridCard, className)} onClick={handleClick}>
      <Image className={styles.gridImg} src={data.thumbUrl} mode="aspectFill" />
      <View className={styles.gridInfo}>
        <Text className={styles.gridName}>{data.commonName}</Text>
        <Text className={styles.gridFamily}>{data.category} · {data.size}</Text>
      </View>
    </View>
  );
};

export default SpeciesCard;
