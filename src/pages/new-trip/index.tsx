import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import TagBadge from '@/components/TagBadge';
import type { Observation } from '@/types';
import styles from './index.module.scss';

const NewTripPage: React.FC = () => {
  const router = useRouter();
  const editId = router.params.editId;
  const { trips, observations, actions } = useBirdingStore();

  const editTrip = editId ? trips.find(t => t.id === editId) : undefined;
  const availableObservations = useMemo(
    () => observations.filter(o => !o.isDraft).sort((a, b) => b.timestamp - a.timestamp),
    [observations]
  );

  const [title, setTitle] = useState(editTrip?.title || '');
  const [notes, setNotes] = useState(editTrip?.notes || '');
  const [selectedObsIds, setSelectedObsIds] = useState<string[]>(
    editTrip?.observationIds || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const locationSummary = useMemo(() => {
    const selected = availableObservations.filter(o => selectedObsIds.includes(o.id));
    if (selected.length === 0) return '未选择记录';
    const locs = new Set(selected.map(o => o.location.name));
    return Array.from(locs).slice(0, 2).join('、') + (locs.size > 2 ? ' 等' : '');
  }, [availableObservations, selectedObsIds]);

  const dateRangeStr = useMemo(() => {
    const selected = availableObservations.filter(o => selectedObsIds.includes(o.id));
    if (selected.length === 0) return '';
    const sorted = [...selected].sort((a, b) => a.timestamp - b.timestamp);
    if (sorted.length === 1) return sorted[0].dateStr;
    return `${sorted[0].dateStr} - ${sorted[sorted.length - 1].dateStr}`;
  }, [availableObservations, selectedObsIds]);

  const speciesCount = useMemo(() => {
    const selected = availableObservations.filter(o => selectedObsIds.includes(o.id));
    return new Set(selected.map(o => o.speciesId)).size;
  }, [availableObservations, selectedObsIds]);

  const toggleSelect = (id: string) => {
    setSelectedObsIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllFromDate = () => {
    Taro.showToast({ title: '按日期筛选功能开发中', icon: 'none' });
  };

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入行程名称', icon: 'none' });
      return;
    }
    if (selectedObsIds.length === 0) {
      Taro.showToast({ title: '请至少选择一条记录', icon: 'none' });
      return;
    }

    setIsSaving(true);
    const selected = availableObservations.filter(o => selectedObsIds.includes(o.id));
    const sorted = [...selected].sort((a, b) => a.timestamp - b.timestamp);
    const now = Date.now();

    const newTrip = {
      id: editId || `trip_${now}`,
      title: title.trim(),
      coverUrl: selected[0]?.speciesThumb || selected[0]?.photos[0]?.url || 'https://picsum.photos/seed/nature1/800/500',
      startTimestamp: sorted[0].timestamp,
      endTimestamp: sorted[sorted.length - 1].timestamp,
      dateRangeStr: dateRangeStr || (sorted.length > 0 ? sorted[0].dateStr : ''),
      locationSummary,
      observationIds: selectedObsIds,
      speciesCount,
      observationCount: selectedObsIds.length,
      notes: notes.trim(),
      createdAt: editTrip?.createdAt || now,
    };

    setTimeout(() => {
      actions.addTrip(newTrip);
      setIsSaving(false);
      Taro.showToast({ title: editId ? '行程已更新' : '行程已创建', icon: 'success' });
      setTimeout(() => {
        if (editId) {
          Taro.redirectTo({ url: `/pages/trip-detail/index?id=${editId}` });
        } else {
          Taro.switchTab({ url: '/pages/mine/index' });
        }
      }, 800);
    }, 500);
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView} enhanced showScrollbar={false}>
        {/* 基本信息 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🎒 行程信息</Text>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>行程名称</Text>
            <Input
              className={styles.input}
              placeholder="例如：奥森周末晨观"
              placeholderClass={styles.placeholder}
              value={title}
              onInput={e => setTitle(e.detail.value)}
              maxlength={30}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>行程描述</Text>
            <Textarea
              className={styles.textarea}
              placeholder="记录行程亮点、天气、伙伴..."
              placeholderClass={styles.placeholder}
              value={notes}
              onInput={e => setNotes(e.detail.value)}
              maxlength={500}
              autoHeight
            />
          </View>
        </View>

        {/* 预览汇总 */}
        <View className={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>📊 行程预览</Text>
            <TagBadge text={`已选${selectedObsIds.length}条`} variant="primary" size="sm" />
          </View>
          <View className={styles.previewCard}>
            <View className={styles.previewRow}>
              <Text className={styles.previewLabel}>📅 日期</Text>
              <Text className={styles.previewValue}>{dateRangeStr || '待选择'}</Text>
            </View>
            <View className={styles.previewRow}>
              <Text className={styles.previewLabel}>📍 地点</Text>
              <Text className={styles.previewValue}>{locationSummary}</Text>
            </View>
            <View className={styles.previewRow}>
              <Text className={styles.previewLabel}>🐦 物种数</Text>
              <Text className={styles.previewValue} style={{ color: '#2F6B4F', fontWeight: 600 }}>{speciesCount} 种</Text>
            </View>
            <View className={styles.previewRow}>
              <Text className={styles.previewLabel}>📝 记录数</Text>
              <Text className={styles.previewValue} style={{ color: '#A67B5B', fontWeight: 600 }}>{selectedObsIds.length} 条</Text>
            </View>
          </View>
        </View>

        {/* 观察记录选择 */}
        <View className={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>📋 选择观察记录</Text>
            <Text className={styles.filterBtn} onClick={selectAllFromDate}>按日期筛选</Text>
          </View>

          {availableObservations.length > 0 ? (
            <View style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {availableObservations.map(obs => (
                <SelectableObsCard
                  key={obs.id}
                  observation={obs}
                  selected={selectedObsIds.includes(obs.id)}
                  onToggle={() => toggleSelect(obs.id)}
                />
              ))}
            </View>
          ) : (
            <View style={{ padding: 60, textAlign: 'center' }}>
              <Text style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📝</Text>
              <Text style={{ color: '#8A94A6', fontSize: 26 }}>还没有可打包的观察记录</Text>
              <View
                style={{
                  marginTop: 24, padding: '16px 32px', display: 'inline-block',
                  background: '#2F6B4F', color: 'white', borderRadius: 999, fontSize: 26
                }}
                onClick={() => Taro.switchTab({ url: '/pages/record/index' })}
              >
                去记录观察
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View
          className={`${styles.saveBtn} ${styles.saveDraftBtn}`}
          onClick={() => Taro.navigateBack()}
        >
          <Text>取消</Text>
        </View>
        <View
          className={`${styles.saveBtn} ${styles.saveConfirmBtn}`}
          onClick={handleSave}
        >
          <Text>{isSaving ? '保存中...' : (editId ? '更新行程' : '创建行程')}</Text>
        </View>
      </View>
    </View>
  );
};

const SelectableObsCard: React.FC<{
  observation: Observation;
  selected: boolean;
  onToggle: () => void;
}> = ({ observation, selected, onToggle }) => {
  return (
    <View
      className={`${styles.obsCard} ${selected ? styles.obsCardSelected : ''}`}
      onClick={onToggle}
    >
      <View className={styles.checkbox}>
        <View className={`${styles.checkInner} ${selected ? styles.checkInnerChecked : ''}`}>
          {selected && <Text style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>✓</Text>}
        </View>
      </View>
      <Image
        className={styles.obsImg}
        src={observation.photos[0]?.url || observation.speciesThumb || ''}
        mode="aspectFill"
      />
      <View className={styles.obsInfo}>
        <Text className={styles.obsName}>{observation.speciesName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 }}>
          <Text style={{ fontSize: 22, color: '#8A94A6' }}>{observation.dateStr} {observation.timeStr}</Text>
          <Text style={{ fontSize: 22, color: '#8A94A6' }}>×{observation.count}</Text>
        </View>
        <Text style={{ fontSize: 22, color: '#B5BEC6', marginTop: 4, display: 'block' }}>
          📍 {observation.location.name}
        </Text>
      </View>
      {observation.photos.length > 0 && (
        <Text style={{ fontSize: 20, color: '#2F6B4F', position: 'absolute', right: 16, bottom: 16 }}>
          📷 {observation.photos.length}
        </Text>
      )}
    </View>
  );
};

export default NewTripPage;
