// #region 1. File Banner & TOC
/**
 * TabContentArea - 他人信息页Tab内容区域
 *
 * 对应UI文档: ContentArea [L2]
 *
 * 功能：
 * - 根据activeTab渲染不同内容
 * - 动态Tab：显示用户发布的动态 (MomentsContentArea)
 * - 资料Tab：显示用户详细资料
 * - 技能Tab：显示用户技能列表
 *
 * TOC:
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types
 * [4] Main Component
 * [5] Styles
 * [6] Export
 */
// #endregion

// #region 2. Imports

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// Components
import MomentsContentArea from './MomentsContentArea';
import ProfileContentArea from './ProfileContentArea';
import SkillsContentArea from './SkillsContentArea';

// Types
import type { TabType, ProfileInfoData, SkillsListData, MomentsListData } from './types';

// #endregion

// #region 3. Types

interface TabContentAreaProps {
  activeTab: TabType;
  userId: number;
  isOwnProfile?: boolean;
  // API data passed from parent
  profileInfo?: ProfileInfoData | null;
  skillsData?: SkillsListData | null;
  momentsData?: MomentsListData | null;
  // Loading states
  profileLoading?: boolean;
  skillsLoading?: boolean;
  momentsLoading?: boolean;
  // Error states
  profileError?: string | null;
  skillsError?: string | null;
  momentsError?: string | null;
  // Pagination
  hasMoreSkills?: boolean;
  hasMoreMoments?: boolean;
  // Actions
  onLoadMoreSkills?: () => void;
  onLoadMoreMoments?: () => void;
  onRefreshProfile?: () => void;
  onRefreshSkills?: () => void;
  onRefreshMoments?: () => void;
  onUnlockWechat?: () => void;
  onSkillPress?: (skillId: number) => void;
  onMomentPress?: (momentId: string) => void;
  onMomentLikePress?: (momentId: string) => void;
}

// #endregion

// #region 4. Main Component

/**
 * Tab内容区域主组件
 */
const TabContentArea: React.FC<TabContentAreaProps> = ({
  activeTab,
  userId,
  isOwnProfile = false,
  // API data
  profileInfo,
  skillsData,
  momentsData,
  // Loading states
  profileLoading = false,
  skillsLoading = false,
  momentsLoading = false,
  // Error states
  profileError = null,
  skillsError = null,
  momentsError = null,
  // Pagination
  hasMoreSkills = false,
  hasMoreMoments = false,
  // Actions
  onLoadMoreSkills,
  onLoadMoreMoments,
  onRefreshProfile,
  onRefreshSkills,
  onRefreshMoments,
  onUnlockWechat,
  onSkillPress,
  onMomentPress,
  onMomentLikePress,
}) => {
  const router = useRouter();

  // Handle skill press
  const handleSkillPress = (skillId: number) => {
    if (onSkillPress) {
      onSkillPress(skillId);
    } else {
      router.push(`/skill/${skillId}?userId=${userId}` as any);
    }
  };

  // Handle moment press
  const handleMomentPress = (momentId: string) => {
    if (onMomentPress) {
      onMomentPress(momentId);
    } else {
      router.push(`/feed/${momentId}` as any);
    }
  };

  // Render content based on active tab
  switch (activeTab) {
    case 'dynamics':
      return (
        <MomentsContentArea
          momentsData={momentsData || null}
          loading={momentsLoading}
          error={momentsError}
          hasMore={hasMoreMoments}
          onLoadMore={onLoadMoreMoments}
          onRefresh={onRefreshMoments}
          onMomentPress={handleMomentPress}
          onLikePress={onMomentLikePress}
        />
      );

    case 'profile':
      return (
        <ProfileContentArea
          profileInfo={profileInfo || null}
          loading={profileLoading}
          error={profileError}
          onRefresh={onRefreshProfile}
          onUnlockWechat={onUnlockWechat}
        />
      );

    case 'skills':
      return (
        <SkillsContentArea
          skillsData={skillsData || null}
          loading={skillsLoading}
          error={skillsError}
          hasMore={hasMoreSkills}
          onLoadMore={onLoadMoreSkills}
          onRefresh={onRefreshSkills}
          onSkillPress={handleSkillPress}
        />
      );

    default:
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>未知的Tab类型</Text>
        </View>
      );
  }
};

// #endregion

// #region 5. Styles

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});

// #endregion

// #region 6. Export

export default TabContentArea;

// #endregion
