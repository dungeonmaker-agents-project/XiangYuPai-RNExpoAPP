import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/src/features/AuthModule/stores/authStore';

// Tab bar icons
const TAB_ICONS = {
  home: {
    active: require('@/assets/images/images/home/bottom-navigation/home-active.png'),
    inactive: require('@/assets/images/images/home/bottom-navigation/home-inactive.png'),
  },
  discover: {
    active: require('@/assets/images/images/home/bottom-navigation/discover-active.png'),
    inactive: require('@/assets/images/images/home/bottom-navigation/discover-inactive.png'),
  },
  message: {
    active: require('@/assets/images/images/home/bottom-navigation/message-active.png'),
    inactive: require('@/assets/images/images/home/bottom-navigation/message-inactive.png'),
  },
  profile: {
    active: require('@/assets/images/images/home/bottom-navigation/profile-active.png'),
    inactive: require('@/assets/images/images/home/bottom-navigation/profile-inactive.png'),
  },
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // 🎯 第二层：路由守卫 - 检查认证状态
  const { isAuthenticated, isInitialized } = useAuthStore();

  // 调试日志
  React.useEffect(() => {
    if (isInitialized) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🛡️ [第二层] 路由守卫 - Tab布局加载');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   📊 认证状态: ${isAuthenticated ? '✅ 已登录' : '❌ 未登录 (访客模式)'}`);
      console.log('   🌐 白名单Tab: homepage, discover');
      console.log('   🔒 受保护Tab: messages, profile');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  }, [isInitialized, isAuthenticated]);

  // 等待初始化完成
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
      }}>
      {/* 🔕 隐藏的路由 - 不显示在Tab栏中 */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // 隐藏index Tab
        }}
      />
      
      <Tabs.Screen
        name="publish"
        options={{
          href: null, // 隐藏publish Tab
        }}
      />
      
      {/* 🌐 首页 - 白名单路由，允许匿名访问 */}
      <Tabs.Screen
        name="homepage"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? TAB_ICONS.home.active : TAB_ICONS.home.inactive}
              style={styles.tabIcon}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            console.log('🌐 [第二层] 访问首页Tab - 白名单路由，✅ 允许访问');
          },
        }}
      />
      
      {/* 🌐 发现 - 白名单路由，允许匿名访问 */}
      <Tabs.Screen
        name="discover"
        options={{
          title: '发现',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? TAB_ICONS.discover.active : TAB_ICONS.discover.inactive}
              style={styles.tabIcon}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            console.log('🌐 [第二层] 访问发现Tab - 白名单路由，✅ 允许访问');
          },
        }}
      />
      
      {/* 🔒 消息 - 受保护路由，需要登录 */}
      <Tabs.Screen
        name="messages"
        options={{
          title: '消息',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? TAB_ICONS.message.active : TAB_ICONS.message.inactive}
              style={styles.tabIcon}
            />
          ),
        }}
        // 🎯 不使用redirect，让Tab始终显示，在页面内处理登录提示
        listeners={{
          tabPress: (e) => {
            if (!isAuthenticated) {
              // 不阻止导航，让用户进入消息页面
              // 消息页面内会显示登录提示（已实现）
              console.log('\n🔒 [第二层] 访问消息Tab - 受保护路由');
              console.log('   状态: 未登录');
              console.log('   操作: ✅ 允许进入，页面内显示登录提示');
              console.log('   提示: 消息页面会显示登录引导界面\n');
            } else {
              console.log('🔒 [第二层] 访问消息Tab - 受保护路由，✅ 已登录，显示完整功能');
            }
          },
        }}
      />
      
      {/* 🔒 我的 - 受保护路由，需要登录 */}
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? TAB_ICONS.profile.active : TAB_ICONS.profile.inactive}
              style={styles.tabIcon}
            />
          ),
        }}
        // 🎯 不使用redirect，让Tab始终显示，在页面内处理登录提示
        listeners={{
          tabPress: (e) => {
            if (!isAuthenticated) {
              // 不阻止导航，让用户进入个人页面
              // 个人页面内会显示登录提示
              console.log('\n🔒 [第二层] 访问我的Tab - 受保护路由');
              console.log('   状态: 未登录');
              console.log('   操作: ✅ 允许进入，页面内显示登录提示');
              console.log('   提示: 个人页面会显示登录引导界面\n');
            } else {
              console.log('🔒 [第二层] 访问我的Tab - 受保护路由，✅ 已登录，显示完整功能');
            }
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
