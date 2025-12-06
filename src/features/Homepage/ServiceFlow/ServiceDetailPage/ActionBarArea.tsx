/**
 * ActionBarArea - 底部操作栏组件 [L2]
 *
 * 功能：展示私信和下单按钮，固定在页面底部
 * 位置：页面底部，高度68px + 安全区
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SIZES, TEXT } from './constants';
import type { ActionBarAreaProps } from './types';

/** 底部操作栏组件 */
const ActionBarArea: React.FC<ActionBarAreaProps> = memo(({
  data,
  onMessage,
  onOrder,
}) => {
  const { canMessage, canOrder } = data;
  const insets = useSafeAreaInsets();

  /** 处理私信按钮点击 - 暂显示功能开发中 */
  const handleMessagePress = useCallback(() => {
    if (onMessage) {
      onMessage();
    } else {
      Alert.alert(TEXT.FEATURE_DEVELOPING, '私信功能即将上线');
    }
  }, [onMessage]);

  /** 处理下单按钮点击 - 暂显示功能开发中 */
  const handleOrderPress = useCallback(() => {
    if (onOrder) {
      onOrder();
    } else {
      Alert.alert(TEXT.FEATURE_DEVELOPING, '下单功能即将上线');
    }
  }, [onOrder]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
      {/* 私信按钮 [L3] */}
      <TouchableOpacity
        style={[styles.messageButton, !canMessage && styles.buttonDisabled]}
        onPress={handleMessagePress}
        disabled={!canMessage}
        activeOpacity={0.8}
      >
        <Text style={styles.messageButtonText}>{TEXT.BTN_MESSAGE}</Text>
      </TouchableOpacity>

      {/* 下单按钮 [L3] */}
      <TouchableOpacity
        style={[!canOrder && styles.buttonDisabled]}
        onPress={handleOrderPress}
        disabled={!canOrder}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.orderButton}
        >
          <Text style={styles.orderButtonText}>{TEXT.BTN_ORDER}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});

ActionBarArea.displayName = 'ActionBarArea';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.PADDING_H,
    paddingTop: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
    gap: SIZES.GAP_LG,
  },
  messageButton: {
    flex: 1,
    height: SIZES.BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.BUTTON_RADIUS,
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
  messageButtonText: {
    fontSize: SIZES.FONT_MD,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  orderButton: {
    flex: 1,
    height: SIZES.BUTTON_HEIGHT,
    minWidth: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.BUTTON_RADIUS,
    paddingHorizontal: 40,
  },
  orderButtonText: {
    fontSize: SIZES.FONT_MD,
    fontWeight: '600',
    color: COLORS.BACKGROUND,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ActionBarArea;
