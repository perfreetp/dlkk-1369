import React, { useMemo, useState } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import { getSpeciesByCategory } from '@/data/mockSpecies';
import SpeciesCard from '@/components/SpeciesCard';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { categoryToIcon } from '@/utils/format';
import styles from './index.module.scss';

const CATEGORIES = ['全部', '鸣禽', '猛禽', '涉禽', '游禽', '攀禽', '陆禽'];
type ViewMode = 'grid' | 'list';

const SpeciesPage: React.FC = () => {
  const { species, wishlist } = useBirdingStore();
  const [category, setCategory] = useState('全部');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchText, setSearchText] = useState('');

  useDidShow(() => {
    console.log('[Species] 页面显示');
  });

  const filteredSpecies = useMemo(() => {
    let list = getSpeciesByCategory(category);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter(s =>
        s.commonName.includes(searchText) ||
        s.latinName.toLowerCase().includes(q) ||
        s.family.includes(searchText)
      );
    }
    return list;
  }, [category, searchText]);

  const observedSpeciesIds = useMemo(() => {
    const set = new Set<string>();
    species.forEach(() => {});
    return set;
  }, [species]);

  const wishlistIds = useMemo(
    () => new Set(wishlist.map(w => w.speciesId)),
    [wishlist]
  );

  const similarPairs = useMemo(() => [
    { a: 'sp-001', b: 'sp-003', hint: '城市 vs 山区，羽色深浅是关键' },
    { a: 'sp-010', b: 'sp-012', hint: '体型差异大，喙部颜色也不同' },
    { a: 'sp-008', b: 'sp-009', hint: '配色完全不同，叫声也有别' },
  ], []);

  const getSpeciesName = (id: string) => {
    const sp = species.find(s => s.id === id);
    return sp ? sp.commonName : '未知';
  };
  const getSpeciesThumb = (id: string) => {
    const sp = species.find(s => s.id === id);
    return sp?.thumbUrl || '';
  };

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.header}>
          <Text className={styles.pageTitle}>物种图鉴</Text>
          <Text className={styles.pageSubtitle}>
            共收录 {species.length} 种鸟类 · 你已目击 {observedSpeciesIds.size} 种
          </Text>
        </View>

        {/* 搜索栏 */}
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索鸟名、学名或科属"
            placeholderStyle="color: #B5BEC6"
            value={searchText}
            onInput={e => setSearchText(e.detail.value)}
          />
        </View>

        {/* 分类横向滚动 */}
        <ScrollView scrollX className={styles.categoryScroll} enhanced showScrollbar={false}>
          {CATEGORIES.map(cat => (
            <View
              key={cat}
              className={`${styles.categoryItem} ${category === cat ? styles.categoryItemActive : ''}`}
              onClick={() => setCategory(cat)}
            >
              <Text className={styles.categoryIcon}>{cat !== '全部' ? categoryToIcon(cat) : '📚'}</Text>
              <Text className={styles.categoryText}>{cat}</Text>
            </View>
          ))}
        </ScrollView>

        {/* 视图切换 + 计数 */}
        <View className={styles.viewToggle}>
          <View className={styles.viewLeft}>
            找到
            <Text className={styles.viewHighlight}>{filteredSpecies.length}</Text>
            个物种
          </View>
          <View className={styles.viewButtons}>
            <View
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('grid')}
            >
              网格
            </View>
            <View
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('list')}
            >
              列表
            </View>
          </View>
        </View>

        {/* 物种列表 */}
        {filteredSpecies.length > 0 ? (
          viewMode === 'grid' ? (
            <View className={styles.speciesGrid}>
              {filteredSpecies.map(sp => (
                <SpeciesCard
                  key={sp.id}
                  data={sp}
                  variant="grid"
                  inWishlist={wishlistIds.has(sp.id)}
                />
              ))}
            </View>
          ) : (
            <View className={styles.speciesList}>
              {filteredSpecies.map(sp => (
                <SpeciesCard
                  key={sp.id}
                  data={sp}
                  variant="list"
                  inWishlist={wishlistIds.has(sp.id)}
                />
              ))}
            </View>
          )
        ) : (
          <View className={styles.emptyWrap}>
            <EmptyState
              icon="🔍"
              title="未找到匹配的物种"
              description="尝试更换关键词或选择其他分类"
            />
          </View>
        )}

        {/* 易混淆物种 */}
        {category === '全部' && !searchText && (
          <View className={styles.similarSection}>
            <SectionHeader
              title="🔀 易混淆物种"
              subtitle="辅助识别对比"
              actionText="对比工具"
              actionLink="/pages/species-compare/index"
            />
            <View
              className={styles.similarCard}
              onClick={() => Taro.navigateTo({ url: `/pages/species-compare/index?a=${similarPairs[0].a}&b=${similarPairs[0].b}` })}
            >
              <View className={styles.similarTop}>
                <Text className={styles.similarTitle}>本周易混淆 · 推荐对比</Text>
                <Text style={{ fontSize: '24rpx', color: '#2F6B4F' }}>查看 →</Text>
              </View>
              <Text className={styles.similarDesc}>{similarPairs[0].hint}</Text>
              <View className={styles.similarPair}>
                <View className={styles.similarItem}>
                  <Image
                    className={styles.similarItemThumb}
                    src={getSpeciesThumb(similarPairs[0].a)}
                    mode="aspectFill"
                  />
                  <Text className={styles.similarItemName}>{getSpeciesName(similarPairs[0].a)}</Text>
                  <Text className={styles.similarItemHint}>体型较小</Text>
                </View>
                <View className={styles.similarItem}>
                  <Image
                    className={styles.similarItemThumb}
                    src={getSpeciesThumb(similarPairs[0].b)}
                    mode="aspectFill"
                  />
                  <Text className={styles.similarItemName}>{getSpeciesName(similarPairs[0].b)}</Text>
                  <Text className={styles.similarItemHint}>体型较大</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default SpeciesPage;
