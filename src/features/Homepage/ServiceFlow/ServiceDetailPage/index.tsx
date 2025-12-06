/**
 * ServiceDetailPage - 技能服务详情页 [L1]
 *
 * 功能：展示技能服务的完整详情，支持线上(online)和线下(offline)两种类型
 * 导航流程：Homepage → GamePlayerListPage(列表) → ServiceDetailPage(详情)
 *
 * 组件结构：
 * - NavArea: 顶部导航栏
 * - GameCardArea: 游戏截图轮播
 * - UserInfoArea: 用户信息（头像、昵称、等级、价格）
 * - TagsArea: 标签区域（仅线上）
 * - SkillIntroArea: 技能介绍（仅线上）
 * - ActivityArea: 活动信息（仅线下）
 * - ReviewArea: 评价区域
 * - ActionBarArea: 底部操作栏
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ActionBarArea from './ActionBarArea';
import ActivityArea from './ActivityArea';
import { COLORS, SIZES, TEXT } from './constants';
import GameCardArea from './GameCardArea';
import { useServiceDetail } from './hooks/useServiceDetail';
import NavArea from './NavArea';
import ReviewArea from './ReviewArea';
import SkillIntroArea from './SkillIntroArea';
import TagsArea from './TagsArea';
import type { ServiceDetailPageProps, ServiceType } from './types';
import UserInfoArea from './UserInfoArea';

// #region 主页面组件
/** 服务详情页主组件 */
const ServiceDetailPage: React.FC<ServiceDetailPageProps> = memo((props) => {
  const router = useRouter();

  // 从路由参数获取 serviceId 和 serviceType
  const params = useLocalSearchParams<{
    serviceId: string;
    serviceType: string;
  }>();
  const serviceId = props.serviceId || params.serviceId || '1';
  const serviceType = (props.serviceType || params.serviceType || 'online') as ServiceType;

  // 使用数据管理Hook
  const {
    pageState,
    detailData,
    reviews,
    hasMoreReviews,
    loadMoreReviews,
    refreshAll,
  } = useServiceDetail(serviceId, serviceType);

  /** 返回上一页 */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /** 图片点击预览 */
  const handleImagePress = useCallback((index: number) => {
    // TODO: 实现图片预览功能
    console.log('[ServiceDetailPage] 图片预览:', index);
  }, []);

  /** 跳转用户主页 */
  const handleUserPress = useCallback((userId: string) => {
    router.push({
      pathname: '/profile/[userId]' as any,
      params: { userId },
    });
  }, [router]);

  /** 查看全部评价 */
  const handleViewAllReviews = useCallback(() => {
    router.push({
      pathname: '/service/reviews/[serviceId]' as any,
      params: { serviceId },
    });
  }, [router, serviceId]);

  /** 跳转订单确认页 - 下单按钮点击 */
  const handleOrder = useCallback(() => {
    router.push({
      pathname: '/order/confirm' as any,
      params: { serviceId },
    });
  }, [router, serviceId]);

  // 加载中状态
  if (pageState.isLoading && !detailData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />
        <NavArea title={TEXT.NAV_TITLE} onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>{TEXT.LOADING}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 错误状态
  if (pageState.isError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />
        <NavArea title={TEXT.NAV_TITLE} onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {pageState.errorMessage || TEXT.LOAD_FAILED}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshAll}>
            <Text style={styles.retryButtonText}>{TEXT.RETRY}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 无数据状态
  if (!detailData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />
        <NavArea title={TEXT.NAV_TITLE} onBack={handleBack} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无数据</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOnline = serviceType === 'online';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />

      {/* 顶部导航栏 [L2] */}
      <NavArea title={TEXT.NAV_TITLE} onBack={handleBack} />

      {/* 可滚动内容区 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={pageState.isLoading}
            onRefresh={refreshAll}
            tintColor={COLORS.PRIMARY}
            colors={[COLORS.PRIMARY]}
          />
        }
      >
        {/* 游戏截图轮播 [L2] */}
        <GameCardArea
          data={detailData.gameCard}
          onImagePress={handleImagePress}
        />

        {/* 用户信息区域 [L2] */}
        <UserInfoArea
          data={detailData.userInfo}
          serviceType={serviceType}
          onAvatarPress={() => handleUserPress(detailData.userInfo.userId)}
        />

        {/* 线上服务：标签区域 [L2] */}
        {isOnline && detailData.tags && (
          <TagsArea data={detailData.tags} />
        )}

        {/* 线上服务：技能介绍 [L2] */}
        {isOnline && detailData.skillIntro && (
          <SkillIntroArea data={detailData.skillIntro} />
        )}

        {/* 线下服务：活动信息 [L2] */}
        {!isOnline && detailData.activity && (
          <ActivityArea data={detailData.activity} />
        )}

        {/* 评价区域 [L2] */}
        <ReviewArea
          summary={detailData.reviewSummary}
          reviews={reviews}
          hasMore={hasMoreReviews}
          onViewAll={handleViewAllReviews}
          onLoadMore={loadMoreReviews}
          onUserPress={handleUserPress}
        />
      </ScrollView>

      {/* 底部操作栏 [L2] */}
      <ActionBarArea data={detailData.action} onOrder={handleOrder} />
    </SafeAreaView>
  );
});

ServiceDetailPage.displayName = 'ServiceDetailPage';
// #endregion

// #region Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.ACTION_BAR_HEIGHT + 20,
  },

  // 加载状态
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.GAP_LG,
  },
  loadingText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
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
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: SIZES.FONT_MD,
    fontWeight: '600',
    color: COLORS.BACKGROUND,
  },

  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_LIGHT,
  },
});
// #endregion

export default ServiceDetailPage;
export type { ServiceDetailPageProps };
