import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthInitialization } from '@/src/features/AuthModule/hooks/useAuthInitialization';

// 🎯 开发环境加载调试工具
if (__DEV__) {
  require('@/src/features/AuthModule/utils/debugLogger');
}

// 🎯 防止启动屏自动隐藏，等待认证初始化完成
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * 加载屏组件
 */
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6366F1" />
    <Text style={styles.loadingText}>正在初始化...</Text>
  </View>
);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // 🎯 第一层：App启动时初始化认证
  const { isReady, isLoading, isAuthenticated } = useAuthInitialization();

  // 初始化完成后隐藏启动屏
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
      console.log(`✅ App ready, isAuthenticated: ${isAuthenticated}`);
    }
  }, [isReady, isAuthenticated]);

  // 🎯 显示加载屏直到认证初始化完成
  if (!isReady || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 认证相关路由组 */}
        <Stack.Screen 
          name="auth" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }} 
        />
        
        {/* Tab路由组（受保护） */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        
        {/* 模态框 */}
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            title: 'Modal',
            animation: 'slide_from_bottom',
          }} 
        />
        
        {/* 发布组局页面（受保护） */}
        <Stack.Screen 
          name="publish" 
          options={{ 
            presentation: 'modal',
            title: '发布组局',
            headerShown: false,
            animation: 'slide_from_bottom',
          }} 
        />
        
        {/* 发布动态页面（受保护） */}
        <Stack.Screen 
          name="publish-post" 
          options={{ 
            presentation: 'modal',
            title: '发布动态',
            headerShown: false,
            animation: 'slide_from_bottom',
          }} 
        />
        
        {/* 用户主页路由组 */}
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        
        {/* 动态详情页 */}
        <Stack.Screen 
          name="feed/[id]" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
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
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
