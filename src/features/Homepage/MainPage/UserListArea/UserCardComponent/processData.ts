/**
 * UserCardComponent 数据处理模块
 * 处理用户卡片数据逻辑
 */

import type { UserCard } from '../../types';

/**
 * 处理用户数据
 * 对用户数据进行展示优化
 */
export const processUserData = (user: UserCard): UserCard => {
  return {
    ...user,
    // 确保头像有默认值
    avatar: user.avatar || 'https://picsum.photos/100/100?random=default',
    // 确保简介有默认值
    bio: user.bio || '这个家伙很神秘，没有填写简介',
    // 确保服务列表不为空
    services: user.services.length > 0 ? user.services : ['模特'],
    // 确保照片列表不为空（兜底用）
    photos: user.photos?.length > 0 ? user.photos : [
      'https://picsum.photos/200/200?random=1',
      'https://picsum.photos/200/200?random=2',
      'https://picsum.photos/200/200?random=3',
    ],
    // 保留真实的 feeds 数据
    feeds: user.feeds || [],
    feedCount: user.feedCount || 0,
  };
};

/**
 * 处理用户状态数据
 */
export const processUserStatus = (user: UserCard) => {
  const now = Date.now();
  const lastActive = user.lastActive || now;
  const timeDiff = now - lastActive;
  
  // 5分钟内为在线
  if (timeDiff < 5 * 60 * 1000) {
    return 'online';
  }
  // 1小时内为可预约
  else if (timeDiff < 60 * 60 * 1000) {
    return 'available';
  }
  // 其他为离线
  else {
    return 'offline';
  }
};

/**
 * 处理用户评分显示
 */
export const processUserRating = (user: UserCard): string => {
  if (!user.rating) return '暂无评分';
  
  const rating = Math.round(user.rating * 10) / 10;
  const reviewCount = user.reviewCount || 0;
  
  return `${rating}分 (${reviewCount}评价)`;
};
