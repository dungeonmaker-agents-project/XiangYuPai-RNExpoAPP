/**
 * OrderConfirmPage - 订单确认页面
 *
 * 功能：展示订单确认信息，支持数量选择和支付
 * 导航流程：ServiceDetailPage → OrderConfirmPage → PaymentSuccess
 *
 * 组件结构：
 * - ProviderInfoCard: 陪玩师信息卡片
 * - ServiceInfoCard: 服务信息卡片
 * - QuantitySelector: 数量选择器
 * - PriceSubtotal: 价格小计
 * - BottomActionBar: 底部操作栏
 * - PaymentModal: 支付弹窗
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  OrderConfirmPageProps,
  OrderConfirmPreviewResponse,
  PriceInfo,
  PricePreview,
  ProviderInfo,
  ServiceInfo,
} from '../types';
import { COLORS, SIZES, TEXT } from '../constants';
import { orderConfirmApi } from '../api/orderApi';
import { ANIMATION_CONFIG, LAYOUT, PAGE_TEXT } from './constants';
import type {
  BottomActionBarProps,
  PageLoadingState,
  PaymentModalInternalProps,
  PriceSubtotalProps,
  ProviderInfoCardProps,
  QuantitySelectorProps,
  ServiceInfoCardProps,
} from './types';

// #region 子组件 - ProviderInfoCard
/**
 * 陪玩师信息卡片
 * 展示陪玩师头像、昵称、标签、技能等级信息
 */
const ProviderInfoCard: React.FC<ProviderInfoCardProps> = memo(({
  nickname,
  avatar,
  gender,
  isOnline,
  isVerified,
  tags,
  skillInfo,
}) => (
  <View style={styles.providerCard}>
    <View style={styles.providerHeader}>
      <Image source={{ uri: avatar }} style={styles.providerAvatar} />
      <View style={styles.providerInfo}>
        <View style={styles.providerNameRow}>
          <Text style={styles.providerNickname} numberOfLines={1}>{nickname}</Text>
          {isOnline && <View style={styles.onlineDot} />}
        </View>
        {tags && tags.length > 0 && (
          <View style={styles.providerTagsRow}>
            {isVerified && (
              <View style={[styles.providerTag, styles.verifiedTag]}>
                <Text style={styles.verifiedTagText}>{PAGE_TEXT.VERIFIED_TAG}</Text>
              </View>
            )}
            {tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.providerTag}>
                <Text style={styles.providerTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
    {skillInfo && (skillInfo.gameArea || skillInfo.rankDisplay) && (
      <View style={styles.skillInfoRow}>
        {skillInfo.gameArea && (
          <View style={styles.skillItem}>
            <Text style={styles.skillLabel}>{PAGE_TEXT.LABEL_GAME_AREA}</Text>
            <Text style={styles.skillValue}>{skillInfo.gameArea}</Text>
          </View>
        )}
        {skillInfo.rankDisplay && (
          <View style={styles.skillItem}>
            <Text style={styles.skillLabel}>{PAGE_TEXT.LABEL_RANK}</Text>
            <Text style={styles.skillValue}>{skillInfo.rankDisplay}</Text>
          </View>
        )}
      </View>
    )}
  </View>
));
ProviderInfoCard.displayName = 'ProviderInfoCard';
// #endregion

// #region 子组件 - ServiceInfoCard
/**
 * 服务信息卡片
 * 展示服务名称和单价
 */
const ServiceInfoCard: React.FC<ServiceInfoCardProps> = memo(({
  serviceName,
  displayText,
}) => (
  <View style={styles.serviceCard}>
    <View style={styles.serviceRow}>
      <Text style={styles.serviceLabel}>{TEXT.SERVICE_LABEL}</Text>
      <Text style={styles.serviceName}>{serviceName}</Text>
    </View>
    <View style={styles.divider} />
    <View style={styles.serviceRow}>
      <Text style={styles.serviceLabel}>{PAGE_TEXT.LABEL_UNIT_PRICE}</Text>
      <Text style={styles.priceText}>{displayText}</Text>
    </View>
  </View>
));
ServiceInfoCard.displayName = 'ServiceInfoCard';
// #endregion

// #region 子组件 - QuantitySelector
/**
 * 数量选择器
 * 支持增减数量操作
 */
const QuantitySelector: React.FC<QuantitySelectorProps> = memo(({
  value,
  min,
  max,
  unit,
  onValueChange,
}) => {
  const canDecrease = value > min;
  const canIncrease = value < max;

  const handleDecrease = useCallback(() => {
    if (canDecrease) onValueChange(value - 1);
  }, [canDecrease, value, onValueChange]);

  const handleIncrease = useCallback(() => {
    if (canIncrease) onValueChange(value + 1);
  }, [canIncrease, value, onValueChange]);

  return (
    <View style={styles.quantityCard}>
      <Text style={styles.quantityLabel}>{TEXT.QUANTITY_LABEL}</Text>
      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={[styles.quantityButton, !canDecrease && styles.quantityButtonDisabled]}
          onPress={handleDecrease}
          disabled={!canDecrease}
          activeOpacity={0.7}
        >
          <Text style={[styles.quantityButtonText, !canDecrease && styles.quantityButtonTextDisabled]}>-</Text>
        </TouchableOpacity>
        <View style={styles.quantityValueContainer}>
          <Text style={styles.quantityValue}>{value}</Text>
          <Text style={styles.quantityUnit}>{unit}</Text>
        </View>
        <TouchableOpacity
          style={[styles.quantityButton, !canIncrease && styles.quantityButtonDisabled]}
          onPress={handleIncrease}
          disabled={!canIncrease}
          activeOpacity={0.7}
        >
          <Text style={[styles.quantityButtonText, !canIncrease && styles.quantityButtonTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
QuantitySelector.displayName = 'QuantitySelector';
// #endregion

// #region 子组件 - PriceSubtotal
/**
 * 价格小计
 * 显示数量x单价=小计
 */
const PriceSubtotal: React.FC<PriceSubtotalProps> = memo(({
  quantity,
  unitPrice,
  total,
  unit,
}) => (
  <View style={styles.subtotalCard}>
    <View style={styles.subtotalRow}>
      <Text style={styles.subtotalLabel}>{PAGE_TEXT.LABEL_SUBTOTAL}</Text>
      <View style={styles.subtotalRight}>
        <Text style={styles.subtotalCalc}>{quantity}{unit} x {unitPrice}{TEXT.BALANCE_UNIT}</Text>
        <Text style={styles.subtotalAmount}>{total} {TEXT.BALANCE_UNIT}</Text>
      </View>
    </View>
  </View>
));
PriceSubtotal.displayName = 'PriceSubtotal';
// #endregion

// #region 子组件 - BottomActionBar
/**
 * 底部操作栏
 * 显示余额和确认支付按钮
 */
const BottomActionBar: React.FC<BottomActionBarProps> = memo(({
  balance,
  totalAmount,
  isLoading,
  isBalanceSufficient,
  onConfirmPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>{TEXT.BALANCE_LABEL}</Text>
        <Text style={styles.balanceValue}>{balance} {TEXT.BALANCE_UNIT}</Text>
      </View>
      <TouchableOpacity
        style={styles.confirmButtonWrapper}
        onPress={onConfirmPress}
        disabled={isLoading || !isBalanceSufficient}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={isBalanceSufficient ? [COLORS.GRADIENT_START, COLORS.GRADIENT_END] : [COLORS.DIVIDER, COLORS.DIVIDER]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.confirmButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.BACKGROUND} />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>{TEXT.BTN_CONFIRM}</Text>
              <Text style={styles.confirmButtonAmount}>{totalAmount} {TEXT.BALANCE_UNIT}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});
BottomActionBar.displayName = 'BottomActionBar';
// #endregion

// #region 子组件 - PaymentModal
/**
 * 支付密码弹窗
 * 输入6位支付密码完成支付
 */
const PaymentModal: React.FC<PaymentModalInternalProps> = memo(({
  visible,
  amount,
  balance,
  onClose,
  onPasswordSubmit,
  isSubmitting,
  errorMessage,
}) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [password, setPassword] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setPassword('');
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: ANIMATION_CONFIG.MODAL_SPRING_TENSION,
        friction: ANIMATION_CONFIG.MODAL_SPRING_FRICTION,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_CONFIG.MODAL_HIDE_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const handlePasswordChange = useCallback((text: string) => {
    const filtered = text.replace(/[^0-9]/g, '').slice(0, 6);
    setPassword(filtered);
    if (filtered.length === 6) {
      onPasswordSubmit(filtered);
    }
  }, [onPasswordSubmit]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY }], paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{TEXT.PAYMENT_TITLE}</Text>
                <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>x</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalAmountSection}>
                <Text style={styles.modalAmountLabel}>支付金额</Text>
                <Text style={styles.modalAmount}>{amount} {TEXT.BALANCE_UNIT}</Text>
              </View>
              <View style={styles.modalBalanceRow}>
                <Text style={styles.modalBalanceLabel}>可用余额: </Text>
                <Text style={styles.modalBalanceValue}>{balance} {TEXT.BALANCE_UNIT}</Text>
              </View>
              <View style={styles.passwordSection}>
                <Text style={styles.passwordLabel}>{TEXT.PASSWORD_TITLE}</Text>
                <View style={styles.passwordDotsContainer}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <View key={index} style={styles.passwordDotBox}>
                      {password.length > index && <View style={styles.passwordDotFilled} />}
                    </View>
                  ))}
                </View>
                <TextInput
                  style={styles.hiddenInput}
                  value={password}
                  onChangeText={handlePasswordChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  autoFocus
                  editable={!isSubmitting}
                />
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
              </View>
              {isSubmitting && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                  <Text style={styles.loadingText}>{TEXT.LOADING}</Text>
                </View>
              )}
              <TouchableOpacity onPress={onClose} style={styles.forgotPasswordLink}>
                <Text style={styles.forgotPasswordText}>{TEXT.PASSWORD_FORGOT}</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});
PaymentModal.displayName = 'PaymentModal';
// #endregion

// #region 主页面组件
/**
 * OrderConfirmPage - 订单确认页主组件
 *
 * 调用场景：从服务详情页点击下单进入
 * 核心逻辑：加载订单预览数据，支持数量调整，发起支付
 *
 * 内部状态：
 * - pageState: 页面加载状态
 * - previewData: 订单预览数据
 * - quantity: 当前选择数量
 * - pricePreview: 价格预览
 * - showPaymentModal: 支付弹窗显示状态
 * - paymentError: 支付错误信息
 *
 * 外部依赖：
 * - orderConfirmApi: 订单API服务
 * - expo-router: 路由导航
 * - expo-linear-gradient: 渐变按钮
 */
const OrderConfirmPage: React.FC<OrderConfirmPageProps> = memo((props) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 从路由参数获取 serviceId
  const params = useLocalSearchParams<{ serviceId: string }>();
  const serviceId = props.serviceId || Number(params.serviceId) || 0;

  // 页面状态
  const [pageState, setPageState] = useState<PageLoadingState>({
    isLoading: true,
    isRefreshing: false,
    isSubmitting: false,
    errorMessage: null,
  });

  // 数据状态
  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const [service, setService] = useState<ServiceInfo | null>(null);
  const [price, setPrice] = useState<PriceInfo | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [quantityOptions, setQuantityOptions] = useState({ min: 1, max: 99 });
  const [pricePreview, setPricePreview] = useState<PricePreview>({ quantity: 1, subtotal: 0, total: 0 });
  const [userBalance, setUserBalance] = useState(0);
  const [hasPaymentPassword, setHasPaymentPassword] = useState(true);

  // 弹窗状态
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentError, setPaymentError] = useState<string | undefined>();

  // #region 数据加载
  /**
   * 加载订单确认预览数据
   * 调用 orderConfirmApi.getOrderConfirmPreview 获取陪玩师/服务/价格信息
   */
  const loadPreviewData = useCallback(async (isRefresh = false) => {
    if (!serviceId) return;

    setPageState((prev) => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      errorMessage: null,
    }));

    try {
      const response = await orderConfirmApi.getOrderConfirmPreview(serviceId, 1);
      const { data } = response;

      setProvider(data.provider);
      setService(data.service);
      setPrice(data.price);
      setQuantity(data.quantityOptions.defaultValue);
      setQuantityOptions({ min: data.quantityOptions.min, max: data.quantityOptions.max });
      setPricePreview(data.preview);
      setUserBalance(data.userBalance);
      setHasPaymentPassword(data.hasPaymentPassword);
    } catch (error) {
      setPageState((prev) => ({
        ...prev,
        errorMessage: TEXT.ERROR_NETWORK,
      }));
    } finally {
      setPageState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
      }));
    }
  }, [serviceId]);

  useEffect(() => {
    loadPreviewData();
  }, [loadPreviewData]);
  // #endregion

  // #region 数量变更
  /**
   * 处理数量变更
   * 更新本地数量状态并重新计算价格
   */
  const handleQuantityChange = useCallback(async (newQuantity: number) => {
    if (!price) return;

    setQuantity(newQuantity);
    const newTotal = price.unitPrice * newQuantity;
    setPricePreview({
      quantity: newQuantity,
      subtotal: newTotal,
      total: newTotal,
    });
  }, [price]);
  // #endregion

  // #region 支付流程
  /**
   * 点击确认支付按钮
   * 检查余额是否足够，打开支付弹窗
   */
  const handleConfirmPress = useCallback(() => {
    if (pricePreview.total > userBalance) {
      setPageState((prev) => ({
        ...prev,
        errorMessage: TEXT.ERROR_BALANCE,
      }));
      return;
    }
    setPaymentError(undefined);
    setShowPaymentModal(true);
  }, [pricePreview.total, userBalance]);

  /**
   * 提交支付密码
   * 调用 orderConfirmApi.submitOrderWithPayment 提交订单
   */
  const handlePasswordSubmit = useCallback(async (password: string) => {
    if (!service) return;

    setPageState((prev) => ({ ...prev, isSubmitting: true }));
    setPaymentError(undefined);

    try {
      const response = await orderConfirmApi.submitOrderWithPayment({
        serviceId: service.serviceId,
        quantity,
        totalAmount: pricePreview.total,
        paymentPassword: password,
      });

      if (response.data.success) {
        setShowPaymentModal(false);
        router.replace({
          pathname: '/order/payment-success' as any,
          params: {
            orderNo: response.data.orderNo,
            amount: response.data.amount,
            remainingBalance: response.data.remainingBalance,
          },
        });
      } else {
        setPaymentError(response.data.errorMessage || TEXT.ERROR_PASSWORD);
      }
    } catch (error) {
      setPaymentError(TEXT.ERROR_NETWORK);
    } finally {
      setPageState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [service, quantity, pricePreview.total, router]);

  /** 关闭支付弹窗 */
  const handleClosePaymentModal = useCallback(() => {
    if (!pageState.isSubmitting) {
      setShowPaymentModal(false);
      setPaymentError(undefined);
    }
  }, [pageState.isSubmitting]);

  /** 返回上一页 */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /** 下拉刷新 */
  const handleRefresh = useCallback(() => {
    loadPreviewData(true);
  }, [loadPreviewData]);
  // #endregion

  // 计算余额是否充足
  const isBalanceSufficient = userBalance >= pricePreview.total;

  // #region 渲染 - 加载状态
  if (pageState.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{TEXT.PAGE_TITLE}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }
  // #endregion

  // #region 渲染 - 错误状态
  if (pageState.errorMessage && !provider) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{TEXT.PAGE_TITLE}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{pageState.errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadPreviewData()}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  // #endregion

  // #region 渲染 - 正常内容
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />

      {/* 导航栏 */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{TEXT.PAGE_TITLE}</Text>
        <View style={styles.backButton} />
      </View>

      {/* 可滚动内容区 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: LAYOUT.BOTTOM_BAR_HEIGHT + insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={pageState.isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.PRIMARY}
            colors={[COLORS.PRIMARY]}
          />
        }
      >
        {/* 陪玩师信息卡片 */}
        {provider && (
          <ProviderInfoCard
            nickname={provider.nickname}
            avatar={provider.avatar}
            gender={provider.gender}
            isOnline={provider.isOnline}
            isVerified={provider.isVerified}
            tags={provider.tags}
            skillInfo={provider.skillInfo}
          />
        )}

        {/* 服务信息卡片 */}
        {service && price && (
          <ServiceInfoCard
            serviceName={service.name}
            unitPrice={price.unitPrice}
            unit={price.unit}
            displayText={price.displayText}
          />
        )}

        {/* 数量选择器 */}
        {price && (
          <QuantitySelector
            value={quantity}
            min={quantityOptions.min}
            max={quantityOptions.max}
            unit={price.unit}
            onValueChange={handleQuantityChange}
          />
        )}

        {/* 价格小计 */}
        {price && (
          <PriceSubtotal
            quantity={quantity}
            unitPrice={price.unitPrice}
            total={pricePreview.total}
            unit={price.unit}
          />
        )}

        {/* 余额不足提示 */}
        {!isBalanceSufficient && (
          <View style={styles.insufficientBalanceHint}>
            <Text style={styles.insufficientBalanceText}>{TEXT.ERROR_BALANCE}，请先充值</Text>
            <TouchableOpacity>
              <Text style={styles.rechargeLink}>{TEXT.BTN_RECHARGE}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <BottomActionBar
        balance={userBalance}
        totalAmount={pricePreview.total}
        isLoading={pageState.isSubmitting}
        isBalanceSufficient={isBalanceSufficient}
        onConfirmPress={handleConfirmPress}
      />

      {/* 支付弹窗 */}
      <PaymentModal
        visible={showPaymentModal}
        amount={pricePreview.total}
        balance={userBalance}
        onClose={handleClosePaymentModal}
        onPasswordSubmit={handlePasswordSubmit}
        isSubmitting={pageState.isSubmitting}
        errorMessage={paymentError}
      />
    </SafeAreaView>
  );
  // #endregion
});

OrderConfirmPage.displayName = 'OrderConfirmPage';
// #endregion

// #region Styles
const styles = StyleSheet.create({
  // 容器
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.CONTENT_PADDING,
    gap: LAYOUT.SECTION_GAP,
  },

  // 导航栏
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: SIZES.PADDING_H,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  navTitle: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
  },

  // 加载状态
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 错误状态
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: SIZES.GAP_LG,
  },
  errorText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.ERROR,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: SIZES.BUTTON_RADIUS,
  },
  retryButtonText: {
    fontSize: SIZES.FONT_MD,
    fontWeight: '600',
    color: COLORS.BACKGROUND,
  },

  // 陪玩师卡片
  providerCard: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: LAYOUT.CARD_BORDER_RADIUS,
    padding: SIZES.PADDING_H,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: LAYOUT.AVATAR_SIZE,
    height: LAYOUT.AVATAR_SIZE,
    borderRadius: LAYOUT.AVATAR_SIZE / 2,
    backgroundColor: COLORS.DIVIDER,
  },
  providerInfo: {
    flex: 1,
    marginLeft: SIZES.GAP_MD,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.GAP_SM,
  },
  providerNickname: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.SUCCESS,
  },
  providerTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.GAP_SM,
    marginTop: SIZES.GAP_SM,
  },
  providerTag: {
    height: LAYOUT.TAG_HEIGHT,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center',
  },
  providerTagText: {
    fontSize: SIZES.FONT_XS,
    color: COLORS.PRIMARY,
  },
  verifiedTag: {
    backgroundColor: '#E6F7FF',
  },
  verifiedTagText: {
    fontSize: SIZES.FONT_XS,
    color: '#1890FF',
  },
  skillInfoRow: {
    flexDirection: 'row',
    marginTop: SIZES.GAP_MD,
    paddingTop: SIZES.GAP_MD,
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
    gap: SIZES.GAP_LG * 2,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.GAP_SM,
  },
  skillLabel: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_PLACEHOLDER,
  },
  skillValue: {
    fontSize: SIZES.FONT_SM,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },

  // 服务卡片
  serviceCard: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: LAYOUT.CARD_BORDER_RADIUS,
    padding: SIZES.PADDING_H,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.GAP_SM,
  },
  serviceLabel: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
  },
  serviceName: {
    fontSize: SIZES.FONT_MD,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  priceText: {
    fontSize: SIZES.FONT_MD,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.DIVIDER,
  },

  // 数量选择器
  quantityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: LAYOUT.CARD_BORDER_RADIUS,
    padding: SIZES.PADDING_H,
  },
  quantityLabel: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.GAP_MD,
  },
  quantityButton: {
    width: LAYOUT.QUANTITY_BUTTON_SIZE,
    height: LAYOUT.QUANTITY_BUTTON_SIZE,
    borderRadius: LAYOUT.QUANTITY_BUTTON_SIZE / 2,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.DIVIDER,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.BACKGROUND,
  },
  quantityButtonTextDisabled: {
    color: COLORS.TEXT_PLACEHOLDER,
  },
  quantityValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 50,
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: SIZES.FONT_XL,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  quantityUnit: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },

  // 小计
  subtotalCard: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: LAYOUT.CARD_BORDER_RADIUS,
    padding: SIZES.PADDING_H,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
  },
  subtotalRight: {
    alignItems: 'flex-end',
  },
  subtotalCalc: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_PLACEHOLDER,
    marginBottom: 4,
  },
  subtotalAmount: {
    fontSize: SIZES.FONT_XL,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },

  // 余额不足提示
  insufficientBalanceHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.GAP_SM,
    paddingVertical: SIZES.GAP_MD,
  },
  insufficientBalanceText: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.ERROR,
  },
  rechargeLink: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },

  // 底部操作栏
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.PADDING_H,
    paddingTop: SIZES.PADDING_V,
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
  },
  balanceSection: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_PLACEHOLDER,
  },
  balanceValue: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 2,
  },
  confirmButtonWrapper: {
    flex: 1,
    marginLeft: SIZES.GAP_MD,
  },
  confirmButtonGradient: {
    height: SIZES.BUTTON_HEIGHT,
    borderRadius: SIZES.BUTTON_RADIUS,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.GAP_SM,
  },
  confirmButtonText: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.BACKGROUND,
  },
  confirmButtonAmount: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.BACKGROUND,
    opacity: 0.9,
  },

  // 支付弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SIZES.PADDING_H,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  modalTitle: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
  },
  modalCloseText: {
    fontSize: 24,
    color: COLORS.TEXT_PLACEHOLDER,
  },
  modalAmountSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  modalAmountLabel: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_PLACEHOLDER,
    marginBottom: 8,
  },
  modalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  modalBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalBalanceLabel: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_PLACEHOLDER,
  },
  modalBalanceValue: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  passwordSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordLabel: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
  },
  passwordDotsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  passwordDotBox: {
    width: SIZES.PASSWORD_BOX_SIZE,
    height: SIZES.PASSWORD_BOX_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
    backgroundColor: COLORS.BACKGROUND_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordDotFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.TEXT_PRIMARY,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.GAP_MD,
  },
  loadingText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
  },
  forgotPasswordLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  forgotPasswordText: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_PLACEHOLDER,
  },
});
// #endregion

export default OrderConfirmPage;
