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

  // 功能点击处理 - 统一跳转到技能服务列表页
  const handleFunctionPress = useCallback((functionId: string) => {
    console.log('[useHomeNavigation] 🧭 导航: 首页 → 技能服务列表页', { functionId });

    // 功能ID映射配置: { skillType: 显示名称, gameId: API参数 }
    const skillConfigMap: Record<string, { skillType: string; gameId: string }> = {
      '1': { skillType: '王者荣耀', gameId: 'honor_of_kings' },
      '2': { skillType: '英雄联盟', gameId: 'lol' },
      '3': { skillType: '和平精英', gameId: 'pubg' },
      '4': { skillType: '荒野乱斗', gameId: 'brawl_stars' },
      '5': { skillType: '探店', gameId: 'explore_store' },
      '6': { skillType: '私影', gameId: 'private_photo' },
      '7': { skillType: '台球', gameId: 'billiards' },
      '8': { skillType: 'K歌', gameId: 'karaoke' },
      '9': { skillType: '喝酒', gameId: 'drinking' },
      '10': { skillType: '按摩', gameId: 'massage' },
    };

    const config = skillConfigMap[functionId] || { skillType: '王者荣耀', gameId: 'honor_of_kings' };

    router.push({
      pathname: '/(tabs)/homepage/game-player-list',
      params: { skillType: config.skillType, gameId: config.gameId },
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
