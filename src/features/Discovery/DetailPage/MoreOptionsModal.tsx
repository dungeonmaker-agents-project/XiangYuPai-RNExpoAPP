/**
 * MoreOptionsModal - 更多选项弹窗组件
 *
 * 功能：
 * - 分享
 * - 收藏/取消收藏
 * - 举报
 * - 不感兴趣
 * - 保存图片
 */

import React from 'react';
import {
    Alert,
    Animated,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 颜色常量
const COLORS = {
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  CARD_BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_DANGER: '#FF4444',
  BORDER: '#E5E5E5',
  BACKGROUND: '#F5F5F5',
} as const;

interface MoreOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  isCollected: boolean;
  hasImages: boolean;
  onShare: () => void;
  onCollect: () => void;
  onReport: () => void;
  onNotInterested?: () => void;
  onSaveImages?: () => void;
}

export default function MoreOptionsModal({
  visible,
  onClose,
  isCollected,
  hasImages,
  onShare,
  onCollect,
  onReport,
  onNotInterested,
  onSaveImages,
}: MoreOptionsModalProps) {
  const [slideAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleShare = () => {
    onClose();
    setTimeout(() => onShare(), 300);
  };

  const handleCollect = () => {
    onCollect();
    onClose();
  };

  const handleReport = () => {
    onClose();
    setTimeout(() => onReport(), 300);
  };

  const handleNotInterested = () => {
    onClose();
    if (onNotInterested) {
      onNotInterested();
    } else {
      Alert.alert('提示', '已标记为不感兴趣，将减少推荐类似内容');
    }
  };

  const handleSaveImages = () => {
    onClose();
    if (onSaveImages) {
      onSaveImages();
    } else {
      Alert.alert('提示', '保存图片功能开发中...');
    }
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* 标题指示条 */}
            <View style={styles.handleBar} />

            {/* 选项列表 */}
            <View style={styles.optionsList}>
              {/* 分享 */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Text style={styles.optionIcon}>📤</Text>
                <Text style={styles.optionText}>分享</Text>
              </TouchableOpacity>

              {/* 收藏/取消收藏 */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleCollect}
                activeOpacity={0.7}
              >
                <Text style={styles.optionIcon}>{isCollected ? '⭐' : '☆'}</Text>
                <Text style={styles.optionText}>
                  {isCollected ? '取消收藏' : '收藏'}
                </Text>
              </TouchableOpacity>

              {/* 保存图片 - 只有有图片时才显示 */}
              {hasImages && (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={handleSaveImages}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>💾</Text>
                  <Text style={styles.optionText}>保存图片</Text>
                </TouchableOpacity>
              )}

              {/* 不感兴趣 */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleNotInterested}
                activeOpacity={0.7}
              >
                <Text style={styles.optionIcon}>🚫</Text>
                <Text style={styles.optionText}>不感兴趣</Text>
              </TouchableOpacity>

              {/* 举报 */}
              <TouchableOpacity
                style={[styles.optionItem, styles.optionItemDanger]}
                onPress={handleReport}
                activeOpacity={0.7}
              >
                <Text style={styles.optionIcon}>⚠️</Text>
                <Text style={[styles.optionText, styles.optionTextDanger]}>
                  举报
                </Text>
              </TouchableOpacity>
            </View>

            {/* 取消按钮 */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.BORDER,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  optionItemDanger: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  optionText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  optionTextDanger: {
    color: COLORS.TEXT_DANGER,
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
});