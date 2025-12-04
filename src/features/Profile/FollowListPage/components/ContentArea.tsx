/**
 * ContentArea 组件
 *
 * 内容区域组件，包含用户列表
 * 支持下拉刷新和上拉加载更多
 */

import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../constants';
import { ContentAreaProps, FollowUser } from '../types';
import { EmptyState } from './EmptyState';
import { UserItem } from './UserItem';

/**
 * 加载更多指示器组件
 */
const LoadMoreIndicator: React.FC<{ loading: boolean; hasMore: boolean }> = ({
  loading,
  hasMore,
}) => {
  if (!hasMore) {
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>已经到底了~</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  return null;
};

/**
 * 内容区域组件
 */
export const ContentArea: React.FC<ContentAreaProps> = ({
  users,
  activeTab,
  loading,
  refreshing,
  hasMore,
  hasSearch,
  onRefresh,
  onLoadMore,
  onUserPress,
  onFollowToggle,
}) => {
  // 渲染用户列表项
  const renderItem = ({ item }: { item: FollowUser }) => (
    <UserItem
      user={item}
      isFollowingTab={activeTab === 'following'}
      onPress={() => onUserPress(item)}
      onFollowToggle={() => onFollowToggle(item)}
    />
  );

  // 提取 key
  const keyExtractor = (item: FollowUser) => item.id;

  return (
    <FlatList
      data={users}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={
        !loading ? <EmptyState activeTab={activeTab} hasSearch={hasSearch} /> : null
      }
      ListFooterComponent={<LoadMoreIndicator loading={loading} hasMore={hasMore} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      contentContainerStyle={[styles.listContent, users.length === 0 && styles.listContentEmpty]}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textGray,
  },
});

export default ContentArea;
