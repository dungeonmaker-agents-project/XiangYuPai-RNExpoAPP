/**
 * TopActionBar - 顶部操作栏组件
 *
 * 功能：
 * - 左侧：返回按钮
 * - 编辑/关注按钮已移至昵称行
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SIZES } from '../constants';
import type { TopActionBarProps } from '../types';

const TopActionBar: React.FC<TopActionBarProps> = ({
  onBack,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* 返回按钮 */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={28} color={COLORS.TEXT_WHITE} />
      </TouchableOpacity>

      {/* 右侧占位（编辑按钮已移至昵称行） */}
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.SPACING_LARGE,
    paddingBottom: SIZES.SPACING_SMALL,
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 36,
    height: 36,
  },
});

export default TopActionBar;

