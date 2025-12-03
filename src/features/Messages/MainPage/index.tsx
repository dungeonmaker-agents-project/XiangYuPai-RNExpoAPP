// #region 1. File Banner & TOC
/**
 * MainPage - 消息模块主页面
 * 
 * 功能：消息主页面，包含4宫格分类、对话列表、导航栏
 * 架构：基于现有Homepage/MainPage模式的八段式实现
 * 
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] Utils & Helpers
 * [6] State Management
 * [7] Domain Logic
 * [8] UI Components & Rendering
 * [9] Exports
 */
// #endregion

// #region 2. Imports
import { useAuthStore } from '@/src/features/AuthModule/stores/authStore';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 内部模块导入
import { useMessagesStore } from '../stores';
import type { MainPageProps } from '../types';
// 区域组件导入（扁平化架构）
import { CategoryArea } from './CategoryArea';
import { ConversationArea } from './ConversationArea';
import { NavigationArea } from './NavigationArea';
// #endregion

// #region 3. Types & Schema
// #endregion

// #region 4. Constants & Config
// #endregion

// #region 5. Utils & Helpers
// #endregion

// #region 6. State Management
/**
 * MainPage状态管理Hook
 * 集成messagesStore和本地状态
 */
const useMainPageState = () => {
  const messages = useMessagesStore();
  const [refreshing, setRefreshing] = React.useState(false);

  return {
    ...messages,
    refreshing,
    setRefreshing,
  };
};

/**
 * MainPage业务逻辑Hook
 */
const useMainPageLogic = () => {
  const router = useRouter();
  const state = useMainPageState();

  // 初始化加载数据
  useEffect(() => {
    state.loadConversations().catch((error: Error) => {
      console.error('[MainPage] loadConversations error:', error);
    });
    
    state.loadCategoryUnreadCounts().catch((error: Error) => {
      console.error('[MainPage] loadCategoryUnreadCounts error:', error);
    });
  }, []);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    state.setRefreshing(true);
    try {
      await state.refreshConversations();
    } finally {
      state.setRefreshing(false);
    }
  }, [state]);

  // 分类卡片点击
  const handleCategoryPress = useCallback((type: string) => {
    router.push(`/(tabs)/messages/${type}` as any);
  }, [router]);

  // 对话点击
  const handleConversationPress = useCallback((conversationId: string) => {
    router.push(`/(tabs)/messages/chat/${conversationId}` as any);
  }, [router]);

  // 对话删除
  const handleConversationDelete = useCallback((conversationId: string) => {
    state.deleteConversation(conversationId);
  }, [state]);

  // 清空所有对话
  const handleClearAll = useCallback(() => {
    state.clearAllConversations();
  }, [state]);

  return {
    state,
    handleRefresh,
    handleCategoryPress,
    handleConversationPress,
    handleConversationDelete,
    handleClearAll,
  };
};
// #endregion

// #region 7. Domain Logic
// #endregion

// #region 8. UI Components & Rendering
/**
 * 登录提示内容区域
 * 未登录时在ScrollView内显示，保持页面结构一致
 */
const LoginPromptContent: React.FC<{ onLoginPress: () => void }> = ({ onLoginPress }) => (
  <View style={styles.promptContentContainer}>
    <Text style={styles.promptIcon}>🔒</Text>
    <Text style={styles.promptTitle}>需要登录</Text>
    <Text style={styles.promptMessage}>请先登录后再查看消息</Text>
    <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
      <Text style={styles.loginButtonText}>立即登录</Text>
    </TouchableOpacity>
  </View>
);

/**
 * MainPage 主组件
 */
const MainPage: React.FC<MainPageProps> = ({ style }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const logic = useMainPageLogic();

  return (
    <View style={[styles.container, style]}>
      {/* 导航栏始终显示 */}
      <NavigationArea 
        onClearPress={isAuthenticated ? logic.handleClearAll : undefined}
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          isAuthenticated ? (
            <RefreshControl
              refreshing={logic.state.refreshing}
              onRefresh={logic.handleRefresh}
              tintColor="#6366F1"
            />
          ) : undefined
        }
      >
        {/* 未登录时显示登录提示，已登录时显示正常内容 */}
        {!isAuthenticated ? (
          <LoginPromptContent
            onLoginPress={() => {
              // TODO: 导航到登录页，根据登录模块提供的路径
              console.log('点击立即登录');
              router.push({
                pathname: '/auth/login',
                params: { returnTo: '/(tabs)/messages' }
              } as any);
            }}
          />
        ) : (
          <>
            <CategoryArea
              unreadCounts={logic.state.categoryUnreadCounts}
              onCategoryPress={logic.handleCategoryPress}
            />
            
            <ConversationArea
              conversations={logic.state.conversations}
              loading={logic.state.loading}
              onConversationPress={logic.handleConversationPress}
              onDelete={logic.handleConversationDelete}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  // 登录提示内容区域样式（在ScrollView内，不占据整个页面）
  promptContentContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#FFFFFF',
  },
  promptIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  promptMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
// #endregion

// #region 9. Exports
export default MainPage;
// #endregion
