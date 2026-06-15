import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const tabs = [
  { key: 'discover', text: '发现', icon: '🔍', pagePath: '/pages/discover/index' },
  { key: 'record', text: '记录', icon: '📝', pagePath: '/pages/record/index' },
  { key: 'map', text: '地图', icon: '🗺️', pagePath: '/pages/map/index' },
  { key: 'species', text: '物种库', icon: '🐦', pagePath: '/pages/species/index' },
  { key: 'trips', text: '行程包', icon: '🎒', pagePath: '/pages/trips/index' },
  { key: 'stats', text: '统计', icon: '📊', pagePath: '/pages/stats/index' },
];

interface CustomTabBarProps {
  current: string;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ current }) => {
  const handleTabClick = (key: string, pagePath: string) => {
    if (key === current) return;
    Taro.redirectTo({ url: pagePath });
  };

  return (
    <View className={styles.tabBar}>
      {tabs.map(tab => {
        const isActive = tab.key === current;
        return (
          <View
            key={tab.key}
            className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
            onClick={() => handleTabClick(tab.key, tab.pagePath)}
          >
            <View className={styles.tabIcon}>{tab.icon}</View>
            <Text className={styles.tabText}>{tab.text}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default CustomTabBar;
