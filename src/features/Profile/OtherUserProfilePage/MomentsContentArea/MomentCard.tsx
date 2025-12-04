// #region 1. File Banner & TOC
/**
 * MomentCard - 动态卡片组件
 *
 * 对应UI文档: MomentItem [L4]
 *
 * 功能：
 * - 展示动态封面、标题、点赞数
 * - 视频类型显示播放按钮
 * - 单击点赞带心形动画
 * - 点击卡片进入详情页
 *
 * TOC:
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types
 * [4] Animation Component
 * [5] Main Component
 * [6] Styles
 * [7] Export
 */
// #endregion

// #region 2. Imports

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { MomentItem } from '../types';

// #endregion

// #region 3. Types

interface MomentCardProps {
  moment: MomentItem;
  onPress: (momentId: string) => void;
  onLikePress: (momentId: string) => void;
  style?: StyleProp<ViewStyle>;
}

// #endregion

// #region 4. Animation Component

/** 心形点赞动画组件 */
const HeartAnimation: React.FC<{
  visible: boolean;
  onComplete: () => void;
}> = ({ visible, onComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // 心形放大并淡出动画
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.5,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            delay: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        scaleAnim.setValue(0);
        onComplete();
      });
    }
  }, [visible, scaleAnim, opacityAnim, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.heartAnimationContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons name="heart" size={64} color="#FF4458" />
    </Animated.View>
  );
};

// #endregion

// #region 5. Main Component

/** 格式化点赞数 */
const formatLikeCount = (count: number): string => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}w`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  onPress,
  onLikePress,
  style,
}) => {
  const [showHeartAnim, setShowHeartAnim] = React.useState(false);
  const { id, type, mediaData, textData, statsData } = moment;

  // 处理点赞点击
  const handleLikePress = useCallback(() => {
    if (!statsData.isLiked) {
      setShowHeartAnim(true);
    }
    onLikePress(id);
  }, [id, statsData.isLiked, onLikePress]);

  // 动画完成回调
  const handleAnimComplete = useCallback(() => {
    setShowHeartAnim(false);
  }, []);

  // 根据宽高比计算图片高度
  const imageHeight = mediaData.aspectRatio
    ? undefined
    : 180;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress(id)}
      activeOpacity={0.9}
    >
      {/* 封面图 */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: mediaData.coverUrl }}
          style={[
            styles.coverImage,
            mediaData.aspectRatio
              ? { aspectRatio: mediaData.aspectRatio }
              : { height: imageHeight },
          ]}
          resizeMode="cover"
        />

        {/* 视频播放按钮 */}
        {type === 'video' && (
          <View style={styles.playButtonContainer}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color="#FFFFFF" />
            </View>
            {mediaData.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {Math.floor(mediaData.duration / 60)}:
                  {String(mediaData.duration % 60).padStart(2, '0')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 点赞心形动画 */}
        <HeartAnimation
          visible={showHeartAnim}
          onComplete={handleAnimComplete}
        />
      </View>

      {/* 内容区域 */}
      <View style={styles.content}>
        {/* 标题 */}
        <Text style={styles.title} numberOfLines={2}>
          {textData.title}
        </Text>

        {/* 点赞按钮 */}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLikePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={statsData.isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={statsData.isLiked ? '#FF4458' : '#999999'}
          />
          <Text
            style={[
              styles.likeCount,
              statsData.isLiked && styles.likeCountActive,
            ]}
          >
            {formatLikeCount(statsData.likeCount)}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// #endregion

// #region 6. Styles

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  coverImage: {
    width: '100%',
    minHeight: 120,
    backgroundColor: '#F5F5F5',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4, // 让播放图标视觉居中
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  heartAnimationContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#999999',
  },
  likeCountActive: {
    color: '#FF4458',
  },
});

// #endregion

// #region 7. Export

export default MomentCard;

// #endregion
