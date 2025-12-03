// #region 1. File Banner & TOC
/**
 * OrderDetailPage - 订单详情页面
 * 
 * 功能：
 * - 根据订单状态显示不同内容
 * - 待接单：显示等待接单状态、倒计时
 * - 进行中：显示服务进度、联系方式
 * - 已完成：显示评价和完成信息
 * - 已取消：显示取消原因
 * 
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] Utils & Helpers
 * [6] State Management
 * [7] Domain Logic
 * [8] UI Components & Rendering
 * [9] Exports
 */
// #endregion

// #region 2. Imports
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// 组件导入
import CompletedStatusArea from './CompletedStatusArea';
import InProgressStatusArea from './InProgressStatusArea';
import PendingStatusArea from './PendingStatusArea';

// 类型和常量
import { COLORS, ORDER_STATUS_CONFIG } from './constants';
import type { OrderDetail } from './types';

// API服务
import { orderApi, type OrderStatusParams, type CancelOrderParams } from '../../Homepage/ServiceFlow/orderApi';
// #endregion

// #region 3. Types & Schema
// (使用types.ts中的定义)
// #endregion

// #region 4. Constants & Config
// (使用constants.ts中的配置)
// #endregion

// #region 5. Utils & Helpers
/**
 * 生成模拟订单详情数据
 */
const generateMockOrderDetail = (orderId: string, statusFromList?: string): OrderDetail => {
  // 如果从列表传入了状态，使用列表的状态；否则随机生成
  const statuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'] as const;
  const status = (statusFromList as typeof statuses[number]) || statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: orderId,
    orderNo: `XYP${Date.now()}`,
    status,
    skillName: '王者荣耀',
    skillDesc: '陪玩服务 - 上分局',
    price: 15,
    quantity: 2,
    totalPrice: 30,
    customerInfo: {
      userId: 'customer-456',
      nickname: '客户昵称',
      avatar: 'https://picsum.photos/seed/customer/200',
      gender: 2,
      phone: '138****5678',
      wechat: 'customer_wechat',
    },
    appointmentTime: Date.now() + 2 * 60 * 60 * 1000, // 2小时后
    createdAt: Date.now() - 30 * 60 * 1000, // 30分钟前
    updatedAt: Date.now() - 10 * 60 * 1000,
    acceptedAt: status !== 'pending' ? Date.now() - 20 * 60 * 1000 : undefined,
    startedAt: status === 'in_progress' || status === 'completed' ? Date.now() - 10 * 60 * 1000 : undefined,
    completedAt: status === 'completed' ? Date.now() - 5 * 60 * 1000 : undefined,
    cancelledAt: status === 'cancelled' ? Date.now() - 5 * 60 * 1000 : undefined,
    cancelReason: status === 'cancelled' ? '用户主动取消' : undefined,
    rating: status === 'completed' ? 5 : undefined,
    comment: status === 'completed' ? '服务很好，技术一流！' : undefined,
    timeline: [
      {
        time: Date.now() - 30 * 60 * 1000,
        title: '订单创建',
        desc: '订单已创建，等待接单',
      },
      ...(status !== 'pending' ? [{
        time: Date.now() - 20 * 60 * 1000,
        title: '已接单',
        desc: '服务者已接单',
      }] : []),
      ...(status === 'in_progress' || status === 'completed' ? [{
        time: Date.now() - 10 * 60 * 1000,
        title: '服务开始',
        desc: '服务已开始',
      }] : []),
      ...(status === 'completed' ? [{
        time: Date.now() - 5 * 60 * 1000,
        title: '服务完成',
        desc: '服务已完成，等待评价',
      }] : []),
      ...(status === 'cancelled' ? [{
        time: Date.now() - 5 * 60 * 1000,
        title: '订单取消',
        desc: '订单已取消',
      }] : []),
    ],
  };
};

/**
 * 格式化时间
 */
const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};
// #endregion

// #region 6. State Management
/**
 * 订单详情状态管理Hook
 */
const useOrderDetailState = (orderId: string, statusFromList?: string) => {
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 加载订单详情
  useEffect(() => {
    setLoading(true);
    
    // 模拟API请求
    setTimeout(() => {
      const detail = generateMockOrderDetail(orderId, statusFromList);
      setOrderDetail(detail);
      setLoading(false);
    }, 500);
  }, [orderId, statusFromList]);
  
  return {
    orderDetail,
    loading,
  };
};
// #endregion

// #region 7. Domain Logic
/**
 * 订单详情业务逻辑Hook
 */
const useOrderDetailLogic = () => {
  const router = useRouter();
  
  /**
   * 返回上一页
   */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);
  
  /**
   * 取消订单
   */
  const handleCancelOrder = useCallback(async (orderId: string) => {
    try {
      // TODO: 替换为真实API调用
      // const response = await orderApi.cancelOrder({ orderId });
      
      // 使用Mock数据
      console.log('取消订单:', orderId);
      Alert.alert('成功', '订单已取消');
      
      // 刷新订单详情
      // 可以重新加载订单状态
    } catch (error) {
      console.error('取消订单失败:', error);
      Alert.alert('错误', error instanceof Error ? error.message : '取消订单失败，请重试');
    }
  }, []);
  
  /**
   * 联系客户
   */
  const handleContactCustomer = useCallback((userId: string) => {
    console.log('联系客户:', userId);
    // TODO: 跳转聊天页面
  }, []);
  
  /**
   * 接单
   */
  const handleAcceptOrder = useCallback((orderId: string) => {
    console.log('接单:', orderId);
    // TODO: 调用接单API
  }, []);
  
  /**
   * 拒绝订单
   */
  const handleRejectOrder = useCallback((orderId: string) => {
    console.log('拒绝订单:', orderId);
    // TODO: 调用拒绝订单API
  }, []);
  
  /**
   * 开始服务
   */
  const handleStartService = useCallback((orderId: string) => {
    console.log('开始服务:', orderId);
    // TODO: 调用开始服务API
  }, []);
  
  /**
   * 完成服务
   */
  const handleCompleteService = useCallback((orderId: string) => {
    console.log('完成服务:', orderId);
    // TODO: 调用完成服务API
  }, []);
  
  return {
    handleBack,
    handleCancelOrder,
    handleContactCustomer,
    handleAcceptOrder,
    handleRejectOrder,
    handleStartService,
    handleCompleteService,
  };
};
// #endregion

// #region 8. UI Components & Rendering

/**
 * OrderInfoCard - 订单信息卡片
 */
const OrderInfoCard: React.FC<{ order: OrderDetail }> = ({ order }) => {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  
  return (
    <View style={styles.infoCard}>
      {/* 订单状态 */}
      <View style={styles.statusSection}>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>
      
      {/* 客户信息 */}
      <View style={styles.customerSection}>
        <Image
          source={{ uri: order.customerInfo.avatar }}
          style={styles.customerAvatar}
        />
        <View style={styles.customerInfo}>
          <View style={styles.customerNameRow}>
            <Text style={styles.customerName}>{order.customerInfo.nickname}</Text>
            <Text style={[styles.genderIcon, order.customerInfo.gender === 1 ? styles.male : styles.female]}>
              {order.customerInfo.gender === 1 ? '♂' : '♀'}
            </Text>
          </View>
          <Text style={styles.skillName}>{order.skillName}</Text>
          <Text style={styles.skillDesc}>{order.skillDesc}</Text>
        </View>
      </View>
      
      {/* 订单信息 */}
      <View style={styles.orderInfoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>订单号</Text>
          <Text style={styles.infoValue}>{order.orderNo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>下单时间</Text>
          <Text style={styles.infoValue}>{formatDateTime(order.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>预约时间</Text>
          <Text style={styles.infoValue}>{formatDateTime(order.appointmentTime)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>购买数量</Text>
          <Text style={styles.infoValue}>{order.quantity} 局</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>单价</Text>
          <Text style={styles.infoValue}>{order.price} 金币</Text>
        </View>
        <View style={[styles.infoRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>合计</Text>
          <Text style={styles.totalValue}>{order.totalPrice} 金币</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * TimelineCard - 订单时间轴
 */
const TimelineCard: React.FC<{ timeline: OrderDetail['timeline'] }> = ({ timeline }) => {
  return (
    <View style={styles.timelineCard}>
      <Text style={styles.cardTitle}>订单进度</Text>
      <View style={styles.timelineList}>
        {timeline.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineDot}>
              <View style={[styles.dot, index === 0 && styles.dotActive]} />
              {index < timeline.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Text style={styles.timelineDesc}>{item.desc}</Text>
              <Text style={styles.timelineTime}>{formatDateTime(item.time)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * OrderDetailPage 主组件
 */
const OrderDetailPage: React.FC = () => {
  const params = useLocalSearchParams<{ orderId: string; status?: string }>();
  const { orderDetail, loading } = useOrderDetailState(params.orderId || '', params.status);
  const {
    handleBack,
    handleCancelOrder,
    handleContactCustomer,
    handleAcceptOrder,
    handleRejectOrder,
    handleStartService,
    handleCompleteService,
  } = useOrderDetailLogic();
  
  if (loading || !orderDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>订单详情</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 状态区域（根据订单状态显示不同内容） */}
        {orderDetail.status === 'pending' && (
          <PendingStatusArea
            order={orderDetail}
            onAccept={() => handleAcceptOrder(orderDetail.id)}
            onReject={() => handleRejectOrder(orderDetail.id)}
            onContact={() => handleContactCustomer(orderDetail.customerInfo.userId)}
          />
        )}
        
        {orderDetail.status === 'accepted' && (
          <InProgressStatusArea
            order={orderDetail}
            onContact={() => handleContactCustomer(orderDetail.customerInfo.userId)}
            onStartService={() => handleStartService(orderDetail.id)}
          />
        )}
        
        {orderDetail.status === 'in_progress' && (
          <InProgressStatusArea
            order={orderDetail}
            onContact={() => handleContactCustomer(orderDetail.customerInfo.userId)}
            onCompleteService={() => handleCompleteService(orderDetail.id)}
          />
        )}
        
        {orderDetail.status === 'completed' && (
          <CompletedStatusArea
            order={orderDetail}
          />
        )}
        
        {/* 订单信息卡片 */}
        <OrderInfoCard order={orderDetail} />
        
        {/* 订单时间轴 */}
        <TimelineCard timeline={orderDetail.timeline} />
        
        {/* 底部间距 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};
// #endregion

// #region 9. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // 顶部导航
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
  
  // 加载状态
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
  },
  
  // 订单信息卡片
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  
  // 状态区域
  statusSection: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // 客户信息
  customerSection: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
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
  skillName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  skillDesc: {
    fontSize: 12,
    color: '#999999',
  },
  
  // 订单信息
  orderInfoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF4444',
  },
  
  // 时间轴卡片
  timelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  timelineList: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineDot: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E5E5',
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5E5',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#999999',
  },
  
  bottomSpacer: {
    height: 20,
  },
});
// #endregion

// #region 10. Exports
export default OrderDetailPage;
// #endregion

