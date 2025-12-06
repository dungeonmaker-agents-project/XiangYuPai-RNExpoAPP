// #region 1. File Banner & TOC
/**
 * SkillsContentArea - 技能Tab内容区域
 *
 * 对应UI文档: SkillsContentArea [L3]
 * 布局: flex-col, gap-16px
 *
 * 功能：
 * - 展示用户技能列表
 * - 上拉加载更多
 * - 点击跳转技能详情/预约页
 *
 * TOC:
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types
 * [4] SkillCard Component
 * [5] Main Component
 * [6] Styles
 * [7] Export
 */
// #endregion

// #region 2. Imports

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import type { SkillItem, SkillsListData } from '../types';

// #endregion

// #region 3. Types

interface SkillsContentAreaProps {
  skillsData: SkillsListData | null;
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onSkillPress?: (skillId: number) => void;
}

// #endregion

// #region 4. SkillCard Component

interface SkillCardProps {
  skill: SkillItem;
  onPress?: (skillId: number) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onPress }) => {
  const {
    id,
    mediaData,
    providerData,
    skillInfo,
    priceData,
    statsData,
  } = skill;

  // 防御性检查：如果必要数据为空则不渲染
  if (!providerData || !skillInfo || !priceData) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.skillCard}
      onPress={() => onPress?.(id)}
      activeOpacity={0.7}
    >
      {/* Left: Cover Image */}
      <Image
        source={{ uri: mediaData.coverUrl || 'https://via.placeholder.com/120' }}
        style={styles.coverImage}
        resizeMode="cover"
      />

      {/* Right: Content */}
      <View style={styles.skillContent}>
        {/* Row 1: Nickname + Badges + Distance */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.nickname} numberOfLines={1}>
              {providerData.nickname}
            </Text>
            {providerData.level && (
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: providerData.level.color || '#8A2BE2' },
                ]}
              >
                <Text style={styles.levelText}>{providerData.level.name}</Text>
              </View>
            )}
            {providerData.isVerified && (
              <View style={styles.verifyBadge}>
                <Text style={styles.verifyText}>实名</Text>
              </View>
            )}
            {providerData.isExpert && (
              <View style={styles.expertBadge}>
                <Text style={styles.expertText}>大神</Text>
              </View>
            )}
          </View>
          {providerData.distance && (
            <Text style={styles.distance}>{providerData.distance}</Text>
          )}
        </View>

        {/* Row 2: Skill Name + Rank */}
        <View style={styles.skillNameRow}>
          <Text style={styles.skillName} numberOfLines={1}>
            {skillInfo.name}
          </Text>
          {skillInfo.rank && (
            <Text style={styles.skillRank}>{skillInfo.rank}</Text>
          )}
        </View>

        {/* Row 3: Tags */}
        {skillInfo.tags && skillInfo.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {skillInfo.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} style={styles.tagText}>
                {tag}
              </Text>
            ))}
          </View>
        )}

        {/* Row 4: Stats + Price */}
        <View style={styles.bottomRow}>
          <View style={styles.statsContainer}>
            {statsData && (
              <>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={styles.statText}>{statsData.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.statDivider}>|</Text>
                <Text style={styles.statText}>{statsData.orderCount}单</Text>
              </>
            )}
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceAmount}>{priceData.amount}</Text>
            <Text style={styles.priceUnit}>{priceData.unit}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// #endregion

// #region 5. Main Component

const SkillsContentArea: React.FC<SkillsContentAreaProps> = ({
  skillsData,
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onSkillPress,
}) => {
  const router = useRouter();

  // Handle skill press
  const handleSkillPress = (skillId: number) => {
    if (onSkillPress) {
      onSkillPress(skillId);
    } else {
      router.push(`/skill/${skillId}` as any);
    }
  };

  // Render footer
  const renderFooter = () => {
    if (loading && skillsData && skillsData.list.length > 0) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color="#8A2BE2" />
          <Text style={styles.footerText}>加载中...</Text>
        </View>
      );
    }

    if (!hasMore && skillsData && skillsData.list.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={styles.footerEndText}>没有更多了~</Text>
        </View>
      );
    }

    return null;
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          {onRefresh && (
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons name="construct-outline" size={64} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>暂无技能</Text>
        <Text style={styles.emptyHint}>该用户还未添加技能服务</Text>
      </View>
    );
  };

  // No data
  if (!skillsData || skillsData.list.length === 0) {
    return renderEmpty();
  }

  return (
    <View style={[styles.container, styles.listContent]}>
      {skillsData.list.map((skill, index) => (
        <React.Fragment key={skill.id}>
          <SkillCard skill={skill} onPress={handleSkillPress} />
          {index < skillsData.list.length - 1 && <View style={styles.separator} />}
        </React.Fragment>
      ))}
      {renderFooter()}
    </View>
  );
};

// #endregion

// #region 6. Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 12,
  },
  separator: {
    height: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#8A2BE2',
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Skill Card
  skillCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  skillContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },

  // Header Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nickname: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginRight: 6,
    maxWidth: 80,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  levelText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  verifyBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  verifyText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '500',
  },
  expertBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  expertText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '500',
  },
  distance: {
    fontSize: 12,
    color: '#999999',
  },

  // Skill Name Row
  skillNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginRight: 8,
  },
  skillRank: {
    fontSize: 12,
    color: '#8A2BE2',
    fontWeight: '500',
  },

  // Tags Row
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#8A2BE2',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 2,
  },
  statDivider: {
    fontSize: 12,
    color: '#E0E0E0',
    marginHorizontal: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF4444',
  },
  priceUnit: {
    fontSize: 11,
    color: '#999999',
    marginLeft: 2,
  },

  // Footer
  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 8,
  },
  footerEnd: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerEndText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});

// #endregion

// #region 7. Export

export default SkillsContentArea;

// #endregion
