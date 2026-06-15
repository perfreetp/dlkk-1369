import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import { relativeTime } from '@/utils/date';
import ObservationCard from '@/components/ObservationCard';
import EmptyState from '@/components/EmptyState';
import CustomTabBar from '@/components/CustomTabBar';
import styles from './index.module.scss';

type FilterType = 'all' | 'incomplete' | 'photo' | 'audio';

const RecordPage: React.FC = () => {
  const { observations } = useBirdingStore();
  const [filter, setFilter] = useState<FilterType>('all');

  useDidShow(() => {
    console.log('[Record] 页面显示');
  });

  const drafts = useMemo(() => observations.filter(o => o.isDraft), [observations]);
  const incomplete = useMemo(() => observations.filter(o => o.needsCompletion), [observations]);

  const filteredObservations = useMemo(() => {
    let list = observations.filter(o => !o.isDraft);
    switch (filter) {
      case 'incomplete':
        list = list.filter(o => o.needsCompletion);
        break;
      case 'photo':
        list = list.filter(o => o.photos.length > 0);
        break;
      case 'audio':
        list = list.filter(o => o.audios.length > 0);
        break;
      default:
        break;
    }
    return [...list].sort((a, b) => b.timestamp - a.timestamp);
  }, [observations, filter]);

  const stats = useMemo(() => ({
    total: observations.filter(o => !o.isDraft).length,
    withPhoto: observations.filter(o => !o.isDraft && o.photos.length > 0).length,
    withAudio: observations.filter(o => !o.isDraft && o.audios.length > 0).length,
    incompleteCount: incomplete.length,
  }), [observations, incomplete.length]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `全部 ${stats.total}` },
    { key: 'incomplete', label: `待补全 ${stats.incompleteCount}` },
    { key: 'photo', label: `有照片 ${stats.withPhoto}` },
    { key: 'audio', label: `有录音 ${stats.withAudio}` },
  ];

  const goNewRecord = () => {
    Taro.navigateTo({ url: '/pages/new-record/index' });
  };

  const goCompleteObs = (id: string) => {
    Taro.navigateTo({ url: `/pages/new-record/index?editId=${id}` });
  };

  return (
    <View className={styles.page}>
      <ScrollView className={styles.scrollView} scrollY enhanced showScrollbar={false}>
        <View className={styles.container}>
        <View className={styles.header}>
          <Text className={styles.pageTitle}>观察记录</Text>
          <Text className={styles.pageSubtitle}>
            共 {stats.total} 条记录 · {drafts.length} 份草稿
          </Text>
        </View>

        {/* 筛选栏 */}
        <View className={styles.filterBar}>
          {filters.map(f => (
            <View
              key={f.key}
              className={`${styles.filterChip} ${filter === f.key ? styles.filterChipActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </View>
          ))}
        </View>

        {/* 待补全提醒 */}
        {incomplete.length > 0 && filter === 'all' && (
          <View className={styles.alertSection}>
            <View
              className={styles.alertCard}
              onClick={() => setFilter('incomplete')}
            >
              <View className={styles.alertTop}>
                <Text className={styles.alertIcon}>⚠️</Text>
                <Text className={styles.alertTitle}>待补全的记录</Text>
                <Text className={styles.alertBadge}>{incomplete.length}条</Text>
              </View>
              <Text className={styles.alertDesc}>
                以下记录缺少照片、行为标签等信息，建议补全以提高统计精度
              </Text>
            </View>
          </View>
        )}

        {/* 草稿箱 */}
        {drafts.length > 0 && filter === 'all' && (
          <View className={styles.draftSection}>
            <View className={styles.draftCard}>
              <View className={styles.draftHeader}>
                <Text className={styles.draftTitle}>📝 离线草稿</Text>
                <Text className={styles.draftBadge}>{drafts.length}份</Text>
              </View>
              <View className={styles.draftList}>
                {drafts.map(d => (
                  <View
                    key={d.id}
                    className={styles.draftItem}
                    onClick={() => goCompleteObs(d.id)}
                  >
                    <Image
                      className={styles.draftThumb}
                      src={d.speciesThumb || d.photos[0]?.url}
                      mode="aspectFill"
                    />
                    <View className={styles.draftInfo}>
                      <Text className={styles.draftName}>{d.speciesName}</Text>
                      <Text className={styles.draftMeta}>
                        {d.dateStr} · {relativeTime(d.createdAt)}
                      </Text>
                    </View>
                    <Text className={styles.draftContinue}>继续</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 记录列表标题 */}
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>
            {filter === 'all' ? '全部记录' :
             filter === 'incomplete' ? '待补全记录' :
             filter === 'photo' ? '含照片记录' : '含录音记录'}
          </Text>
          <Text className={styles.listCount}>{filteredObservations.length}条</Text>
        </View>

        {/* 记录列表 */}
        {filteredObservations.length > 0 ? (
          <View className={styles.obsList}>
            {filteredObservations.map(obs => (
              <ObservationCard
                key={obs.id}
                data={obs}
                variant="compact"
                onClick={() => obs.needsCompletion
                  ? goCompleteObs(obs.id)
                  : Taro.navigateTo({ url: `/pages/observation-detail/index?id=${obs.id}` })
                }
              />
            ))}
          </View>
        ) : (
          <View className={styles.emptyWrap}>
            <EmptyState
              icon="📭"
              title="暂无记录"
              description={filter === 'incomplete' ? '所有记录都已补全，做得不错！' :
                filter === 'photo' ? '还没有带照片的记录' :
                filter === 'audio' ? '还没有带录音的记录' : '点击右下角按钮，记录你第一次观察吧'}
              actionText={filter === 'all' ? '开始记录' : undefined}
              onAction={filter === 'all' ? goNewRecord : undefined}
            />
          </View>
        )}
        <View className={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* 悬浮新建按钮 */}
      <View className={styles.fabButton} onClick={goNewRecord}>
        <Text className={styles.fabIcon}>+</Text>
      </View>

      <CustomTabBar current="record" />
    </View>
  );
};

export default RecordPage;
