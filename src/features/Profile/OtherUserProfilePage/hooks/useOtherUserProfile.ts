// #region 1. File Banner & TOC
/**
 * useOtherUserProfile - 对方主页数据获取Hook
 *
 * 对应后端: OtherUserProfileController
 * 对应UI文档: 对方主页_结构文档.md
 *
 * 功能：
 * - 获取用户头部数据 (UserHeaderData)
 * - 获取用户资料详情 (ProfileInfoData)
 * - 获取用户技能列表 (SkillsListData)
 * - 关注/取消关注用户
 * - 解锁微信功能
 *
 * TOC:
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types
 * [4] Hook Implementation
 * [5] Export
 */
// #endregion

// #region 2. Imports

import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

import {
  getOtherUserProfile,
  getProfileInfo,
  getUserSkills,
  unlockWechat as unlockWechatApi,
  followUser as followUserApi,
  unfollowUser as unfollowUserApi,
  type OtherUserProfileData,
  type ProfileInfoData as ApiProfileInfoData,
  type UserSkillsListData,
  type UnlockWechatResult as ApiUnlockResult,
} from '../api';

import type {
  UserHeaderData,
  ProfileInfoData,
  SkillItem,
  SkillsListData,
  UnlockWechatResult,
  TabType,
} from '../types';

// #endregion

// #region 3. Types

interface UseOtherUserProfileOptions {
  userId: number;
  autoFetch?: boolean;
}

interface UseOtherUserProfileReturn {
  // Data
  headerData: UserHeaderData | null;
  profileInfo: ProfileInfoData | null;
  skillsData: SkillsListData | null;

  // Loading states
  headerLoading: boolean;
  profileLoading: boolean;
  skillsLoading: boolean;

  // Error states
  headerError: string | null;
  profileError: string | null;
  skillsError: string | null;

  // Pagination
  skillsPage: number;
  hasMoreSkills: boolean;

  // Actions
  fetchHeaderData: () => Promise<void>;
  fetchProfileInfo: () => Promise<void>;
  fetchSkillsList: (page?: number) => Promise<void>;
  loadMoreSkills: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // User actions
  followUser: () => Promise<boolean>;
  unfollowUser: () => Promise<boolean>;
  unlockWechat: () => Promise<UnlockWechatResult>;
}

// #endregion

// #region 4. Hook Implementation

/**
 * 对方主页数据获取Hook
 */
export function useOtherUserProfile({
  userId,
  autoFetch = true,
}: UseOtherUserProfileOptions): UseOtherUserProfileReturn {
  // State - Header Data
  const [headerData, setHeaderData] = useState<UserHeaderData | null>(null);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [headerError, setHeaderError] = useState<string | null>(null);

  // State - Profile Info
  const [profileInfo, setProfileInfo] = useState<ProfileInfoData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // State - Skills List
  const [skillsData, setSkillsData] = useState<SkillsListData | null>(null);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [skillsPage, setSkillsPage] = useState(1);
  const [hasMoreSkills, setHasMoreSkills] = useState(true);

  // Get current location for distance calculation (with timeout)
  const getCurrentLocation = useCallback(async () => {
    try {
      console.log('[OtherUserProfile] 开始获取位置...');
      const startTime = Date.now();

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('[OtherUserProfile] 位置权限被拒绝');
        return { latitude: undefined, longitude: undefined };
      }

      // Add timeout for location fetch (3 seconds max)
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 3000);
      });

      const location = await Promise.race([locationPromise, timeoutPromise]);

      const elapsed = Date.now() - startTime;
      console.log(`[OtherUserProfile] 位置获取完成, 耗时: ${elapsed}ms`);

      if (location) {
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      console.log('[OtherUserProfile] 位置获取超时，继续请求');
      return { latitude: undefined, longitude: undefined };
    } catch (error) {
      console.warn('[OtherUserProfile] 获取位置失败:', error);
      return { latitude: undefined, longitude: undefined };
    }
  }, []);

  // Transform API response to UserHeaderData
  const transformHeaderData = useCallback(
    (data: OtherUserProfileData): UserHeaderData => {
      return {
        userId: data.userId,
        avatar: data.avatar,
        coverUrl: data.coverUrl,
        nickname: data.nickname,
        gender: data.gender,
        age: data.age,
        bio: data.bio,
        level: data.level,
        isVerified: data.isVerified,
        isExpert: data.isExpert,
        isVip: data.isVip,
        isOnline: data.isOnline,
        isAvailable: data.isAvailable,
        distance: data.distance,
        stats: {
          followerCount: data.followerCount,
          followingCount: data.followingCount,
          likesCount: data.likesCount,
          skillsCount: 0, // Will be updated from skills API
        },
        isFollowed: data.isFollowed,
        followStatus: data.followStatus,
        canMessage: data.canMessage,
        canUnlockWechat: data.canUnlockWechat,
        wechatUnlocked: data.wechatUnlocked,
        unlockPrice: data.unlockPrice,
      };
    },
    []
  );

  // Transform API response to ProfileInfoData
  const transformProfileInfo = useCallback(
    (data: ApiProfileInfoData): ProfileInfoData => {
      return {
        userId: data.userId,
        residence: data.residence,
        ipLocation: data.ipLocation,
        height: data.height,
        weight: data.weight,
        occupation: data.occupation,
        wechat: data.wechat,
        wechatUnlocked: data.wechatUnlocked,
        birthday: data.birthday,
        zodiac: data.zodiac,
        age: data.age,
        bio: data.bio,
      };
    },
    []
  );

  // Fetch header data
  const fetchHeaderData = useCallback(async () => {
    console.log(`[OtherUserProfile] 开始获取用户 ${userId} 的主页数据...`);
    const startTime = Date.now();
    setHeaderLoading(true);
    setHeaderError(null);

    try {
      const { latitude, longitude } = await getCurrentLocation();
      console.log(`[OtherUserProfile] 位置获取完成，开始API请求...`);

      const apiStartTime = Date.now();
      const response = await getOtherUserProfile(userId, latitude, longitude);
      const apiElapsed = Date.now() - apiStartTime;
      console.log(`[OtherUserProfile] API请求完成, 耗时: ${apiElapsed}ms, code: ${response.code}`);

      if (response.code === 200 && response.data) {
        setHeaderData(transformHeaderData(response.data));
        console.log(`[OtherUserProfile] 数据转换完成`);
      } else {
        const errorMsg = response.message || '获取用户信息失败';
        console.log(`[OtherUserProfile] API返回错误: ${errorMsg}`);
        setHeaderError(errorMsg);
      }
    } catch (error: any) {
      console.error('[OtherUserProfile] Fetch header data error:', error);
      // Extract error message from API error object
      const errorMessage = error?.message || error?.msg || '网络错误，请稍后重试';
      setHeaderError(errorMessage);
    } finally {
      const totalElapsed = Date.now() - startTime;
      console.log(`[OtherUserProfile] 总耗时: ${totalElapsed}ms`);
      setHeaderLoading(false);
    }
  }, [userId, getCurrentLocation, transformHeaderData]);

  // Fetch profile info
  const fetchProfileInfo = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await getProfileInfo(userId);

      if (response.code === 200 && response.data) {
        setProfileInfo(transformProfileInfo(response.data));
      } else {
        setProfileError(response.message || '获取资料详情失败');
      }
    } catch (error: any) {
      console.error('Fetch profile info error:', error);
      const errorMessage = error?.message || error?.msg || '网络错误，请稍后重试';
      setProfileError(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  }, [userId, transformProfileInfo]);

  // Fetch skills list
  const fetchSkillsList = useCallback(
    async (page: number = 1) => {
      setSkillsLoading(true);
      setSkillsError(null);

      try {
        const response = await getUserSkills(userId, page, 10);

        if (response.code === 200 && response.data) {
          const { list, total, hasMore } = response.data;

          if (page === 1) {
            setSkillsData({ list, total, hasMore });
          } else {
            setSkillsData((prev) =>
              prev
                ? {
                    list: [...prev.list, ...list],
                    total,
                    hasMore,
                  }
                : { list, total, hasMore }
            );
          }

          setSkillsPage(page);
          setHasMoreSkills(hasMore);

          // Update skills count in header data
          setHeaderData((prev) =>
            prev
              ? {
                  ...prev,
                  stats: { ...prev.stats, skillsCount: total },
                }
              : prev
          );
        } else {
          setSkillsError(response.message || '获取技能列表失败');
        }
      } catch (error: any) {
        console.error('Fetch skills list error:', error);
        const errorMessage = error?.message || error?.msg || '网络错误，请稍后重试';
        setSkillsError(errorMessage);
      } finally {
        setSkillsLoading(false);
      }
    },
    [userId]
  );

  // Load more skills
  const loadMoreSkills = useCallback(async () => {
    if (!hasMoreSkills || skillsLoading) return;
    await fetchSkillsList(skillsPage + 1);
  }, [hasMoreSkills, skillsLoading, skillsPage, fetchSkillsList]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchHeaderData(),
      fetchProfileInfo(),
      fetchSkillsList(1),
    ]);
  }, [fetchHeaderData, fetchProfileInfo, fetchSkillsList]);

  // Follow user
  const followUser = useCallback(async (): Promise<boolean> => {
    try {
      const response = await followUserApi(userId);
      if (response.code === 200) {
        // Update local state
        setHeaderData((prev) =>
          prev
            ? {
                ...prev,
                isFollowed: true,
                followStatus: 'following',
                stats: {
                  ...prev.stats,
                  followerCount: prev.stats.followerCount + 1,
                },
              }
            : prev
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Follow user error:', error);
      return false;
    }
  }, [userId]);

  // Unfollow user
  const unfollowUser = useCallback(async (): Promise<boolean> => {
    try {
      const response = await unfollowUserApi(userId);
      if (response.code === 200) {
        // Update local state
        setHeaderData((prev) =>
          prev
            ? {
                ...prev,
                isFollowed: false,
                followStatus: 'none',
                stats: {
                  ...prev.stats,
                  followerCount: Math.max(0, prev.stats.followerCount - 1),
                },
              }
            : prev
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unfollow user error:', error);
      return false;
    }
  }, [userId]);

  // Unlock WeChat
  const unlockWechat = useCallback(async (): Promise<UnlockWechatResult> => {
    try {
      const response = await unlockWechatApi({ targetUserId: userId });

      if (response.code === 200 && response.data) {
        const result = response.data;

        if (result.success) {
          // Update local states
          setHeaderData((prev) =>
            prev
              ? {
                  ...prev,
                  wechatUnlocked: true,
                  canUnlockWechat: false,
                }
              : prev
          );

          setProfileInfo((prev) =>
            prev
              ? {
                  ...prev,
                  wechat: result.wechat,
                  wechatUnlocked: true,
                }
              : prev
          );
        }

        return {
          success: result.success,
          wechat: result.wechat,
          cost: result.cost,
          remainingCoins: result.remainingCoins,
          failReason: result.failReason,
        };
      }

      return {
        success: false,
        wechat: null,
        cost: null,
        remainingCoins: null,
        failReason: response.message || '解锁失败',
      };
    } catch (error) {
      console.error('Unlock WeChat error:', error);
      return {
        success: false,
        wechat: null,
        cost: null,
        remainingCoins: null,
        failReason: '网络错误，请稍后重试',
      };
    }
  }, [userId]);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch && userId) {
      fetchHeaderData();
    }
  }, [autoFetch, userId, fetchHeaderData]);

  return {
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
    skillsPage,
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
  };
}

// #endregion

// #region 5. Export

export default useOtherUserProfile;

// #endregion
