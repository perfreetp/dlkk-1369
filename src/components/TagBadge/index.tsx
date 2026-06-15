import React from 'react';
import { Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'ghost';

interface TagBadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const TagBadge: React.FC<TagBadgeProps> = ({
  text,
  variant = 'default',
  size = 'sm',
  className,
}) => {
  return (
    <Text className={classnames(
      styles.badge,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      className,
    )}>
      {text}
    </Text>
  );
};

export default TagBadge;
