import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

type StatVariant = 'default' | 'primary' | 'accent' | 'highlight';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: string;
  variant?: StatVariant;
  onClick?: () => void;
  link?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  variant = 'default',
  onClick,
  link,
  className,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    else if (link) Taro.navigateTo({ url: link });
  };

  return (
    <View
      className={classnames(
        styles.card,
        styles[`variant-${variant}`],
        (onClick || link) && styles.clickable,
        className,
      )}
      onClick={handleClick}
    >
      {icon && <Text className={styles.icon}>{icon}</Text>}
      <Text className={styles.value}>{value}</Text>
      <Text className={styles.label}>{label}</Text>
      {subValue && <Text className={styles.subValue}>{subValue}</Text>}
    </View>
  );
};

export default StatCard;
