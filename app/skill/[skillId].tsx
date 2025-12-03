/**
 * Detail Screen - 详情页路由
 * 
 * Route: /skill/[skillId]
 * 
 * Features:
 * - 显示详细信息（技能/服务/组局等）
 * - 用户信息和评价
 * - 预约下单功能
 */

import { ErrorBoundary } from '@/src/components';
import DetailPage from '@/src/features/Profile/OtherUserProfilePage/DetailPage';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DetailScreen() {
  const { skillId, userId, isMyProduct, contentType } = useLocalSearchParams<{ 
    skillId: string; 
    userId?: string;
    isMyProduct?: string;
    contentType?: 'service' | 'event';
  }>();
  
  // Validate skillId
  if (!skillId) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>技能ID无效</Text>
        </View>
      </>
    );
  }
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ErrorBoundary>
        <DetailPage 
          skillId={skillId} 
          userId={userId || ''} 
          isMyProduct={isMyProduct === 'true'}
          contentType={contentType || 'service'}
        />
      </ErrorBoundary>
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
});

