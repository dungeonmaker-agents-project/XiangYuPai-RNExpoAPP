/**
 * Discovery模块 - 数据转换工具
 * 
 * 功能：
 * - 后端API数据 → 前端展示数据
 * - FeedListItem → Feed
 * - CommentItem → Comment
 * - 时间戳转换
 * - 数据格式化
 */

import type { CommentItem, DiscoverContentItemVO, FeedListItem } from '@/services/api/discoveryApi';
import type { Comment, Feed } from '../types';

// ==================== 动态数据转换 ====================

/**
 * 将后端FeedListItem转换为前端Feed
 */
export const transformFeedListItemToFeed = (item: FeedListItem): Feed => {
  // 优先使用 author 对象，如果没有则使用扁平字段
  const nickname = item.author?.nickname || item.userNickname || '未知用户';
  const avatar = item.author?.avatar || item.userAvatar || '';
  const authorUserId = item.author?.userId || item.userId;
  
  return {
    id: item.id,
    userId: item.userId,
    
    // 内容信息
    type: item.type,
    typeDesc: item.typeDesc,
    title: item.title,
    summary: item.summary,
    content: item.summary || item.title, // 列表使用summary
    coverImage: item.coverImage,
    
    // 用户信息（优先从author对象获取）
    userInfo: {
      id: authorUserId,
      nickname: nickname,
      avatar: avatar,
      isFollowed: false, // TODO: 需要从用户关系服务获取
      tags: [], // TODO: 需要从用户服务获取
    },
    
    // 媒体列表（TODO: 需要从Media服务获取）
    mediaList: item.coverImage ? [{
      id: `media-${item.id}`,
      type: 'image' as const,
      url: item.coverImage,
      width: 800,
      height: 600,
    }] : [],
    
    // 话题列表（TODO: 需要从话题关联表获取）
    topicList: [],
    
    // 地理位置（v7.1新增）
    locationName: item.locationName,
    locationAddress: item.locationAddress,
    longitude: item.longitude,
    latitude: item.latitude,
    distance: item.distance,
    cityId: item.cityId,
    
    // 旧版位置信息（兼容）
    location: item.locationName ? {
      id: `loc-${item.id}`,
      name: item.locationName,
      address: item.locationAddress || '',
      latitude: item.latitude || 0,
      longitude: item.longitude || 0,
      distance: item.distance ? item.distance * 1000 : undefined, // km → m
    } : undefined,
    
    // 统计数据（确保是数字类型）
    likeCount: Number(item.likeCount) || 0,
    commentCount: Number(item.commentCount) || 0,
    shareCount: Number(item.shareCount) || 0,
    collectCount: Number(item.collectCount) || 0,
    viewCount: Number(item.viewCount) || 0,
    
    // 用户互动状态（后端可能返回 liked/collected 或 isLiked/isCollected）
    isLiked: (item as any).liked ?? item.isLiked ?? false,
    isCollected: (item as any).collected ?? item.isCollected ?? false,
    
    // 时间戳
    createdAt: parseBackendDateTime(item.createdAt),
    updatedAt: Date.now(),
  };
};

/**
 * 批量转换FeedListItem列表
 */
export const transformFeedList = (items: FeedListItem[]): Feed[] => {
  return items.map(transformFeedListItemToFeed);
};

// ==================== BFF响应数据转换 ====================

/**
 * 将BFF的DiscoverContentItemVO转换为前端Feed
 *
 * BFF响应格式与旧API不同，需要单独转换
 */
export const transformDiscoverContentItemToFeed = (item: DiscoverContentItemVO): Feed => {
  return {
    id: item.id,
    userId: item.authorData.userId,

    // 内容信息
    type: item.type === 'video' ? 2 : 1, // video=2, image=1
    typeDesc: item.type === 'video' ? '视频' : '图片',
    title: item.textData.title,
    summary: item.textData.content || item.textData.title,
    content: item.textData.content || item.textData.title,
    coverImage: item.mediaData.coverUrl,

    // 用户信息
    userInfo: {
      id: item.authorData.userId,
      nickname: item.authorData.nickname,
      avatar: item.authorData.avatar,
      isFollowed: false, // TODO: 从关注状态获取
      tags: [],
    },

    // 媒体列表
    mediaList: item.mediaData.coverUrl ? [{
      id: `media-${item.id}`,
      type: item.type as 'image' | 'video',
      url: item.mediaData.coverUrl,
      width: item.mediaData.width || 800,
      height: item.mediaData.height || 600,
      duration: item.mediaData.duration,
      aspectRatio: item.mediaData.aspectRatio,
    }] : [],

    // 话题列表
    topicList: [],

    // 地理位置
    locationName: item.metaData.location,
    locationAddress: undefined,
    longitude: undefined,
    latitude: undefined,
    distance: item.metaData.distance,
    cityId: undefined,

    // 旧版位置信息（兼容）
    location: item.metaData.location ? {
      id: `loc-${item.id}`,
      name: item.metaData.location,
      address: '',
      latitude: 0,
      longitude: 0,
      distance: item.metaData.distance,
    } : undefined,

    // 统计数据
    likeCount: item.statsData.likeCount || 0,
    commentCount: item.statsData.commentCount || 0,
    shareCount: 0,
    collectCount: item.statsData.collectCount || 0,
    viewCount: 0,

    // 用户互动状态
    isLiked: item.statsData.isLiked || false,
    isCollected: item.statsData.isCollected || false,

    // 时间戳
    createdAt: parseBackendDateTime(item.metaData.createTime),
    updatedAt: Date.now(),
  };
};

/**
 * 批量转换BFF DiscoverContentItemVO列表
 */
export const transformDiscoverContentList = (items: DiscoverContentItemVO[]): Feed[] => {
  return items.map(transformDiscoverContentItemToFeed);
};

// ==================== 评论数据转换 ====================

/**
 * 将后端CommentItem转换为前端Comment
 */
export const transformCommentItemToComment = (item: CommentItem): Comment => {
  return {
    id: item.id,
    feedId: item.contentId,
    userId: item.userId,
    
    // 用户信息
    userInfo: {
      id: item.userId,
      nickname: item.userNickname,
      avatar: item.userAvatar || '',
      isFollowed: false, // TODO: 需要从用户关系服务获取
      tags: [],
    },
    
    // 评论内容
    content: item.commentText,
    
    // 回复关系
    parentId: item.parentId,
    replyTo: item.replyToId,
    replyToUserId: item.replyToUserId,
    replyToUserNickname: item.replyToUserNickname,
    replyToUser: item.replyToUserId ? {
      id: item.replyToUserId,
      nickname: item.replyToUserNickname || '',
      avatar: '',
      isFollowed: false,
      tags: [],
    } : undefined,
    
    // 统计数据
    likeCount: item.likeCount,
    replyCount: item.replyCount,
    isTop: item.isTop,
    
    // 用户互动
    isLiked: item.liked,
    
    // 二级回复（递归转换）
    replies: item.replies ? item.replies.map(transformCommentItemToComment) : [],
    totalReplies: item.totalReplies,
    hasMoreReplies: item.hasMoreReplies,
    
    // 时间
    createdAt: parseBackendDateTime(item.createdAt),
  };
};

/**
 * 批量转换评论列表
 */
export const transformCommentList = (items: CommentItem[]): Comment[] => {
  return items.map(transformCommentItemToComment);
};

// ==================== 时间转换工具 ====================

/**
 * 解析后端时间字符串为时间戳
 * 
 * 后端格式："yyyy-MM-dd HH:mm:ss"
 */
export const parseBackendDateTime = (dateTimeStr: string): number => {
  // 如果已经是时间戳，直接返回
  if (typeof dateTimeStr === 'number') {
    return dateTimeStr;
  }
  
  // 解析后端时间格式
  const date = new Date(dateTimeStr.replace(' ', 'T'));
  return date.getTime();
};

/**
 * 格式化相对时间
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()}`;
  }
};

/**
 * 格式化数字（1000+ → 1k, 10000+ → 1w）
 */
export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}w`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

/**
 * 格式化距离（米 → 文字描述）
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.floor(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// ==================== 导出 ====================

export const dataTransformUtils = {
  transformFeedListItemToFeed,
  transformFeedList,
  transformDiscoverContentItemToFeed,
  transformDiscoverContentList,
  transformCommentItemToComment,
  transformCommentList,
  parseBackendDateTime,
  formatRelativeTime,
  formatNumber,
  formatDistance,
};

