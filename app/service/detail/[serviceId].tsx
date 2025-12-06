/**
 * 服务详情页路由 - /service/detail/[serviceId]
 *
 * 路由参数：
 * - serviceId: 服务ID
 * - serviceType: 服务类型 ('online' | 'offline')
 */

import { ErrorBoundary } from '@/src/components';
import ServiceDetailPage from '@/src/features/Homepage/ServiceFlow/ServiceDetailPage';
import type { ServiceType } from '@/src/features/Homepage/ServiceFlow/ServiceDetailPage/types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ServiceDetailScreen() {
  const { serviceId, serviceType } = useLocalSearchParams<{
    serviceId: string;
    serviceType: string;
  }>();

  return (
    <ErrorBoundary>
      <ServiceDetailPage
        serviceId={serviceId}
        serviceType={(serviceType as ServiceType) || 'online'}
      />
    </ErrorBoundary>
  );
}
