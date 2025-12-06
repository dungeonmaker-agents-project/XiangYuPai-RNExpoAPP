/**
 * Service List Screen - 服务列表页路由适配器
 * 支持所有技能类型：王者荣耀、英雄联盟、和平精英等
 */

import { ErrorBoundary } from '@/src/components';
import GamePlayerListPage from '@/src/features/Homepage/ServiceFlow/GamePlayerListPage';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ServiceListScreen() {
  const { skillType } = useLocalSearchParams<{ skillType: string }>();

  return (
    <ErrorBoundary>
      <GamePlayerListPage skillType={skillType} />
    </ErrorBoundary>
  );
}
