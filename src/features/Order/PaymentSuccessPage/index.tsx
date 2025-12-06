/**
 * PaymentSuccessPage - 支付成功页面
 *
 * 调用场景: 订单支付成功后跳转展示
 * 核心逻辑: 展示支付结果信息，提供查看订单和返回首页入口
 * 外部依赖: expo-router, expo-linear-gradient, @expo/vector-icons
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { PaymentSuccessPageProps } from '../types';
import { COLORS, SIZES, TEXT } from '../constants';
import type { InfoRowProps, PaymentSuccessRouteParams } from './types';

// ========== 子组件 ==========

/**
 * InfoRow - 信息行组件
 * 展示标签和值的水平布局
 */
const InfoRow: React.FC<InfoRowProps> = ({ label, value, isAmount }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, isAmount && styles.infoValueAmount]}>{value}</Text>
  </View>
);

// ========== 主组件 ==========

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<PaymentSuccessRouteParams>();

  // 解析路由参数
  const orderNo = params.orderNo || '';
  const amount = parseFloat(params.amount || '0');
  const remainingBalance = parseFloat(params.remainingBalance || '0');

  // 禁用返回手势和物理返回键
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  /** 跳转到订单列表页 */
  const handleViewOrderPress = () => {
    router.replace('/profile/my-orders');
  };

  /** 返回首页 */
  const handleBackHomePress = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />

      <View style={styles.content}>
        {/* 成功图标区域 */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={48} color={COLORS.BACKGROUND} />
          </View>
        </View>

        {/* 标题文本 */}
        <Text style={styles.titleText}>{TEXT.SUCCESS_TITLE}</Text>
        <Text style={styles.descText}>{TEXT.SUCCESS_DESC}</Text>

        {/* 订单信息卡片 */}
        <View style={styles.infoCard}>
          <InfoRow label="支付金额" value={`${amount.toFixed(2)} ${TEXT.BALANCE_UNIT}`} isAmount />
          <View style={styles.divider} />
          <InfoRow label="订单编号" value={orderNo} />
          <View style={styles.divider} />
          <InfoRow label="剩余余额" value={`${remainingBalance.toFixed(2)} ${TEXT.BALANCE_UNIT}`} />
        </View>

        {/* 底部按钮区域 */}
        <View style={styles.buttonArea}>
          {/* 主按钮 - 查看订单 */}
          <TouchableOpacity onPress={handleViewOrderPress} activeOpacity={0.85}>
            <LinearGradient
              colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>{TEXT.SUCCESS_VIEW_ORDER}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 次按钮 - 返回首页 */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackHomePress}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>{TEXT.SUCCESS_BACK_HOME}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ========== 样式定义 ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.PADDING_H * 1.5,
    alignItems: 'center',
    paddingTop: 60,
  },
  // 图标区域
  iconWrapper: {
    marginBottom: SIZES.GAP_LG * 1.5,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 标题文本
  titleText: {
    fontSize: SIZES.FONT_XXL,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SIZES.GAP_SM,
  },
  descText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SIZES.GAP_LG * 2,
  },
  // 信息卡片
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.BACKGROUND_GRAY,
    borderRadius: SIZES.CARD_RADIUS,
    paddingVertical: SIZES.PADDING_V,
    paddingHorizontal: SIZES.PADDING_H,
    marginBottom: SIZES.GAP_LG * 2.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.GAP_MD,
  },
  infoLabel: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
  },
  infoValue: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  infoValueAmount: {
    fontSize: SIZES.FONT_LG,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.DIVIDER,
  },
  // 按钮区域
  buttonArea: {
    width: '100%',
    gap: SIZES.GAP_MD,
  },
  primaryButton: {
    width: '100%',
    height: SIZES.BUTTON_HEIGHT,
    borderRadius: SIZES.BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.BACKGROUND,
  },
  secondaryButton: {
    width: '100%',
    height: SIZES.BUTTON_HEIGHT,
    borderRadius: SIZES.BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
  },
  secondaryButtonText: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
  },
});

export default PaymentSuccessPage;
