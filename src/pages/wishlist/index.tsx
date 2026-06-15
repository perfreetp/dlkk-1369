import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import TagBadge from '@/components/TagBadge';
import SpeciesCard from '@/components/SpeciesCard';
import EmptyState from '@/components/EmptyState';
import { getSeasonalSpecies } from '@/data/mockSpecies';
import { getCurrentSeason } from '@/utils/date';
import type { WishlistItem } from '@/types';
import styles from './index.module.scss';

type FilterTab = 'all' | 'pending' | 'observed' | 'high';

const WishlistPage: React.FC = () => {
  const { wishlist, actions, species: allSpecies } = useBirdingStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredWishlist = useMemo(() => {
    let list = [...wishlist];
    switch (activeTab) {
      case 'pending':
        list = list.filter(w => !w.observed);
        break;
      case 'observed':
        list = list.filter(w => w.observed);
        break;
      case 'high':
        list = list.filter(w => w.priority === '高' && !w.observed);
        break;
      default:
        break;
    }
    return list.sort((a, b) => {
      if (a.observed !== b.observed) return a.observed ? 1 : -1;
      const priorityOrder = { '高': 0, '中': 1, '低': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [wishlist, activeTab]);

  const season = getCurrentSeason();
  const seasonalRecommend = useMemo(() => {
    const inWishlistIds = new Set(wishlist.map(w => w.speciesId));
    return getSeasonalSpecies(season).filter(s => !inWishlistIds.has(s.id)).slice(0, 6);
  }, [season, wishlist]);

  const tabs = [
    { key: 'all' as FilterTab, label: '全部', count: wishlist.length },
    { key: 'high' as FilterTab, label: '高优先', count: wishlist.filter(w => w.priority === '高' && !w.observed).length },
    { key: 'pending' as FilterTab, label: '待观察', count: wishlist.filter(w => !w.observed).length },
    { key: 'observed' as FilterTab, label: '已解锁', count: wishlist.filter(w => w.observed).length },
  ];

  const progress = {
    total: wishlist.length,
    observed: wishlist.filter(w => w.observed).length,
  };

  const handleTogglePriority = (speciesId: string, currentPriority: WishlistItem['priority']) => {
    const priorityCycle: WishlistItem['priority'][] = ['高', '中', '低'];
    const nextIdx = (priorityCycle.indexOf(currentPriority) + 1) % priorityCycle.length;
    const nextPriority = priorityCycle[nextIdx];
    actions.updateWishlistPriority(speciesId, nextPriority);
    Taro.showToast({ title: `优先级: ${nextPriority}`, icon: 'none' });
  };

  const handleQuickAdd = (species: any) => {
    actions.addToWishlist({
      speciesId: species.id,
      speciesName: species.commonName,
      speciesThumb: species.thumbUrl,
      addedAt: Date.now(),
      priority: '中',
      observed: false,
    });
    Taro.showToast({ title: '已加入待观察', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      {/* 头部进度卡 */}
      <View className={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text className={styles.headerTitle}>我的待观察清单</Text>
            <Text className={styles.headerSub}>
              已解锁 {progress.observed} / {progress.total} 种
            </Text>
          </View>
          <View
            className={styles.addBtn}
            onClick={() => setShowAddModal(true)}
          >
            <Text style={{ fontSize: 28, color: '#2F6B4F', fontWeight: 700 }}>＋ 添加</Text>
          </View>
        </View>
        <View className={styles.progressTrack}>
          <View
            className={styles.progressFill}
            style={{ width: `${progress.total > 0 ? (progress.observed / progress.total) * 100 : 0}%` }}
          />
          <Text className={styles.progressText}>
            {progress.total > 0 ? Math.round((progress.observed / progress.total) * 100) : 0}%
          </Text>
        </View>
      </View>

      {/* 筛选标签 */}
      <ScrollView scrollX className={styles.tabScroll} enhanced showScrollbar={false}>
        <View className={styles.tabWrap}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text className={styles.tabLabel}>{tab.label}</Text>
              <View className={`${styles.tabCount} ${activeTab === tab.key ? styles.tabCountActive : ''}`}>
                {tab.count}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <ScrollView scrollY className={styles.listScroll} enhanced showScrollbar={false}>
        {/* 当季推荐添加 */}
        {activeTab === 'all' && seasonalRecommend.length > 0 && (
          <View className={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>🌸 {season}季推荐添加</Text>
              <TagBadge text={`已筛选`} variant="ghost" size="sm" />
            </View>
            <ScrollView scrollX className={styles.recommendScroll} enhanced showScrollbar={false}>
              {seasonalRecommend.map(s => (
                <View key={s.id} className={styles.recommendCard}>
                  <Image className={styles.recommendImg} src={s.thumbUrl} mode="aspectFill" />
                  <View className={styles.recommendInfo}>
                    <Text className={styles.recommendName}>{s.commonName}</Text>
                    <Text className={styles.recommendLatin}>{s.latinName}</Text>
                  </View>
                  <View className={styles.recommendAdd} onClick={() => handleQuickAdd(s)}>
                    <Text>＋</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 愿望清单列表 */}
        {filteredWishlist.length > 0 ? (
          <View style={{ padding: '0 16px 16px' }}>
            {filteredWishlist.map(item => (
              <WishlistRow
                key={item.speciesId}
                item={item}
                onToggle={() => actions.toggleWishlistObserved(item.speciesId)}
                onChangePriority={() => handleTogglePriority(item.speciesId, item.priority)}
                onRemove={() => {
                  Taro.showModal({
                    title: '确认删除',
                    content: `将${item.speciesName}从待观察清单中移除？`,
                    success: (res) => {
                      if (res.confirm) {
                        actions.removeFromWishlist(item.speciesId);
                        Taro.showToast({ title: '已移除', icon: 'none' });
                      }
                    }
                  });
                }}
                onClickDetail={() => Taro.navigateTo({ url: `/pages/species-detail/index?id=${item.speciesId}` })}
              />
            ))}
          </View>
        ) : (
          <View style={{ padding: 60 }}>
            <EmptyState
              icon="🌿"
              title={activeTab === 'observed' ? '还没有解锁任何物种' : '清单是空的'}
              description={activeTab === 'observed' ? '继续加油，把它们一个个变成现实吧！' : '添加你想要见到的鸟种，制定你的观察计划'}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 快速添加弹窗 */}
      {showAddModal && (
        <View className={styles.modalMask} onClick={() => setShowAddModal(false)}>
          <View className={styles.modal} onClick={e => e.stopPropagation?.()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>从物种库添加</Text>
              <Text className={styles.modalClose} onClick={() => setShowAddModal(false)}>关闭</Text>
            </View>
            <ScrollView scrollY style={{ maxHeight: '60vh' }}>
              {allSpecies.slice(0, 15).map(s => (
                <View key={s.id} style={{
                  display: 'flex', alignItems: 'center', padding: '12px 0',
                  borderBottom: '1px solid #F0EDE6'
                }}>
                  <View style={{ flex: 1 }}>
                    <SpeciesCard
                      species={s}
                      variant="list"
                      onClick={() => {
                        if (!wishlist.some(w => w.speciesId === s.id)) {
                          handleQuickAdd(s);
                        } else {
                          Taro.showToast({ title: '已在清单中', icon: 'none' });
                        }
                      }}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const WishlistRow: React.FC<{
  item: WishlistItem;
  onToggle: () => void;
  onChangePriority: () => void;
  onRemove: () => void;
  onClickDetail: () => void;
}> = ({ item, onToggle, onChangePriority, onRemove, onClickDetail }) => {
  const priorityStyle = {
    '高': { bg: 'rgba(214,69,69,0.08)', color: '#D64545', label: '高' },
    '中': { bg: 'rgba(212,168,67,0.1)', color: '#B8860B', label: '中' },
    '低': { bg: 'rgba(47,107,79,0.08)', color: '#2F6B4F', label: '低' },
  }[item.priority];

  return (
    <View className={`${styles.rowCard} ${item.observed ? styles.rowCardObserved : ''}`}>
      <View className={styles.checkWrap} onClick={onToggle}>
        <View className={`${styles.checkCircle} ${item.observed ? styles.checkCircleChecked : ''}`}>
          {item.observed && <Text style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>✓</Text>}
        </View>
      </View>
      <Image
        className={styles.rowImg}
        src={item.speciesThumb}
        mode="aspectFill"
        onClick={onClickDetail}
      />
      <View className={styles.rowInfo} onClick={onClickDetail}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text className={styles.rowName}>{item.speciesName}</Text>
          {item.observed && (
            <TagBadge text="已解锁" variant="success" size="sm" />
          )}
        </View>
        <Text className={styles.rowSub}>
          添加于 {new Date(item.addedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          {item.observed && item.observedAt && ` · 发现于 ${new Date(item.observedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`}
        </Text>
      </View>
      <View className={styles.rowActions}>
        <View
          className={styles.priorityBadge}
          style={{ background: priorityStyle.bg, color: priorityStyle.color }}
          onClick={onChangePriority}
        >
          {priorityStyle.label}优先
        </View>
        <View className={styles.removeBtn} onClick={onRemove}>
          <Text style={{ color: '#B5BEC6', fontSize: 24 }}>移除</Text>
        </View>
      </View>
    </View>
  );
};

export default WishlistPage;
