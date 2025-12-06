/**
 * useHomeNavigation - 首页导航管理Hook
 * 统一管理首页所有导航逻辑
 */

import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import type { UserCard } from './types';

/**
 * 首页导航管理Hook
 * @deprecated navigation parameter - now uses expo-router internally
 */
export const useHomeNavigation = (navigation?: any) => {
  const router = useRouter();
  
  // 用户点击处理 - 跳转到个人主页
  const handleUserPress = useCallback((user: UserCard) => {
    console.log('[useHomeNavigation] 🧭 导航: 首页 → 个人主页', { userId: user.id });
    router.push({
      pathname: '/profile/[userId]',
      params: { userId: user.id },
    });
  }, [router]);

  // 功能点击处理 - 统一跳转到服务列表页
  const handleFunctionPress = useCallback((functionId: string) => {
    console.log('[useHomeNavigation] 🧭 导航: 首页 → 服务列表页', { functionId });

    // 功能ID到skillType的映射
    const skillTypeMap: Record<string, string> = {
      '1': '王者荣耀',
      '2': '英雄联盟',
      '3': '和平精英',
      '4': '荒野乱斗',
      '5': '探店',
      '6': '私影',
      '7': '台球',
      '8': 'K歌',
      '9': '喝酒',
      '10': '按摩',
    };

    const skillType = skillTypeMap[functionId] || '王者荣耀';

    // 统一跳转到服务列表页，传递skillType参数
    router.push({
      pathname: '/(tabs)/homepage/game-player-list',
      params: { skillType },
    });
  }, [router]);

  // 位置点击处理 - 跳转到位置选择页
  const handleLocationPress = useCallback(() => {
    console.log('[useHomeNavigation] 🧭 导航: 首页 → 位置选择');
    router.push('/(tabs)/homepage/location');
  }, [router]);

  // 更多组队聚会处理 - 跳转到组局中心
  const handleMoreTeamPartyPress = useCallback(() => {
    console.log('[useHomeNavigation] 🧭 导航: 首页 → 组局中心');
    router.push('/(tabs)/homepage/event-center');
  }, [router]);

  // 游戏横幅点击处理 - 跳转到服务详情页
  const handleGameBannerPress = useCallback(() => {
    console.log('[useHomeNavigation] 🧭 导航: 首页 → 游戏服务详情');
    router.push({
      pathname: '/(tabs)/homepage/service-detail',
      params: { serviceType: 'game' },
    });
  }, [router]);

  // 组队聚会点击处理 - 跳转到组局中心
  const handleTeamPartyPress = useCallback(() => {
    console.log('[useHomeNavigation] 🧭 导航: 首页 → 组局中心');
    router.push('/(tabs)/homepage/event-center');
  }, [router]);

  // 更多专享处理 - 跳转到限时专享列表
  const handleMoreOffersPress = useCallback(() => {
    console.log('[useHomeNavigation] 🧭 导航: 首页 → 限时专享列表');
    router.push('/(tabs)/homepage/featured');
  }, [router]);

  // 搜索点击处理 - 跳转到搜索页
  const handleSearchPress = useCallback(() => {
    console.log('[useHomeNavigation] 🧭 导航: 首页 → 搜索页');
    router.push('/(tabs)/homepage/search');
  }, [router]);

  return {
    handleUserPress,
    handleFunctionPress,
    handleLocationPress,
    handleMoreTeamPartyPress,
    handleGameBannerPress,
    handleTeamPartyPress,
    handleMoreOffersPress,
    handleSearchPress,
  };
};
