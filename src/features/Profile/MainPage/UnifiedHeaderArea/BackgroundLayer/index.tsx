/**
 * BackgroundLayer - 背景层组件
 *
 * 功能：
 * - 显示背景图片或默认渐变色
 * - 底部渐变遮罩确保文字可读性
 *
 * UI设计参考：个人主页-资料.png / 个人主页-动态.png
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

import { BACKGROUND_HEIGHT } from '../constants';
import type { BackgroundLayerProps } from '../types';

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ backgroundImage }) => {
  const renderContent = () => (
    <>
      {/* 底部渐变遮罩 - 确保用户信息可读 */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.7)']}
        locations={[0, 0.5, 1]}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />
    </>
  );

  if (backgroundImage) {
    return (
      <ImageBackground
        source={{ uri: backgroundImage }}
        style={styles.background}
        resizeMode="cover"
      >
        {renderContent()}
      </ImageBackground>
    );
  }

  // 使用紫色渐变背景（无图片时的默认背景）
  return (
    <LinearGradient
      colors={['#9D5BD2', '#7B3FB8', '#5B2D99']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      {renderContent()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BACKGROUND_HEIGHT,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BACKGROUND_HEIGHT * 0.5, // 渐变覆盖下半部分
  },
});

export default BackgroundLayer;

