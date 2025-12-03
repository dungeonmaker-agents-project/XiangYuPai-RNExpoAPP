/**
 * UserListArea 数据处理模块
 * 处理用户列表数据逻辑
 */

import type { UserCard } from '../types';

/**
 * 处理列表数据
 * 对用户列表进行展示优化
 */
export const processListData = (users: UserCard[]): UserCard[] => {
  // 安全处理：确保 users 是数组
  if (!users || !Array.isArray(users)) {
    return [];
  }

  return users.map((user, index) => ({
    ...user,
    // 添加列表索引
    listIndex: index,
    // 确保必要字段有默认值
    avatar: user.avatar || `https://picsum.photos/100/100?random=${index}`,
    photos: user.photos?.length > 0 ? user.photos : [
      `https://picsum.photos/200/200?random=${index * 10 + 1}`,
      `https://picsum.photos/200/200?random=${index * 10 + 2}`,
      `https://picsum.photos/200/200?random=${index * 10 + 3}`,
    ],
  }));
};

/**
 * 按距离排序用户列表
 */
export const processSortByDistance = (users: UserCard[]): UserCard[] => {
  return [...users].sort((a, b) => a.distance - b.distance);
};

/**
 * 按评分排序用户列表
 */
export const processSortByRating = (users: UserCard[]): UserCard[] => {
  return [...users].sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

/**
 * 按最后活跃时间排序
 */
export const processSortByLastActive = (users: UserCard[]): UserCard[] => {
  return [...users].sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
};

/**
 * 筛选在线用户
 */
export const processFilterOnline = (users: UserCard[]): UserCard[] => {
  return users.filter(user => user.status === 'online');
};

/**
 * 筛选可预约用户
 */
export const processFilterAvailable = (users: UserCard[]): UserCard[] => {
  return users.filter(user => user.status === 'available' || user.status === 'online');
};

/**
 * 按地区筛选用户
 */
export const processFilterByRegion = (users: UserCard[], region: string): UserCard[] => {
  if (region === '全部') return users;
  return users.filter(user => user.region === region);
};
