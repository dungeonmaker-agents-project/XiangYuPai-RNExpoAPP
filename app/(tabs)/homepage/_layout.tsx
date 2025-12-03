import { Stack } from 'expo-router';
import React from 'react';

export default function HomepageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}>
      {/* 首页主页面 */}
      <Stack.Screen 
        name="index" 
        options={{
          title: '首页',
        }} 
      />
      
      {/* 服务详情页面（通用） */}
      <Stack.Screen 
        name="service-detail" 
        options={{
          title: '服务详情',
          headerShown: false,
          headerBackTitle: '返回',
        }} 
      />
      
      {/* 搜索页面 */}
      <Stack.Screen 
        name="search" 
        options={{
          title: '搜索',
          headerShown: false,
        }} 
      />
      
      {/* 定位页面 */}
      <Stack.Screen 
        name="location" 
        options={{
          title: '选择位置',
          headerShown: true,
          headerBackTitle: '返回',
          presentation: 'modal',
        }} 
      />
      
      {/* 区域选择页面 */}
      <Stack.Screen 
        name="region" 
        options={{
          title: '选择区域',
          headerShown: true,
          headerBackTitle: '返回',
        }} 
      />
      
      {/* 线上筛选页面 */}
      <Stack.Screen 
        name="filter-online" 
        options={{
          title: '筛选条件',
          headerShown: true,
          headerBackTitle: '返回',
          presentation: 'modal',
        }} 
      />
      
      {/* 线下筛选页面 */}
      <Stack.Screen 
        name="filter-offline" 
        options={{
          title: '筛选条件',
          headerShown: true,
          headerBackTitle: '返回',
          presentation: 'modal',
        }} 
      />
      
      {/* 组局中心页面 */}
      <Stack.Screen 
        name="event-center" 
        options={{
          title: '组局中心',
          headerShown: false,
          headerBackTitle: '返回',
        }} 
      />
      
      {/* 限时专享页面 */}
      <Stack.Screen 
        name="featured" 
        options={{
          title: '限时专享',
          headerShown: false,
          headerBackTitle: '返回',
        }} 
      />
      
      {/* 发布组局页面 */}
      <Stack.Screen 
        name="publish-event" 
        options={{
          title: '发布组局',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
