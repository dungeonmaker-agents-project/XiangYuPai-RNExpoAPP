// #region 1. File Banner & TOC
/**
 * OtherUserProfilePage - Other User's Profile Page
 *
 * 个人主页页面（完整页面，非模态框）
 * 用于查看其他用户的个人主页
 *
 * 对应UI文档: 对方主页_结构文档.md
 * 对应后端: OtherUserProfileController
 *
 * Features:
 * - 完整的页面布局
 * - 头部导航 (UnifiedHeaderArea)
 * - Tab切换（动态/资料/技能）
 * - 底部操作按钮（私信/解锁微信）
 * - 认证系统集成
 * - 新API集成
 *
 * TOC:
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Main Component
 * [4] Styles
 * [5] Export
 */
// #endregion

// #region 2. Imports

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import UnifiedHeaderArea from '../MainPage/UnifiedHeaderArea';
import TabNavigationArea from './TabNavigationArea';
import TabContentArea from './TabContentArea';

// Hooks
import { useOtherUserProfile } from './hooks';
import { useAuthGuard } from '@/src/utils/auth/AuthGuard';

// Auth store (for checking if viewing own profile)
import { useAuthStore } from '@/src/features/AuthModule/stores/authStore';

// Event handlers
import navigateToMessage from './navigateToMessage';

// Types
import type { OtherUserProfilePageProps, TabType } from './types';

// #endregion

// #region 3. Main Component

/**
 * 对方用户主页页面
 */
const OtherUserProfilePage: React.FC<OtherUserProfilePageProps> = ({ userId }) => {
  const router = useRouter();
  const { requireAuth, isAuthenticated } = useAuthGuard();

  // Get current user ID to check if viewing own profile
  const currentUserInfo = useAuthStore((state) => state.userInfo);
  const currentUserId = currentUserInfo?.id;

  // Check if viewing own profile
  const isOwnProfile = currentUserId && String(userId) === String(currentUserId);

  // Tab state - must be declared before any early returns
  const [activeTab, setActiveTab] = useState<TabType>('dynamics');

  // Local states - must be declared before any early returns
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // API hook - must be called before any early returns (hooks must be called unconditionally)
  const {
    // Data
    headerData,
    profileInfo,
    skillsData,
    // Loading states
    headerLoading,
    profileLoading,
    skillsLoading,
    // Error states
    headerError,
    profileError,
    skillsError,
    // Pagination
    hasMoreSkills,
    // Actions
    fetchHeaderData,
    fetchProfileInfo,
    fetchSkillsList,
    loadMoreSkills,
    refreshAll,
    // User actions
    followUser,
    unfollowUser,
    unlockWechat,
  } = useOtherUserProfile({
    userId: Number(userId),
    autoFetch: !isOwnProfile,
  });

  // Redirect to own profile page if viewing own profile
  useEffect(() => {
    if (isOwnProfile) {
      console.log('[OtherUserProfile] 检测到访问自己的主页，跳转到 MainPage');
      router.replace('/profile/main' as any);
    }
  }, [isOwnProfile, router]);

  // Update following state when header data changes
  useEffect(() => {
    if (headerData) {
      setIsFollowing(headerData.isFollowed);
    }
  }, [headerData]);

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (isOwnProfile) return; // Don't load data if viewing own profile
    if (activeTab === 'profile' && !profileInfo && !profileLoading) {
      fetchProfileInfo();
    }
    if (activeTab === 'skills' && !skillsData && !skillsLoading) {
      fetchSkillsList(1);
    }
  }, [activeTab, profileInfo, skillsData, profileLoading, skillsLoading, isOwnProfile]);

  // Handle tab change
  const handleTabChange = useCallback((tab: TabType) => {
    console.log('🔄 切换Tab:', tab);
    setActiveTab(tab);
  }, []);

  // Handle follow toggle
  const handleFollowToggle = useCallback(async () => {
    if (!requireAuth({ action: '关注用户' })) return;

    try {
      setActionLoading(true);
      if (isFollowing) {
        const success = await unfollowUser();
        if (success) {
          setIsFollowing(false);
        }
      } else {
        const success = await followUser();
        if (success) {
          setIsFollowing(true);
        }
      }
    } catch (err) {
      console.error('Follow/unfollow error:', err);
    } finally {
      setActionLoading(false);
    }
  }, [isFollowing, requireAuth, followUser, unfollowUser]);

  // Handle back button
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  // Handle following count press
  const handleFollowingPress = useCallback(() => {
    router.push(`/profile/following?userId=${userId}` as any);
  }, [router, userId]);

  // Handle follower count press
  const handleFollowerPress = useCallback(() => {
    router.push(`/profile/followers?userId=${userId}` as any);
  }, [router, userId]);

  // Handle like count press
  const handleLikePress = useCallback(() => {
    // TODO: Implement like/collect page
  }, []);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (!requireAuth({ action: '发送消息' })) return;

    if (headerData) {
      navigateToMessage(router, String(headerData.userId), headerData.nickname);
    }
  }, [requireAuth, headerData, router]);

  // Handle unlock WeChat
  const handleUnlockWeChat = useCallback(async () => {
    if (!requireAuth({ action: '解锁微信' })) return;
    if (!headerData) return;

    // If already unlocked, show the WeChat ID
    if (headerData.wechatUnlocked && profileInfo?.wechat) {
      Alert.alert(
        '微信号',
        `${headerData.nickname}的微信号：\n${profileInfo.wechat}`,
        [
          {
            text: '复制',
            onPress: () => {
              Clipboard.setString(profileInfo.wechat || '');
              Alert.alert('成功', '微信号已复制到剪贴板');
            },
          },
          { text: '关闭', style: 'cancel' },
        ]
      );
      return;
    }

    // Confirm unlock
    const price = headerData.unlockPrice || 50;
    Alert.alert(
      '解锁微信',
      `查看 ${headerData.nickname} 的微信号需要支付 ${price} 金币`,
      [
        {
          text: '立即支付',
          onPress: async () => {
            setActionLoading(true);
            try {
              const result = await unlockWechat();
              if (result.success && result.wechat) {
                Alert.alert(
                  '解锁成功',
                  `微信号：${result.wechat}`,
                  [
                    {
                      text: '复制',
                      onPress: () => {
                        Clipboard.setString(result.wechat || '');
                        Alert.alert('成功', '微信号已复制到剪贴板');
                      },
                    },
                    { text: '关闭', style: 'cancel' },
                  ]
                );
              } else {
                Alert.alert('解锁失败', result.failReason || '未知错误');
              }
            } catch (error) {
              Alert.alert('错误', '网络错误，请稍后重试');
            } finally {
              setActionLoading(false);
            }
          },
        },
        { text: '取消', style: 'cancel' },
      ]
    );
  }, [requireAuth, headerData, profileInfo, unlockWechat]);

  // Convert gender string to number for UnifiedHeaderArea
  const convertGender = (gender: string | null): 1 | 2 | undefined => {
    if (gender === 'male') return 1;
    if (gender === 'female') return 2;
    return undefined;
  };

  // Convert distance string (e.g., "2.5km") to number
  const parseDistance = (distance: string | null): number | undefined => {
    if (!distance) return undefined;
    const num = parseFloat(distance);
    return isNaN(num) ? undefined : num;
  };

  // === EARLY RETURNS (after all hooks are declared) ===

  // If viewing own profile, show loading while redirecting
  if (isOwnProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>正在跳转到我的主页...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (headerLoading && !headerData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (headerError && !headerData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{headerError}</Text>
          <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No data
  if (!headerData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centerContainer}>
          <Ionicons name="person-outline" size={48} color="#CCCCCC" />
          <Text style={styles.errorText}>用户不存在</Text>
          <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
      >
        {/* Header Area (背景图+用户信息) */}
        <UnifiedHeaderArea
          backgroundImage={headerData.coverUrl || undefined}
          nickname={headerData.nickname}
          gender={convertGender(headerData.gender)}
          age={headerData.age || undefined}
          height={undefined}
          isRealVerified={headerData.isVerified}
          isGodVerified={headerData.isExpert}
          isVipVerified={headerData.isVip}
          isOnline={headerData.isOnline}
          distance={parseDistance(headerData.distance)}
          followerCount={headerData.stats.followerCount}
          followingCount={headerData.stats.followingCount}
          likeCount={headerData.stats.likesCount}
          isFollowing={isFollowing}
          isOwnProfile={false}
          onBack={handleBack}
          onFollowPress={handleFollowToggle}
          onFollowingPress={handleFollowingPress}
          onFollowerPress={handleFollowerPress}
          onLikePress={handleLikePress}
        />

        {/* Tab Navigation */}
        <TabNavigationArea activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab Content */}
        <View style={styles.tabContent}>
          <TabContentArea
            activeTab={activeTab}
            userId={headerData.userId}
            isOwnProfile={false}
            profileInfo={profileInfo}
            skillsData={skillsData}
            profileLoading={profileLoading}
            skillsLoading={skillsLoading}
            profileError={profileError}
            skillsError={skillsError}
            hasMoreSkills={hasMoreSkills}
            onLoadMoreSkills={loadMoreSkills}
            onRefreshProfile={fetchProfileInfo}
            onRefreshSkills={() => fetchSkillsList(1)}
            onUnlockWechat={handleUnlockWeChat}
          />
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomButtonArea}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={handleSendMessage}
          activeOpacity={0.8}
          disabled={!headerData.canMessage}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
          <Text style={styles.messageButtonText}>私信</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.unlockButton,
            headerData.wechatUnlocked && styles.unlockButtonUnlocked,
          ]}
          onPress={handleUnlockWeChat}
          activeOpacity={0.8}
          disabled={actionLoading}
        >
          <Ionicons
            name={headerData.wechatUnlocked ? 'checkmark-circle-outline' : 'lock-open-outline'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.unlockButtonText}>
            {headerData.wechatUnlocked ? '查看微信' : '解锁微信'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// #endregion

// #region 4. Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // Let content naturally expand
  },
  tabContent: {
    minHeight: 400,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8A2BE2',
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomButtonArea: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  unlockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D946EF',
  },
  unlockButtonUnlocked: {
    backgroundColor: '#10B981',
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// #endregion

// #region 5. Export

export default OtherUserProfilePage;

// #endregion
