// #region 1. File Banner & TOC
/**
 * ConversationArea - 对话列表区域
 * 
 * 功能：展示最近对话列表，支持点击进入聊天、删除对�? */
// #endregion

// #region 2. Imports
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MessageItem } from '../../SharedComponents';
import type { Conversation } from '../../types';
// #endregion

// #region 3. Types & Schema
interface ConversationAreaProps {
  conversations: Conversation[];
  loading: boolean;
  onConversationPress: (id: string) => void;
  onDelete?: (id: string) => void;
}
// #endregion

// #region 4. Constants & Config
// #endregion

// #region 5. Utils & Helpers
// #endregion

// #region 6. State Management
// #endregion

// #region 7. Domain Logic
// #endregion

// #region 8. UI Components & Rendering
const EmptyView = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>暂无消息</Text>
  </View>
);

const ConversationArea: React.FC<ConversationAreaProps> = ({
  conversations,
  loading,
  onConversationPress,
  onDelete,
}) => {
  if (loading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载�?..</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MessageItem
          id={item.id}
          type="conversation"
          avatar={item.user.avatar}
          title={item.user.nickname}
          subtitle={item.lastMessage}
          timestamp={item.timestamp}
          isRead={item.isRead}
          unreadCount={item.unreadCount}
          onPress={() => onConversationPress(item.id)}
          onDelete={onDelete ? () => onDelete(item.id) : undefined}
        />
      )}
      ListEmptyComponent={EmptyView}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
// #endregion

// #region 9. Exports
export default React.memo(ConversationArea);
export { ConversationArea };
// #endregion
