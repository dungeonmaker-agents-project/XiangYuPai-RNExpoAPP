/**
 * ContentListArea - L2 Component
 * Skill service list with FlatList, refresh, and pagination
 *
 * Invocation: GameSkillList page
 * Logic: Render skill cards with pull-to-refresh and infinite scroll
 */
import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { SkillServiceCard } from './SkillServiceCard';
import type { ContentListAreaProps } from './types';
import type { SkillServiceItemVO } from '../../api/types';

export function ContentListArea({
  data,
  isLoading,
  isRefreshing,
  isLoadingMore,
  hasMore,
  onRefresh,
  onLoadMore,
  onItemPress,
}: ContentListAreaProps) {
  // Render item callback
  const renderItem = useCallback(
    ({ item }: { item: SkillServiceItemVO }) => (
      <SkillServiceCard item={item} onPress={onItemPress} />
    ),
    [onItemPress]
  );

  // Key extractor
  const keyExtractor = useCallback(
    (item: SkillServiceItemVO) => `skill-${item.skillId}`,
    []
  );

  // Footer component (loading more / end of list)
  const ListFooterComponent = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#9B59B6" />
          <Text style={styles.footerText}>加载中...</Text>
        </View>
      );
    }
    if (!hasMore && data.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>已经到底啦~</Text>
        </View>
      );
    }
    return null;
  }, [isLoadingMore, hasMore, data.length]);

  // Empty component
  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#9B59B6" />
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      );
    }
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyText}>暂无符合条件的陪玩师</Text>
      </View>
    );
  }, [isLoading]);

  // Handle end reached (load more)
  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      onLoadMore();
    }
  }, [isLoadingMore, hasMore, onLoadMore]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={['#9B59B6']}
          tintColor="#9B59B6"
        />
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#999999',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
});
