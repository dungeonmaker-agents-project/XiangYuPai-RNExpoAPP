/**
 * Order Create Screen - 创建订单页面
 * 
 * Route: /order/create
 * 
 * Features:
 * - 显示技能信息
 * - 选择购买数量
 * - 预约时间
 * - 立即支付
 * 
 * 接口文档: XiangYuPai-Doc/Action-API/Home/技能服务下单接口文档.md
 * 对应接口:
 * - GET /api/order/preview - 订单预览
 * - POST /api/order/create - 创建订单
 * - POST /api/order/pay - 执行支付
 * - POST /api/order/pay/verify - 验证支付密码
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// API服务
import {
  type CreateOrderParams,
  type OrderPreviewResponse,
  type PayOrderParams,
  type VerifyPaymentPasswordParams,
  orderApi,
} from '../../src/features/Homepage/ServiceFlow/orderApi';

export default function OrderCreateScreen() {
  const router = useRouter();
  const { serviceId, userId } = useLocalSearchParams<{ serviceId?: string; userId?: string }>();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [orderPreview, setOrderPreview] = useState<OrderPreviewResponse['data'] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [payPwd, setPayPwd] = useState('');
  const [paying, setPaying] = useState(false);
  const [currentOrderInfo, setCurrentOrderInfo] = useState<{ orderId: string; orderNo: string; amount: number } | null>(null);
  
  // 计算总价
  const totalPrice = useMemo(() => {
    if (!orderPreview) return 0;
    return orderPreview.price.unitPrice * quantity;
  }, [orderPreview, quantity]);
  
  const canSubmit = useMemo(() => quantity > 0 && !paying && orderPreview, [quantity, paying, orderPreview]);
  
  // 加载订单预览数据
  useEffect(() => {
    if (!serviceId) {
      Alert.alert('错误', '缺少服务ID参数');
      router.back();
      return;
    }
    
    loadOrderPreview();
  }, [serviceId]);
  
  /**
   * 加载订单预览
   */
  const loadOrderPreview = async () => {
    try {
      setLoading(true);
      // TODO: 替换为真实API调用
      // const response = await orderApi.getOrderPreview({ serviceId: Number(serviceId), quantity });
      
      // 使用Mock数据
      const response = orderApi.generateMockOrderPreview(Number(serviceId || 1), quantity);
      
      setOrderPreview(response.data);
      setQuantity(response.data.quantityOptions.default);
    } catch (error) {
      console.error('加载订单预览失败:', error);
      Alert.alert('错误', '加载订单信息失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleDecrease = () => {
    if (!orderPreview) return;
    if (quantity > orderPreview.quantityOptions.min) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleIncrease = () => {
    if (!orderPreview) return;
    if (quantity < orderPreview.quantityOptions.max) {
      setQuantity(quantity + 1);
    }
  };
  
  /**
   * 提交订单
   */
  const handlePay = async () => {
    if (!orderPreview || !serviceId) return;
    
    try {
      setPaying(true);
      
      // 创建订单
      const createParams: CreateOrderParams = {
        serviceId: Number(serviceId),
        quantity,
        totalAmount: totalPrice,
      };
      
      // TODO: 替换为真实API调用
      // const createResponse = await orderApi.createOrder(createParams);
      
      // 使用Mock数据
      const createResponse = orderApi.generateMockCreateOrder(totalPrice);
      
      if (createResponse.code !== 200) {
        throw new Error(createResponse.message || '创建订单失败');
      }
      
      const { orderId, orderNo, amount, paymentInfo } = createResponse.data;
      
      // 保存订单信息
      setCurrentOrderInfo({ orderId, orderNo, amount });
      
      // 检查余额是否充足
      if (paymentInfo && !paymentInfo.sufficientBalance) {
        Alert.alert(
          '余额不足',
          `您的余额为${paymentInfo.userBalance}金币，需要支付${amount}金币。请先充值。`,
          [
            { text: '取消', style: 'cancel' },
            { text: '去充值', onPress: () => router.push('/profile/coins' as any) },
          ]
        );
        return;
      }
      
      // 显示支付弹窗
      setShowPayModal(true);
    } catch (error) {
      console.error('创建订单失败:', error);
      Alert.alert('错误', error instanceof Error ? error.message : '创建订单失败，请重试');
    } finally {
      setPaying(false);
    }
  };

  /**
   * 执行支付（首次尝试）
   */
  const handleConfirmPay = async () => {
    if (!currentOrderInfo) return;
    
    try {
      setPaying(true);
      
      // 执行支付
      const payParams: PayOrderParams = {
        orderId: currentOrderInfo.orderId,
        orderNo: currentOrderInfo.orderNo,
        paymentMethod: 'balance',
        amount: currentOrderInfo.amount,
      };
      
      // TODO: 替换为真实API调用
      // const payResponse = await orderApi.payOrder(payParams);
      
      // 使用Mock数据
      const payResponse = orderApi.generateMockPayOrder(true);
      
      if (payResponse.code !== 200) {
        throw new Error(payResponse.message || '支付失败');
      }
      
      const { paymentStatus, requirePassword, balance } = payResponse.data;
      
      // 根据支付状态处理
      if (paymentStatus === 'require_password' || requirePassword) {
        // 需要输入支付密码
        setShowPayModal(false);
        setShowPasswordModal(true);
      } else if (paymentStatus === 'success') {
        // 支付成功
        handlePaymentSuccess();
      } else if (paymentStatus === 'failed') {
        // 支付失败
        Alert.alert('支付失败', payResponse.data.failureReason || '支付失败，请重试');
      }
    } catch (error) {
      console.error('支付失败:', error);
      Alert.alert('错误', error instanceof Error ? error.message : '支付失败，请重试');
    } finally {
      setPaying(false);
    }
  };
  
  /**
   * 验证支付密码
   */
  const handleVerifyPassword = async () => {
    if (!currentOrderInfo) return;
    
    if (payPwd.length !== 6) {
      Alert.alert('提示', '请输入6位支付密码');
      return;
    }
    
    try {
      setPaying(true);
      
      // 验证支付密码
      const verifyParams: VerifyPaymentPasswordParams = {
        orderId: currentOrderInfo.orderId,
        orderNo: currentOrderInfo.orderNo,
        paymentPassword: payPwd,
      };
      
      // TODO: 替换为真实API调用
      // const verifyResponse = await orderApi.verifyPaymentPassword(verifyParams);
      
      // 使用Mock数据（模拟密码验证）
      const verifyResponse = orderApi.generateMockVerifyPaymentPassword(payPwd === '666666');
      
      if (verifyResponse.code !== 200) {
        throw new Error(verifyResponse.message || '验证失败');
      }
      
      const { paymentStatus, failureReason } = verifyResponse.data;
      
      if (paymentStatus === 'success') {
        // 支付成功
        handlePaymentSuccess();
      } else {
        // 验证失败
        setPayPwd('');
        Alert.alert('支付失败', failureReason || '支付密码错误，请重试');
      }
    } catch (error) {
      console.error('验证支付密码失败:', error);
      Alert.alert('错误', error instanceof Error ? error.message : '验证失败，请重试');
    } finally {
      setPaying(false);
    }
  };
  
  /**
   * 支付成功处理
   */
  const handlePaymentSuccess = () => {
    setShowPayModal(false);
    setShowPasswordModal(false);
    setPayPwd('');
    
    if (currentOrderInfo) {
      // 跳转到订单详情页
      router.replace({
        pathname: '/profile/order-detail',
        params: { orderId: currentOrderInfo.orderId },
      } as any);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }
  
  // 数据未加载
  if (!orderPreview) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>加载订单信息失败</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadOrderPreview}>
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }
  
  const { provider, service, price, quantityOptions } = orderPreview;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>确认订单</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 用户信息卡片 */}
          <View style={styles.userCard}>
            <Image source={{ uri: provider.avatar }} style={styles.coverImage} />
            
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{provider.nickname}</Text>
                <Text style={[styles.genderIcon, provider.gender === 'female' ? styles.female : styles.male]}>
                  {provider.gender === 'female' ? '♀' : '♂'}
                </Text>
                {provider.age && <Text style={styles.userAge}> {provider.age}岁</Text>}
              </View>
              
              <View style={styles.userTags}>
                {provider.tags.map((tag, index) => (
                  <View key={index} style={styles.userTag}>
                    <Text style={styles.userTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 订单详情 */}
          <View style={styles.orderDetails}>
            {/* 购买项目 */}
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>购买</Text>
              <Text style={styles.orderValue}>{service.name}</Text>
            </View>

            {/* 价格 */}
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>价格</Text>
              <Text style={styles.orderValue}>{price.displayText}</Text>
            </View>

            {/* 场次 */}
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>场次</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity <= quantityOptions.min && styles.quantityButtonDisabled]}
                  onPress={handleDecrease}
                  disabled={quantity <= quantityOptions.min}
                >
                  <Ionicons 
                    name="remove-circle-outline" 
                    size={24} 
                    color={quantity <= quantityOptions.min ? '#CCCCCC' : '#D946EF'} 
                  />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{quantity}</Text>
                
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity >= quantityOptions.max && styles.quantityButtonDisabled]}
                  onPress={handleIncrease}
                  disabled={quantity >= quantityOptions.max}
                >
                  <Ionicons 
                    name="add-circle" 
                    size={24} 
                    color={quantity >= quantityOptions.max ? '#CCCCCC' : '#D946EF'} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 游戏大区（可选） */}
            {provider.skillInfo.gameArea && (
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>游戏大区</Text>
                <Text style={styles.orderValue}>{provider.skillInfo.gameArea}</Text>
              </View>
            )}
            
            {/* 段位（可选） */}
            {provider.skillInfo.rankDisplay && (
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>段位</Text>
                <Text style={styles.orderValue}>{provider.skillInfo.rankDisplay}</Text>
              </View>
            )}
          </View>

          {/* 总计 */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>共计</Text>
            <Text style={styles.totalPrice}>{totalPrice}</Text>
            <Text style={styles.totalUnit}>金币</Text>
          </View>
        </ScrollView>

        {/* 底部支付按钮 */}
        <View style={styles.bottomButton}>
          <TouchableOpacity 
            style={[styles.payButton, !canSubmit && styles.buttonDisabled]} 
            onPress={handlePay} 
            disabled={!canSubmit}
          >
            <Text style={styles.payButtonText}>立即支付</Text>
          </TouchableOpacity>
        </View>

        {/* 支付确认弹窗 */}
        <Modal visible={showPayModal} transparent animationType="fade" onRequestClose={() => setShowPayModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>确认支付</Text>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentAmount}>{totalPrice} 金币</Text>
                <View style={styles.paymentMethod}>
                  <Text style={styles.paymentMethodLabel}>💰 金币支付</Text>
                  <Text style={styles.balanceInfo}>余额: {orderPreview.userBalance} 金币</Text>
                </View>
                <Text style={styles.agreementText}>我同意支付以下所示的总金额（含服务费）</Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalCancel]} 
                  onPress={() => setShowPayModal(false)} 
                  disabled={paying}
                >
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalConfirm]} 
                  onPress={handleConfirmPay} 
                  disabled={paying}
                >
                  <Text style={styles.modalConfirmText}>{paying ? '处理中...' : '立即支付'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* 支付密码弹窗 */}
        <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={() => setShowPasswordModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>请输入支付密码</Text>
              <Text style={styles.modalSubtitle}>付款 {currentOrderInfo?.amount || 0} 金币</Text>
              <TextInput
                style={styles.pwdInput}
                placeholder="******"
                placeholderTextColor="#BDBDBD"
                secureTextEntry
                keyboardType="number-pad"
                maxLength={6}
                value={payPwd}
                onChangeText={setPayPwd}
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalCancel]} 
                  onPress={() => { setShowPasswordModal(false); setPayPwd(''); }} 
                  disabled={paying}
                >
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalConfirm]} 
                  onPress={handleVerifyPassword} 
                  disabled={paying}
                >
                  <Text style={styles.modalConfirmText}>{paying ? '处理中...' : '确认支付'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  
  // 用户信息卡片
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E5E5E5',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginRight: 4,
  },
  userAge: {
    fontSize: 14,
    color: '#666666',
  },
  genderIcon: {
    fontSize: 14,
  },
  male: {
    color: '#2196F3',
  },
  female: {
    color: '#FF4081',
  },
  userTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  userTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  userTagText: {
    fontSize: 11,
    color: '#2196F3',
  },
  
  // 订单详情
  orderDetails: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderLabel: {
    fontSize: 16,
    color: '#333333',
  },
  orderValue: {
    fontSize: 16,
    color: '#666666',
  },
  
  // 数量控制
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    padding: 4,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    minWidth: 30,
    textAlign: 'center',
  },
  
  // 总计
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF4444',
  },
  totalUnit: {
    fontSize: 16,
    color: '#FF4444',
    marginLeft: 4,
  },
  
  // 底部按钮
  bottomButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  payButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  
  // 支付信息
  paymentInfo: {
    marginVertical: 20,
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF4444',
    marginBottom: 16,
  },
  paymentMethod: {
    width: '100%',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  balanceInfo: {
    fontSize: 12,
    color: '#666666',
  },
  agreementText: {
    fontSize: 12,
    color: '#8B5CF6',
    textAlign: 'center',
  },
  
  pwdInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
    color: '#111',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalCancelText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  modalConfirm: {
    backgroundColor: '#8B5CF6',
  },
  modalConfirmText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
