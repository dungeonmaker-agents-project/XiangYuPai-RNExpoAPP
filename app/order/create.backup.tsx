/**
 * Order Create Screen - 创建订单页面
 * 
 * Route: /order/create
 * 
 * Features:
 * - 显示技能信�?
 * - 选择购买数量
 * - 预约时间
 * - 立即支付
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
  const { skillId, userId } = useLocalSearchParams<{ skillId: string; userId?: string }>();
  
  const [quantity, setQuantity] = useState(1);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payPwd, setPayPwd] = useState('');
  const [paying, setPaying] = useState(false);
  
  // 模拟数据
  const orderData = {
    coverImage: 'https://picsum.photos/100',
    userName: '昵称123',
    gender: 2,
    tags: ['实名认证', '大神', '微信', '荣耀王者', '巅峰1800+'],
    skillName: '王者荣耀',
    price: 10,
    unit: '局',
    availableTime: '1小时30分钟',
  };
  
  const totalPrice = orderData.price * quantity;
  const canSubmit = useMemo(() => quantity > 0 && !paying, [quantity, paying]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };
  
  const handlePay = () => {
    console.log('立即支付', { skillId, quantity, totalPrice });
    setShowPayModal(true);
  };

  const handleConfirmPay = async () => {
    if (payPwd.length !== 6) {
      Alert.alert('提示', '请输?位支付密?');
      return;
    }
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      if (payPwd === '666666') {
        setShowPayModal(false);
        setPayPwd('');
        const orderId = `ORD${Date.now()}`;
        router.replace({ pathname: '/profile/order-detail', params: { orderId } });
      } else {
        Alert.alert('支付失败', '支付密码错误，请重试');
      }
    } finally {
      setPaying(false);
    }
  };

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
            <Image source={{ uri: orderData.coverImage }} style={styles.coverImage} />
            
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{orderData.userName}</Text>
                <Text style={[styles.genderIcon, orderData.gender === 1 ? styles.male : styles.female]}>
                  {orderData.gender === 1 ? '女' : '男'}
                </Text>
              </View>
              
              <View style={styles.userTags}>
                {orderData.tags.map((tag, index) => (
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
              <Text style={styles.orderValue}>{orderData.skillName}</Text>
            </View>

            {/* 价格 */}
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>价格</Text>
              <Text style={styles.orderValue}>{orderData.price}金币/{orderData.unit}</Text>
            </View>

            {/* 场次 */}
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>场次</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={handleDecrease}
                  disabled={quantity <= 1}
                >
                  <Ionicons 
                    name="remove-circle-outline" 
                    size={24} 
                    color={quantity <= 1 ? '#CCCCCC' : '#D946EF'} 
                  />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{quantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={handleIncrease}
                >
                  <Ionicons name="add-circle" size={24} color="#D946EF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 预约时间 */}
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>预约</Text>
              <Text style={styles.orderValue}>{orderData.availableTime}</Text>
            </View>
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
          <TouchableOpacity style={[styles.payButton, !canSubmit && styles.buttonDisabled]} onPress={handlePay} disabled={!canSubmit}>
            <Text style={styles.payButtonText}>立即支付</Text>
          </TouchableOpacity>
        </View>

        {/* 支付密码弹窗 */}
        <Modal visible={showPayModal} transparent animationType="fade" onRequestClose={() => setShowPayModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>请输入支付密码?</Text>
              <Text style={styles.modalSubtitle}>用于确认本次支付</Text>
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
                <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => { setShowPayModal(false); setPayPwd(''); }} disabled={paying}>
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalConfirm]} onPress={handleConfirmPay} disabled={paying}>
                  <Text style={styles.modalConfirmText}>{paying ? '处理�?..' : '确认支付'}</Text>
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

