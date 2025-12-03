/**
 * ShareModal - 分享面板组件
 *
 * 根据 动态详情页面_结构文档.md 规范实现:
 * - 标题: "分享/转发"
 * - 5个选项: 好友(紫色) | 微信(绿色) | QQ(蓝色) | 微博(红色) | 举报(灰色)
 * - 布局: flex-row 均分, gap:20px, padding:20px 16px 40px
 * - 图标尺寸: 56x56px 圆形
 *
 * 数据模型:
 * ShareItem: { shareId, shareName, shareIcon, shareType(friend|wechat|qq|weibo|report) }
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
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
  BORDER: '#E5E5E5',
  // 分享渠道颜色
  FRIEND: '#8A2BE2',      // 好友 - 紫色
  WECHAT: '#07C160',      // 微信 - 绿色
  QQ: '#12B7F5',          // QQ - 蓝色
  WEIBO: '#E6162D',       // 微博 - 红色
  REPORT: '#999999',      // 举报 - 灰色
} as const;

// 分享选项数据模型
interface ShareItem {
  shareId: string;
  shareName: string;
  shareIcon: string;
  shareType: 'friend' | 'wechat' | 'qq' | 'weibo' | 'report';
  color: string;
}

// 分享选项配置
const SHARE_OPTIONS: ShareItem[] = [
  {
    shareId: 'friend',
    shareName: '好友',
    shareIcon: '👤',
    shareType: 'friend',
    color: COLORS.FRIEND,
  },
  {
    shareId: 'wechat',
    shareName: '微信',
    shareIcon: '💬',
    shareType: 'wechat',
    color: COLORS.WECHAT,
  },
  {
    shareId: 'qq',
    shareName: 'QQ',
    shareIcon: '🐧',
    shareType: 'qq',
    color: COLORS.QQ,
  },
  {
    shareId: 'weibo',
    shareName: '微博',
    shareIcon: '📱',
    shareType: 'weibo',
    color: COLORS.WEIBO,
  },
  {
    shareId: 'report',
    shareName: '举报',
    shareIcon: '⚠️',
    shareType: 'report',
    color: COLORS.REPORT,
  },
];

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  feedId: string;
  feedTitle?: string;
  feedContent?: string;
  onReport?: () => void;
  onShare?: (channel: 'wechat' | 'moments' | 'qq' | 'copy_link') => void;
}

export default function ShareModal({
  visible,
  onClose,
  feedId,
  feedTitle,
  feedContent,
  onReport,
  onShare,
}: ShareModalProps) {
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

  const handleShareItem = async (item: ShareItem) => {
    console.log('[ShareModal] 点击分享选项:', item.shareType, { feedId });

    switch (item.shareType) {
      case 'friend':
        // 应用内好友分享
        onShare?.('wechat');
        Alert.alert('提示', '分享给好友功能开发中...');
        onClose();
        break;

      case 'wechat':
        onShare?.('wechat');
        Alert.alert('提示', '分享到微信功能开发中...');
        onClose();
        break;

      case 'qq':
        onShare?.('qq');
        Alert.alert('提示', '分享到QQ功能开发中...');
        onClose();
        break;

      case 'weibo':
        onShare?.('moments');
        Alert.alert('提示', '分享到微博功能开发中...');
        onClose();
        break;

      case 'report':
        onClose();
        // 延迟打开举报弹窗，等分享面板关闭动画完成
        setTimeout(() => {
          onReport?.();
        }, 300);
        break;
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
            {/* 拖动指示条 */}
            <View style={styles.handleBar} />

            {/* 标题 */}
            <View style={styles.header}>
              <Text style={styles.headerIcon}>🔄</Text>
              <Text style={styles.headerTitle}>分享/转发</Text>
            </View>

            {/* 分享选项网格 */}
            <View style={styles.shareGrid}>
              {SHARE_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.shareId}
                  style={styles.shareItem}
                  onPress={() => handleShareItem(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.shareIconCircle, { backgroundColor: item.color }]}>
                    <Text style={styles.shareIcon}>{item.shareIcon}</Text>
                  </View>
                  <Text style={styles.shareName}>{item.shareName}</Text>
                </TouchableOpacity>
              ))}
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.BORDER,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 20,
  },
  shareItem: {
    alignItems: 'center',
    width: 56,
    gap: 8,
  },
  shareIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 28,
  },
  shareName: {
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
});
