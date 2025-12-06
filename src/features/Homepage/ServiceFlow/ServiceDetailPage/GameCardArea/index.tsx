/**
 * GameCardArea - 游戏资料卡片轮播区域组件 [L2]
 *
 * 功能：展示服务截图轮播，支持手动滑动和点击预览
 * 位置：导航栏下方，高度约40%屏幕
 */

import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS, SIZES } from '../constants';
import type { GameCardAreaProps, ScreenshotItem } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** 轮播指示器组件 */
const SwiperIndicator: React.FC<{
  total: number;
  current: number;
}> = memo(({ total, current }) => {
  if (total <= 1) return null;

  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.indicatorDot,
            index === current && styles.indicatorDotActive,
          ]}
        />
      ))}
    </View>
  );
});

SwiperIndicator.displayName = 'SwiperIndicator';

/** 游戏资料卡片轮播区域组件 */
const GameCardArea: React.FC<GameCardAreaProps> = memo(({
  data,
  onImagePress,
  onIndexChange,
}) => {
  const { screenshots } = data;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  /** 处理滚动结束事件，计算当前索引 */
  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < screenshots.length) {
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }, [currentIndex, screenshots.length, onIndexChange]);

  /** 渲染单个截图项 */
  const renderItem = useCallback(({ item, index }: { item: ScreenshotItem; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onImagePress?.(index)}
      style={styles.imageWrapper}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
  ), [onImagePress]);

  /** 列表项key提取 */
  const keyExtractor = useCallback((_: ScreenshotItem, index: number) =>
    `screenshot_${index}`, []);

  /** 空数据占位 */
  if (!screenshots || screenshots.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 轮播列表 [L3] */}
      <FlatList
        ref={flatListRef}
        data={screenshots}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      {/* 指示器 [L3] */}
      <SwiperIndicator total={screenshots.length} current={currentIndex} />
    </View>
  );
});

GameCardArea.displayName = 'GameCardArea';

const styles = StyleSheet.create({
  container: {
    height: SIZES.GAME_CARD_HEIGHT,
    backgroundColor: COLORS.SURFACE,
    position: 'relative',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SIZES.GAME_CARD_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorDotActive: {
    backgroundColor: COLORS.PRIMARY,
    width: 16,
  },
});

export default GameCardArea;
