import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import ObservationCard from '@/components/ObservationCard';
import SpeciesCard from '@/components/SpeciesCard';
import TagBadge from '@/components/TagBadge';
import EmptyState from '@/components/EmptyState';
import StatCard from '@/components/StatCard';
import { getSpeciesById } from '@/data/mockSpecies';
import type { Observation, Species } from '@/types';
import styles from './index.module.scss';

const TripDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;
  const { trips, observations } = useBirdingStore();

  const trip = useMemo(() => trips.find(t => t.id === id), [trips, id]);
  const tripObservations = useMemo(() => {
    if (!trip) return [] as Observation[];
    return observations
      .filter(o => trip.observationIds.includes(o.id) && !o.isDraft)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [trip, observations]);

  const uniqueSpeciesIds = useMemo(() => {
    const ids = new Set(tripObservations.map(o => o.speciesId));
    return Array.from(ids);
  }, [tripObservations]);

  const uniqueSpecies = useMemo(() => {
    return uniqueSpeciesIds.map(sid => getSpeciesById(sid)).filter(Boolean) as Species[];
  }, [uniqueSpeciesIds]);

  const [showSpeciesList, setShowSpeciesList] = useState(false);

  if (!trip) {
    return (
      <View className={styles.page}>
        <EmptyState icon="🎒" title="行程不存在" description="该行程可能已被删除" />
      </View>
    );
  }

  const handleExport = () => {
    Taro.showActionSheet({
      itemList: ['生成分享简报', '导出为PDF', '导出为Excel', '复制文字总结'],
      success: (res) => {
        const messages = [
          '简报已生成，可在个人中心查看',
          'PDF导出功能开发中',
          'Excel导出功能开发中',
          '文字总结已复制到剪贴板',
        ];
        Taro.showToast({ title: messages[res.tapIndex], icon: 'none' });
      }
    });
  };

  const statData = [
    { label: '观察记录', value: tripObservations.length, icon: '📝' },
    { label: '识别物种', value: uniqueSpeciesIds.length, icon: '🐦' },
    { label: '总个体数', value: tripObservations.reduce((s, o) => s + o.count, 0), icon: '🔢' },
    { label: '带照片', value: tripObservations.filter(o => o.photos.length > 0).length, icon: '📷' },
  ];

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView} enhanced showScrollbar={false}>
        {/* 封面图 */}
        <View className={styles.cover}>
          <Image className={styles.coverImg} src={trip.coverUrl} mode="aspectFill" />
          <View className={styles.coverGradient} />
          <View className={styles.coverInfo}>
            <Text className={styles.tripTitle}>{trip.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <TagBadge text={`📅 ${trip.dateRangeStr}`} variant="ghost" size="sm" />
              <TagBadge text={`📍 ${trip.locationSummary}`} variant="ghost" size="sm" />
            </View>
          </View>
        </View>

        {/* 统计卡片 */}
        <View className={styles.statsGrid}>
          {statData.map((s, i) => (
            <StatCard
              key={i}
              label={s.label}
              value={s.value}
              icon={s.icon}
              variant={i === 0 ? 'primary' : i === 1 ? 'accent' : 'default'}
            />
          ))}
        </View>

        {/* 操作按钮 */}
        <View className={styles.actionRow}>
          <View className={styles.actionBtn} onClick={() => setShowSpeciesList(!showSpeciesList)}>
            <Text style={{ fontSize: 28, marginRight: 8 }}>{showSpeciesList ? '▼' : '▶'}</Text>
            <Text>物种清单 ({uniqueSpecies.length})</Text>
          </View>
          <View className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={handleExport}>
            <Text style={{ fontSize: 28, marginRight: 8 }}>📤</Text>
            <Text>导出分享</Text>
          </View>
        </View>

        {/* 物种清单 */}
        {showSpeciesList && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>🔍 本行程物种清单</Text>
            {uniqueSpecies.length > 0 ? (
              <View className={styles.speciesList}>
                {uniqueSpecies.map(s => (
                  <SpeciesCard
                    key={s.id}
                    species={s}
                    variant="list"
                    onClick={() => Taro.navigateTo({ url: `/pages/species-detail/index?id=${s.id}` })}
                  />
                ))}
              </View>
            ) : (
              <View style={{ padding: 40, textAlign: 'center' }}>
                <Text style={{ color: '#B5BEC6', fontSize: 24 }}>暂无物种数据</Text>
              </View>
            )}
          </View>
        )}

        {/* 行程备注 */}
        {trip.notes && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📝 行程记录</Text>
            <View className={styles.notesCard}>
              <Text className={styles.notesText}>{trip.notes}</Text>
            </View>
          </View>
        )}

        {/* 观察记录时间线 */}
        <View className={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>📖 观察记录</Text>
            <TagBadge text={`${tripObservations.length}条`} variant="primary" size="sm" />
          </View>

          {tripObservations.length > 0 ? (
            <View className={styles.timeline}>
              {tripObservations.map((obs, i) => (
                <View key={obs.id} className={styles.timelineItem}>
                  <View className={styles.timelineDot} style={{
                    background: i === 0 ? '#2F6B4F' : i === tripObservations.length - 1 ? '#D4A843' : '#A67B5B'
                  }} />
                  {i < tripObservations.length - 1 && <View className={styles.timelineLine} />}
                  <View className={styles.timelineContent}>
                    <View className={styles.timelineTime}>
                      <Text style={{ fontSize: 22, color: '#8A94A6', marginRight: 8 }}>🕐</Text>
                      <Text style={{ fontSize: 24, color: '#8A94A6', fontWeight: 500 }}>{obs.timeStr}</Text>
                    </View>
                    <ObservationCard
                      observation={obs}
                      variant="compact"
                      onClick={() => Taro.navigateTo({ url: `/pages/observation-detail/index?id=${obs.id}` })}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ padding: 48, textAlign: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>🕊</Text>
              <Text style={{ color: '#8A94A6', fontSize: 26 }}>本行程暂无观察记录</Text>
              <View
                style={{
                  marginTop: 24, padding: '16px 32px', display: 'inline-block',
                  background: '#2F6B4F', color: 'white', borderRadius: 999, fontSize: 26
                }}
                onClick={() => Taro.switchTab({ url: '/pages/record/index' })}
              >
                去添加记录
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View
          className={styles.bottomBtn}
          onClick={() => Taro.navigateTo({ url: `/pages/new-trip/index?editId=${trip.id}` })}
        >
          <Text style={{ fontSize: 28, marginRight: 8 }}>✏️</Text>
          <Text>编辑行程</Text>
        </View>
        <View className={`${styles.bottomBtn} ${styles.bottomBtnPrimary}`} onClick={handleExport}>
          <Text style={{ fontSize: 28, marginRight: 8 }}>📤</Text>
          <Text>生成简报</Text>
        </View>
      </View>
    </View>
  );
};

export default TripDetailPage;
