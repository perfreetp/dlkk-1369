import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import { getSpeciesById } from '@/data/mockSpecies';
import { weatherToText } from '@/utils/format';
import TagBadge from '@/components/TagBadge';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const ObservationDetailPage: React.FC = () => {
  const router = useRouter();
  const { observations } = useBirdingStore();
  const id = router.params.id;

  useDidShow(() => {
    console.log('[ObservationDetail] 页面显示', id);
  });

  const observation = useMemo(() => observations.find(o => o.id === id), [observations, id]);
  const species = useMemo(() => observation ? getSpeciesById(observation.speciesId) : undefined, [observation]);

  if (!observation) {
    return (
      <View className={styles.page}>
        <EmptyState icon="❓" title="记录不存在" description="该观察记录可能已被删除" />
      </View>
    );
  }

  return (
    <View className={styles.page}>
      {/* 照片画廊 */}
      <View className={styles.photoGallery}>
        {observation.photos.length > 0 ? (
          <>
            <Image className={styles.heroPhoto} src={observation.photos[0].url} mode="aspectFill" />
            {observation.photos.length > 1 && (
              <Text className={styles.photoCount}>📷 {observation.photos.length}</Text>
            )}
          </>
        ) : (
          <Image className={styles.heroPhoto} src={observation.speciesThumb || ''} mode="aspectFill" />
        )}
      </View>

      <View className={styles.content}>
        {/* 物种信息 */}
        <View className={styles.speciesHeader}>
          <Image className={styles.speciesThumb} src={observation.speciesThumb || ''} mode="aspectFill" />
          <View className={styles.speciesInfo}>
            <Text className={styles.speciesName}>{observation.speciesName}</Text>
            <Text className={styles.speciesLatin}>{species?.latinName}</Text>
          </View>
          <Text className={styles.countBadge}>× {observation.count}</Text>
        </View>

        {/* 基础信息 */}
        <View className={styles.metaSection}>
          <Text className={styles.metaTitle}>📋 观察信息</Text>
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>时间</Text>
            <Text className={styles.metaValue}>{observation.dateStr} {observation.timeStr}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>天气</Text>
            <Text className={styles.metaValue}>{weatherToText(observation.weather)}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>地点</Text>
            <Text className={styles.metaValue}>
              📍 {observation.location.name}
              {observation.location.address ? `\n${observation.location.address}` : ''}
            </Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>行为</Text>
            <View className={styles.tagsWrap}>
              {observation.behaviors.length > 0
                ? observation.behaviors.map(b => <TagBadge key={b} text={b} variant="primary" />)
                : <Text className={styles.metaValue} style={{ color: '#B5BEC6' }}>未标注</Text>
              }
            </View>
          </View>
          {observation.tripId && (
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>行程</Text>
              <Text
                className={styles.metaValue}
                style={{ color: '#2F6B4F', fontWeight: 500 }}
                onClick={() => Taro.navigateTo({ url: `/pages/trip-detail/index?id=${observation.tripId}` })}
              >
                查看关联行程 →
              </Text>
            </View>
          )}
        </View>

        {/* 录音 */}
        {observation.audios.length > 0 && (
          <View className={styles.audioSection}>
            <Text className={styles.metaTitle}>🎵 叫声录音</Text>
            {observation.audios.map(a => (
              <View key={a.id} className={styles.audioItem}>
                <View className={styles.playBtn}>▶</View>
                <View className={styles.audioInfo}>
                  <Text className={styles.audioName}>{observation.speciesName} 鸣唱</Text>
                  <Text className={styles.audioDur}>时长 {a.duration}s</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 备注 */}
        {observation.notes && (
          <View className={styles.notesSection}>
            <Text className={styles.notesTitle}>📝 观察备注</Text>
            <Text className={styles.notesContent}>{observation.notes}</Text>
          </View>
        )}

        {observation.needsCompletion && (
          <View style={{ marginTop: 32, padding: 24, background: 'rgba(212,168,67,0.1)', borderRadius: 16 }}>
            <Text style={{ fontSize: 28, color: '#C98214', fontWeight: 600 }}>⚠️ 该记录需要补全信息</Text>
            <Text style={{ fontSize: 24, color: '#5B6670', marginTop: 8, display: 'block' }}>建议补充照片、行为标签以提高数据完整性。</Text>
          </View>
        )}
      </View>

      {/* 底部操作 */}
      <View className={styles.bottomBar}>
        <View
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => Taro.showToast({ title: '删除功能开发中', icon: 'none' })}
        >
          删除
        </View>
        <View
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => Taro.navigateTo({ url: `/pages/new-record/index?editId=${observation.id}` })}
        >
          编辑记录
        </View>
      </View>
    </View>
  );
};

export default ObservationDetailPage;
