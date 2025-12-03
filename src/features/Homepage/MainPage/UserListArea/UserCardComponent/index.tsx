/**
 * UserCardComponent - 用户卡片组件
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
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 内部模块导入
import { COLORS } from '../../constants';
import type { UserCard } from '../../types';
import { processUserData } from './processData';
import { utilsCardFormat } from './utilsFormat';
// #endregion

// #region 2. Types & Schema
interface UserCardComponentProps {
  user: UserCard;
  onPress: () => void;
}
// #endregion

// #region 3. Constants & Config
const CARD_CONFIG = {
  collapsedAspectRatio: 351 / 100,
  expandedAspectRatio: 351 / 243,
  avatarSize: 60,
  maxPhotos: 3,
} as const;
// #endregion

// #region 4. Utils & Helpers
// 工具函数已移至 ./utilsFormat.ts
// #endregion

// #region 5. State Management
// 状态管理逻辑
// #endregion

// #region 6. Domain Logic
// 业务逻辑已移至 ./processData.ts
// #endregion

// #region 7. UI Components & Rendering
/**
 * UserCardComponent 组件 - 用户卡片
 * 展示用户信息的可展开卡片
 */
export const UserCardComponent: React.FC<UserCardComponentProps> = ({ user, onPress }) => {
  const router = useRouter();
  const [showDynamics, setShowDynamics] = useState(false);

  const processedUser = processUserData(user);
  const { formatDistance, formatStatus, truncateText } = utilsCardFormat();

  // 跳转到动态详情页
  const handleFeedPress = (feedId: number) => {
    router.push({
      pathname: '/feed/[id]',
      params: { id: String(feedId) },
    });
  };

  const handleContentPress = () => {
    setShowDynamics(!showDynamics);
  };

  const renderUserInfo = () => (
    <TouchableOpacity 
      style={styles.userInfoSection}
      onPress={handleContentPress}
      activeOpacity={0.8}
    >
      {/* 用户头像 */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: processedUser.avatar }} style={styles.avatar} />
      </View>

      {/* 用户信息 */}
      <View style={styles.userDetailsContainer}>
        {/* 第一行：用户昵称 + 年龄 */}
        <View style={styles.nameRow}>
          <Text style={styles.username}>
            {truncateText(processedUser.username, 15)}
          </Text>
          <View style={styles.ageTag}>
            <Text style={styles.ageText}>♀{processedUser.age}</Text>
          </View>
        </View>

        {/* 第二行：用户简介 */}
        <Text style={styles.bio}>
          {truncateText(processedUser.bio || '这个家伙很神秘，没有填写简介', 40)}
        </Text>

        {/* 第三行：职位 + 状态信息 */}
        <View style={styles.thirdRowContainer}>
          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle}>
              {processedUser.services.length > 0 ? processedUser.services[0] : '模特'}
            </Text>
          </View>
          
          <View style={styles.rightStatusContainer}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: formatStatus(processedUser.status).color }
              ]} />
              <Text style={[
                styles.statusText, 
                { color: formatStatus(processedUser.status).color }
              ]}>
                {formatStatus(processedUser.status).text}
              </Text>
            </View>
            <Text style={styles.distanceText}>
              📍 {formatDistance(processedUser.distance)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDynamics = () => {
    if (!showDynamics) return null;

    // 检查是否有真实的动态数据
    const hasFeedsData = processedUser.feeds && processedUser.feeds.length > 0;

    // 没有动态时显示占位符
    if (!hasFeedsData) {
      return (
        <View>
          <View style={styles.divider} />
          <View style={styles.emptyDynamicsSection}>
            <Text style={styles.emptyDynamicsText}>暂无动态内容</Text>
          </View>
        </View>
      );
    }

    // 有动态时正常显示（最多3条）
    const feedsToShow = processedUser.feeds.slice(0, CARD_CONFIG.maxPhotos);

    return (
      <View>
        <View style={styles.divider} />

        <View style={styles.dynamicsSection}>
          <View style={styles.dynamicsGrid}>
            {feedsToShow.map((feed) => (
              <TouchableOpacity
                key={feed.feedId}
                style={styles.dynamicItem}
                onPress={() => handleFeedPress(feed.feedId)}
              >
                <View style={styles.dynamicImageContainer}>
                  <Image source={{ uri: feed.coverImage }} style={styles.dynamicImage} />
                  <View style={styles.dynamicStats}>
                    <Text style={styles.dynamicLikes}>❤️ {feed.likeCount}</Text>
                  </View>
                </View>

                <View style={styles.dynamicTextContainer}>
                  <Text style={styles.dynamicTitle} numberOfLines={1}>
                    {feed.content || '暂无内容'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.cardWrapper}>
      <View style={[
        styles.cardContainer,
        !showDynamics && styles.cardCollapsed,
        showDynamics && styles.cardExpanded
      ]}>
        {renderUserInfo()}
        {renderDynamics()}
      </View>
    </View>
  );
};
// #endregion

// #region 8. Styles
const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 14,
    marginVertical: 8,
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.gray50,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCollapsed: {
    width: '100%',
    overflow: 'hidden',
  },
  cardExpanded: {
    width: '100%',
    aspectRatio: CARD_CONFIG.expandedAspectRatio,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: '30%',
    position: 'relative',
    alignItems: 'flex-start',
  },
  avatar: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderColor: COLORS.white,
  },
  userDetailsContainer: {
    width: '67%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  ageTag: {
    backgroundColor: COLORS.pink,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  bio: {
    fontSize: 14,
    color: COLORS.gray500,
    lineHeight: 20,
    flex: 1,
  },
  thirdRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 14,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  rightStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginTop: 14,
    marginBottom: 14,
    marginHorizontal: 14,
  },
  dynamicsSection: {
    paddingHorizontal: 14,
  },
  emptyDynamicsSection: {
    paddingHorizontal: 14,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDynamicsText: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  dynamicsGrid: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  dynamicItem: {
    flex: 1,
    minWidth: 80,
    maxWidth: 120,
    minHeight: 120,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dynamicImageContainer: {
    width: '100%',
    minHeight: 100,
    maxHeight: 220,
    borderRadius: 8,
    position: 'relative',
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  dynamicImage: {
    width: '100%',
    minHeight: 80,
    maxHeight: 200,
    backgroundColor: COLORS.gray100,
    resizeMode: 'cover',
    flex: 1,
  },
  dynamicTextContainer: {
    width: '100%',
    paddingTop: 4,
    alignItems: 'flex-start',
  },
  dynamicTitle: {
    color: COLORS.gray500,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'left',
  },
  dynamicStats: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dynamicLikes: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '500',
  },
});
// #endregion

// #region 9. Exports
export default UserCardComponent;
// #endregion
