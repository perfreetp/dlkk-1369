import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Input, Textarea, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import { mockSpeciesList } from '@/data/mockSpecies';
import { getCurrentSeason, formatDate, formatTime } from '@/utils/date';
import { weatherToText, categoryToIcon } from '@/utils/format';
import type { BehaviorTag, Observation, ObservationPhoto, ObservationAudio } from '@/types';
import TagBadge from '@/components/TagBadge';
import styles from './index.module.scss';

const weatherOptions: Observation['weather'][] = ['晴', '多云', '阴', '小雨', '大雨', '雪', '雾'];
const behaviorOptions: BehaviorTag[] = ['觅食', '繁殖', '栖息', '迁徙', '鸣唱', '育雏', '争斗', '其他'];

const NewRecordPage: React.FC = () => {
  const router = useRouter();
  const editId = router.params.editId;
  const { observations, actions } = useBirdingStore();
  const speciesList = mockSpeciesList;

  const editObservation = editId ? observations.find(o => o.id === editId) : undefined;

  const [speciesId, setSpeciesId] = useState(editObservation?.speciesId || '');
  const [speciesName, setSpeciesName] = useState(editObservation?.speciesName || '');
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);

  const [date, setDate] = useState(editObservation ? editObservation.dateStr : formatDate(new Date()));
  const [time, setTime] = useState(editObservation ? editObservation.timeStr : formatTime(new Date()));
  const [weatherIndex, setWeatherIndex] = useState(
    editObservation ? weatherOptions.indexOf(editObservation.weather) : 0
  );
  const [location, setLocation] = useState(
    editObservation?.location.name || '正在获取位置...'
  );
  const [count, setCount] = useState(editObservation?.count || 1);
  const [behaviors, setBehaviors] = useState<BehaviorTag[]>(editObservation?.behaviors || []);
  const [photos, setPhotos] = useState<ObservationPhoto[]>(editObservation?.photos || []);
  const [audios, setAudios] = useState<ObservationAudio[]>(editObservation?.audios || []);
  const [notes, setNotes] = useState(editObservation?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!editObservation) {
      setTimeout(() => setLocation('北京奥林匹克森林公园'), 1000);
    }
  }, []);

  const filteredSpecies = speciesList.filter(s =>
    s.commonName.includes(speciesSearch) || s.latinName.toLowerCase().includes(speciesSearch.toLowerCase())
  );

  const currentSeason = getCurrentSeason();
  const seasonalSpecies = speciesList.filter(s => s.bestSeason.includes(currentSeason)).slice(0, 5);

  const handleSpeciesSelect = (s: typeof speciesList[0]) => {
    setSpeciesId(s.id);
    setSpeciesName(s.commonName);
    setShowSpeciesPicker(false);
    setSpeciesSearch('');
  };

  const toggleBehavior = (b: BehaviorTag) => {
    setBehaviors(prev =>
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  };

  const handleAddPhoto = () => {
    Taro.chooseImage({
      count: 9 - photos.length,
      success: (res) => {
        const newPhotos: ObservationPhoto[] = res.tempFilePaths.map((url, i) => ({
          id: `photo_${Date.now()}_${i}`,
          url,
        }));
        setPhotos(prev => [...prev, ...newPhotos]);
      },
      fail: () => {
        const demoPhotos: ObservationPhoto[] = [
          { id: `photo_${Date.now()}_0`, url: 'https://picsum.photos/seed/bird1/800/600' },
          { id: `photo_${Date.now()}_1`, url: 'https://picsum.photos/seed/bird2/800/600' },
        ];
        setPhotos(prev => [...prev, ...demoPhotos.slice(0, 1)]);
      }
    });
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleAddAudio = () => {
    Taro.showToast({ title: '录音功能模拟中', icon: 'none' });
    setTimeout(() => {
      const newAudio: ObservationAudio = {
        id: `audio_${Date.now()}`,
        url: 'demo_audio.mp3',
        duration: Math.floor(Math.random() * 30) + 10,
      };
      setAudios(prev => [...prev, newAudio]);
    }, 500);
  };

  const handleRemoveAudio = (id: string) => {
    setAudios(prev => prev.filter(a => a.id !== id));
  };

  const validate = () => {
    if (!speciesId) {
      Taro.showToast({ title: '请选择鸟种', icon: 'none' });
      return false;
    }
    return true;
  };

  const needsCompletion = photos.length === 0 || behaviors.length === 0;

  const handleSave = (asDraft: boolean) => {
    if (!asDraft && !validate()) return;
    setIsSaving(true);

    const selectedSpecies = speciesList.find(s => s.id === speciesId);
    const now = Date.now();

    const observation: Observation = {
      id: editId || `obs_${now}`,
      speciesId,
      speciesName: speciesName || '未识别物种',
      speciesThumb: selectedSpecies?.thumbUrl,
      timestamp: new Date(`${date}T${time}`).getTime(),
      dateStr: date,
      timeStr: time,
      weather: weatherOptions[weatherIndex],
      location: {
        lat: 40.0025 + Math.random() * 0.02,
        lng: 116.3903 + Math.random() * 0.02,
        name: location,
      },
      count,
      behaviors,
      photos,
      audios,
      notes,
      isDraft: asDraft,
      needsCompletion: !asDraft && needsCompletion,
      createdAt: editObservation?.createdAt || now,
    };

    setTimeout(() => {
      if (editId) {
        actions.updateObservation(editId, observation);
      } else {
        actions.addObservation(observation);
      }
      setIsSaving(false);
      Taro.showToast({
        title: asDraft ? '已保存至草稿箱' : (needsCompletion ? '已保存，建议补全' : '记录已保存'),
        icon: 'success',
      });
      setTimeout(() => Taro.navigateBack(), 800);
    }, 500);
  };

  const selectedSpeciesInfo = speciesList.find(s => s.id === speciesId);

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView} enhanced showScrollbar={false}>
        {/* 物种选择 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🐦 选择鸟种</Text>

          {speciesId ? (
            <View className={styles.selectedSpecies} onClick={() => setShowSpeciesPicker(true)}>
              <Image className={styles.selectedSpeciesImg} src={selectedSpeciesInfo?.thumbUrl || ''} mode="aspectFill" />
              <View className={styles.selectedSpeciesInfo}>
                <Text className={styles.selectedSpeciesName}>{speciesName}</Text>
                <Text className={styles.selectedSpeciesLatin}>{selectedSpeciesInfo?.latinName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <TagBadge text={selectedSpeciesInfo?.category || ''} variant="primary" size="sm" />
                  <Text style={{ fontSize: 22, color: '#8A94A6', marginLeft: 8 }}>
                    {categoryToIcon(selectedSpeciesInfo?.category as any)} {selectedSpeciesInfo?.size}型
                  </Text>
                </View>
              </View>
              <Text className={styles.changeBtn}>更换</Text>
            </View>
          ) : (
            <>
              <View
                className={styles.speciesSearchBar}
                onClick={() => setShowSpeciesPicker(true)}
              >
                <Text style={{ fontSize: 24, color: '#B5BEC6', marginRight: 12 }}>🔍</Text>
                <Text style={{ fontSize: 26, color: '#B5BEC6' }}>搜索鸟名、拉丁名或选择类别...</Text>
              </View>

              <Text className={styles.subTitle}>当季常见推荐</Text>
              <View className={styles.seasonalSpecies}>
                {seasonalSpecies.map(s => (
                  <View
                    key={s.id}
                    className={styles.seasonalSpeciesItem}
                    onClick={() => handleSpeciesSelect(s)}
                  >
                    <Image className={styles.seasonalImg} src={s.thumbUrl} mode="aspectFill" />
                    <View className={styles.seasonalOverlay}>
                      <Text className={styles.seasonalName}>{s.commonName}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* 基础信息 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📍 时间与地点</Text>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>日期</Text>
            <Picker mode="date" value={date} onChange={e => setDate(e.detail.value)}>
              <View className={styles.formValue}>
                <Text>{date}</Text>
                <Text style={{ color: '#B5BEC6', fontSize: 22 }}>📅</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>时间</Text>
            <Picker mode="time" value={time} onChange={e => setTime(e.detail.value)}>
              <View className={styles.formValue}>
                <Text>{time}</Text>
                <Text style={{ color: '#B5BEC6', fontSize: 22 }}>🕐</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>天气</Text>
            <Picker range={weatherOptions} value={weatherIndex} onChange={e => setWeatherIndex(+e.detail.value)}>
              <View className={styles.formValue}>
                <Text>{weatherToText(weatherOptions[weatherIndex])}</Text>
                <Text style={{ color: '#B5BEC6', fontSize: 22 }}>▼</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>地点</Text>
            <View className={styles.formValue}>
              <Text style={{ flex: 1 }}>📍 {location}</Text>
              <Text style={{ color: '#2F6B4F', fontSize: 22 }}>刷新</Text>
            </View>
          </View>
        </View>

        {/* 数量和行为 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📊 数量与行为</Text>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>观察数量</Text>
            <View className={styles.counter}>
              <View
                className={styles.counterBtn}
                onClick={() => setCount(c => Math.max(1, c - 1))}
              >
                <Text>－</Text>
              </View>
              <Text className={styles.counterNum}>{count}</Text>
              <View
                className={styles.counterBtn}
                onClick={() => setCount(c => Math.min(999, c + 1))}
              >
                <Text>＋</Text>
              </View>
            </View>
          </View>

          <Text className={styles.subTitle}>行为标签（可多选）</Text>
          <View className={styles.behaviorTags}>
            {behaviorOptions.map(b => (
              <View
                key={b}
                className={`${styles.behaviorTag} ${behaviors.includes(b) ? styles.behaviorTagActive : ''}`}
                onClick={() => toggleBehavior(b)}
              >
                <Text>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 照片 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📷 照片 ({photos.length}/9)</Text>
          <View className={styles.photoGrid}>
            {photos.map(p => (
              <View key={p.id} className={styles.photoItem}>
                <Image className={styles.photoImg} src={p.url} mode="aspectFill" />
                <View className={styles.photoRemove} onClick={() => handleRemovePhoto(p.id)}>
                  <Text>×</Text>
                </View>
              </View>
            ))}
            {photos.length < 9 && (
              <View className={styles.photoAdd} onClick={handleAddPhoto}>
                <Text style={{ fontSize: 48, color: '#B5BEC6', fontWeight: 300 }}>＋</Text>
                <Text style={{ fontSize: 22, color: '#8A94A6', marginTop: 8 }}>上传照片</Text>
              </View>
            )}
          </View>
        </View>

        {/* 录音 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🎵 叫声录音</Text>
          {audios.length > 0 && audios.map(a => (
            <View key={a.id} className={styles.audioItem}>
              <View className={styles.audioPlayBtn}>▶</View>
              <View className={styles.audioInfo}>
                <View className={styles.audioWave}>
                  {[...Array(12)].map((_, i) => (
                    <View key={i} className={styles.audioWaveBar} style={{
                      height: `${20 + Math.random() * 30}px`
                    }} />
                  ))}
                </View>
              </View>
              <Text className={styles.audioDuration}>{a.duration}s</Text>
              <Text className={styles.audioRemove} onClick={() => handleRemoveAudio(a.id)}>删除</Text>
            </View>
          ))}
          <View className={styles.recordBtn} onClick={handleAddAudio}>
            <Text style={{ fontSize: 28, marginRight: 12 }}>🎤</Text>
            <Text style={{ color: '#2F6B4F', fontWeight: 500 }}>录制或上传叫声</Text>
          </View>
        </View>

        {/* 备注 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📝 观察备注</Text>
          <Textarea
            className={styles.notesInput}
            placeholder="记录观察环境、特征、有趣的发现..."
            placeholderClass={styles.placeholder}
            value={notes}
            onInput={e => setNotes(e.detail.value)}
            maxlength={500}
            autoHeight
          />
          <Text className={styles.charCount}>{notes.length}/500</Text>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View
          className={`${styles.saveBtn} ${styles.saveDraftBtn}`}
          onClick={() => handleSave(true)}
        >
          <Text>保存草稿</Text>
        </View>
        <View
          className={`${styles.saveBtn} ${styles.saveConfirmBtn}`}
          onClick={() => handleSave(false)}
        >
          <Text>{isSaving ? '保存中...' : '确认保存'}</Text>
        </View>
      </View>

      {/* 物种选择弹窗 */}
      {showSpeciesPicker && (
        <View className={styles.modalMask} onClick={() => setShowSpeciesPicker(false)}>
          <View className={styles.modal} onClick={e => e.stopPropagation?.()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择鸟种</Text>
              <Text className={styles.modalClose} onClick={() => setShowSpeciesPicker(false)}>关闭</Text>
            </View>
            <View className={styles.modalSearch}>
              <Text style={{ fontSize: 24, color: '#B5BEC6', marginRight: 12 }}>🔍</Text>
              <Input
                className={styles.searchInput}
                placeholder="搜索鸟名..."
                value={speciesSearch}
                onInput={e => setSpeciesSearch(e.detail.value)}
              />
            </View>
            <ScrollView scrollY className={styles.modalScroll} enhanced showScrollbar={false}>
              {filteredSpecies.map(s => (
                <View key={s.id} className={styles.speciesOption} onClick={() => handleSpeciesSelect(s)}>
                  <Image className={styles.speciesOptionImg} src={s.thumbUrl} mode="aspectFill" />
                  <View className={styles.speciesOptionInfo}>
                    <Text className={styles.speciesOptionName}>{s.commonName}</Text>
                    <Text className={styles.speciesOptionLatin}>{s.latinName}</Text>
                  </View>
                  <TagBadge text={s.category} variant="ghost" size="sm" />
                </View>
              ))}
              {filteredSpecies.length === 0 && (
                <View style={{ padding: 80, textAlign: 'center' }}>
                  <Text style={{ color: '#B5BEC6', fontSize: 26 }}>未找到匹配的鸟种</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default NewRecordPage;
