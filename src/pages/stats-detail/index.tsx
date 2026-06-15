import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useBirdingStore } from '@/store/useBirdingStore';
import StatCard from '@/components/StatCard';
import SpeciesCard from '@/components/SpeciesCard';
import TagBadge from '@/components/TagBadge';
import { getSpeciesById } from '@/data/mockSpecies';
import styles from './index.module.scss';

const StatsDetailPage: React.FC = () => {
  const router = useRouter();
  const { monthlyStats, user } = useBirdingStore();
  const month = router.params.month || `${monthlyStats.year}-${String(monthlyStats.month).padStart(2, '0')}`;

  const stats = monthlyStats;

  const topSpeciesWithDetails = useMemo(() => {
    return stats.topSpecies.map(ts => ({
      ...ts,
      species: getSpeciesById(ts.speciesId),
    })).filter(item => item.species);
  }, [stats]);

  const newSpeciesWithDetails = useMemo(() => {
    return stats.newSpecies.map(sid => getSpeciesById(sid)).filter(Boolean);
  }, [stats]);

  const maxWeeklyValue = Math.max(...stats.weeklyDistribution, 1);
  const weekLabels = ['第1周', '第2周', '第3周', '第4周', '第5周'];

  const handleExport = () => {
    Taro.showActionSheet({
      itemList: ['导出月度简报', '分享数据卡片', '复制统计摘要'],
      success: (res) => {
        const msgs = ['简报已生成', '分享功能开发中', '摘要已复制到剪贴板'];
        Taro.showToast({ title: msgs[res.tapIndex], icon: 'none' });
      }
    });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView} enhanced showScrollbar={false}>
        {/* 月度标题卡 */}
        <View className={styles.headerCard}>
          <View>
            <Text className={styles.monthLabel}>{stats.year}年{stats.month}月</Text>
            <Text className={styles.headerSubtitle}>个人观察月度复盘</Text>
          </View>
          <View className={styles.headerBadge}>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: 600 }}>{user.level}观鸟人</Text>
          </View>
        </View>

        {/* 核心统计 */}
        <View className={styles.coreStats}>
          <StatCard label="观察次数" value={stats.totalObservations} icon="📝" variant="primary" />
          <StatCard label="识别物种" value={stats.totalSpecies} icon="🐦" variant="accent" />
          <StatCard label="出行次数" value={stats.totalTrips} icon="🎒" variant="highlight" />
          <StatCard label="总个体数" value={Math.floor(stats.totalObservations * 2.4)} icon="🔢" variant="default" />
        </View>

        {/* 每周分布图表 */}
        <View className={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>📈 每周活动分布</Text>
            <TagBadge text={`共${stats.totalObservations}次`} variant="primary" size="sm" />
          </View>
          <View className={styles.barChart}>
            {stats.weeklyDistribution.map((v, i) => (
              <View key={i} className={styles.barCol}>
                <Text className={styles.barValue}>{v > 0 ? v : ''}</Text>
                <View className={styles.barTrack}>
                  <View
                    className={styles.barFill}
                    style={{ height: `${Math.max((v / maxWeeklyValue) * 100, v > 0 ? 8 : 0)}%` }}
                  />
                </View>
                <Text className={styles.barLabel}>{weekLabels[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top物种 */}
        <View className={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>🏆 本月高频物种</Text>
            <TagBadge text={`TOP${topSpeciesWithDetails.length}`} variant="accent" size="sm" />
          </View>
          {topSpeciesWithDetails.map((item, i) => (
            <View key={item.speciesId} className={styles.rankItem}>
              <View className={styles.rankBadge} style={{
                background: i === 0 ? 'linear-gradient(135deg,#D4A843,#B8860B)' :
                           i === 1 ? 'linear-gradient(135deg,#B5BEC6,#8A94A6)' :
                           i === 2 ? 'linear-gradient(135deg,#A67B5B,#8B5E3C)' : '#FAF8F3',
                color: i < 3 ? 'white' : '#5B6670'
              }}>
                {i + 1}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <SpeciesCard
                  species={item.species!}
                  variant="list"
                  onClick={() => Taro.navigateTo({ url: `/pages/species-detail/index?id=${item.speciesId}` })}
                />
              </View>
              <View className={styles.rankCount}>
                <Text className={styles.rankCountNum}>{item.count}</Text>
                <Text className={styles.rankCountUnit}>次</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 新增物种 */}
        {newSpeciesWithDetails.length > 0 && (
          <View className={styles.section} style={{ background: 'linear-gradient(135deg, #F0F7F4, #FFF8EC)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>✨ 本月新记录</Text>
              <TagBadge text={`+${newSpeciesWithDetails.length}`} variant="success" size="sm" />
            </View>
            <ScrollView scrollX className={styles.newSpeciesScroll} enhanced showScrollbar={false}>
              {newSpeciesWithDetails.map(s => (
                <View
                  key={s.id}
                  className={styles.newSpeciesCard}
                  onClick={() => Taro.navigateTo({ url: `/pages/species-detail/index?id=${s.id}` })}
                >
                  <Image className={styles.newSpeciesImg} src={s.thumbUrl} mode="aspectFill" />
                  <View className={styles.newSpeciesInfo}>
                    <Text className={styles.newSpeciesName}>{s.commonName}</Text>
                    <Text className={styles.newSpeciesLatin}>{s.latinName}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={{ padding: 16, marginTop: 12, background: 'rgba(47,107,79,0.06)', borderRadius: 12 }}>
              <Text style={{ fontSize: 24, color: '#2F6B4F', lineHeight: 1.6 }}>
                🎉 太棒了！本月在个人图鉴上新增了 <Text style={{ fontWeight: 700, fontSize: 28 }}>{newSpeciesWithDetails.length}</Text> 个物种记录。
                {newSpeciesWithDetails.length >= 3 && ' 继续加油，挑战百鸟图鉴！'}
              </Text>
            </View>
          </View>
        )}

        {/* 观察地点统计 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📍 常去观察点</Text>
          {stats.locations.map((loc, i) => {
            const maxLoc = Math.max(...stats.locations.map(l => l.count), 1);
            const percent = (loc.count / maxLoc) * 100;
            return (
              <View key={i} className={styles.locItem}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 26, color: '#1A2332', fontWeight: 500 }}>{loc.name}</Text>
                    <Text style={{ fontSize: 24, color: '#2F6B4F', fontWeight: 600 }}>{loc.count}次</Text>
                  </View>
                  <View className={styles.locBarTrack}>
                    <View
                      className={styles.locBarFill}
                      style={{ width: `${percent}%` }}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* 成就总结 */}
        <View className={styles.section} style={{ background: 'linear-gradient(135deg,#1A2332,#2F3A4F)' }}>
          <Text className={styles.sectionTitle} style={{ color: 'white' }}>🎯 本月成就</Text>
          <View className={styles.achievementRow}>
            {[
              { icon: '📸', label: '完整记录', ok: stats.totalObservations >= 5, desc: '≥5次观察' },
              { icon: '📚', label: '图鉴扩充', ok: newSpeciesWithDetails.length >= 1, desc: '≥1个新物种' },
              { icon: '🎒', label: '勤奋出行', ok: stats.totalTrips >= 2, desc: '≥2次行程' },
              { icon: '🔊', label: '声音采集', ok: stats.totalObservations >= 3, desc: '≥3次带录音' },
            ].map((a, i) => (
              <View key={i} className={`${styles.achievementItem} ${a.ok ? styles.achievementOk : ''}`}>
                <Text style={{ fontSize: 36, display: 'block', marginBottom: 6 }}>{a.icon}</Text>
                <Text className={styles.achievementLabel}>{a.label}</Text>
                <Text className={styles.achievementDesc}>{a.desc}</Text>
                <View className={styles.achievementCheck}>{a.ok ? '✓' : '○'}</View>
              </View>
            ))}
          </View>
        </View>

        {/* 导出按钮 */}
        <View style={{ padding: 20 }}>
          <View
            className={styles.exportBtn}
            onClick={handleExport}
          >
            <Text style={{ fontSize: 28, marginRight: 10 }}>📤</Text>
            <Text>生成并导出月度简报</Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

export default StatsDetailPage;
