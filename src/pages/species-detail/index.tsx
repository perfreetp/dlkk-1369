import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import { getSpeciesById, mockSpeciesList } from '@/data/mockSpecies';
import TagBadge from '@/components/TagBadge';
import ObservationCard from '@/components/ObservationCard';
import SpeciesCard from '@/components/SpeciesCard';
import EmptyState from '@/components/EmptyState';
import { categoryToIcon } from '@/utils/format';
import styles from './index.module.scss';

const SpeciesDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;
  const { observations, wishlist, actions } = useBirdingStore();

  const species = useMemo(() => getSpeciesById(id || ''), [id]);
  const speciesObservations = useMemo(
    () => observations.filter(o => o.speciesId === id && !o.isDraft).sort((a, b) => b.timestamp - a.timestamp),
    [observations, id]
  );
  const similarSpecies = useMemo(
    () => (species?.similarSpeciesIds || []).map(sid => getSpeciesById(sid)).filter(Boolean) as typeof mockSpeciesList,
    [species]
  );
  const isInWishlist = useMemo(
    () => wishlist.some(w => w.speciesId === id),
    [wishlist, id]
  );

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const seasonText = (() => {
    if (!species) return '';
    const months = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return species.bestSeason.map(m => months[m]).join('、');
  })();

  const conservationColor = (status: string) => {
    const map: Record<string, any> = {
      '无危': 'success',
      '近危': 'warning',
      '易危': 'warning',
      '濒危': 'accent',
      '极危': 'accent',
    };
    return map[status] || 'default';
  };

  const handleToggleWishlist = () => {
    if (!species) return;
    if (isInWishlist) {
      actions.removeFromWishlist(species.id);
      Taro.showToast({ title: '已从待观察移除', icon: 'none' });
    } else {
      actions.addToWishlist({
        speciesId: species.id,
        speciesName: species.commonName,
        speciesThumb: species.thumbUrl,
        addedAt: Date.now(),
        priority: '中',
        observed: false,
      });
      Taro.showToast({ title: '已加入待观察', icon: 'success' });
    }
  };

  const handleCompare = (otherId: string) => {
    Taro.navigateTo({ url: `/pages/species-compare/index?id1=${id}&id2=${otherId}` });
  };

  if (!species) {
    return (
      <View className={styles.page}>
        <EmptyState icon="🦅" title="物种不存在" description="该物种信息可能已被删除" />
      </View>
    );
  }

  const galleryImages = species.gallery.length > 0 ? species.gallery : [species.thumbUrl];

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView} enhanced showScrollbar={false}>
        {/* 图片画廊 */}
        <View className={styles.gallery}>
          <Image
            className={styles.galleryMain}
            src={galleryImages[activeGalleryIndex]}
            mode="aspectFill"
          />
          {galleryImages.length > 1 && (
            <View className={styles.galleryIndicator}>
              {activeGalleryIndex + 1} / {galleryImages.length}
            </View>
          )}
        </View>

        {/* 缩略图 */}
        {galleryImages.length > 1 && (
          <ScrollView
            scrollX
            className={styles.thumbScroll}
            enhanced
            showScrollbar={false}
          >
            {galleryImages.map((img, i) => (
              <View
                key={i}
                className={`${styles.thumbItem} ${i === activeGalleryIndex ? styles.thumbItemActive : ''}`}
                onClick={() => setActiveGalleryIndex(i)}
              >
                <Image className={styles.thumbImg} src={img} mode="aspectFill" />
              </View>
            ))}
          </ScrollView>
        )}

        {/* 物种名称 */}
        <View className={styles.nameSection}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text className={styles.commonName}>{species.commonName}</Text>
              <TagBadge
                text={species.conservationStatus}
                variant={conservationColor(species.conservationStatus) as any}
                size="sm"
              />
            </View>
            <Text className={styles.latinName}>{species.latinName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
              <TagBadge text={`${categoryToIcon(species.category)} ${species.category}`} variant="primary" size="sm" />
              <TagBadge text={`${species.size}型`} variant="ghost" size="sm" />
              <TagBadge text={species.family} variant="ghost" size="sm" />
            </View>
          </View>
        </View>

        {/* 操作按钮区 */}
        <View className={styles.actionRow}>
          <View
            className={`${styles.actionBtn} ${isInWishlist ? styles.actionBtnActive : ''}`}
            onClick={handleToggleWishlist}
          >
            <Text style={{ fontSize: 28, marginRight: 8 }}>{isInWishlist ? '⭐' : '☆'}</Text>
            <Text>{isInWishlist ? '已在清单' : '加入待观察'}</Text>
          </View>
          <View
            className={styles.actionBtn}
            onClick={() => Taro.navigateTo({ url: `/pages/new-record/index?speciesId=${species.id}` })}
          >
            <Text style={{ fontSize: 28, marginRight: 8 }}>📝</Text>
            <Text>记录观察</Text>
          </View>
        </View>

        {/* 基本信息卡片 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📋 物种简介</Text>
          <Text className={styles.description}>{species.description}</Text>
        </View>

        {/* 外形特征 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🎨 识别要点</Text>
          <View className={styles.appearanceList}>
            {species.appearance.map((item, i) => (
              <View key={i} className={styles.appearanceItem}>
                <View className={styles.appearanceDot} />
                <Text className={styles.appearanceText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 生态信息 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🌍 生态信息</Text>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>栖息环境</Text>
              <Text className={styles.infoValue}>🌲 {species.habitat}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>食性</Text>
              <Text className={styles.infoValue}>🍽 {species.diet}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>分布范围</Text>
              <Text className={styles.infoValue}>🗺 {species.distribution}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>最佳观察季节</Text>
              <Text className={styles.infoValue}>📅 {seasonText}</Text>
            </View>
          </View>
        </View>

        {/* 叫声描述 */}
        {species.callDescription && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>🎵 叫声识别</Text>
            <View className={styles.callCard}>
              <View className={styles.callPlay}>▶</View>
              <View style={{ flex: 1 }}>
                <Text className={styles.callText}>"{species.callDescription}"</Text>
                <View className={styles.callWave}>
                  {[...Array(20)].map((_, i) => (
                    <View key={i} className={styles.callWaveBar} style={{
                      height: `${30 + Math.sin(i * 0.5) * 20 + Math.random() * 10}rpx`
                    }} />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 我的观察记录 */}
        <View className={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>📖 我的观察记录</Text>
            <TagBadge text={`${speciesObservations.length}次`} variant="accent" size="sm" />
          </View>
          {speciesObservations.length > 0 ? (
            <View className={styles.observationList}>
              {speciesObservations.slice(0, 3).map(obs => (
                <ObservationCard
                  key={obs.id}
                  observation={obs}
                  variant="compact"
                  onClick={() => Taro.navigateTo({ url: `/pages/observation-detail/index?id=${obs.id}` })}
                />
              ))}
              {speciesObservations.length > 3 && (
                <View className={styles.moreBtn} onClick={() => Taro.switchTab({ url: '/pages/record/index' })}>
                  <Text>查看全部 {speciesObservations.length} 条记录 →</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{ padding: 40, textAlign: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>🔍</Text>
              <Text style={{ color: '#8A94A6', fontSize: 24 }}>还没有观察过这种鸟</Text>
              <Text style={{ color: '#B5BEC6', fontSize: 22, marginTop: 8, display: 'block' }}>下次遇到时记录第一条吧！</Text>
            </View>
          )}
        </View>

        {/* 易混淆物种 */}
        {similarSpecies.length > 0 && (
          <View className={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>⚠️ 易混淆物种</Text>
            </View>
            <View style={{ flexDirection: 'column', gap: 16 }}>
              {similarSpecies.map(s => (
                <View key={s.id} className={styles.similarCard}>
                  <SpeciesCard
                    species={s}
                    variant="list"
                    onClick={() => Taro.redirectTo({ url: `/pages/species-detail/index?id=${s.id}` })}
                  />
                  <View className={styles.compareBtn} onClick={() => handleCompare(s.id)}>
                    <Text>对比识别 →</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

export default SpeciesDetailPage;
