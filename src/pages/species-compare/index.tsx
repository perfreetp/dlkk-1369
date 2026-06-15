import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { mockSpeciesList, getSpeciesById } from '@/data/mockSpecies';
import { categoryToIcon } from '@/utils/format';
import EmptyState from '@/components/EmptyState';
import SpeciesCard from '@/components/SpeciesCard';
import styles from './index.module.scss';

const DEFAULT_ID_A = 'sp-010';
const DEFAULT_ID_B = 'sp-012';

const SpeciesComparePage: React.FC = () => {
  const router = useRouter();

  const paramA = (router.params.a || router.params.id1 || '').toString();
  const paramB = (router.params.b || router.params.id2 || '').toString();

  const [speciesAId, setSpeciesAId] = useState(paramA || DEFAULT_ID_A);
  const [speciesBId, setSpeciesBId] = useState(paramB || DEFAULT_ID_B);
  const [showPicker, setShowPicker] = useState<'a' | 'b' | null>(null);

  const speciesA = useMemo(() => getSpeciesById(speciesAId), [speciesAId]);
  const speciesB = useMemo(() => getSpeciesById(speciesBId), [speciesBId]);

  if (!speciesA || !speciesB) {
    return (
      <View className={styles.page}>
        <EmptyState icon="🔍" title="加载失败" description="物种信息不存在" />
      </View>
    );
  }

  const s1 = speciesA;
  const s2 = speciesB;

  const compareFields = [
    { label: '分类', icon: '🏷', field1: `${categoryToIcon(s1.category)} ${s1.category}`, field2: `${categoryToIcon(s2.category)} ${s2.category}`, same: s1.category === s2.category },
    { label: '科属', icon: '📚', field1: s1.family, field2: s2.family, same: s1.family === s2.family },
    { label: '体型', icon: '📏', field1: `${s1.size}型`, field2: `${s2.size}型`, same: s1.size === s2.size },
    { label: '栖息地', icon: '🌲', field1: s1.habitat, field2: s2.habitat, same: s1.habitat === s2.habitat },
    { label: '食性', icon: '🍽', field1: s1.diet, field2: s2.diet, same: s1.diet === s2.diet },
    { label: '分布', icon: '🗺', field1: s1.distribution, field2: s2.distribution, same: s1.distribution === s2.distribution },
    { label: '保护级别', icon: '🛡', field1: s1.conservationStatus, field2: s2.conservationStatus, same: s1.conservationStatus === s2.conservationStatus },
  ];

  const handlePickSpecies = (side: 'a' | 'b') => {
    setShowPicker(side);
  };

  const handleSelectSpecies = (id: string) => {
    if (showPicker === 'a') {
      setSpeciesAId(id);
    } else {
      setSpeciesBId(id);
    }
    setShowPicker(null);
  };

  const quickPairs = [
    { a: 'sp-001', b: 'sp-003', label: '麻雀 vs 山麻雀' },
    { a: 'sp-010', b: 'sp-012', label: '白鹭 vs 大白鹭' },
    { a: 'sp-008', b: 'sp-009', label: '喜鹊 vs 灰喜鹊' },
    { a: 'sp-015', b: 'sp-016', label: '黑耳鸢 vs 红隼' },
  ];

  const handleQuickPair = (a: string, b: string) => {
    setSpeciesAId(a);
    setSpeciesBId(b);
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView} enhanced showScrollbar={false}>
        {/* 两物种头图对比 */}
        <View className={styles.headerCompare}>
          <View className={styles.headerItem} onClick={() => handlePickSpecies('a')}>
            <Image className={styles.headerImg} src={s1.thumbUrl} mode="aspectFill" />
            <View className={styles.headerOverlay}>
              <Text className={styles.headerName}>{s1.commonName}</Text>
              <Text className={styles.headerLatin}>{s1.latinName}</Text>
              <Text className={styles.headerHint}>点击更换 ▾</Text>
            </View>
          </View>
          <View className={styles.vsBadge}>VS</View>
          <View className={styles.headerItem} onClick={() => handlePickSpecies('b')}>
            <Image className={styles.headerImg} src={s2.thumbUrl} mode="aspectFill" />
            <View className={styles.headerOverlay}>
              <Text className={styles.headerName}>{s2.commonName}</Text>
              <Text className={styles.headerLatin}>{s2.latinName}</Text>
              <Text className={styles.headerHint}>点击更换 ▾</Text>
            </View>
          </View>
        </View>

        {/* 快速对比组 */}
        <View className={styles.quickPairs}>
          <Text className={styles.quickPairsTitle}>⚡ 快速对比</Text>
          <ScrollView scrollX className={styles.quickPairsScroll} enhanced showScrollbar={false}>
            {quickPairs.map(pair => (
              <View
                key={pair.label}
                className={`${styles.quickPairChip} ${speciesAId === pair.a && speciesBId === pair.b ? styles.quickPairChipActive : ''}`}
                onClick={() => handleQuickPair(pair.a, pair.b)}
              >
                {pair.label}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 识别要点对比 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>🎨 识别要点对比</Text>
          <View className={styles.appearanceCompare}>
            <View className={styles.appearanceCol}>
              <Text className={styles.colLabel} style={{ color: '#2F6B4F' }}>{s1.commonName}</Text>
              {s1.appearance.map((item, i) => (
                <View key={i} className={`${styles.appearanceTag} ${styles.tagSideLeft}`}>
                  <Text>{item}</Text>
                </View>
              ))}
            </View>
            <View className={styles.appearanceDivider}>
              <View className={styles.dividerLine} />
              <Text className={styles.dividerText}>特征</Text>
              <View className={styles.dividerLine} />
            </View>
            <View className={styles.appearanceCol}>
              <Text className={styles.colLabel} style={{ color: '#A67B5B' }}>{s2.commonName}</Text>
              {s2.appearance.map((item, i) => (
                <View key={i} className={`${styles.appearanceTag} ${styles.tagSideRight}`}>
                  <Text>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 基础信息对比表 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📋 基础信息对比</Text>
          <View className={styles.compareTable}>
            {compareFields.map((f, i) => (
              <View key={i} className={`${styles.tableRow} ${f.same ? styles.rowSame : ''}`}>
                <View className={styles.tableCellLabel}>
                  <Text style={{ fontSize: 22, marginRight: 6 }}>{f.icon}</Text>
                  <Text>{f.label}</Text>
                </View>
                <View className={styles.tableCell}>
                  <Text className={styles.cellTextLeft}>{f.field1}</Text>
                </View>
                <View className={styles.tableCell}>
                  <Text className={styles.cellTextRight}>{f.field2}</Text>
                </View>
                {f.same && <View className={styles.sameBadge}>✓</View>}
              </View>
            ))}
          </View>
        </View>

        {/* 叫声对比 */}
        {(s1.callDescription || s2.callDescription) && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>🎵 鸣唱/叫声对比</Text>
            <View className={styles.callCompare}>
              <View className={styles.callCard}>
                <View className={styles.callHeader}>
                  <Text className={styles.callName}>{s1.commonName}</Text>
                  <View className={styles.callPlay}>▶</View>
                </View>
                {s1.callDescription ? (
                  <Text className={styles.callDesc}>"{s1.callDescription}"</Text>
                ) : (
                  <Text className={styles.callEmpty}>暂无叫声描述</Text>
                )}
                <View className={styles.callWave}>
                  {[...Array(16)].map((_, i) => (
                    <View key={i} className={styles.callWaveBar} style={{
                      height: `${40 + Math.sin(i * 0.7) * 20 + Math.random() * 10}rpx`,
                      background: 'linear-gradient(to top, rgba(47,107,79,0.2), #2F6B4F)'
                    }} />
                  ))}
                </View>
              </View>
              <View className={styles.callCard}>
                <View className={styles.callHeader}>
                  <Text className={styles.callName}>{s2.commonName}</Text>
                  <View className={styles.callPlay} style={{ background: '#A67B5B' }}>▶</View>
                </View>
                {s2.callDescription ? (
                  <Text className={styles.callDesc}>"{s2.callDescription}"</Text>
                ) : (
                  <Text className={styles.callEmpty}>暂无叫声描述</Text>
                )}
                <View className={styles.callWave}>
                  {[...Array(16)].map((_, i) => (
                    <View key={i} className={styles.callWaveBar} style={{
                      height: `${40 + Math.cos(i * 0.6) * 20 + Math.random() * 10}rpx`,
                      background: 'linear-gradient(to top, rgba(166,123,91,0.2), #A67B5B)'
                    }} />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 识别建议 */}
        <View className={styles.section} style={{ background: 'linear-gradient(135deg, #FFF8EC, #FFF5F0)' }}>
          <Text className={styles.sectionTitle}>💡 识别建议</Text>
          <View style={{ padding: 20, background: 'rgba(255,255,255,0.7)', borderRadius: 12 }}>
            {s1.appearance.slice(0, 1).map((a, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: 600, color: '#2F6B4F', fontSize: 26 }}>• {s1.commonName}：</Text>
                <Text style={{ color: '#5B6670', fontSize: 26 }}>{a}</Text>
              </View>
            ))}
            {s2.appearance.slice(0, 1).map((a, i) => (
              <View key={i}>
                <Text style={{ fontWeight: 600, color: '#A67B5B', fontSize: 26 }}>• {s2.commonName}：</Text>
                <Text style={{ color: '#5B6670', fontSize: 26 }}>{a}</Text>
              </View>
            ))}
            <View style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed rgba(181,190,198,0.4)' }}>
              <Text style={{ fontSize: 24, color: '#8A94A6' }}>📷 观察时注意拍摄清晰的头部、胸腹和翅膀照片，结合鸣唱和生境综合判断。</Text>
            </View>
          </View>
        </View>

        {/* 底部快捷操作 */}
        <View className={styles.actionSection}>
          <View
            className={styles.actionBtn}
            onClick={() => Taro.navigateTo({ url: `/pages/species-detail/index?id=${s1.id}` })}
          >
            <Text>查看{s1.commonName}详情</Text>
          </View>
          <View
            className={styles.actionBtn}
            onClick={() => Taro.navigateTo({ url: `/pages/species-detail/index?id=${s2.id}` })}
          >
            <Text>查看{s2.commonName}详情</Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* 物种选择弹窗 */}
      {showPicker && (
        <View className={styles.modalMask} onClick={() => setShowPicker(null)}>
          <View className={styles.pickerPanel} onClick={e => e.stopPropagation()}>
            <View className={styles.pickerHeader}>
              <Text className={styles.pickerTitle}>选择{showPicker === 'a' ? '左侧' : '右侧'}对比物种</Text>
              <Text className={styles.pickerClose} onClick={() => setShowPicker(null)}>✕</Text>
            </View>
            <ScrollView scrollY className={styles.pickerList} enhanced showScrollbar={false}>
              {mockSpeciesList.map(sp => (
                <View
                  key={sp.id}
                  className={`${styles.pickerItem} ${(showPicker === 'a' && sp.id === speciesBId) || (showPicker === 'b' && sp.id === speciesAId) ? styles.pickerItemDisabled : ''}`}
                  onClick={() => {
                    if ((showPicker === 'a' && sp.id === speciesBId) || (showPicker === 'b' && sp.id === speciesAId)) return;
                    handleSelectSpecies(sp.id);
                  }}
                >
                  <SpeciesCard data={sp} variant="list" />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default SpeciesComparePage;
