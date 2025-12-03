/**
 * UserListArea - 用户列表区域组件
 *
 * 支持两种数据模式：
 * 1. 用户卡片模式 (users: UserCard[]) - 展示用户信息卡片
 * 2. 动态流模式 (feedItems: FeedItemData[]) - 展示动态内容流
 *
 * TOC (快速跳转):
 * [1] Imports
 * [2] Types & Schema
 * [3] Constants & Config
 * [4] Utils & Helpers
 * [5] State Management
 * [6] Domain Logic
 * [7] UI Components & Rendering
 * [8] Exports
 */

// #region 1. Imports
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// 内部模块导入
import { COLORS } from '../constants';
import type { UserCard, FeedItem } from '../types';
import UserCardComponent from './UserCardComponent';
import FeedCardComponent from './FeedCardComponent';
import { processListData } from './processData';
import { utilsListLayout } from './utilsLayout';
// #endregion

// #region 2. Types & Schema
/**
 * FeedItemData 类型别名，保持向后兼容
 */
export type FeedItemData = FeedItem;

interface UserListAreaProps {
  /** 用户数据（旧模式，向后兼容） */
  users?: UserCard[];
  /** 动态流数据（新模式，优先使用） */
  feedItems?: FeedItem[];
  loading: boolean;
  onUserPress?: (user: UserCard) => void;
  onFeedPress?: (feed: FeedItem) => void;
  onFeedUserPress?: (userId: string) => void;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}
// #endregion

// #region 3. Constants & Config
const LIST_CONFIG = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 5,
  windowSize: 10,
  // 注意：移除 getItemLayout，因为有 ListHeaderComponent 时会导致偏移量计算错误
  // 让 FlatList 自动计算每个项目的位置
} as const;
// #endregion

// #region 4. Utils & Helpers
// 工具函数已移至 ./utilsLayout.ts
// #endregion

// #region 5. State Management
// 状态管理逻辑
// #endregion

// #region 6. Domain Logic
// 业务逻辑已移至 ./processData.ts
// #endregion

// #region 7. UI Components & Rendering
/**
 * UserListArea 组件 - 用户列表/动态流区域
 * 自动识别数据类型并渲染对应的卡片组件
 */
const UserListArea: React.FC<UserListAreaProps> = ({
  users,
  feedItems,
  loading,
  onUserPress,
  onFeedPress,
  onFeedUserPress,
  onEndReached,
  refreshing = false,
  onRefresh,
  ListHeaderComponent,
}) => {
  // 判断使用哪种数据模式：优先使用 feedItems
  const useFeedMode = feedItems && feedItems.length > 0;
  const useUserMode = !useFeedMode && users && users.length > 0;

  // 调试日志
  console.log('[UserListArea] 📊 数据状态', {
    feedItemsCount: feedItems?.length || 0,
    usersCount: users?.length || 0,
    useFeedMode,
    useUserMode,
    loading,
  });

  // 处理用户数据（仅在用户模式下使用）
  const processedUsers = useUserMode ? processListData(users || []) : [];

  // 🔥 详细调试：输出处理后的用户数据
  console.log('[UserListArea] 🔥 processedUsers', {
    count: processedUsers.length,
    firstUser: processedUsers[0] ? {
      id: processedUsers[0].id,
      username: processedUsers[0].username,
      avatar: processedUsers[0].avatar?.substring(0, 50),
    } : null,
  });

  const { getListStyle, getContentStyle } = utilsListLayout();

  // 渲染用户卡片项
  const renderUserItem = useCallback(({ item }: { item: UserCard }) => (
    <UserCardComponent
      user={item}
      onPress={() => onUserPress?.(item)}
    />
  ), [onUserPress]);

  // 渲染动态卡片项
  const renderFeedItem = useCallback(({ item }: { item: FeedItem }) => (
    <FeedCardComponent
      feed={item}
      onPress={() => onFeedPress?.(item)}
      onUserPress={() => onFeedUserPress?.(item.userInfo.id)}
    />
  ), [onFeedPress, onFeedUserPress]);

  // 渲染空状态
  const renderListEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{useFeedMode ? '暂无动态' : '暂无用户'}</Text>
      </View>
    );
  }, [loading, useFeedMode]);

  // 渲染列表底部
  const renderListFooter = useCallback(() => {
    const dataLength = useFeedMode ? (feedItems?.length || 0) : (users?.length || 0);
    if (loading && dataLength > 0) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.footerText}>加载更多...</Text>
        </View>
      );
    }
    return null;
  }, [loading, useFeedMode, feedItems?.length, users?.length]);

  // 用户列表 key 提取
  const userKeyExtractor = useCallback((item: UserCard, index: number) =>
    item.id || `user-${index}`,
  []);

  // 动态列表 key 提取
  const feedKeyExtractor = useCallback((item: FeedItem, index: number) =>
    item.id || `feed-${index}`,
  []);

  // 根据数据模式渲染对应的列表
  if (useFeedMode) {
    return (
      <View style={[styles.container, getListStyle()]}>
        <FlatList
          data={feedItems}
          keyExtractor={feedKeyExtractor}
          renderItem={renderFeedItem}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderListEmpty}
          ListFooterComponent={renderListFooter}
          contentContainerStyle={[styles.listContent, getContentStyle()]}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          onRefresh={onRefresh}
          {...LIST_CONFIG}
        />
      </View>
    );
  }

  // 用户模式（默认）
  return (
    <View style={[styles.container, getListStyle()]}>
      <FlatList
        data={processedUsers}
        keyExtractor={userKeyExtractor}
        renderItem={renderUserItem}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={[styles.listContent, getContentStyle()]}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        refreshing={refreshing}
        onRefresh={onRefresh}
        {...LIST_CONFIG}
      />
    </View>
  );
};
// #endregion

// #region 8. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray500,
    marginTop: 12,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray500,
  },
});
// #endregion

// #region 9. Exports
export default UserListArea;
export type { UserListAreaProps, FeedItemData };
export { FeedCardComponent } from './FeedCardComponent';
// #endregion
