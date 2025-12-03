/**
 * MyPage - 我的页面
 *
 * 功能：
 * - 用户基本信息展示
 * - 交易快捷入口（我的发布/我的订单/我的购买/我的报名）
 * - 更多内容菜单（个人中心/钱包/状态/金币/设置/客服/达人认证）
 */

import { useAuthStore } from '@/src/features/AuthModule/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 图标配置类型
interface IconConfig {
  name: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
}

// 图标组件
const MenuIcon = ({ config }: { config: IconConfig }) => (
  <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
    <Ionicons name={config.name} size={24} color={config.iconColor} />
  </View>
);

const MyPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentProfile = useProfileStore((state) => state.currentProfile);

  // 交易区域菜单项
  const transactionItems = [
    { id: 'publish', label: '我的发布', icon: { name: 'document-text-outline' as const, backgroundColor: '#FFF5E6', iconColor: '#F59E0B' }, route: '/profile/my-posts' },
    { id: 'order', label: '我的订单', icon: { name: 'clipboard-outline' as const, backgroundColor: '#EEF2FF', iconColor: '#6366F1' }, route: '/profile/my-orders' },
    { id: 'purchase', label: '我的购买', icon: { name: 'bag-outline' as const, backgroundColor: '#F0FDF4', iconColor: '#22C55E' }, route: '/profile/my-purchases' },
    { id: 'signup', label: '我的报名', icon: { name: 'mail-outline' as const, backgroundColor: '#EFF6FF', iconColor: '#3B82F6' }, route: '/profile/my-signups' },
  ];

  // 更多内容菜单项
  const moreItems = [
    { id: 'personal', label: '个人中心', icon: { name: 'person-outline' as const, backgroundColor: '#FFF7ED', iconColor: '#F97316' }, route: '/profile/user-profile' },
    { id: 'status', label: '状态', icon: { name: 'navigate-circle-outline' as const, backgroundColor: '#E0F2FE', iconColor: '#0EA5E9' }, route: '/profile/my-status' },
    { id: 'wallet', label: '钱包', icon: { name: 'wallet-outline' as const, backgroundColor: '#ECFEFF', iconColor: '#06B6D4' }, route: '/profile/wallet' },
    { id: 'coin', label: '金币', icon: { name: 'diamond-outline' as const, backgroundColor: '#FEF3C7', iconColor: '#F59E0B' }, route: '/profile/coins' },
    { id: 'settings', label: '设置', icon: { name: 'settings-outline' as const, backgroundColor: '#F3E8FF', iconColor: '#A855F7' }, route: '/profile/settings' },
    { id: 'service', label: '客服', icon: { name: 'headset-outline' as const, backgroundColor: '#DCFCE7', iconColor: '#22C55E' }, route: '/profile/customer-service' },
    { id: 'expert', label: '达人认证', icon: { name: 'trophy-outline' as const, backgroundColor: '#FCE7F3', iconColor: '#EC4899' }, route: '/profile/expert-verification' },
  ];

  // 处理菜单项点击
  const handleMenuPress = (route: string, label: string) => {
    console.log(`🧭 导航: 我的页面 → ${label}`);
    router.push(route as any);
  };

  // 处理用户信息区域点击（仅未登录时跳转登录页）
  const handleUserInfoPress = () => {
    if (!isAuthenticated) {
      console.log('🧭 导航: 我的页面 → 登录页');
      router.push('/auth/login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* 紫色渐变背景 - 延伸到状态栏 */}
      <LinearGradient
        colors={['#C084FC', '#A855F7', '#9333EA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity
          style={styles.userSection}
          onPress={handleUserInfoPress}
          activeOpacity={0.7}
        >
          <View style={styles.userInfo}>
            <Image
              source={
                currentProfile?.avatar
                  ? { uri: currentProfile.avatar }
                  : require('@/assets/images/images/common/default-avatar.png')
              }
              style={styles.avatar}
            />
            <View style={styles.userText}>
              <Text style={styles.userName}>
                {isAuthenticated && currentProfile?.nickname
                  ? currentProfile.nickname
                  : '用户名称'}
              </Text>
              <Text style={styles.userDesc}>
                {isAuthenticated && currentProfile?.bio
                  ? currentProfile.bio
                  : '这个家伙很神秘，没有填写简介'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 交易区域 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>交易</Text>
          <View style={styles.menuGrid}>
            {transactionItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.route, item.label)}
                activeOpacity={0.7}
              >
                <MenuIcon config={item.icon} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 更多内容区域 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>更多内容</Text>
          <View style={styles.menuGrid}>
            {moreItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.route, item.label)}
                activeOpacity={0.7}
              >
                <MenuIcon config={item.icon} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // 头部渐变区域
  headerGradient: {
    paddingBottom: 20,
  },
  // 用户信息区域
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  userText: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  // ScrollView
  scrollView: {
    flex: 1,
    marginTop: -8,
  },
  scrollContent: {
    paddingTop: 0,
  },
  // 区域样式
  section: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 6,
    marginBottom: 10,
    marginHorizontal: 14,
    borderRadius: 14,
    // 阴影
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
    paddingLeft: 4,
  },
  // 菜单网格
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  menuLabel: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
});

export default MyPage;

