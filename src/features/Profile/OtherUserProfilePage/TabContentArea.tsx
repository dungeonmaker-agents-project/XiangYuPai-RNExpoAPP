// #region 1. File Banner & TOC
/**
 * TabContentArea - 他人信息页Tab内容区域
 *
 * 对应UI文档: ContentArea [L2]
 *
 * 功能：
 * - 根据activeTab渲染不同内容
 * - 动态Tab：显示用户发布的动态
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

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// Components
import DynamicContent from '../MainPage/TabContentArea/DynamicContent';
import ProfileContentArea from './ProfileContentArea';
import SkillsContentArea from './SkillsContentArea';

// API
import { feedApi } from '@/services/api/feedApi';

// Types
import type { TabType, ProfileInfoData, SkillsListData } from './types';

// #endregion

// #region 3. Types

interface TabContentAreaProps {
  activeTab: TabType;
  userId: number;
  isOwnProfile?: boolean;
  // API data passed from parent
  profileInfo?: ProfileInfoData | null;
  skillsData?: SkillsListData | null;
  // Loading states
  profileLoading?: boolean;
  skillsLoading?: boolean;
  // Error states
  profileError?: string | null;
  skillsError?: string | null;
  // Pagination
  hasMoreSkills?: boolean;
  // Actions
  onLoadMoreSkills?: () => void;
  onRefreshProfile?: () => void;
  onRefreshSkills?: () => void;
  onUnlockWechat?: () => void;
  onSkillPress?: (skillId: number) => void;
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
  // Loading states
  profileLoading = false,
  skillsLoading = false,
  // Error states
  profileError = null,
  skillsError = null,
  // Pagination
  hasMoreSkills = false,
  // Actions
  onLoadMoreSkills,
  onRefreshProfile,
  onRefreshSkills,
  onUnlockWechat,
  onSkillPress,
}) => {
  const router = useRouter();

  // Local state for user posts (动态)
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // Load user posts when dynamics tab is active
  const loadUserPosts = useCallback(async (page: number = 1) => {
    if (!userId) return;

    try {
      setPostsLoading(true);
      console.log(`[TabContentArea] 加载用户 ${userId} 的动态，第 ${page} 页`);

      const response = await feedApi.getUserFeedList(userId, {
        pageNum: page,
        pageSize: 20,
      });

      if (page === 1) {
        setPosts(response.list || []);
      } else {
        setPosts(prev => [...prev, ...(response.list || [])]);
      }
      setHasMorePosts(response.hasMore);
      setPostsPage(page);

      console.log(`[TabContentArea] 动态加载完成，共 ${response.list?.length || 0} 条`);
    } catch (error) {
      console.error('[TabContentArea] 加载动态失败:', error);
    } finally {
      setPostsLoading(false);
    }
  }, [userId]);

  // Load posts when dynamics tab becomes active
  useEffect(() => {
    if (activeTab === 'dynamics' && posts.length === 0 && !postsLoading) {
      loadUserPosts(1);
    }
  }, [activeTab, posts.length, postsLoading, loadUserPosts]);

  // Handle post press
  const handlePostPress = (postId: string) => {
    console.log('点击动态:', postId);
    router.push(`/feed/${postId}` as any);
  };

  // Handle load more posts
  const handleLoadMorePosts = () => {
    if (hasMorePosts && !postsLoading) {
      loadUserPosts(postsPage + 1);
    }
  };

  // Handle skill press
  const handleSkillPress = (skillId: number) => {
    if (onSkillPress) {
      onSkillPress(skillId);
    } else {
      router.push(`/skill/${skillId}?userId=${userId}` as any);
    }
  };

  // Render content based on active tab
  switch (activeTab) {
    case 'dynamics':
      return (
        <DynamicContent
          posts={posts}
          loading={postsLoading}
          onPostPress={handlePostPress}
          onLoadMore={handleLoadMorePosts}
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
