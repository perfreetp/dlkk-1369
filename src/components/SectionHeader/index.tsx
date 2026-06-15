import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  actionLink,
  onAction,
  className,
}) => {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionLink) {
      Taro.navigateTo({ url: actionLink });
    }
  };

  return (
    <View className={classnames(styles.container, className)}>
      <View className={styles.left}>
        <Text className={styles.title}>{title}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
      {(actionText && (actionLink || onAction)) && (
        <Text className={styles.action} onClick={handleAction}>
          {actionText} →
        </Text>
      )}
    </View>
  );
};

export default SectionHeader;
