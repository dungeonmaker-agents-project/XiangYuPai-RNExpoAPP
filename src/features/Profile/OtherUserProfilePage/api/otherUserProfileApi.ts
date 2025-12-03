/**
 * Other User Profile API
 *
 * 对方主页相关的API接口
 * 对接后端: /xypai-app-bff/api/profile/*
 *
 * @author XyPai Team
 * @date 2025-12-02
 */

import { apiClient } from '@/services/api/client';
import type { ApiResponse } from '@/services/api/client';

// ==================== Types ====================

/**
 * 对方主页数据
 */
export interface OtherUserProfileData {
  userId: number;
  avatar: string;
  coverUrl: string | null;
  nickname: string;
  gender: 'male' | 'female' | 'other';
  age: number | null;
  bio: string | null;
  level: {
    value: number;
    name: string;
    icon: string;
  };
  isVerified: boolean;
  isExpert: boolean;
  isVip: boolean;
  isOnline: boolean;
  isAvailable: boolean;
  distance: string | null;
  followerCount: number;
  followingCount: number;
  likesCount: number;
  isFollowed: boolean;
  followStatus: 'none' | 'following' | 'mutual';
  canMessage: boolean;
  canUnlockWechat: boolean;
  wechatUnlocked: boolean;
  unlockPrice: number | null;
}

/**
 * 用户资料详情
 */
export interface ProfileInfoData {
  userId: number;
  residence: string | null;
  ipLocation: string | null;
  height: number | null;
  weight: number | null;
  occupation: string | null;
  wechat: string | null;
  wechatUnlocked: boolean;
  birthday: string | null;
  zodiac: string | null;
  age: number | null;
  bio: string | null;
}

/**
 * 技能项
 */
export interface SkillItem {
  id: number;
  mediaData: {
    coverUrl: string;
    images: string[];
  };
  providerData: {
    userId: number;
    nickname: string;
    avatar: string;
  };
  skillInfo: {
    name: string;
    rank: string | null;
    tags: string[];
  };
  priceData: {
    amount: number;
    unit: string;
    displayText: string;
  };
}

/**
 * 技能列表响应
 */
export interface UserSkillsListData {
  list: SkillItem[];
  total: number;
  hasMore: boolean;
}

/**
 * 解锁微信请求
 */
export interface UnlockWechatRequest {
  targetUserId: number;
  unlockType?: 'coins' | 'vip';
  paymentPassword?: string;
}

/**
 * 解锁微信结果
 */
export interface UnlockWechatResult {
  success: boolean;
  wechat: string | null;
  cost: number | null;
  remainingCoins: number | null;
  failReason: string | null;
}

// ==================== API Functions ====================

/**
 * 获取对方主页数据
 */
export async function getOtherUserProfile(
  userId: number,
  latitude?: number,
  longitude?: number
): Promise<ApiResponse<OtherUserProfileData>> {
  const params = new URLSearchParams();
  if (latitude !== undefined) params.append('latitude', latitude.toString());
  if (longitude !== undefined) params.append('longitude', longitude.toString());

  const queryString = params.toString();
  const url = `/xypai-app-bff/api/profile/${userId}${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<OtherUserProfileData>(url);
}

/**
 * 获取用户资料详情
 */
export async function getProfileInfo(
  userId: number
): Promise<ApiResponse<ProfileInfoData>> {
  return apiClient.get<ProfileInfoData>(`/xypai-app-bff/api/profile/${userId}/info`);
}

/**
 * 获取用户技能列表
 */
export async function getUserSkills(
  userId: number,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<UserSkillsListData>> {
  return apiClient.get<UserSkillsListData>(
    `/xypai-app-bff/api/profile/${userId}/skills?pageNum=${pageNum}&pageSize=${pageSize}`
  );
}

/**
 * 解锁微信
 */
export async function unlockWechat(
  request: UnlockWechatRequest
): Promise<ApiResponse<UnlockWechatResult>> {
  return apiClient.post<UnlockWechatResult>('/xypai-app-bff/api/profile/unlock-wechat', request);
}

/**
 * 关注用户
 */
export async function followUser(
  targetUserId: number
): Promise<ApiResponse<void>> {
  return apiClient.post<void>(`/xypai-app-bff/api/profile/${targetUserId}/follow`, {});
}

/**
 * 取消关注
 */
export async function unfollowUser(
  targetUserId: number
): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/xypai-app-bff/api/profile/${targetUserId}/follow`);
}

// ==================== Export ====================

export const otherUserProfileApi = {
  getOtherUserProfile,
  getProfileInfo,
  getUserSkills,
  unlockWechat,
  followUser,
  unfollowUser,
};

export default otherUserProfileApi;
