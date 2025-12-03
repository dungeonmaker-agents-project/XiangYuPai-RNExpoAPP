// #region 1. File Banner & TOC
/**
 * CategoryArea - 4宫格消息分类区域
 * 
 * 功能：展示赞和收藏、评论、粉丝、系统通知四个分类入口
 */
// #endregion

// #region 2. Imports
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MESSAGE_CATEGORIES } from '../../constants';
// #endregion

// #region 3. Types & Schema
interface CategoryAreaProps {
  unreadCounts: Record<string, number>;
  onCategoryPress: (type: string) => void;
}

interface CategoryConfig {
  id: string;
  title: string;
  icon: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  backgroundColor: string;
}
// #endregion

// #region 4. Constants & Config
const COLORS = {
  background: '#FFFFFF',
  text: '#1F2937',
  badge: '#EF4444',
  badgeText: '#FFFFFF',
};

// 分类图标和颜色配置
const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  likes: {
    id: 'likes',
    title: '赞和收藏',
    icon: 'heart',
    iconName: 'heart',
    color: '#EF4444', // 红色
    backgroundColor: '#FEE2E2',
  },
  comments: {
    id: 'comments',
    title: '评论',
    icon: 'comment',
    iconName: 'comment-text',
    color: '#3B82F6', // 蓝色
    backgroundColor: '#DBEAFE',
  },
  followers: {
    id: 'followers',
    title: '粉丝',
    icon: 'user-plus',
    iconName: 'account-plus',
    color: '#F59E0B', // 橙色
    backgroundColor: '#FEF3C7',
  },
  notifications: {
    id: 'notifications',
    title: '系统通知',
    icon: 'bell',
    iconName: 'bell',
    color: '#8B5CF6', // 紫色
    backgroundColor: '#EDE9FE',
  },
};
// #endregion

// #region 5. Utils & Helpers
// #endregion

// #region 6. State Management
// #endregion

// #region 7. Domain Logic
// #endregion

// #region 8. UI Components & Rendering
const CategoryCard: React.FC<{
  categoryId: string;
  title: string;
  count: number;
  onPress: () => void;
}> = ({ categoryId, title, count, onPress }) => {
  const config = CATEGORY_CONFIGS[categoryId];
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* 图标容器 */}
      <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
        <MaterialCommunityIcons
          name={config.iconName}
          size={28}
          color={config.color}
        />
      </View>
      
      {/* 标题 */}
      <Text style={styles.cardTitle}>{title}</Text>
      
      {/* 未读角标 */}
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const CategoryArea: React.FC<CategoryAreaProps> = ({ unreadCounts, onCategoryPress }) => {
  return (
    <View style={styles.container}>
      {MESSAGE_CATEGORIES.map((category) => (
        <CategoryCard
          key={category.id}
          categoryId={category.id}
          title={category.title}
          count={unreadCounts[category.id] || 0}
          onPress={() => onCategoryPress(category.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  card: {
    flex: 1,
    maxWidth: '23%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // 阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.badge,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.badgeText,
    fontSize: 10,
    fontWeight: '600',
  },
});
// #endregion

// #region 9. Exports
export default React.memo(CategoryArea);
export { CategoryArea };
// #endregion
